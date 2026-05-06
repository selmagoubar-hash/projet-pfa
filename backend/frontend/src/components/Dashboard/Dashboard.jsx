import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import StatisticsCharts from './StatisticsCharts';
import { dashboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getStats();
        console.log('Stats reçues:', response.data);
        setStats(response.data);
        setError('');
      } catch (err) {
        console.error('Erreur chargement stats:', err);
        setError('Impossible de charger les statistiques. Vérifiez que le serveur Django est en cours d\'exécution.');
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <Loader />
        <p className="mt-3 text-muted">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <Alert type="danger" message={error} />
        <div className="text-center mt-4">
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  // Valeurs par défaut si stats est null
  const nombrePatients = stats?.nombre_patients ?? stats?.total_patients ?? 0;
  const nombreConsultations = stats?.consultations_mois ?? stats?.nombre_consultations ?? 0;
  const revenus = stats?.revenus_totaux ?? stats?.revenue ?? 0;
  const rdvAujourdhui = stats?.rendezvous_aujourdhui ?? stats?.today_appointments ?? 0;

  const cards = [
    ['Patients', nombrePatients],
    ['Consultations terminées', nombreConsultations],
    ['Chiffre d\'affaires', `${Number(revenus).toLocaleString()} FCFA`],
    ["RDV aujourd'hui", rdvAujourdhui],
  ];

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue {user?.first_name || user?.username || 'Utilisateur'} !</p>
        </div>
      </div>
      <Alert type="danger" message={error} />
      
      <div className="row g-3">
        {cards.map(([label, value]) => (
          <div className="col-12 col-sm-6 col-xl-3" key={label}>
            <div className="metric-card">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
      
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="content-panel">
            <h2>Rendez-vous du jour</h2>
            {(stats?.liste_rdv_aujourdhui || []).length === 0 ? (
              <p className="text-muted mb-0">Aucun rendez-vous pour aujourd'hui</p>
            ) : (
              <div className="list-group list-group-flush">
                {stats.liste_rdv_aujourdhui.map((rdv) => (
                  <div className="list-group-item px-0 d-flex justify-content-between" key={rdv.id}>
                    <span>{rdv.patient}</span>
                    <span className="text-muted">{rdv.heure} · {rdv.medecin}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-5">
          <div className="content-panel">
            <h2>Dernières consultations</h2>
            {(stats?.dernieres_consultations || []).length === 0 ? (
              <p className="text-muted mb-0">Aucune consultation enregistrée</p>
            ) : (
              stats.dernieres_consultations.map((item) => (
                <div className="compact-row" key={item.id}>
                  <strong>{item.patient}</strong>
                  <span>{item.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="content-panel">
            <h2>Prochains rendez-vous</h2>
            {(stats?.prochains_rdv || []).length === 0 ? (
              <p className="text-muted mb-0">Aucun rendez-vous à venir</p>
            ) : (
              stats.prochains_rdv.map((rdv) => (
                <div className="compact-row" key={rdv.id}>
                  <strong>{rdv.patient}</strong>
                  <span>{rdv.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="content-panel">
            <h2>Top Médecins (consultations)</h2>
            {(stats?.top_medecins || []).length === 0 ? (
              <p className="text-muted mb-0">Aucune donnée disponible</p>
            ) : (
              stats.top_medecins.map((medecin, index) => (
                <div className="compact-row" key={index}>
                  <strong>{medecin.nom}</strong>
                  <span>{medecin.total} consultation(s)</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <StatisticsCharts />
    </section>
  );
}

export default Dashboard;