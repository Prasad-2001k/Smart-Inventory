# inventory/views.py

from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, Category, Supplier, Order, OrderItem


def _refresh_cookie_settings():
    """
    Compute cookie settings for the refresh token based on DEBUG.
    In DEBUG (localhost over HTTP), allow Secure=False so the cookie is accepted.
    In production, use Secure=True and SameSite=None for cross-site (frontend on different domain).
    """
    if settings.DEBUG:
        return {
            "max_age": 7 * 24 * 3600,
            "httponly": True,
            "secure": False,    # allow over http://localhost
            "samesite": "None", # cross-site for different dev ports
        }
    return {
        "max_age": 7 * 24 * 3600,
        "httponly": True,
        "secure": True,
        "samesite": "None",
    }
from .serializers import (
    ProductSerializer,
    SupplierSerializer,
    CategorySerializer,
    OrderSerializer,
    OrderItemSerializer,
)


# --------------------------
# Category ViewSet
# --------------------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["cname"]
    ordering_fields = ["cname"]
    ordering = ["cname"]


# --------------------------
# Supplier ViewSet
# --------------------------
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email"]
    ordering_fields = ["name"]
    ordering = ["name"]


# --------------------------
# Product ViewSet
# --------------------------
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Filtering / searching / ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # e.g. ?category=1&supplier=2
    filterset_fields = ["category", "supplier"]

    # e.g. ?search=mouse
    search_fields = ["name", "sku"]

    # e.g. ?ordering=name or ?ordering=-current_stock
    ordering_fields = ["name", "current_stock", "price", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        """
        Optionally filter by low stock using ?stock_lt=<int>.
        Works in addition to other filters.
        """
        queryset = super().get_queryset()
        stock_less_than = self.request.query_params.get("stock_lt")

        if stock_less_than is not None and stock_less_than.isdigit():
            queryset = queryset.filter(current_stock__lt=int(stock_less_than))

        return queryset

    @action(
        detail=True,
        methods=["patch", "put"],
        permission_classes=[permissions.IsAdminUser],
    )
    def update_stock(self, request, pk=None):
        """Update the stock level of a product (admin-only)."""
        product = self.get_object()
        new_stock = request.data.get("current_stock")

        if new_stock is None:
            return Response(
                {"error": "current_stock field is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_stock = int(new_stock)
            if new_stock < 0:
                return Response(
                    {"error": "Stock cannot be negative"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Stock must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.current_stock = new_stock
        product.save(update_fields=["current_stock"])

        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --------------------------
# Order ViewSet
# --------------------------
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """
        Custom action to cancel an order.
        Restores product stock for all items in the order.
        """
        with transaction.atomic():
            order = self.get_object()

            if order.status == "X":
                return Response(
                    {"error": "Order is already cancelled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if order.status == "C":
                return Response(
                    {"error": "Cannot cancel a completed order."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Restore stock for each item in the order
            items_qs = OrderItem.objects.select_related("product").filter(order=order)
            product_ids = [item.product_id for item in items_qs]

            if product_ids:
                products_qs = Product.objects.select_for_update().filter(
                    id__in=product_ids
                )
                products_map = {p.id: p for p in products_qs}

                for item in items_qs:
                    product = products_map.get(item.product_id)
                    if product:
                        product.current_stock += item.quantity
                        product.save(update_fields=["current_stock"])

            order.status = "X"
            order.save(update_fields=["status"])

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Custom action to mark an order as completed."""
        order = self.get_object()
        if order.status == "C":
            return Response(
                {"error": "Order is already completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status == "X":
            return Response(
                {"error": "Cannot complete a cancelled order."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = "C"
        order.save(update_fields=["status"])
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Create Order while validating stock with a DB transaction and row-level locks.
        Expected payload:
        {
            "items": [
                {"product": <product_id>, "quantity": <int>}
            ]
        }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data.pop("items", [])

        # If no items provided, allow creating an empty order (frontend two-step flow)
        if not items:
            order = serializer.save()
            out_serializer = self.get_serializer(order)
            return Response(out_serializer.data, status=status.HTTP_201_CREATED)

        # Collect product ids from the Product instances in items
        product_ids = [item["product"].id for item in items]

        with transaction.atomic():
            # Lock the related products (SELECT FOR UPDATE)
            products_qs = Product.objects.select_for_update().filter(
                id__in=product_ids
            )
            products_map = {p.id: p for p in products_qs}

            # Validate stock for each item
            for it in items:
                product = it["product"]  # Product instance
                qty = int(it["quantity"])

                locked_product = products_map.get(product.id)
                if not locked_product:
                    return Response(
                        {"detail": f"Product {product.id} not found."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if qty <= 0:
                    return Response(
                        {
                            "detail": f"Quantity must be positive for product {product.id}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if locked_product.current_stock < qty:
                    return Response(
                        {
                            "detail": f"Insufficient stock for product "
                            f"{locked_product.id} ({locked_product.name})."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Create the order first (without items)
            order = serializer.save()

            # Create OrderItems; stock will be deducted by signal on OrderItem post_save
            for it in items:
                product = it["product"]
                qty = int(it["quantity"])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price_at_purchase=product.price,
                )

        out_serializer = self.get_serializer(order)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


# --------------------------
# OrderItem ViewSet
# --------------------------
class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["order", "product"]
    ordering_fields = ["order", "product"]
    ordering = ["order", "product"]


# --------------------------
# Authentication Views
# --------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and set refresh token as HttpOnly cookie."""
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, email=email, password=password)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response = Response(
        {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "tokens": {
                "access": access_token,
                "refresh": refresh_token,  # return refresh for body-based flow
            },
        },
        status=status.HTTP_201_CREATED,
    )

    # Set refresh token in HttpOnly cookie (not exposed to JS)
    cookie_opts = _refresh_cookie_settings()
    response.set_cookie("refresh_token", refresh_token, **cookie_opts)
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Login user, return access token and set refresh token as HttpOnly cookie."""
    from django.contrib.auth import authenticate

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response = Response(
        {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "tokens": {
                "access": access_token,
                "refresh": refresh_token,  # return refresh for body-based flow
            },
        },
        status=status.HTTP_200_OK,
    )

    cookie_opts = _refresh_cookie_settings()
    response.set_cookie("refresh_token", refresh_token, **cookie_opts)
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh_cookie(request):
    """
    Issue a new access token using the refresh token.
    - Tries HttpOnly cookie `refresh_token`
    - Falls back to JSON body {"refresh": "<token>"}
    """
    refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED
        )
    try:
        refresh = RefreshToken(refresh_token)
        access = str(refresh.access_token)
        return Response({"access": access}, status=status.HTTP_200_OK)
    except Exception:
        return Response(
            {"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """Logout user - delete refresh token cookie so client can't refresh."""
    response = Response(
        {"message": "Successfully logged out"}, status=status.HTTP_200_OK
    )
    response.delete_cookie("refresh_token", samesite="Lax")
    return response


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_user(request):
    """Get current authenticated user information."""
    return Response(
        {
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        },
        status=status.HTTP_200_OK,
    )
