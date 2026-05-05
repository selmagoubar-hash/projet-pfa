# dashboard/services.py
from django.db.models import Sum
from django.utils import timezone
from patients.models import Patient
from appointments.models import RendezVous
from billing.models import Facture


def get_dashboard_stats():
    now = timezone.now()
    debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Patients
    nb_patients = Patient.objects.count()
    nouveaux_patients_mois = Patient.objects.filter(created_at__gte=debut_mois).count()
    
    # Consultations
    consultations_terminees = RendezVous.objects.filter(statut='termine').count()
    consultations_mois = RendezVous.objects.filter(statut='termine', date_heure__gte=debut_mois).count()
    
    # Revenus
    revenus = Facture.objects.filter(statut='payee').aggregate(total=Sum('montant_total'))['total'] or 0
    revenus_mois = Facture.objects.filter(statut='payee', date_emission__gte=debut_mois).aggregate(total=Sum('montant_total'))['total'] or 0
    
    # Factures en attente
    factures_attente = Facture.objects.filter(statut='en_attente').count()
    
    # Taux d'occupation (simulé)
    total_rdv_mois = RendezVous.objects.filter(date_heure__gte=debut_mois).count()
    taux_occupation = min(100, int((consultations_mois / max(total_rdv_mois, 1)) * 100)) if total_rdv_mois > 0 else 0
    
    # Objectif mensuel (ex: 1 million FCFA)
    objectif_mensuel = min(100, int((revenus_mois / 1000000) * 100)) if revenus_mois else 0
    
    return {
        'nombre_patients': nb_patients,
        'nouveaux_patients_mois': nouveaux_patients_mois,
        'nombre_consultations_terminees': consultations_terminees,
        'consultations_mois': consultations_mois,
        'revenus_totaux': revenus,
        'revenus_mois': revenus_mois,
        'factures_en_attente': factures_attente,
        'taux_occupation': taux_occupation,
        'objectif_mensuel': objectif_mensuel,
    }
