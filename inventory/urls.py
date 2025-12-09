# inventory/urls.py

from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    ProductViewSet, CategoryViewSet, SupplierViewSet, 
    OrderViewSet, OrderItemViewSet, register, login, logout, get_user, token_refresh_cookie
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/user/', get_user, name='get_user'),
    # cookie-backed refresh (available at /api/token/refresh/ because core includes inventory.urls first)
    path('token/refresh/', token_refresh_cookie, name='token_refresh_cookie'),
] + router.urls