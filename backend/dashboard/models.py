from django.db import models
from django.utils import timezone

class DashboardStats(models.Model):
    """Modèle pour stocker des statistiques du dashboard (optionnel)"""
    date = models.DateField(default=timezone.now, unique=True)
    total_patients = models.IntegerField(default=0)
    total_consultations = models.IntegerField(default=0)
    total_revenus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    nouveaux_patients = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Statistique Dashboard"
        verbose_name_plural = "Statistiques Dashboard"
        ordering = ['-date']

    def __str__(self):
        return f"Stats du {self.date}"