from django.db import models
from django.conf import settings
from patients.models import Patient

class RendezVous(models.Model):
    STATUT_CHOICES = (
        ('planifie', 'Planifié'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='rendezvous')
    medecin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'medecin'}, related_name='medecin_rdvs')
    date_heure = models.DateTimeField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='planifie')
    motif = models.TextField(blank=True)

    def __str__(self):
        return f"RDV: {self.patient} avec Dr. {self.medecin.last_name} le {self.date_heure}"
