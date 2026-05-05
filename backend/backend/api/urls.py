from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from consultations.api.views import ConsultationViewSet, MedicamentViewSet
from patients.api.views import PatientViewSet
from appointments.api.views import RendezVousViewSet
from billing.api.views import FactureViewSet
from dashboard.api.views import AdvancedDashboardStatsAPIView, DashboardStatsAPIView
from users.api.views import RegisterAPIView, LoginAPIView, UserProfileAPIView, UserViewSet

router = DefaultRouter()
router.register(r'consultations', ConsultationViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'medicaments', MedicamentViewSet)
router.register(r'rendez-vous', RendezVousViewSet, basename='rendez-vous')
router.register(r'factures', FactureViewSet, basename='factures')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard_stats'),
    path('dashboard/advanced-stats/', AdvancedDashboardStatsAPIView.as_view(), name='dashboard_advanced_stats'),
    path('auth/register/', RegisterAPIView.as_view(), name='api_register'),
    path('auth/login/', LoginAPIView.as_view(), name='api_login'),
    path('auth/profile/', UserProfileAPIView.as_view(), name='api_profile'),
    path('auth/token/', obtain_auth_token, name='api_token'),
    path('auth/', include('rest_framework.urls')),
]
