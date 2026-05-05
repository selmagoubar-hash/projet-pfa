import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { billingService, patientService } from '../../services/api';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', montant_total: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [invoiceRes, patientRes] = await Promise.all([billingService.getAll(), patientService.getAll()]);
      setInvoices(invoiceRes.data.results || invoiceRes.data);
      setPatients(patientRes.data.results || patientRes.data);
    } catch {
      setError('Impossible de charger les factures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await billingService.create({ ...form, statut: 'en_attente' });
    setForm({ patient: '', montant_total: '' });
    load();
  };

  const pay = async (invoice) => {
    await billingService.pay(invoice.id, invoice.montant_total);
    load();
  };

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>Factures</h1>
          <p>Suivi des montants, statuts et paiements.</p>
        </div>
      </div>
      <Alert type="danger" message={error} />
      <div className="row g-3">
        <div className="col-xl-8">
          <div className="content-panel">
            {loading ? <Loader /> : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead><tr><th>#</th><th>Patient</th><th>Montant</th><th>Statut</th><th>Date</th><th></th></tr></thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>#{invoice.id}</td>
                        <td>{invoice.patient_nom}</td>
                        <td>{Number(invoice.montant_total).toLocaleString()} MAD</td>
                        <td><span className="badge text-bg-light border">{invoice.statut}</span></td>
                        <td>{new Date(invoice.date_emission).toLocaleDateString('fr-FR')}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-success" disabled={invoice.statut === 'payee'} onClick={() => pay(invoice)} type="button">Payer</button>
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
          <form className="content-panel" onSubmit={submit}>
            <h2>Nouvelle facture</h2>
            <select className="form-select mb-3" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
              <option value="">Patient</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.nom_complet || `${patient.first_name} ${patient.last_name}`}</option>)}
            </select>
            <input className="form-control mb-3" type="number" step="0.01" placeholder="Montant total" value={form.montant_total} onChange={(e) => setForm({ ...form, montant_total: e.target.value })} required />
            <button className="btn btn-primary w-100" type="submit">Créer facture</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default InvoiceList;
