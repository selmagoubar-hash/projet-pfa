from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import Consultation, Ordonnance, Medicament
from appointments.models import RendezVous
from billing.models import Facture


def get_statistiques_consultations(medecin_id=None, periode='mois'):
    """
    Retourne des statistiques sur les consultations.
    
    Args:
        medecin_id: ID du médecin (optionnel)
        periode: 'jour', 'semaine', 'mois', 'annee'
    
    Returns:
        dict: Statistiques agrégées
    """
    # Définir la période
    now = timezone.now()
    if periode == 'jour':
        date_debut = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif periode == 'semaine':
        date_debut = now - timedelta(days=7)
    elif periode == 'mois':
        date_debut = now - timedelta(days=30)
    else:  # annee
        date_debut = now - timedelta(days=365)
    
    # Filtrer les consultations
    consultations = Consultation.objects.filter(date__gte=date_debut)
    if medecin_id:
        consultations = consultations.filter(medecin_id=medecin_id)
    
    # Statistiques
    stats = {
        'total_consultations': consultations.count(),
        'consultations_par_jour': consultations.extra(
            select={'jour': "DATE(date)"}
        ).values('jour').annotate(count=Count('id')).order_by('-jour')[:30],
        'diagnostics_communs': consultations.values('diagnostic').annotate(
            count=Count('id')
        ).order_by('-count')[:10],
        'taux_ordonnances': consultations.filter(ordonnance__isnull=False).count() / max(consultations.count(), 1) * 100,
    }
    
    return stats


def creer_facture_consultation(consultation_id):
    """
    Crée automatiquement une facture pour une consultation.
    """
    consultation = Consultation.objects.get(id=consultation_id)
    
    # Calculer le montant (à personnaliser selon votre logique métier)
    montant_base = 5000  # Prix de base d'une consultation en FCFA
    
    facture, created = Facture.objects.get_or_create(
        patient=consultation.patient,
        defaults={
            'montant_total': montant_base,
            'statut': 'en_attente'
        }
    )
    
    if not created:
        facture.montant_total += montant_base
        facture.save()
    
    return facture


def get_consultations_par_medecin():
    """
    Retourne le nombre de consultations par médecin.
    """
    from users.models import CustomUser
    
    medecins = CustomUser.objects.filter(role='medecin')
    resultat = []
    
    for medecin in medecins:
        resultat.append({
            'medecin': f"Dr. {medecin.last_name} {medecin.first_name}",
            'total': Consultation.objects.filter(medecin=medecin).count(),
            'mois_courant': Consultation.objects.filter(
                medecin=medecin,
                date__month=timezone.now().month,
                date__year=timezone.now().year
            ).count()
        })
    
    return resultat