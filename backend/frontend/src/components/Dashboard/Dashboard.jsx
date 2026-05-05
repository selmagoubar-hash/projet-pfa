import React, { useEffect, useState } from 'react';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import StatisticsCharts from './StatisticsCharts';
import { dashboardService } from '../../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getStats()
      .then((response) => setStats(response.data))
      .catch(() => setError('Impossible de charger les statistiques.'));
  }, []);

  if (!stats && !error) {
    return <div className="page-center"><Loader /></div>;
  }

  const cards = [
    ['Patients', stats?.nombre_patients ?? stats?.total_patients ?? 0],
    ['Consultations', stats?.consultations_mois ?? stats?.nombre_consultations ?? 0],
    ['Revenus', `${Number(stats?.revenus_totaux ?? stats?.revenue ?? 0).toLocaleString()} MAD`],
    ["RDV aujourd'hui", stats?.rendezvous_aujourdhui ?? stats?.today_appointments ?? 0],
  ];

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue synthétique de l'activité du cabinet.</p>
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
              <p className="text-muted mb-0">Aucun rendez-vous planifié.</p>
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
              <p className="text-muted mb-0">Aucune consultation récente.</p>
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
      <StatisticsCharts />
    </section>
  );
}

export default Dashboard;
