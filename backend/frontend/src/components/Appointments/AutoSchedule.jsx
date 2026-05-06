import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { appointmentService, patientService, userService } from '../../services/api';

function AutoSchedule({ onScheduled }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ patient: '', medecin: '', date: '', motif: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          patientService.getAll(),
          userService.getAll({ role: 'medecin' })
        ]);
        setPatients(patientRes.data.results || patientRes.data || []);
        setDoctors(doctorRes.data.results || doctorRes.data || []);
      } catch (err) {
        setError('Erreur chargement données');
      }
    };
    loadData();
  }, []);

  const loadSlots = async () => {
    if (!form.medecin || !form.date) {
      setError('Sélectionnez un médecin et une date');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await appointmentService.getAvailableSlots({
        medecin: form.medecin,
        date: form.date,
      });
      setSlots(response.data.slots || []);
      setSuggestions(response.data.suggestions || []);
      if (response.data.slots?.length === 0) {
        setError('Aucun créneau disponible pour cette date');
      }
    } catch (err) {
      setError('Erreur chargement créneaux');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.medecin || !form.date) {
      setError('Tous les champs sont requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await appointmentService.autoSchedule(form);
      setSuccess(`✅ Rendez-vous planifié le ${new Date(response.data.date_heure).toLocaleString('fr-FR')}`);
      setForm({ patient: '', medecin: '', date: '', motif: '' });
      setSlots([]);
      setSuggestions([]);
      if (onScheduled) onScheduled();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Planification impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">🤖 Planification automatique</h5>
      </div>
      <div className="card-body">
        <Alert type="danger" message={error} />
        <Alert type="success" message={success} />
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Patient</label>
            <select className="form-select" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
              <option value="">-- Sélectionner --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.nom_complet || `${p.first_name} ${p.last_name}`}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Médecin</label>
            <select className="form-select" value={form.medecin} onChange={(e) => setForm({ ...form, medecin: e.target.value })} required>
              <option value="">-- Sélectionner --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.nom_complet || d.username}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Date souhaitée</label>
            <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Motif</label>
            <textarea className="form-control" rows="2" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
          </div>
          
          <div className="d-flex gap-2 mb-3">
            <button type="button" className="btn btn-outline-info" onClick={loadSlots} disabled={loading}>
              {loading ? <Loader small /> : '🔍 Voir créneaux'}
            </button>
            <button type="submit" className="btn btn-info text-white" disabled={loading}>
              {loading ? <Loader small /> : '⚡ Auto planifier'}
            </button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="alert alert-info">
              <strong>📅 Meilleurs créneaux :</strong><br/>
              {suggestions.map((s, i) => <span key={i} className="badge bg-info me-1">{s.time}</span>)}
            </div>
          )}
          
          {slots.length > 0 && !suggestions.length && (
            <div className="alert alert-secondary">
              <strong>📅 {slots.length} créneaux disponibles :</strong><br/>
              {slots.slice(0, 5).map((s, i) => <span key={i} className="badge bg-secondary me-1">{s.time}</span>)}
              {slots.length > 5 && <span>...</span>}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AutoSchedule;