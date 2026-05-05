from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.utils import timezone

from .services import get_dashboard_stats
from patients.models import Patient
from appointments.models import RendezVous
from consultations.models import Consultation
from billing.models import Facture


class DashboardHomeView(LoginRequiredMixin, TemplateView):
    """Page d'accueil du tableau de bord avec statistiques"""
    template_name = 'dashboard/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        aujourd_hui = timezone.now().date()
        
        # Statistiques globales
        context['stats'] = get_dashboard_stats()
        
        # Rendez-vous du jour (tous)
        context['rendezvous_aujourdhui'] = RendezVous.objects.filter(
            date_heure__date=aujourd_hui
        ).order_by('date_heure')[:10]
        
        # Prochains rendez-vous
        context['prochains_rdv'] = RendezVous.objects.filter(
            date_heure__gte=timezone.now(),
            statut='planifie'
        ).order_by('date_heure')[:5]
        
        # Dernières consultations
        context['dernieres_consultations'] = Consultation.objects.all().order_by('-date')[:5]
        
        # Top médecins (nombre de consultations)
        context['top_medecins'] = Consultation.objects.values(
            'medecin__first_name', 'medecin__last_name'
        ).annotate(
            total=Count('id')
        ).order_by('-total')[:5]
        
        # Si l'utilisateur est médecin, filtrer ses données personnelles
        if user.role == 'medecin':
            context['mes_consultations'] = Consultation.objects.filter(medecin=user).count()
            context['mes_rdv_aujourdhui'] = RendezVous.objects.filter(
                medecin=user,
                date_heure__date=aujourd_hui
            ).count()
            context['mes_rdv_prevus'] = RendezVous.objects.filter(
                medecin=user,
                date_heure__gte=timezone.now(),
                statut='planifie'
            ).count()
        
        # Si l'utilisateur est patient
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            context['mes_consultations'] = Consultation.objects.filter(patient=user.patient_profile).count()
            context['mes_rdv_prevus'] = RendezVous.objects.filter(
                patient=user.patient_profile,
                date_heure__gte=timezone.now(),
                statut='planifie'
            ).count()
        
        return context


class DashboardStatsView(LoginRequiredMixin, TemplateView):
    """JSON statistics endpoint for the server-rendered dashboard."""

    def get(self, request, *args, **kwargs):
        today = timezone.localdate()
        revenue = Facture.objects.filter(statut='payee').aggregate(
            total=Sum('montant_total')
        )['total'] or 0

        return JsonResponse({
            'total_patients': Patient.objects.count(),
            'total_consultations': Consultation.objects.count(),
            'revenue': float(revenue),
            'today_appointments': RendezVous.objects.filter(date_heure__date=today).count(),
        })
