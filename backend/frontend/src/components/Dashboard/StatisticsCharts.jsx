import React, { useEffect, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';
import { dashboardService } from '../../services/api';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

function StatisticsCharts() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getAdvancedStats()
      .then((response) => setStats(response.data))
      .catch(() => setError('Impossible de charger les graphiques.'));
  }, []);

  if (error) return <Alert type="danger" message={error} />;
  if (!stats) return <div className="content-panel"><Loader /></div>;

  const consultationsData = {
    labels: stats.consultations_by_day.map((item) => item.date),
    datasets: [{
      label: 'Consultations',
      data: stats.consultations_by_day.map((item) => item.total),
      backgroundColor: '#4f83cc',
    }],
  };

  const revenuesData = {
    labels: stats.revenues_by_month.map((item) => item.month),
    datasets: [{
      label: 'Revenus MAD',
      data: stats.revenues_by_month.map((item) => item.total),
      borderColor: '#2f9e73',
      backgroundColor: 'rgba(47, 158, 115, 0.16)',
      tension: 0.35,
    }],
  };

  const appointmentsData = {
    labels: stats.rdv_by_status.map((item) => item.status),
    datasets: [{
      data: stats.rdv_by_status.map((item) => item.total),
      backgroundColor: ['#4f83cc', '#d66a61', '#d9a441'],
    }],
  };

  return (
    <div className="row g-3 mt-1">
      <div className="col-xl-6">
        <div className="content-panel chart-panel">
          <h2>Consultations par jour</h2>
          <Bar data={consultationsData} />
        </div>
      </div>
      <div className="col-xl-6">
        <div className="content-panel chart-panel">
          <h2>Revenus par mois</h2>
          <Line data={revenuesData} />
        </div>
      </div>
      <div className="col-xl-5">
        <div className="content-panel chart-panel">
          <h2>Rendez-vous par statut</h2>
          <Pie data={appointmentsData} />
        </div>
      </div>
      <div className="col-xl-7">
        <div className="content-panel">
          <h2>Top diagnostics</h2>
          {(stats.top_diagnostics || []).map((item) => (
            <div className="compact-row" key={item.diagnostic}>
              <strong>{item.diagnostic}</strong>
              <span>{item.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatisticsCharts;
