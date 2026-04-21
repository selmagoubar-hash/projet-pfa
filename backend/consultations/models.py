from django.db import models
from django.conf import settings
from appointments.models import RendezVous
from patients.models import Patient


class Consultation(models.Model):
    """
    Modèle représentant une consultation médicale.
    Une consultation est liée à un rendez-vous et à un médecin.
    """
    rendezvous = models.OneToOneField(
        RendezVous, 
        on_delete=models.CASCADE, 
        related_name='consultation',
        verbose_name="Rendez-vous associé"
    )
    medecin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'medecin'},
        related_name='consultations_realisees',
        verbose_name="Médecin"
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='consultations',
        verbose_name="Patient"
    )
    diagnostic = models.TextField(verbose_name="Diagnostic")
    notes = models.TextField(blank=True, verbose_name="Notes cliniques")
    tension_arterielle = models.CharField(max_length=20, blank=True, verbose_name="Tension artérielle")
    poids = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Poids (kg)")
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, verbose_name="Température (°C)")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Date de consultation")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")

    class Meta:
        verbose_name = "Consultation"
        verbose_name_plural = "Consultations"
        ordering = ['-date']

    def __str__(self):
        return f"Consultation du {self.date.strftime('%d/%m/%Y %H:%M')} - {self.patient}"


class Medicament(models.Model):
    """
    Modèle représentant un médicament dans la base.
    """
    nom = models.CharField(max_length=200, verbose_name="Nom du médicament")
    description = models.TextField(blank=True, verbose_name="Description")
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Prix unitaire")

    class Meta:
        verbose_name = "Médicament"
        verbose_name_plural = "Médicaments"

    def __str__(self):
        return self.nom


class Ordonnance(models.Model):
    """
    Modèle représentant une ordonnance.
    Une ordonnance est liée à une consultation et contient plusieurs médicaments.
    """
    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.CASCADE,
        related_name='ordonnance',
        verbose_name="Consultation"
    )
    date = models.DateField(auto_now_add=True, verbose_name="Date d'émission")
    recommandations = models.TextField(blank=True, verbose_name="Recommandations générales")
    duree_traitement = models.CharField(max_length=100, blank=True, verbose_name="Durée du traitement")

    class Meta:
        verbose_name = "Ordonnance"
        verbose_name_plural = "Ordonnances"

    def __str__(self):
        return f"Ordonnance du {self.date} - {self.consultation.patient}"


class LigneOrdonnance(models.Model):
    """
    Modèle représentant une ligne d'ordonnance (médicament + posologie).
    """
    ordonnance = models.ForeignKey(
        Ordonnance,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name="Ordonnance"
    )
    medicament = models.ForeignKey(
        Medicament,
        on_delete=models.CASCADE,
        related_name='lignes_ordonnance',
        verbose_name="Médicament"
    )
    posologie = models.CharField(max_length=200, verbose_name="Posologie")
    duree = models.CharField(max_length=100, blank=True, verbose_name="Durée")
    quantite = models.PositiveIntegerField(default=1, verbose_name="Quantité")

    class Meta:
        verbose_name = "Ligne d'ordonnance"
        verbose_name_plural = "Lignes d'ordonnance"

    def __str__(self):
        return f"{self.medicament.nom} - {self.posologie}"