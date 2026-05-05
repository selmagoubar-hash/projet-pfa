from django.contrib import admin
from .models import Disponibilite, RendezVous

@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medecin', 'date_heure', 'statut', 'reminder_sent')
    list_filter = ('statut', 'date_heure', 'medecin', 'reminder_sent')
    search_fields = ('patient__first_name', 'patient__last_name')


@admin.register(Disponibilite)
class DisponibiliteAdmin(admin.ModelAdmin):
    list_display = ('medecin', 'jour_semaine', 'heure_debut', 'heure_fin', 'duree_creneau', 'actif')
    list_filter = ('jour_semaine', 'actif', 'medecin')
