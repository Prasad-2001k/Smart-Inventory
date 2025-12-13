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

from django.core.exceptions import ValidationError

from .models import Product, Category, Supplier, Order, OrderItem
from .services import order_service


def _refresh_cookie_settings():
    """
    Compute cookie settings for the refresh token based on DEBUG.
    In DEBUG (localhost over HTTP), use SameSite="Lax" with Secure=False.
    Modern browsers require Secure=True when SameSite=None, so we use Lax for localhost.
    In production, use Secure=True and SameSite=None for cross-site (frontend on different domain).
    """
    if settings.DEBUG:
        return {
            "max_age": 7 * 24 * 3600,
            "httponly": True,
            "secure": False,    # allow over http://localhost
            "samesite": "Lax",  # Lax works for same-site localhost (different ports are same-site)
            "path": "/api/",    # Only send cookie for API requests
        }
    return {
        "max_age": 7 * 24 * 3600,
        "httponly": True,
        "secure": True,        # Required for SameSite=None in production
        "samesite": "None",    # Cross-site for different domains
        "path": "/api/",       # Only send cookie for API requests
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

        try:
            order_service.restore_stock(order, set_status=True)
        except ValidationError as exc:
            message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

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

        try:
            with transaction.atomic():
                order = serializer.save()
                order_service.add_order_items(order, items)
        except ValidationError as exc:
            message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.validated_data["order"]
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)

        try:
            created_items = order_service.add_order_items(
                order, [{"product": product, "quantity": quantity}]
            )
        except ValidationError as exc:
            message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

        created_item = created_items[0]
        output = self.get_serializer(created_item)
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)


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
                # Refresh token is only in HttpOnly cookie, not in response body
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
                # Refresh token is only in HttpOnly cookie, not in response body
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
    Issue a new access token using the refresh token from HttpOnly cookie only.
    If ROTATE_REFRESH_TOKENS is enabled, also update the refresh token cookie.
    """
    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return Response(
            {"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED
        )
    try:
        refresh = RefreshToken(refresh_token)
        access = str(refresh.access_token)
        
        # Create response with new access token
        response = Response({"access": access}, status=status.HTTP_200_OK)
        
        # If token rotation is enabled, update the refresh token cookie
        # When ROTATE_REFRESH_TOKENS=True, accessing refresh.access_token rotates the token
        # The refresh object now contains the new refresh token
        rotate_tokens = getattr(settings, 'SIMPLE_JWT', {}).get('ROTATE_REFRESH_TOKENS', False)
        if rotate_tokens:
            new_refresh_token = str(refresh)
            cookie_opts = _refresh_cookie_settings()
            response.set_cookie("refresh_token", new_refresh_token, **cookie_opts)
        
        return response
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
    # Delete cookie with same settings as when it was set
    cookie_opts = _refresh_cookie_settings()
    response.delete_cookie(
        "refresh_token",
        path=cookie_opts.get("path", "/"),
        samesite=cookie_opts.get("samesite", "Lax"),
    )
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
