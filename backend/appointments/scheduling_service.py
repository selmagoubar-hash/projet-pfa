from datetime import datetime, timedelta
from django.utils import timezone
from appointments.models import Disponibilite, RendezVous
from patients.models import Patient
from users.models import CustomUser

def _parse_date(value):
    if hasattr(value, 'weekday'):
        return value
    return datetime.strptime(value, '%Y-%m-%d').date()

def _aware_datetime(day, hour):
    return timezone.make_aware(datetime.combine(day, hour), timezone.get_current_timezone())

def get_available_slots(medecin_id, date_value):
    day = _parse_date(date_value)
    
    # Récupérer les disponibilités du médecin pour ce jour
    availabilities = Disponibilite.objects.filter(
        medecin_id=medecin_id,
        jour_semaine=day.weekday(),
        actif=True
    )
    
    # Récupérer les rendez-vous déjà pris
    reserved = set(
        RendezVous.objects.filter(
            medecin_id=medecin_id,
            date_heure__date=day,
        ).exclude(statut='annule').values_list('date_heure', flat=True)
    )
    
    slots = []
    for availability in availabilities:
        current = _aware_datetime(day, availability.heure_debut)
        end = _aware_datetime(day, availability.heure_fin)
        step = timedelta(minutes=availability.duree_creneau)
        
        while current + step <= end:
            if current >= timezone.now() and current not in reserved:
                slots.append({
                    'datetime': current.isoformat(),
                    'time': current.strftime('%H:%M'),
                    'duration_minutes': availability.duree_creneau,
                })
            current += step
    
    return sorted(slots, key=lambda slot: slot['datetime'])

def suggest_best_slots(medecin_id, date_value, limit=3):
    slots = get_available_slots(medecin_id, date_value)
    preferred_hours = ('09:', '10:', '11:', '14:', '15:')
    return slots[:limit]

def auto_schedule(patient_id, medecin_id, date_value, motif=''):
    slots = get_available_slots(medecin_id, date_value)
    if not slots:
        return None
    
    patient = Patient.objects.get(pk=patient_id)
    medecin = CustomUser.objects.get(pk=medecin_id, role='medecin')
    scheduled_at = datetime.fromisoformat(slots[0]['datetime'])
    
    return RendezVous.objects.create(
        patient=patient,
        medecin=medecin,
        date_heure=scheduled_at,
        motif=motif,
        statut='planifie'
    )