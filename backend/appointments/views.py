from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, ListView, TemplateView, UpdateView

from .models import RendezVous
from .services import send_appointment_cancellation_email, send_appointment_confirmation_email


class StaffRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.role in ['admin', 'medecin', 'secretaire']


class RendezVousListView(LoginRequiredMixin, ListView):
    model = RendezVous
    template_name = 'appointments/rendezvous_list.html'
    context_object_name = 'rendezvous'
    paginate_by = 20

    def get_queryset(self):
        queryset = RendezVous.objects.select_related('patient', 'medecin').order_by('date_heure')
        user = self.request.user
        if user.role == 'medecin':
            queryset = queryset.filter(medecin=user)
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            queryset = queryset.filter(patient=user.patient_profile)
        return queryset


class RendezVousCreateView(LoginRequiredMixin, StaffRequiredMixin, CreateView):
    model = RendezVous
    fields = ['patient', 'medecin', 'date_heure', 'motif', 'statut']
    template_name = 'appointments/rendezvous_form.html'
    success_url = reverse_lazy('appointments:list')

    def form_valid(self, form):
        response = super().form_valid(form)
        try:
            send_appointment_confirmation_email(self.object)
        except Exception:
            pass
        messages.success(self.request, 'Rendez-vous créé avec succès.')
        return response


class RendezVousUpdateView(LoginRequiredMixin, StaffRequiredMixin, UpdateView):
    model = RendezVous
    fields = ['patient', 'medecin', 'date_heure', 'motif', 'statut']
    template_name = 'appointments/rendezvous_form.html'
    success_url = reverse_lazy('appointments:list')

    def form_valid(self, form):
        messages.success(self.request, 'Rendez-vous mis à jour.')
        return super().form_valid(form)


class RendezVousDeleteView(LoginRequiredMixin, StaffRequiredMixin, DeleteView):
    model = RendezVous
    template_name = 'appointments/rendezvous_confirm_delete.html'
    success_url = reverse_lazy('appointments:list')


class RendezVousCalendarView(LoginRequiredMixin, TemplateView):
    template_name = 'appointments/calendar.html'

    def get(self, request, *args, **kwargs):
        if request.headers.get('accept') == 'application/json' or request.GET.get('format') == 'json':
            events = RendezVous.objects.select_related('patient', 'medecin').all()
            return JsonResponse([
                {
                    'id': rdv.id,
                    'title': f'{rdv.patient} - Dr. {rdv.medecin.last_name}',
                    'start': rdv.date_heure.isoformat(),
                    'status': rdv.statut,
                    'motif': rdv.motif,
                }
                for rdv in events
            ], safe=False)
        return super().get(request, *args, **kwargs)


def confirm_rendezvous(request, pk):
    rdv = RendezVous.objects.get(pk=pk)
    rdv.statut = 'planifie'
    rdv.save(update_fields=['statut'])
    try:
        send_appointment_confirmation_email(rdv)
    except Exception:
        pass
    messages.success(request, 'Rendez-vous confirmé.')
    return redirect('appointments:list')


def cancel_rendezvous(request, pk):
    rdv = RendezVous.objects.get(pk=pk)
    rdv.statut = 'annule'
    rdv.save(update_fields=['statut'])
    try:
        send_appointment_cancellation_email(rdv)
    except Exception:
        pass
    messages.info(request, 'Rendez-vous annulé.')
    return redirect('appointments:list')
