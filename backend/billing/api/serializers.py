from rest_framework import serializers

from billing.models import Facture, Paiement


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'facture', 'montant_paye', 'date_paiement']


class FactureSerializer(serializers.ModelSerializer):
    patient_nom = serializers.SerializerMethodField()
    paiements = PaiementSerializer(many=True, read_only=True)

    class Meta:
        model = Facture
        fields = ['id', 'patient', 'patient_nom', 'montant_total', 'statut', 'date_emission', 'paiements']

    def get_patient_nom(self, obj):
        return str(obj.patient)
