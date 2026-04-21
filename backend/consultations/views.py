from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.db.models import Q
from .models import Consultation, Ordonnance, Medicament, LigneOrdonnance
from .forms import ConsultationForm, OrdonnanceForm, LigneOrdonnanceForm
from appointments.models import RendezVous


class ConsultationListView(LoginRequiredMixin, ListView):
    """Liste des consultations avec filtres"""
    model = Consultation
    template_name = 'consultations/consultation_list.html'
    context_object_name = 'consultations'
    paginate_by = 10

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtrer selon le rôle
        if user.role == 'medecin':
            queryset = queryset.filter(medecin=user)
        elif user.role == 'patient':
            try:
                queryset = queryset.filter(patient__user=user)
            except:
                queryset = queryset.none()
        
        # Recherche
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(patient__first_name__icontains=search) |
                Q(patient__last_name__icontains=search) |
                Q(diagnostic__icontains=search)
            )
        
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Liste des consultations'
        return context


class ConsultationDetailView(LoginRequiredMixin, DetailView):
    model = Consultation
    template_name = 'consultations/consultation_detail.html'
    context_object_name = 'consultation'


class ConsultationCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Consultation
    form_class = ConsultationForm
    template_name = 'consultations/consultation_form.html'
    success_url = reverse_lazy('consultations:list')

    def test_func(self):
        # Seuls les médecins et secrétaires peuvent créer des consultations
        return self.request.user.role in ['medecin', 'secretaire', 'admin']

    def get_initial(self):
        initial = super().get_initial()
        rendezvous_id = self.kwargs.get('rendezvous_id')
        if rendezvous_id:
            rendezvous = get_object_or_404(RendezVous, id=rendezvous_id)
            initial['rendezvous'] = rendezvous
            initial['patient'] = rendezvous.patient
            initial['medecin'] = rendezvous.medecin
        return initial

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Consultation créée avec succès!')
        return response


class ConsultationUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Consultation
    form_class = ConsultationForm
    template_name = 'consultations/consultation_form.html'
    success_url = reverse_lazy('consultations:list')

    def test_func(self):
        consultation = self.get_object()
        user = self.request.user
        return user.role == 'admin' or user == consultation.medecin


class ConsultationDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Consultation
    template_name = 'consultations/consultation_confirm_delete.html'
    success_url = reverse_lazy('consultations:list')

    def test_func(self):
        user = self.request.user
        return user.role == 'admin'


# Vues pour Ordonnances
class OrdonnanceDetailView(LoginRequiredMixin, DetailView):
    model = Ordonnance
    template_name = 'consultations/ordonnance_detail.html'
    context_object_name = 'ordonnance'


class OrdonnanceCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Ordonnance
    form_class = OrdonnanceForm
    template_name = 'consultations/ordonnance_form.html'

    def test_func(self):
        return self.request.user.role in ['medecin', 'admin']

    def get_initial(self):
        initial = super().get_initial()
        consultation_id = self.kwargs.get('consultation_id')
        if consultation_id:
            initial['consultation'] = get_object_or_404(Consultation, id=consultation_id)
        return initial

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Ordonnance créée avec succès!')
        return response

    def get_success_url(self):
        return reverse_lazy('consultations:ordonnance_detail', kwargs={'pk': self.object.pk})


class OrdonnanceUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Ordonnance
    form_class = OrdonnanceForm
    template_name = 'consultations/ordonnance_form.html'

    def test_func(self):
        user = self.request.user
        return user.role == 'admin' or user == self.get_object().consultation.medecin

    def get_success_url(self):
        return reverse_lazy('consultations:ordonnance_detail', kwargs={'pk': self.object.pk})


class LigneOrdonnanceCreateView(LoginRequiredMixin, CreateView):
    model = LigneOrdonnance
    form_class = LigneOrdonnanceForm
    template_name = 'consultations/ligne_ordonnance_form.html'

    def get_initial(self):
        initial = super().get_initial()
        ordonnance_id = self.kwargs.get('ordonnance_id')
        if ordonnance_id:
            initial['ordonnance'] = get_object_or_404(Ordonnance, id=ordonnance_id)
        return initial

    def get_success_url(self):
        return reverse_lazy('consultations:ordonnance_detail', kwargs={'pk': self.kwargs['ordonnance_id']})


def creer_consultation_depuis_rendezvous(request, rendezvous_id):
    """Vue utilitaire pour créer une consultation à partir d'un rendez-vous terminé"""
    rendezvous = get_object_or_404(RendezVous, id=rendezvous_id)
    
    # Vérifier que le rendez-vous est terminé
    if rendezvous.statut != 'termine':
        messages.error(request, "Seuls les rendez-vous terminés peuvent donner lieu à une consultation.")
        return redirect('appointments:detail', pk=rendezvous_id)
    
    # Vérifier si une consultation existe déjà
    if hasattr(rendezvous, 'consultation'):
        messages.warning(request, "Une consultation existe déjà pour ce rendez-vous.")
        return redirect('consultations:detail', pk=rendezvous.consultation.id)
    
    # Créer la consultation
    consultation = Consultation.objects.create(
        rendezvous=rendezvous,
        medecin=rendezvous.medecin,
        patient=rendezvous.patient,
        diagnostic="",
        notes=""
    )
    
    messages.success(request, "Consultation créée avec succès!")
    return redirect('consultations:update', pk=consultation.id)