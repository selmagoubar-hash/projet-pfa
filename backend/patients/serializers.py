from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()
    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'first_name', 'last_name', 'nom_complet', 'email', 'phone', 
                  'date_of_birth', 'age', 'address', 'social_security_number', 'created_at']

    def get_nom_complet(self, obj):
        return f"{obj.first_name} {obj.last_name}"