from rest_framework import serializers
from patients.models import Patient, DossierMedical


class PatientSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'first_name', 'last_name', 'nom_complet', 'date_of_birth', 
                  'age', 'phone', 'address', 'created_at']
    
    def get_nom_complet(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))


class DossierMedicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DossierMedical
        fields = ['id', 'patient', 'diagnostic', 'traitement', 'ordonnance', 'updated_at']
