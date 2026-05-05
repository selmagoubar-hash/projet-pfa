from django.shortcuts import render, redirect
from django.views.generic import CreateView, ListView, UpdateView, TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser


class SignupView(CreateView):
    """Vue d'inscription - crée un compte patient"""
    model = CustomUser
    form_class = CustomUserCreationForm
    template_name = 'users/signup.html'
    success_url = reverse_lazy('users:login')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        return response


class CustomLoginView(LoginView):
    """Vue de connexion personnalisée"""
    template_name = 'users/login.html'
    
    def get_success_url(self):
        return reverse_lazy('dashboard:home')
    
    def form_valid(self, form):
        messages.success(self.request, f'Bienvenue {form.get_user().username}!')
        return super().form_valid(form)


class CustomLogoutView(LogoutView):
    """Vue de déconnexion"""
    next_page = reverse_lazy('users:login')
    
    def dispatch(self, request, *args, **kwargs):
        messages.info(request, 'Vous avez été déconnecté.')
        return super().dispatch(request, *args, **kwargs)


class ProfilView(LoginRequiredMixin, TemplateView):
    """Vue pour afficher le profil utilisateur"""
    template_name = 'users/profil.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context


class ProfilUpdateView(LoginRequiredMixin, UpdateView):
    """Vue pour modifier le profil utilisateur"""
    model = CustomUser
    form_class = CustomUserChangeForm
    template_name = 'users/profil_edit.html'
    success_url = reverse_lazy('users:profil')
    
    def get_object(self):
        return self.request.user
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Votre profil a été mis à jour avec succès!')
        return response


class ChangePasswordView(LoginRequiredMixin, TemplateView):
    """Vue pour changer le mot de passe"""
    template_name = 'users/change_password.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = PasswordChangeForm(user=self.request.user)
        return context
    
    def post(self, request):
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Garde l'utilisateur connecté
            messages.success(request, 'Votre mot de passe a été changé avec succès!')
            return redirect('users:profil')
        return render(request, self.template_name, {'form': form})


class UserListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = CustomUser
    template_name = 'users/user_list.html'
    context_object_name = 'users'
    paginate_by = 20
    
    def test_func(self):
        return self.request.user.role == 'admin'
    
    def get_queryset(self):
        return CustomUser.objects.all().order_by('-date_joined')
