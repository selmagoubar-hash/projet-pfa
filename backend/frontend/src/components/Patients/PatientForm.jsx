import React, { useState } from 'react';

const emptyPatient = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  phone: '',
  address: '',
};

function PatientForm({ initialValue = emptyPatient, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initialValue);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm(emptyPatient);
  };

  return (
    <form className="content-panel" onSubmit={submit}>
      <h2>Nouveau patient</h2>
      <div className="row g-3">
        <div className="col-md-6"><input className="form-control" placeholder="Prénom" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required /></div>
        <div className="col-md-6"><input className="form-control" placeholder="Nom" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required /></div>
        <div className="col-md-6"><input className="form-control" type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} required /></div>
        <div className="col-md-6"><input className="form-control" placeholder="Téléphone" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        <div className="col-12"><textarea className="form-control" placeholder="Adresse" value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
      </div>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" disabled={loading} type="submit">Enregistrer</button>
        {onCancel && <button className="btn btn-outline-secondary" onClick={onCancel} type="button">Annuler</button>}
      </div>
    </form>
  );
}

export default PatientForm;
