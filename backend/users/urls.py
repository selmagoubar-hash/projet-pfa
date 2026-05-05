from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('signup/', views.SignupView.as_view(), name='register'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', views.CustomLogoutView.as_view(), name='logout'),
    path('profil/', views.ProfilView.as_view(), name='profil'),
    path('profil/edit/', views.ProfilUpdateView.as_view(), name='profil_edit'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('users/', views.UserListView.as_view(), name='user_list'),
]
