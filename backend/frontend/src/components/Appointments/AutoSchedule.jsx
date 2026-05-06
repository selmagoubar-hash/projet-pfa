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
  const [success, setSuccess] = useState('');

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
        console.error('Erreur:', err);
        setError('Impossible de charger les données');
      }
    };
    loadData();
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const loadSlots = async () => {
    if (!form.medecin || !form.date) {
      setError('Veuillez sélectionner un médecin et une date');
      return;
    }
    
    setLoading(true);
    setError('');
    setSlots([]);
    setSuggestions([]);
    
    try {
      const response = await appointmentService.getAvailableSlots({
        medecin: form.medecin,
        date: form.date,
      });
      
      if (response.data?.slots?.length > 0) {
        setSlots(response.data.slots);
        setSuggestions(response.data.suggestions || []);
      } else {
        setError('Aucun créneau disponible pour cette date. Vérifiez les disponibilités du médecin.');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSchedule = async (event) => {
    event.preventDefault();
    
    if (!form.patient || !form.medecin || !form.date) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await appointmentService.autoSchedule({
        patient: form.patient,
        medecin: form.medecin,
        date: form.date,
        motif: form.motif || '',
      });
      
      setSuccess(`✅ Rendez-vous planifié le ${new Date(response.data.date_heure).toLocaleString('fr-FR')}`);
      setForm({ patient: '', medecin: '', date: '', motif: '' });
      setSlots([]);
      setSuggestions([]);
      
      if (onScheduled) onScheduled();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Planification automatique impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="content-panel" onSubmit={handleAutoSchedule}>
      <h2>🤖 Planification automatique</h2>
      
      <Alert type="danger" message={error} />
      <Alert type="success" message={success} />
      
      <div className="mb-3">
        <label className="form-label">Patient *</label>
        <select 
          className="form-select" 
          value={form.patient} 
          onChange={(e) => update('patient', e.target.value)} 
          required
        >
          <option value="">-- Sélectionner un patient --</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.nom_complet || `${patient.first_name} ${patient.last_name}`}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Médecin *</label>
        <select 
          className="form-select" 
          value={form.medecin} 
          onChange={(e) => update('medecin', e.target.value)} 
          required
        >
          <option value="">-- Sélectionner un médecin --</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.nom_complet || doctor.username}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Date souhaitée *</label>
        <input 
          className="form-control" 
          type="date" 
          value={form.date} 
          onChange={(e) => update('date', e.target.value)} 
          required 
        />
        <small className="text-muted">Choisissez une date future</small>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Motif (optionnel)</label>
        <textarea 
          className="form-control" 
          placeholder="Motif de la consultation..." 
          value={form.motif} 
          onChange={(e) => update('motif', e.target.value)} 
          rows="2"
        />
      </div>
      
      <div className="d-flex gap-2 mb-3">
        <button 
          className="btn btn-outline-primary" 
          type="button" 
          onClick={loadSlots} 
          disabled={loading || !form.medecin || !form.date}
        >
          {loading ? <Loader small /> : '🔍 Voir les créneaux disponibles'}
        </button>
        <button 
          className="btn btn-success" 
          type="submit" 
          disabled={loading || !form.patient || !form.medecin || !form.date}
        >
          {loading ? <Loader small /> : '⚡ Auto planifier'}
        </button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="alert alert-info">
          <strong>📅 Meilleurs créneaux suggérés :</strong>
          <div className="mt-2">
            {suggestions.slice(0, 5).map((slot, idx) => (
              <span className="badge bg-info me-2 mb-1" key={idx}>
                {slot.time}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {slots.length > 0 && !suggestions.length && (
        <div className="alert alert-secondary">
          <strong>📅 {slots.length} créneau(x) disponible(s) :</strong>
          <div className="mt-2">
            {slots.slice(0, 10).map((slot, idx) => (
              <span className="badge bg-secondary me-2 mb-1" key={idx}>
                {slot.time}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {!slots.length && !suggestions.length && form.date && form.medecin && !loading && (
        <div className="alert alert-warning">
          ⚠️ Aucun créneau trouvé pour cette date. 
          <br/>
          Vérifiez que le médecin a des disponibilités configurées dans l'admin Django.
        </div>
      )}
    </form>
  );
}

export default AutoSchedule;