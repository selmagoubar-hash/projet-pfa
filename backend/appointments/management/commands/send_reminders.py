from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import RendezVous
from appointments.services import send_appointment_reminder_email


class Command(BaseCommand):
    help = 'Send appointment reminders 24 hours before scheduled appointments.'

    def handle(self, *args, **options):
        now = timezone.now()
        reminder_start = now + timedelta(hours=23, minutes=30)
        reminder_end = now + timedelta(hours=24, minutes=30)
        appointments = RendezVous.objects.select_related(
            'patient__user',
            'medecin',
        ).filter(
            statut='planifie',
            reminder_sent=False,
            date_heure__gte=reminder_start,
            date_heure__lte=reminder_end,
        )

        sent_count = 0
        for rendezvous in appointments:
            try:
                sent = send_appointment_reminder_email(rendezvous)
            except Exception as exc:
                self.stderr.write(f'Failed to send reminder for appointment #{rendezvous.id}: {exc}')
                continue

            if sent:
                rendezvous.reminder_sent = True
                rendezvous.save(update_fields=['reminder_sent'])
                sent_count += 1

        self.stdout.write(self.style.SUCCESS(f'{sent_count} reminder(s) sent.'))
