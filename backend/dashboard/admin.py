from django.contrib import admin
from .models import DashboardStats  # Créons le modèle plus bas

# Si vous n'avez pas encore de modèle, enregistrez au moins l'admin par défaut
admin.site.site_header = "Cabinet Médical Administration"
admin.site.site_title = "Cabinet Médical"
admin.site.index_title = "Bienvenue dans l'administration"