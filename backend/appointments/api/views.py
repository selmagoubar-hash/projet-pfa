from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from appointments.models import RendezVous
from appointments.scheduling_service import auto_schedule, get_available_slots, suggest_best_slots
from appointments.services import (
    send_appointment_cancellation_email,
    send_appointment_confirmation_email,
)
from .serializers import RendezVousSerializer


class RendezVousViewSet(viewsets.ModelViewSet):
    serializer_class = RendezVousSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = RendezVous.objects.select_related('patient', 'medecin').order_by('date_heure')
        if user.role == 'medecin':
            return queryset.filter(medecin=user)
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            return queryset.filter(patient=user.patient_profile)
        return queryset

    def perform_create(self, serializer):
        rendezvous = serializer.save()
        try:
            send_appointment_confirmation_email(rendezvous)
        except Exception:
            pass

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        rdv = self.get_object()
        rdv.statut = 'planifie'
        rdv.save(update_fields=['statut'])
        try:
            send_appointment_confirmation_email(rdv)
        except Exception:
            pass
        return Response(self.get_serializer(rdv).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        rdv = self.get_object()
        rdv.statut = 'annule'
        rdv.save(update_fields=['statut'])
        try:
            send_appointment_cancellation_email(rdv)
        except Exception:
            pass
        return Response(self.get_serializer(rdv).data)

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        return Response([
            {
                'id': rdv.id,
                'title': f'{rdv.patient} - Dr. {rdv.medecin.last_name}',
                'start': rdv.date_heure,
                'status': rdv.statut,
                'motif': rdv.motif,
            }
            for rdv in self.get_queryset()
        ])

    @action(detail=False, methods=['get'], url_path='available-slots')
    def available_slots(self, request):
        medecin_id = request.query_params.get('medecin')
        date_value = request.query_params.get('date')
        if not medecin_id or not date_value:
            return Response(
                {'detail': 'medecin and date query parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({
            'slots': get_available_slots(medecin_id, date_value),
            'suggestions': suggest_best_slots(medecin_id, date_value),
        })

    @action(detail=False, methods=['post'], url_path='auto-schedule')
    def auto_schedule(self, request):
        patient_id = request.data.get('patient')
        medecin_id = request.data.get('medecin')
        date_value = request.data.get('date')
        if not patient_id or not medecin_id or not date_value:
            return Response(
                {'detail': 'patient, medecin and date fields are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rendezvous = auto_schedule(
            patient_id=patient_id,
            medecin_id=medecin_id,
            date_value=date_value,
            motif=request.data.get('motif', ''),
        )
        if rendezvous is None:
            return Response(
                {'detail': 'Aucun créneau disponible pour cette date.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            send_appointment_confirmation_email(rendezvous)
        except Exception:
            pass
        return Response(self.get_serializer(rendezvous).data, status=status.HTTP_201_CREATED)
