from datetime import timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from appointments.models import RendezVous
from billing.models import Facture
from consultations.models import Consultation
from patients.models import Patient


class DashboardStatsAPIView(APIView):
    permission_classes = []

    def get(self, request):
        now = timezone.now()
        today = now.date()
        start_week = now - timedelta(days=7)
        start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        stats = {
            'nombre_patients': Patient.objects.count(),
            'nombre_consultations': RendezVous.objects.filter(statut='termine').count(),
            'revenus_totaux': float(
                Facture.objects.filter(statut='payee').aggregate(total=Sum('montant_total'))['total'] or 0
            ),
            'revenus_mois': float(
                Facture.objects.filter(statut='payee', date_emission__gte=start_month).aggregate(
                    total=Sum('montant_total')
                )['total'] or 0
            ),
            'rendezvous_aujourdhui': RendezVous.objects.filter(date_heure__date=today).count(),
            'consultations_mois': Consultation.objects.filter(date__gte=start_month).count(),
            'consultations_semaine': Consultation.objects.filter(date__gte=start_week).count(),
            'nouveaux_patients_mois': Patient.objects.filter(created_at__gte=start_month).count(),
        }

        stats['dernieres_consultations'] = [
            {
                'id': consultation.id,
                'patient': str(consultation.patient),
                'date': consultation.date.strftime('%d/%m/%Y %H:%M'),
                'diagnostic': consultation.diagnostic[:50] if consultation.diagnostic else '',
            }
            for consultation in Consultation.objects.select_related('patient').order_by('-date')[:5]
        ]

        stats['top_medecins'] = [
            {
                'nom': f"Dr. {item['medecin__last_name']}",
                'prenom': item['medecin__first_name'],
                'total': item['total'],
            }
            for item in Consultation.objects.values(
                'medecin__first_name',
                'medecin__last_name',
            ).annotate(total=Count('id')).order_by('-total')[:5]
        ]

        stats['liste_rdv_aujourdhui'] = [
            {
                'id': rendezvous.id,
                'patient': str(rendezvous.patient),
                'heure': rendezvous.date_heure.strftime('%H:%M'),
                'medecin': f"Dr. {rendezvous.medecin.last_name}",
            }
            for rendezvous in RendezVous.objects.select_related('patient', 'medecin').filter(
                date_heure__date=today,
                statut='planifie',
            )[:10]
        ]

        return Response(stats)


class AdvancedDashboardStatsAPIView(APIView):
    permission_classes = []

    def get(self, request):
        now = timezone.now()
        start_30_days = now - timedelta(days=30)
        start_12_months = now - timedelta(days=365)

        consultations_by_day = Consultation.objects.filter(
            date__gte=start_30_days,
        ).annotate(
            day=TruncDate('date'),
        ).values('day').annotate(total=Count('id')).order_by('day')

        revenues_by_month = Facture.objects.filter(
            statut='payee',
            date_emission__gte=start_12_months.date(),
        ).annotate(
            month=TruncMonth('date_emission'),
        ).values('month').annotate(total=Sum('montant_total')).order_by('month')

        rdv_by_status = RendezVous.objects.values('statut').annotate(
            total=Count('id'),
        ).order_by('statut')

        top_medecins = Consultation.objects.values(
            'medecin__first_name',
            'medecin__last_name',
            'medecin__username',
        ).annotate(total=Count('id')).order_by('-total')[:5]

        top_diagnostics = Consultation.objects.exclude(
            diagnostic='',
        ).values('diagnostic').annotate(total=Count('id')).order_by('-total')[:5]

        return Response({
            'consultations_by_day': [
                {'date': item['day'].isoformat(), 'total': item['total']}
                for item in consultations_by_day
            ],
            'revenues_by_month': [
                {'month': item['month'].strftime('%Y-%m'), 'total': float(item['total'] or 0)}
                for item in revenues_by_month
            ],
            'rdv_by_status': [
                {'status': item['statut'], 'total': item['total']}
                for item in rdv_by_status
            ],
            'top_medecins': [
                {
                    'name': self._doctor_name(item),
                    'total': item['total'],
                }
                for item in top_medecins
            ],
            'top_diagnostics': [
                {'diagnostic': item['diagnostic'], 'total': item['total']}
                for item in top_diagnostics
            ],
        })

    @staticmethod
    def _doctor_name(item):
        full_name = f"{item['medecin__first_name']} {item['medecin__last_name']}".strip()
        return f"Dr. {full_name}" if full_name else item['medecin__username']
