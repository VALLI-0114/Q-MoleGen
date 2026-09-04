"""
URL configuration for Q-MolGen project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('django_app.dashboard.urls')),
]
