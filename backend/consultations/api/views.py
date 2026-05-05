from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from consultations.models import Consultation, Medicament, Ordonnance
from .serializers import ConsultationSerializer, MedicamentSerializer, OrdonnanceSerializer


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'medecin':
            return Consultation.objects.filter(medecin=user)
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            return Consultation.objects.filter(patient=user.patient_profile)
        return Consultation.objects.all()
    
    @action(detail=True, methods=['get'])
    def ordonnance(self, request, pk=None):
        consultation = self.get_object()
        try:
            ordonnance = consultation.ordonnance
            serializer = OrdonnanceSerializer(ordonnance)
            return Response(serializer.data)
        except Ordonnance.DoesNotExist:
            return Response({'detail': 'Aucune ordonnance pour cette consultation'}, status=404)


class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = MedicamentSerializer
    permission_classes = [permissions.IsAuthenticated]
