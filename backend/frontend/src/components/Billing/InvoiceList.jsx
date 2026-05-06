import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { billingService, patientService } from '../../services/api';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient: '', montant_total: '', description: '' });
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoiceRes, patientRes] = await Promise.all([
        billingService.getAll(),
        patientService.getAll()
      ]);
      setInvoices(invoiceRes.data.results || invoiceRes.data || []);
      setPatients(patientRes.data.results || patientRes.data || []);
    } catch (err) {
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await billingService.create({
        patient: form.patient,
        montant_total: parseFloat(form.montant_total),
        statut: 'en_attente'
      });
      setSuccess('Facture créée !');
      setForm({ patient: '', montant_total: '', description: '' });
      setShowForm(false);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la création');
    }
  };

  const handlePay = async (invoice) => {
    const montant = paymentAmount || invoice.montant_total;
    if (window.confirm(`Payer ${montant} FCFA ?`)) {
      try {
        await billingService.pay(invoice.id, montant);
        setSuccess(`Paiement de ${montant} FCFA enregistré !`);
        setPayingInvoice(null);
        setPaymentAmount('');
        await loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erreur lors du paiement');
      }
    }
  };

  const getStatusBadge = (statut) => {
    return statut === 'payee' 
      ? 'badge bg-success' 
      : 'badge bg-warning text-dark';
  };

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>📄 Factures</h1>
          <p>Gestion des factures et paiements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Fermer' : '+ Nouvelle facture'}
        </button>
      </div>

      <Alert type="danger" message={error} />
      <Alert type="success" message={success} />

      {showForm && (
        <div className="card shadow mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">➕ Nouvelle facture</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
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
                  <label className="form-label">Montant (FCFA) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.montant_total}
                    onChange={(e) => setForm({ ...form, montant_total: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">Créer la facture</button>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📋 Liste des factures</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <Loader />
          ) : invoices.length === 0 ? (
            <p className="text-muted text-center">Aucune facture</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Montant</th>
                    <th>Payé</th>
                    <th>Reste</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const totalPaye = invoice.paiements?.reduce((sum, p) => sum + p.montant_paye, 0) || 0;
                    const reste = invoice.montant_total - totalPaye;
                    return (
                      <tr key={invoice.id}>
                        <td>#{invoice.id}</td>
                        <td>{invoice.patient_nom}</td>
                        <td>{invoice.montant_total.toLocaleString()} FCFA</td>
                        <td>{totalPaye.toLocaleString()} FCFA</td>
                        <td className={reste > 0 ? 'text-danger fw-bold' : 'text-success'}>{reste.toLocaleString()} FCFA</td>
                        <td>
                          <span className={getStatusBadge(invoice.statut)}>
                            {invoice.statut === 'payee' ? 'Payée' : 'En attente'}
                          </span>
                        </td>
                        <td>{new Date(invoice.date_emission).toLocaleDateString('fr-FR')}</td>
                        <td>
                          {invoice.statut !== 'payee' && (
                            payingInvoice === invoice.id ? (
                              <div className="d-flex gap-1">
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  style={{ width: '100px' }}
                                  placeholder="Montant"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                                <button className="btn btn-sm btn-success" onClick={() => handlePay(invoice)}>✓</button>
                                <button className="btn btn-sm btn-secondary" onClick={() => setPayingInvoice(null)}>✗</button>
                              </div>
                            ) : (
                              <button className="btn btn-sm btn-outline-success" onClick={() => setPayingInvoice(invoice.id)}>
                                Payer
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InvoiceList;