from rest_framework import serializers
from consultations.models import Consultation, Ordonnance, Medicament, LigneOrdonnance


class MedicamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicament
        fields = ['id', 'nom', 'description', 'prix_unitaire']


class LigneOrdonnanceSerializer(serializers.ModelSerializer):
    medicament_nom = serializers.CharField(source='medicament.nom', read_only=True)
    
    class Meta:
        model = LigneOrdonnance
        fields = ['id', 'medicament', 'medicament_nom', 'posologie', 'duree', 'quantite']


class OrdonnanceSerializer(serializers.ModelSerializer):
    lignes = LigneOrdonnanceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ordonnance
        fields = ['id', 'consultation', 'date', 'recommandations', 'duree_traitement', 'lignes']


class ConsultationSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='patient.first_name', read_only=True)
    medecin_nom = serializers.CharField(source='medecin.last_name', read_only=True)
    ordonnance = OrdonnanceSerializer(read_only=True)
    
    class Meta:
        model = Consultation
        fields = ['id', 'rendezvous', 'medecin', 'medecin_nom', 'patient', 'patient_nom',
                  'diagnostic', 'notes', 'tension_arterielle', 'poids', 'temperature',
                  'date', 'updated_at', 'ordonnance']
