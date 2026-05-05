from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def _appointment_recipient(rendezvous):
    if rendezvous.patient.user and rendezvous.patient.user.email:
        return rendezvous.patient.user.email
    return None


def _send_appointment_email(rendezvous, subject, template_name):
    recipient = _appointment_recipient(rendezvous)
    if not recipient:
        return False

    context = {
        'rendezvous': rendezvous,
        'patient': rendezvous.patient,
        'medecin': rendezvous.medecin,
    }
    html_message = render_to_string(template_name, context)
    text_message = strip_tags(html_message)
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    email.attach_alternative(html_message, 'text/html')
    email.send(fail_silently=False)
    return True


def send_appointment_reminder_email(rendezvous):
    return _send_appointment_email(
        rendezvous,
        'Rappel de votre rendez-vous médical',
        'emails/appointment_reminder.html',
    )


def send_appointment_confirmation_email(rendezvous):
    return _send_appointment_email(
        rendezvous,
        'Confirmation de votre rendez-vous médical',
        'emails/appointment_confirmation.html',
    )


def send_appointment_cancellation_email(rendezvous):
    return _send_appointment_email(
        rendezvous,
        'Annulation de votre rendez-vous médical',
        'emails/appointment_cancellation.html',
    )
