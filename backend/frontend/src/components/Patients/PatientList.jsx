import React, { useEffect, useMemo, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import PatientForm from './PatientForm';
import { patientService } from '../../services/api';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 8;

  const loadPatients = () => {
    setLoading(true);
    patientService.getAll()
      .then((response) => setPatients(response.data.results || response.data))
      .catch(() => setError('Impossible de charger les patients.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadPatients, []);

  const filtered = useMemo(() => patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name} ${patient.phone || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  }), [patients, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const createPatient = async (data) => {
    await patientService.create(data);
    loadPatients();
  };

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>Patients</h1>
          <p>Rechercher, créer et suivre les dossiers patients.</p>
        </div>
        <input className="form-control search-input" placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <Alert type="danger" message={error} />
      <div className="row g-3">
        <div className="col-xl-8">
          <div className="content-panel">
            {loading ? <Loader /> : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead><tr><th>Patient</th><th>Âge</th><th>Téléphone</th><th>Adresse</th><th></th></tr></thead>
                    <tbody>
                      {visible.map((patient) => (
                        <tr key={patient.id}>
                          <td>{patient.nom_complet || `${patient.first_name} ${patient.last_name}`}</td>
                          <td>{patient.age ?? '-'}</td>
                          <td>{patient.phone || '-'}</td>
                          <td>{patient.address || '-'}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => patientService.delete(patient.id).then(loadPatients)} type="button">Supprimer</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">{filtered.length} patient(s)</span>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)} type="button">Précédent</button>
                    <button className="btn btn-outline-secondary btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)} type="button">Suivant</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="col-xl-4">
          <PatientForm onSubmit={createPatient} />
        </div>
      </div>
    </section>
  );
}

export default PatientList;
