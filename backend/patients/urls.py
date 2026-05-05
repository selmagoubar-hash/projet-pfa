from django.urls import path
from . import views

app_name = 'patients'

urlpatterns = [
    path('', views.PatientListView.as_view(), name='list'),
    path('ajouter/', views.PatientCreateView.as_view(), name='create'),
    path('<int:pk>/modifier/', views.PatientUpdateView.as_view(), name='update'),
    path('<int:pk>/supprimer/', views.PatientDeleteView.as_view(), name='delete'),
]