import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './AdminPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Определяем окружение по hostname
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:18001'  // Локальная разработка
  : 'https://api.shelternearyou.online';  // Прод

console.log('Admin API Base:', API_BASE);  // Для отладки

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [popularEndpoints, setPopularEndpoints] = useState([]);
  const [geography, setGeography] = useState([]);
  const [popularShelters, setPopularShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, submissionsRes, reportsRes, usageRes, endpointsRes, geoRes, sheltersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/admin/submissions?status=pending`),
        fetch(`${API_BASE}/admin/reports?status=pending`),
        fetch(`${API_BASE}/admin/usage-stats`),
        fetch(`${API_BASE}/admin/popular-endpoints?limit=5`),
        fetch(`${API_BASE}/admin/geography?limit=10`),
        fetch(`${API_BASE}/admin/popular-shelters?limit=10`)
      ]);

      setStats(await statsRes.json());
      setSubmissions(await submissionsRes.json());
      setReports(await reportsRes.json());
      setUsageStats(await usageRes.json());
      setPopularEndpoints(await endpointsRes.json());
      setGeography(await geoRes.json());
      setPopularShelters(await sheltersRes.json());
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this shelter submission?')) return;

    try {
      const res = await fetch(`${API_BASE}/admin/submissions/${id}/approve`, {
        method: 'PUT'
      });

      if (res.ok) {
        alert('✅ Submission approved!');
        loadData();
      } else {
        alert('❌ Failed to approve submission');
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('❌ Error approving submission');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):');
    if (reason === null) return;

    try {
      const res = await fetch(`${API_BASE}/admin/submissions/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT'
      });

      if (res.ok) {
        alert('✅ Submission rejected!');
        loadData();
      } else {
        alert('❌ Failed to reject submission');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('❌ Error rejecting submission');
    }
  };

  const handleResolveReport = async (id, action) => {
    const confirmMsg = action === 'delete_shelter' 
      ? '⚠️ This will DELETE the shelter permanently. Continue?' 
      : 'Mark this report as resolved?';
    
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}/resolve?action=${action}`, {
        method: 'PUT'
      });

      if (res.ok) {
        alert('✅ Report resolved!');
        loadData();
      } else {
        alert('❌ Failed to resolve report');
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('❌ Error resolving report');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!confirm('Mark this report as invalid?')) return;

    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('✅ Report deleted!');
        loadData();
      } else {
        alert('❌ Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('❌ Error deleting report');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  const chartData = {
    labels: stats.submissions.chart_data.map(d => d._id),
    datasets: [
      {
        label: 'Submissions per Day',
        data: stats.submissions.chart_data.map(d => d.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Submissions - Last 30 Days'
      }
    }
  };

  // Usage stats chart
  const usageChartData = usageStats?.requests_chart ? {
    labels: usageStats.requests_chart.map(d => d.date),
    datasets: [
      {
        label: 'API Requests per Day',
        data: usageStats.requests_chart.map(d => d.count),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.1
      }
    ]
  } : null;

  // Popular endpoints bar chart
  const endpointsChartData = popularEndpoints.length > 0 ? {
    labels: popularEndpoints.map(e => e.endpoint),
    datasets: [
      {
        label: 'Request Count',
        data: popularEndpoints.map(e => e.count),
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgb(102, 126, 234)',
        borderWidth: 1
      }
    ]
  } : null;

  const endpointsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top 5 Most Popular Endpoints'
      }
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <button className="btn-refresh" onClick={loadData}>
          🔄 Refresh
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.shelters.total.toLocaleString()}</div>
            <div className="stat-label">Total Shelters</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.submissions.pending}</div>
            <div className="stat-label">Pending Submissions</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <div className="stat-value">{stats.reports.pending}</div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.submissions.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{stats.comments.total}</div>
            <div className="stat-label">Comments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✔️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.reports.resolved}</div>
            <div className="stat-label">Resolved Reports</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          📋 Pending Submissions ({submissions.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          🚫 Pending Reports ({reports.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveTab('usage')}
        >
          📊 Usage Statistics
        </button>
      </div>

      {/* Submissions Table */}
      {activeTab === 'submissions' && (
        <div className="data-table">
          <h2>Pending Submissions</h2>
          {submissions.length === 0 ? (
            <p className="empty-state">No pending submissions</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Comment</th>
                  <th>Submitted</th>
                  <th>IP</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id}>
                    <td><strong>{sub.name}</strong></td>
                    <td className="address-cell">{sub.address || `${sub.latitude}, ${sub.longitude}`}</td>
                    <td>{sub.type.replace('_', ' ')}</td>
                    <td>{sub.capacity || '-'}</td>
                    <td className="comment-cell">{sub.comment || '-'}</td>
                    <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                    <td className="ip-cell">{sub.submitter_ip}</td>
                    <td className="actions-cell">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(sub.id)}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(sub.id)}
                      >
                        ❌ Reject
                      </button>
                      <a 
                        href={`https://www.google.com/maps?q=${sub.latitude},${sub.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-map"
                      >
                        🗺️ Map
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reports Table */}
      {activeTab === 'reports' && (
        <div className="data-table">
          <h2>Pending Reports</h2>
          {reports.length === 0 ? (
            <p className="empty-state">No pending reports</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Shelter</th>
                  <th>Address</th>
                  <th>Issue Type</th>
                  <th>Details</th>
                  <th>Contact</th>
                  <th>Reported</th>
                  <th>IP</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td><strong>{report.shelter_name}</strong></td>
                    <td className="address-cell">{report.shelter_address}</td>
                    <td>
                      {report.issue_type === 'closed' && '❌ Closed'}
                      {report.issue_type === 'wrong_address' && '📍 Wrong Address'}
                      {report.issue_type === 'blocked_entrance' && '🚧 Blocked'}
                      {report.issue_type === 'other' && 'ℹ️ Other'}
                    </td>
                    <td className="comment-cell">{report.comment}</td>
                    <td>{report.contact || '-'}</td>
                    <td>{new Date(report.reported_at).toLocaleString()}</td>
                    <td className="ip-cell">{report.reporter_ip}</td>
                    <td className="actions-cell">
                      <button 
                        className="btn-resolve"
                        onClick={() => handleResolveReport(report.id, 'mark_resolved')}
                      >
                        ✅ Resolve
                      </button>
                      <button 
                        className="btn-delete-shelter"
                        onClick={() => handleResolveReport(report.id, 'delete_shelter')}
                      >
                        🗑️ Delete Shelter
                      </button>
                      <button 
                        className="btn-invalid"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        ⚠️ Invalid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Usage Statistics Tab */}
      {activeTab === 'usage' && (
        <div className="usage-stats-section">
          {/* Usage Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📡</div>
              <div className="stat-info">
                <div className="stat-value">{usageStats?.requests_today?.toLocaleString() || 0}</div>
                <div className="stat-label">Requests Today</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{usageStats?.requests_week?.toLocaleString() || 0}</div>
                <div className="stat-label">Requests This Week</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">{usageStats?.requests_month?.toLocaleString() || 0}</div>
                <div className="stat-label">Requests This Month</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🗺️</div>
              <div className="stat-info">
                <div className="stat-value">{usageStats?.routes_built_today || 0}</div>
                <div className="stat-label">Routes Today</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🚶</div>
              <div className="stat-info">
                <div className="stat-value">{usageStats?.routes_built_week || 0}</div>
                <div className="stat-label">Routes This Week</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-info">
                <div className="stat-value">{usageStats?.avg_route_distance_km?.toFixed(1) || 0} km</div>
                <div className="stat-label">Avg Route Distance</div>
              </div>
            </div>
          </div>

          {/* API Requests Chart */}
          {usageChartData && (
            <div className="chart-container">
              <Line data={usageChartData} options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { display: true, text: 'API Requests - Last 30 Days' } }
              }} />
            </div>
          )}

          {/* Popular Endpoints Chart */}
          {endpointsChartData && (
            <div className="chart-container">
              <Bar data={endpointsChartData} options={endpointsChartOptions} />
            </div>
          )}

          {/* Geography Table */}
          <div className="data-table">
            <h2>📍 Top 10 Request Locations (GPS)</h2>
            {geography.length === 0 ? (
              <p className="empty-state">No geographic data yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Request Count</th>
                    <th>Map</th>
                  </tr>
                </thead>
                <tbody>
                  {geography.map((geo, idx) => (
                    <tr key={idx}>
                      <td>{geo.latitude.toFixed(4)}</td>
                      <td>{geo.longitude.toFixed(4)}</td>
                      <td><strong>{geo.count}</strong></td>
                      <td>
                        <a 
                          href={`https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-map"
                        >
                          🗺️ View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Popular Shelters Table */}
          <div className="data-table">
            <h2>⭐ Top 10 Most Viewed Shelters</h2>
            {popularShelters.length === 0 ? (
              <p className="empty-state">No shelter data yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Shelter Name</th>
                    <th>Address</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {popularShelters.map((shelter, idx) => (
                    <tr key={idx}>
                      <td><strong>{shelter.name}</strong></td>
                      <td className="address-cell">{shelter.address}</td>
                      <td><strong>{shelter.views}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;