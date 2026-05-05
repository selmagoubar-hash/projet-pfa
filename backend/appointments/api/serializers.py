from rest_framework import serializers

from appointments.models import Disponibilite, RendezVous


class RendezVousSerializer(serializers.ModelSerializer):
    patient_nom = serializers.SerializerMethodField()
    medecin_nom = serializers.SerializerMethodField()

    class Meta:
        model = RendezVous
        fields = [
            'id', 'patient', 'patient_nom', 'medecin', 'medecin_nom',
            'date_heure', 'statut', 'motif', 'reminder_sent'
        ]

    def get_medecin_nom(self, obj):
        return f'Dr. {obj.medecin.get_full_name() or obj.medecin.username}'

    def get_patient_nom(self, obj):
        return str(obj.patient)


class DisponibiliteSerializer(serializers.ModelSerializer):
    medecin_nom = serializers.SerializerMethodField()

    class Meta:
        model = Disponibilite
        fields = [
            'id', 'medecin', 'medecin_nom', 'jour_semaine',
            'heure_debut', 'heure_fin', 'duree_creneau', 'actif'
        ]

    def get_medecin_nom(self, obj):
        return f'Dr. {obj.medecin.get_full_name() or obj.medecin.username}'
