from django.contrib import admin
from .models import Facture, Paiement

@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'montant_total', 'statut', 'date_emission')
    list_filter = ('statut', 'date_emission')
    search_fields = ('patient__first_name', 'patient__last_name')

@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('facture', 'montant_paye', 'date_paiement')
    list_filter = ('date_paiement',)
