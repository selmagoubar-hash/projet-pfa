from django.contrib import admin
from .models import RendezVous

@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medecin', 'date_heure', 'statut')
    list_filter = ('statut', 'date_heure', 'medecin')
    search_fields = ('patient__first_name', 'patient__last_name')
