from django.db.models import Sum
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from billing.models import Facture
from .serializers import FactureSerializer, PaiementSerializer


class FactureViewSet(viewsets.ModelViewSet):
    serializer_class = FactureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Facture.objects.select_related('patient').prefetch_related('paiements').order_by('-date_emission')
        user = self.request.user
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            return queryset.filter(patient=user.patient_profile)
        return queryset

    @action(detail=True, methods=['post'])
    def payer(self, request, pk=None):
        facture = self.get_object()
        serializer = PaiementSerializer(data={
            'facture': facture.id,
            'montant_paye': request.data.get('montant_paye') or request.data.get('montant') or facture.montant_total,
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        total_paye = facture.paiements.aggregate(total=Sum('montant_paye'))['total'] or 0
        if total_paye >= facture.montant_total:
            facture.statut = 'payee'
            facture.save(update_fields=['statut'])

        return Response(FactureSerializer(facture, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)
