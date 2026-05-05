import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    password: '',
    password2: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card auth-card-wide" onSubmit={submit}>
        <h1>Inscription</h1>
        <p className="text-muted">Créez un accès sécurisé à l'application.</p>
        <Alert type="danger" message={error} />
        <div className="row g-3">
          <div className="col-md-6"><input className="form-control" placeholder="Prénom" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Nom" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Nom d'utilisateur" value={form.username} onChange={(e) => update('username', e.target.value)} required /></div>
          <div className="col-md-6"><input className="form-control" type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Téléphone" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
          <div className="col-md-6">
            <select className="form-select" value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="patient">Patient</option>
              <option value="secretaire">Secrétaire</option>
              <option value="medecin">Médecin</option>
            </select>
          </div>
          <div className="col-12"><textarea className="form-control" placeholder="Adresse" value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => update('password', e.target.value)} required /></div>
          <div className="col-md-6"><input className="form-control" type="password" placeholder="Confirmer" value={form.password2} onChange={(e) => update('password2', e.target.value)} required /></div>
        </div>
        <button className="btn btn-primary w-100 mt-4" disabled={loading} type="submit">
          {loading ? <Loader small /> : 'Créer le compte'}
        </button>
        <div className="text-center mt-3"><Link to="/login">Déjà inscrit ? Connexion</Link></div>
      </form>
    </div>
  );
}

export default Register;
