from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views.generic import DetailView, ListView

from .models import Facture, Paiement


class FactureListView(LoginRequiredMixin, ListView):
    model = Facture
    template_name = 'billing/facture_list.html'
    context_object_name = 'factures'
    paginate_by = 20

    def get_queryset(self):
        queryset = Facture.objects.select_related('patient').order_by('-date_emission')
        user = self.request.user
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            return queryset.filter(patient=user.patient_profile)
        return queryset


class FactureDetailView(LoginRequiredMixin, DetailView):
    model = Facture
    template_name = 'billing/facture_detail.html'
    context_object_name = 'facture'


def payer_facture(request, pk):
    facture = get_object_or_404(Facture, pk=pk)
    if request.method == 'POST':
        montant = request.POST.get('montant') or facture.montant_total
        Paiement.objects.create(facture=facture, montant_paye=montant)
        total_paye = sum(p.montant_paye for p in facture.paiements.all())
        if total_paye >= facture.montant_total:
            facture.statut = 'payee'
            facture.save(update_fields=['statut'])
        messages.success(request, 'Paiement enregistré.')
    return redirect(reverse_lazy('billing:detail', kwargs={'pk': facture.pk}))
