from django.db import models
from patients.models import Patient

class Facture(models.Model):
    STATUT_CHOICES = (
        ('en_attente', 'En attente'),
        ('payee', 'Payée'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='factures')
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    date_emission = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Facture #{self.id} de {self.patient}"

class Paiement(models.Model):
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE, related_name='paiements')
    montant_paye = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Paiement de {self.montant_paye} pour facture #{self.facture.id}"
