from django import forms
from .models import Consultation, Ordonnance, LigneOrdonnance, Medicament
from appointments.models import RendezVous


class ConsultationForm(forms.ModelForm):
    class Meta:
        model = Consultation
        fields = ['rendezvous', 'medecin', 'patient', 'diagnostic', 'notes', 
                  'tension_arterielle', 'poids', 'temperature']
        widgets = {
            'diagnostic': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'tension_arterielle': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ex: 120/80'}),
            'poids': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'temperature': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.1'}),
            'rendezvous': forms.Select(attrs={'class': 'form-select'}),
            'medecin': forms.Select(attrs={'class': 'form-select'}),
            'patient': forms.Select(attrs={'class': 'form-select'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limiter les rendez-vous à ceux qui n'ont pas encore de consultation
        self.fields['rendezvous'].queryset = RendezVous.objects.filter(
            consultation__isnull=True
        )


class OrdonnanceForm(forms.ModelForm):
    class Meta:
        model = Ordonnance
        fields = ['consultation', 'recommandations', 'duree_traitement']
        widgets = {
            'recommandations': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'duree_traitement': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ex: 7 jours'}),
            'consultation': forms.Select(attrs={'class': 'form-select'}),
        }


class LigneOrdonnanceForm(forms.ModelForm):
    class Meta:
        model = LigneOrdonnance
        fields = ['ordonnance', 'medicament', 'posologie', 'duree', 'quantite']
        widgets = {
            'posologie': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ex: 1 comprimé matin et soir'}),
            'duree': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ex: 5 jours'}),
            'quantite': forms.NumberInput(attrs={'class': 'form-control'}),
            'ordonnance': forms.Select(attrs={'class': 'form-select'}),
            'medicament': forms.Select(attrs={'class': 'form-select'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['medicament'].queryset = Medicament.objects.all().order_by('nom')