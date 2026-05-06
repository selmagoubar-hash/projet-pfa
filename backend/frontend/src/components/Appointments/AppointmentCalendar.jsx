import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import AutoSchedule from './AutoSchedule';
import { appointmentService, patientService, userService } from '../../services/api';

function AppointmentCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  const [form, setForm] = useState({
    patient: '',
    medecin: '',
    date_heure: '',
    motif: '',
    statut: 'planifie'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rdvRes, patientRes, doctorRes] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        userService.getAll({ role: 'medecin' })
      ]);
      setAppointments(rdvRes.data.results || rdvRes.data || []);
      setPatients(patientRes.data.results || patientRes.data || []);
      setDoctors(doctorRes.data.results || doctorRes.data || []);
      setError('');
    } catch (err) {
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ patient: '', medecin: '', date_heure: '', motif: '', statut: 'planifie' });
    setEditingAppointment(null);
    setShowForm(false);
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setForm({
      patient: appointment.patient,
      medecin: appointment.medecin,
      date_heure: appointment.date_heure.slice(0, 16),
      motif: appointment.motif || '',
      statut: appointment.statut
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, form);
        setSuccess('Rendez-vous modifié avec succès !');
      } else {
        await appointmentService.create(form);
        setSuccess('Rendez-vous créé avec succès !');
      }
      resetForm();
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Opération impossible');
    }
  };

  const handleDelete = async (id, patientName) => {
    if (window.confirm(`Supprimer le rendez-vous de ${patientName} ?`)) {
      try {
        await appointmentService.delete(id);
        setSuccess('Rendez-vous supprimé !');
        await loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleConfirm = async (id) => {
    try {
      await appointmentService.confirm(id);
      setSuccess('Rendez-vous confirmé !');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la confirmation');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Annuler ce rendez-vous ?')) {
      try {
        await appointmentService.cancel(id);
        setSuccess('Rendez-vous annulé !');
        await loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erreur lors de l\'annulation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'planifie': 'bg-primary',
      'termine': 'bg-success',
      'annule': 'bg-danger'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  const getStatusText = (status) => {
    const texts = {
      'planifie': 'Planifié',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return texts[status] || status;
  };

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>📅 Rendez-vous</h1>
          <p>Planifier, confirmer et annuler les rendez-vous</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Fermer' : '+ Nouveau rendez-vous'}
        </button>
      </div>

      <Alert type="danger" message={error} />
      <Alert type="success" message={success} />

      {showForm && (
        <div className="card shadow mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{editingAppointment ? '✏️ Modifier' : '➕ Créer'} un rendez-vous</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Patient *</label>
                  <select
                    className="form-select"
                    value={form.patient}
                    onChange={(e) => setForm({ ...form, patient: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nom_complet || `${p.first_name} ${p.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Médecin *</label>
                  <select
                    className="form-select"
                    value={form.medecin}
                    onChange={(e) => setForm({ ...form, medecin: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.nom_complet || d.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date et heure *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.date_heure}
                    onChange={(e) => setForm({ ...form, date_heure: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={form.statut}
                    onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  >
                    <option value="planifie">Planifié</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Motif</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Motif de la consultation..."
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingAppointment ? '💾 Enregistrer' : '➕ Créer'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Liste des rendez-vous</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <Loader />
              ) : appointments.length === 0 ? (
                <p className="text-muted text-center">Aucun rendez-vous</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Patient</th>
                        <th>Médecin</th>
                        <th>Date & heure</th>
                        <th>Motif</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.patient_nom || item.patient}</strong>
                          </td>
                          <td>{item.medecin_nom || item.medecin}</td>
                          <td>{new Date(item.date_heure).toLocaleString('fr-FR')}</td>
                          <td>{item.motif || '-'}</td>
                          <td>
                            <span className={getStatusBadge(item.statut)}>
                              {getStatusText(item.statut)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleEdit(item)}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleConfirm(item.id)}
                                disabled={item.statut !== 'planifie'}
                                title="Confirmer"
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancel(item.id)}
                                disabled={item.statut === 'annule'}
                                title="Annuler"
                              >
                                ✗
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleDelete(item.id, item.patient_nom)}
                                title="Supprimer"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <AutoSchedule onScheduled={loadData} />
        </div>
      </div>
    </section>
  );
}

export default AppointmentCalendar;