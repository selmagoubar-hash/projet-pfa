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
    reminder_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"RDV: {self.patient} avec Dr. {self.medecin.last_name} le {self.date_heure}"


class Disponibilite(models.Model):
    JOUR_CHOICES = (
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    )

    medecin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'medecin'},
        related_name='disponibilites',
    )
    jour_semaine = models.PositiveSmallIntegerField(choices=JOUR_CHOICES)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    duree_creneau = models.PositiveSmallIntegerField(default=30)
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ['medecin', 'jour_semaine', 'heure_debut']
        unique_together = ('medecin', 'jour_semaine', 'heure_debut', 'heure_fin')

    def __str__(self):
        return f"{self.medecin} - {self.get_jour_semaine_display()} {self.heure_debut}-{self.heure_fin}"
