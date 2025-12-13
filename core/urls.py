"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
    # --- JWT Authentication Endpoints ---
    # 1. Obtain Access/Refresh token pair (Standard SimpleJWT - alternative to custom login)
    # Note: Your custom login at api/auth/login/ is preferred and returns user info too
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Note: api/token/refresh/ is handled by custom token_refresh_cookie in inventory/urls.py
    # which supports both cookie and body-based refresh tokens
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    path('api/docs/',
            SpectacularSwaggerView.as_view(url_name='schema'),
            name='swagger-ui'),

    path('api/redoc/',
            SpectacularRedocView.as_view(url_name='schema'),
            name='redoc'),
]
