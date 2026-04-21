from django.contrib import admin
from .models import Consultation, Ordonnance, Medicament, LigneOrdonnance


class LigneOrdonnanceInline(admin.TabularInline):
    model = LigneOrdonnance
    extra = 1
    fields = ['medicament', 'posologie', 'duree', 'quantite']


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'medecin', 'date', 'diagnostic_court')
    list_filter = ('date', 'medecin')
    search_fields = ('patient__first_name', 'patient__last_name', 'medecin__username', 'diagnostic')
    readonly_fields = ('date', 'updated_at')
    fieldsets = (
        ('Informations principales', {
            'fields': ('rendezvous', 'medecin', 'patient', 'diagnostic', 'notes')
        }),
        ('Signes vitaux', {
            'fields': ('tension_arterielle', 'poids', 'temperature'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('date', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def diagnostic_court(self, obj):
        return obj.diagnostic[:50] + '...' if len(obj.diagnostic) > 50 else obj.diagnostic
    diagnostic_court.short_description = "Diagnostic"


@admin.register(Ordonnance)
class OrdonnanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'consultation', 'date', 'nb_medicaments')
    list_filter = ('date',)
    search_fields = ('consultation__patient__first_name', 'consultation__patient__last_name')
    inlines = [LigneOrdonnanceInline]

    def nb_medicaments(self, obj):
        return obj.lignes.count()
    nb_medicaments.short_description = "Nb médicaments"


@admin.register(Medicament)
class MedicamentAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prix_unitaire')
    search_fields = ('nom',)
    list_filter = ('prix_unitaire',)


@admin.register(LigneOrdonnance)
class LigneOrdonnanceAdmin(admin.ModelAdmin):
    list_display = ('ordonnance', 'medicament', 'posologie', 'quantite')
    list_filter = ('ordonnance__date',)
    search_fields = ('medicament__nom',)