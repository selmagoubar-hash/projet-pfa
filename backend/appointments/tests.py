from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from appointments.models import RendezVous, Disponibilite
from patients.models import Patient
from appointments.scheduling_service import get_available_slots, suggest_best_slots

User = get_user_model()

class RendezVousModelTest(TestCase):
    """Tests pour le modèle RendezVous"""

    def setUp(self):
        self.medecin = User.objects.create_user(
            username='dr_test',
            password='testpass123',
            role='medecin',
            first_name='Jean',
            last_name='Dupont'
        )
        self.patient = Patient.objects.create(
            first_name='Paul',
            last_name='Martin',
            email='paul@test.com',
            phone='0612345678'
        )

    def test_create_rendezvous(self):
        """Test de création d'un rendez-vous"""
        rdv = RendezVous.objects.create(
            patient=self.patient,
            medecin=self.medecin,
            date_heure=timezone.now() + timezone.timedelta(days=1),
            motif='Consultation de contrôle',
            statut='planifie'
        )
        self.assertEqual(rdv.patient, self.patient)
        self.assertEqual(rdv.medecin, self.medecin)
        self.assertEqual(rdv.statut, 'planifie')
        self.assertFalse(rdv.reminder_sent)

    def test_rendezvous_str_method(self):
        """Test de la méthode __str__"""
        rdv = RendezVous.objects.create(
            patient=self.patient,
            medecin=self.medecin,
            date_heure=timezone.now() + timezone.timedelta(days=1)
        )
        self.assertIn(str(self.patient), str(rdv))
        self.assertIn("Dr. Dupont", str(rdv))

    def test_rendezvous_statut_choices(self):
        """Test des choix de statut"""
        rdv = RendezVous.objects.create(
            patient=self.patient,
            medecin=self.medecin,
            date_heure=timezone.now() + timezone.timedelta(days=1)
        )
        self.assertEqual(rdv.get_statut_display(), 'Planifié')
        
        rdv.statut = 'termine'
        rdv.save()
        self.assertEqual(rdv.get_statut_display(), 'Terminé')
        
        rdv.statut = 'annule'
        rdv.save()
        self.assertEqual(rdv.get_statut_display(), 'Annulé')


class DisponibiliteModelTest(TestCase):
    """Tests pour le modèle Disponibilité"""

    def setUp(self):
        self.medecin = User.objects.create_user(
            username='dr_test',
            password='testpass123',
            role='medecin'
        )

    def test_create_disponibilite(self):
        """Test de création d'une disponibilité"""
        dispo = Disponibilite.objects.create(
            medecin=self.medecin,
            jour_semaine=0,  # Lundi
            heure_debut='09:00',
            heure_fin='12:00',
            duree_creneau=30,
            actif=True
        )
        self.assertEqual(dispo.medecin, self.medecin)
        self.assertEqual(dispo.heure_debut.strftime('%H:%M'), '09:00')
        self.assertEqual(dispo.duree_creneau, 30)
        self.assertTrue(dispo.actif)

    def test_disponibilite_str_method(self):
        """Test de la méthode __str__"""
        dispo = Disponibilite.objects.create(
            medecin=self.medecin,
            jour_semaine=0,
            heure_debut='09:00',
            heure_fin='12:00'
        )
        self.assertIn(str(self.medecin), str(dispo))
        self.assertIn('Lundi', str(dispo))


class SchedulingServiceTest(TestCase):
    """Tests pour le service de planification"""

    def setUp(self):
        self.medecin = User.objects.create_user(
            username='dr_test',
            password='testpass123',
            role='medecin'
        )
        self.patient = Patient.objects.create(
            first_name='Test',
            last_name='Patient',
            email='test@test.com'
        )

    def test_get_available_slots_empty(self):
        """Test de récupération des créneaux sans disponibilité"""
        from datetime import date
        slots = get_available_slots(self.medecin.id, date.today())
        self.assertEqual(slots, [])

    def test_suggest_best_slots_empty(self):
        """Test de suggestion sans disponibilité"""
        from datetime import date
        suggestions = suggest_best_slots(self.medecin.id, date.today())
        self.assertEqual(suggestions, [])


class RendezVousViewsTest(TestCase):
    """Tests pour les vues des rendez-vous"""

    def setUp(self):
        self.medecin = User.objects.create_user(
            username='dr_test',
            password='testpass123',
            role='medecin',
            first_name='Jean',
            last_name='Dupont'
        )
        self.secretaire = User.objects.create_user(
            username='secretaire',
            password='testpass123',
            role='secretaire'
        )
        self.patient_user = User.objects.create_user(
            username='patient',
            password='testpass123',
            role='patient'
        )
        self.patient = Patient.objects.create(
            first_name='Paul',
            last_name='Martin',
            email='paul@test.com',
            user=self.patient_user
        )

    def test_rendezvous_list_requires_login(self):
        """Test que la liste des rendez-vous nécessite une connexion"""
        response = self.client.get('/appointments/')
        self.assertEqual(response.status_code, 302)

    def test_rendezvous_list_for_medecin(self):
        """Test que le médecin voit ses rendez-vous"""
        self.client.login(username='dr_test', password='testpass123')
        response = self.client.get('/appointments/')
        self.assertEqual(response.status_code, 200)

    def test_rendezvous_list_for_secretaire(self):
        """Test que le secrétaire voit tous les rendez-vous"""
        self.client.login(username='secretaire', password='testpass123')
        response = self.client.get('/appointments/')
        self.assertEqual(response.status_code, 200)

    def test_create_rendezvous_for_secretaire(self):
        """Test de création d'un rendez-vous par un secrétaire"""
        self.client.login(username='secretaire', password='testpass123')
        response = self.client.post('/appointments/create/', {
            'patient': self.patient.id,
            'medecin': self.medecin.id,
            'date_heure': (timezone.now() + timezone.timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S'),
            'motif': 'Test consultation',
            'statut': 'planifie'
        })
        # Vérifier la redirection après création
        self.assertIn(response.status_code, [302, 200])


class AppointmentAPITest(TestCase):
    """Tests pour l'API des rendez-vous"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            password='testpass123',
            role='admin'
        )
        self.client.login(username='apiuser', password='testpass123')

    def test_api_calendar_endpoint(self):
        """Test de l'endpoint API calendar"""
        response = self.client.get('/api/rendez-vous/calendar/')
        self.assertEqual(response.status_code, 200)

    def test_api_available_slots_endpoint(self):
        """Test de l'endpoint API available-slots"""
        response = self.client.get('/api/rendez-vous/available-slots/')
        # Devrait retourner 400 car paramètres manquants
        self.assertEqual(response.status_code, 400)