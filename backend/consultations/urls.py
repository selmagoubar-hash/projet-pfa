from django.urls import path
from . import views

app_name = 'consultations'

urlpatterns = [
    # Consultations
    path('', views.ConsultationListView.as_view(), name='list'),
    path('<int:pk>/', views.ConsultationDetailView.as_view(), name='detail'),
    path('ajouter/', views.ConsultationCreateView.as_view(), name='create'),
    path('ajouter/<int:rendezvous_id>/', views.ConsultationCreateView.as_view(), name='create_from_rendezvous'),
    path('<int:pk>/modifier/', views.ConsultationUpdateView.as_view(), name='update'),
    path('<int:pk>/supprimer/', views.ConsultationDeleteView.as_view(), name='delete'),
    
    # Ordonnances
    path('ordonnance/<int:pk>/', views.OrdonnanceDetailView.as_view(), name='ordonnance_detail'),
    path('ordonnance/ajouter/<int:consultation_id>/', views.OrdonnanceCreateView.as_view(), name='ordonnance_create'),
    path('ordonnance/<int:pk>/modifier/', views.OrdonnanceUpdateView.as_view(), name='ordonnance_update'),
    path('ordonnance/<int:ordonnance_id>/ligne/ajouter/', views.LigneOrdonnanceCreateView.as_view(), name='ligne_create'),
    
    # Utilitaire
    path('depuis-rendezvous/<int:rendezvous_id>/', views.creer_consultation_depuis_rendezvous, name='from_rendezvous'),
]