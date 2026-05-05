from django.test import TestCase
from django.contrib.auth import get_user_model
from dashboard.services import get_dashboard_stats

User = get_user_model()

class DashboardServicesTest(TestCase):
    """Tests pour les services du dashboard"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testmedecin',
            password='testpass123',
            role='medecin'
        )

    def test_get_dashboard_stats_returns_dict(self):
        """Test que get_dashboard_stats retourne un dictionnaire"""
        stats = get_dashboard_stats()
        self.assertIsInstance(stats, dict)
        self.assertIn('nombre_patients', stats)
        self.assertIn('revenus_totaux', stats)
        self.assertIn('factures_en_attente', stats)

    def test_stats_have_correct_types(self):
        """Test que les statistiques ont les bons types"""
        stats = get_dashboard_stats()
        self.assertIsInstance(stats.get('nombre_patients', 0), int)
        self.assertIsInstance(stats.get('revenus_totaux', 0), (int, float))

    def test_empty_database_returns_zero(self):
        """Test qu'une base vide retourne des zéros"""
        stats = get_dashboard_stats()
        self.assertEqual(stats.get('nombre_patients', 0), 0)
        self.assertEqual(stats.get('nombre_consultations_terminees', 0), 0)
        self.assertEqual(stats.get('revenus_totaux', 0), 0)


class DashboardViewsTest(TestCase):
    """Tests pour les vues du dashboard"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='admin'
        )

    def test_dashboard_home_requires_login(self):
        """Test que le dashboard nécessite une authentification"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)  # Redirect to login

    def test_dashboard_home_logged_in(self):
        """Test que le dashboard s'affiche pour un utilisateur connecté"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'dashboard/home.html')