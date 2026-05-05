import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Connexion</h1>
        <p className="text-muted">Accédez à votre espace cabinet médical.</p>
        <Alert type="danger" message={error} />
        <label className="form-label">Nom d'utilisateur</label>
        <input className="form-control mb-3" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <label className="form-label">Mot de passe</label>
        <input className="form-control mb-4" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary w-100" disabled={loading} type="submit">
          {loading ? <Loader small /> : 'Se connecter'}
        </button>
        <div className="text-center mt-3">
          <Link to="/register">Créer un compte patient</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
