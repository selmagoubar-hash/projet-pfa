import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import AutoSchedule from './AutoSchedule';
import { appointmentService, patientService, userService } from '../../services/api';

function AppointmentCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', medecin: '', date_heure: '', motif: '', statut: 'planifie' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [rdvRes, patientRes, doctorRes] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        userService.getAll({ role: 'medecin' }),
      ]);
      setAppointments(rdvRes.data.results || rdvRes.data);
      setPatients(patientRes.data.results || patientRes.data);
      setDoctors(doctorRes.data.results || doctorRes.data);
    } catch {
      setError('Impossible de charger les rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await appointmentService.create(form);
      setForm({ patient: '', medecin: '', date_heure: '', motif: '', statut: 'planifie' });
      load();
    } catch {
      setError('Création du rendez-vous impossible.');
    }
  };

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>Rendez-vous</h1>
          <p>Planifier, confirmer et annuler les rendez-vous.</p>
        </div>
      </div>
      <Alert type="danger" message={error} />
      <div className="row g-3">
        <div className="col-xl-8">
          <div className="content-panel">
            <h2>Agenda</h2>
            {loading ? <Loader /> : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead><tr><th>Date</th><th>Patient</th><th>Médecin</th><th>Motif</th><th>Statut</th><th></th></tr></thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.date_heure).toLocaleString('fr-FR')}</td>
                        <td>{item.patient_nom}</td>
                        <td>{item.medecin_nom}</td>
                        <td>{item.motif || '-'}</td>
                        <td><span className="badge text-bg-light border">{item.statut}</span></td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-success me-2" onClick={() => appointmentService.confirm(item.id).then(load)} type="button">Confirmer</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => appointmentService.cancel(item.id).then(load)} type="button">Annuler</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="col-xl-4">
          <AutoSchedule onScheduled={load} />
          <form className="content-panel mt-3" onSubmit={submit}>
            <h2>Nouveau rendez-vous</h2>
            <select className="form-select mb-3" value={form.patient} onChange={(e) => update('patient', e.target.value)} required>
              <option value="">Patient</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.nom_complet || `${patient.first_name} ${patient.last_name}`}</option>)}
            </select>
            <select className="form-select mb-3" value={form.medecin} onChange={(e) => update('medecin', e.target.value)} required>
              <option value="">Médecin</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>Dr. {doctor.nom_complet || doctor.username}</option>)}
            </select>
            <input className="form-control mb-3" type="datetime-local" value={form.date_heure} onChange={(e) => update('date_heure', e.target.value)} required />
            <textarea className="form-control mb-3" placeholder="Motif" value={form.motif} onChange={(e) => update('motif', e.target.value)} />
            <button className="btn btn-primary w-100" type="submit">Planifier</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AppointmentCalendar;
