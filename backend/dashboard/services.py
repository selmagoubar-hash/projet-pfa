from patients.models import Patient
from appointments.models import RendezVous
from billing.models import Facture
from django.db.models import Sum

def get_dashboard_stats():
    nb_patients = Patient.objects.count()
    nb_consultations = RendezVous.objects.filter(statut='termine').count()
    revenus_agg = Facture.objects.filter(statut='payee').aggregate(total=Sum('montant_total'))
    
    return {
        'nombre_patients': nb_patients,
        'nombre_consultations_terminees': nb_consultations,
        'revenus_totaux': revenus_agg['total'] or 0.00
    }
