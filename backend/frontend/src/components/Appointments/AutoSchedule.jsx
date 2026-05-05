import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { appointmentService, patientService, userService } from '../../services/api';

function AutoSchedule({ onScheduled }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ patient: '', medecin: '', date: '', motif: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      patientService.getAll(),
      userService.getAll({ role: 'medecin' }),
    ]).then(([patientRes, doctorRes]) => {
      setPatients(patientRes.data.results || patientRes.data);
      setDoctors(doctorRes.data.results || doctorRes.data);
    }).catch(() => setError('Impossible de charger les données de planification.'));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const loadSlots = async () => {
    if (!form.medecin || !form.date) return;
    setLoading(true);
    setError('');
    try {
      const response = await appointmentService.getAvailableSlots({
        medecin: form.medecin,
        date: form.date,
      });
      setSlots(response.data.slots || []);
      setSuggestions(response.data.suggestions || []);
    } catch {
      setError('Aucun créneau disponible pour cette sélection.');
      setSlots([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await appointmentService.autoSchedule(form);
      setForm({ patient: '', medecin: '', date: '', motif: '' });
      setSlots([]);
      setSuggestions([]);
      onScheduled?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Planification automatique impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="content-panel" onSubmit={submit}>
      <h2>Planification automatique</h2>
      <Alert type="danger" message={error} />
      <select className="form-select mb-3" value={form.patient} onChange={(event) => update('patient', event.target.value)} required>
        <option value="">Patient</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>{patient.nom_complet || `${patient.first_name} ${patient.last_name}`}</option>
        ))}
      </select>
      <select className="form-select mb-3" value={form.medecin} onChange={(event) => update('medecin', event.target.value)} required>
        <option value="">Médecin</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>Dr. {doctor.nom_complet || doctor.username}</option>
        ))}
      </select>
      <input className="form-control mb-3" type="date" value={form.date} onChange={(event) => update('date', event.target.value)} required />
      <textarea className="form-control mb-3" placeholder="Motif" value={form.motif} onChange={(event) => update('motif', event.target.value)} />
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-outline-primary" type="button" onClick={loadSlots} disabled={loading}>
          {loading ? <Loader small /> : 'Voir les créneaux'}
        </button>
        <button className="btn btn-primary" type="submit" disabled={loading || !form.patient || !form.medecin || !form.date}>
          Auto planifier
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="mb-3">
          <div className="small fw-semibold mb-2">Meilleures suggestions</div>
          <div className="d-flex flex-wrap gap-2">
            {suggestions.map((slot) => <span className="badge text-bg-primary" key={slot.datetime}>{slot.time}</span>)}
          </div>
        </div>
      )}
      {slots.length > 0 && (
        <div className="small text-muted">
          {slots.length} créneau(x) disponible(s): {slots.map((slot) => slot.time).join(', ')}
        </div>
      )}
    </form>
  );
}

export default AutoSchedule;
