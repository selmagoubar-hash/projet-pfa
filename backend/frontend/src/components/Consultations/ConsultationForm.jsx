import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { appointmentService, consultationService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function ConsultationForm() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ rendezvous: '', diagnostic: '', notes: '', tension_arterielle: '', poids: '', temperature: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [consultRes, rdvRes] = await Promise.all([consultationService.getAll(), appointmentService.getAll()]);
      setConsultations(consultRes.data.results || consultRes.data);
      setAppointments((rdvRes.data.results || rdvRes.data).filter((rdv) => rdv.statut !== 'annule'));
    } catch {
      setError('Impossible de charger les consultations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const rdv = appointments.find((item) => String(item.id) === String(form.rendezvous));
    if (!rdv) return;
    try {
      await consultationService.create({
        ...form,
        patient: rdv.patient,
        medecin: rdv.medecin || user.id,
        poids: form.poids || null,
        temperature: form.temperature || null,
      });
      setForm({ rendezvous: '', diagnostic: '', notes: '', tension_arterielle: '', poids: '', temperature: '' });
      load();
    } catch {
      setError('Enregistrement de la consultation impossible.');
    }
  };

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>Consultations</h1>
          <p>Créer les comptes rendus et suivre l'historique médical.</p>
        </div>
      </div>
      <Alert type="danger" message={error} />
      <div className="row g-3">
        <div className="col-xl-7">
          <div className="content-panel">
            <h2>Historique</h2>
            {loading ? <Loader /> : consultations.map((item) => (
              <div className="compact-row" key={item.id}>
                <strong>{item.patient_nom} · {new Date(item.date).toLocaleDateString('fr-FR')}</strong>
                <span>{item.diagnostic}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-xl-5">
          <form className="content-panel" onSubmit={submit}>
            <h2>Nouvelle consultation</h2>
            <select className="form-select mb-3" value={form.rendezvous} onChange={(e) => update('rendezvous', e.target.value)} required>
              <option value="">Rendez-vous</option>
              {appointments.map((rdv) => <option key={rdv.id} value={rdv.id}>{rdv.patient_nom} · {new Date(rdv.date_heure).toLocaleString('fr-FR')}</option>)}
            </select>
            <textarea className="form-control mb-3" placeholder="Diagnostic" value={form.diagnostic} onChange={(e) => update('diagnostic', e.target.value)} required />
            <textarea className="form-control mb-3" placeholder="Notes cliniques" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
            <div className="row g-2">
              <div className="col-md-4"><input className="form-control" placeholder="Tension" value={form.tension_arterielle} onChange={(e) => update('tension_arterielle', e.target.value)} /></div>
              <div className="col-md-4"><input className="form-control" type="number" step="0.01" placeholder="Poids" value={form.poids} onChange={(e) => update('poids', e.target.value)} /></div>
              <div className="col-md-4"><input className="form-control" type="number" step="0.1" placeholder="Temp." value={form.temperature} onChange={(e) => update('temperature', e.target.value)} /></div>
            </div>
            <button className="btn btn-primary w-100 mt-3" type="submit">Enregistrer</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ConsultationForm;
