import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-semibold" to="/">Cabinet Médical</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav me-auto">
            <NavLink className="nav-link" to="/">Tableau de bord</NavLink>
            <NavLink className="nav-link" to="/patients">Patients</NavLink>
            <NavLink className="nav-link" to="/rendez-vous">Rendez-vous</NavLink>
            <NavLink className="nav-link" to="/consultations">Consultations</NavLink>
            <NavLink className="nav-link" to="/factures">Factures</NavLink>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">{user?.first_name || user?.username} · {user?.role}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout} type="button">Déconnexion</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
