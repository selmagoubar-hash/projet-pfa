from django.urls import path

from . import views

app_name = 'appointments'

urlpatterns = [
    path('', views.RendezVousListView.as_view(), name='list'),
    path('create/', views.RendezVousCreateView.as_view(), name='create'),
    path('<int:pk>/edit/', views.RendezVousUpdateView.as_view(), name='update'),
    path('<int:pk>/delete/', views.RendezVousDeleteView.as_view(), name='delete'),
    path('calendar/', views.RendezVousCalendarView.as_view(), name='calendar'),
    path('<int:pk>/confirm/', views.confirm_rendezvous, name='confirm'),
    path('<int:pk>/cancel/', views.cancel_rendezvous, name='cancel'),
]
