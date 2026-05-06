import React, { useState, useEffect } from 'react';
import { consultationService } from '../../services/api';

function PrescriptionForm({ consultationId, onSaved }) {
  const [medications, setMedications] = useState([]);
  const [prescription, setPrescription] = useState({
    consultation: consultationId,
    recommandations: '',
    duree_traitement: '',
    lignes: []
  });
  const [currentMed, setCurrentMed] = useState({
    medicament: '',
    posologie: '',
    duree: '',
    quantite: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await consultationService.getMedications();
      setMedications(response.data);
    } catch (err) {
      console.error('Erreur chargement médicaments');
    }
  };

  const addLigne = () => {
    if (!currentMed.medicament || !currentMed.posologie) {
      setError('Veuillez remplir médicament et posologie');
      return;
    }
    setPrescription({
      ...prescription,
      lignes: [...prescription.lignes, { ...currentMed, id: Date.now() }]
    });
    setCurrentMed({ medicament: '', posologie: '', duree: '', quantite: 1 });
    setError('');
  };

  const removeLigne = (index) => {
    const newLignes = prescription.lignes.filter((_, i) => i !== index);
    setPrescription({ ...prescription, lignes: newLignes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await consultationService.createPrescription(prescription);
      alert('Ordonnance enregistrée !');
      if (onSaved) onSaved();
    } catch (err) {
      setError('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <h6>📋 Ordonnance</h6>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="mb-3">
        <label className="form-label">Recommandations</label>
        <textarea
          className="form-control"
          rows="2"
          value={prescription.recommandations}
          onChange={(e) => setPrescription({ ...prescription, recommandations: e.target.value })}
          placeholder="Recommandations générales..."
        />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Durée du traitement</label>
        <input
          type="text"
          className="form-control"
          value={prescription.duree_traitement}
          onChange={(e) => setPrescription({ ...prescription, duree_traitement: e.target.value })}
          placeholder="Ex: 7 jours"
        />
      </div>
      
      <div className="card bg-light p-3 mb-3">
        <h6>➕ Ajouter un médicament</h6>
        <div className="row">
          <div className="col-md-5 mb-2">
            <select
              className="form-select"
              value={currentMed.medicament}
              onChange={(e) => setCurrentMed({ ...currentMed, medicament: e.target.value })}
            >
              <option value="">-- Médicament --</option>
              {medications.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Posologie"
              value={currentMed.posologie}
              onChange={(e) => setCurrentMed({ ...currentMed, posologie: e.target.value })}
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              type="number"
              className="form-control"
              placeholder="Qté"
              value={currentMed.quantite}
              onChange={(e) => setCurrentMed({ ...currentMed, quantite: e.target.value })}
            />
          </div>
          <div className="col-md-1 mb-2">
            <button type="button" className="btn btn-success w-100" onClick={addLigne}>+</button>
          </div>
        </div>
      </div>
      
      {prescription.lignes.length > 0 && (
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Médicament</th>
              <th>Posologie</th>
              <th>Qté</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prescription.lignes.map((ligne, idx) => (
              <tr key={ligne.id}>
                <td>{medications.find(m => m.id == ligne.medicament)?.nom || ligne.medicament}</td>
                <td>{ligne.posologie}</td>
                <td>{ligne.quantite}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeLigne(idx)}>
                    ✗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Enregistrement...' : '💾 Enregistrer l\'ordonnance'}
      </button>
    </form>
  );
}

export default PrescriptionForm;