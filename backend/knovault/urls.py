from django.urls import path
from .views import (
    DocumentUploadView, DocumentListView, DocumentDetailView, SignupView,
    DocumentChatView, ChatHistoryView, DocumentToolView, DocumentDeleteView, LogoutView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/signup/', SignupView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/logout/', LogoutView.as_view()),

    path('documents/', DocumentListView.as_view()),
    path('documents/upload/', DocumentUploadView.as_view()),
    path('documents/<int:pk>/', DocumentDetailView.as_view()),

    path('documents/<int:pk>/chat/', DocumentChatView.as_view()),
    path('documents/<int:pk>/messages/', ChatHistoryView.as_view()),
    path('documents/<int:pk>/tools/<str:kind>/', DocumentToolView.as_view()),

    path('documents/<int:pk>/messages/', ChatHistoryView.as_view()),
    path('documents/<int:pk>/delete/', DocumentDeleteView.as_view()),
]