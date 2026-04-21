from django.contrib import admin
from .models import Patient, DossierMedical

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'date_of_birth', 'phone', 'created_at')
    search_fields = ('first_name', 'last_name', 'phone')

@admin.register(DossierMedical)
class DossierMedicalAdmin(admin.ModelAdmin):
    list_display = ('patient', 'updated_at')
    search_fields = ('patient__first_name', 'patient__last_name')
