from django.urls import path

from . import views

app_name = 'billing'

urlpatterns = [
    path('', views.FactureListView.as_view(), name='list'),
    path('<int:pk>/', views.FactureDetailView.as_view(), name='detail'),
    path('<int:pk>/payer/', views.payer_facture, name='payer'),
]
