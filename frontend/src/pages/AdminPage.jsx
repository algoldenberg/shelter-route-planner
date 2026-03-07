import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, submissionsRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/admin/submissions?status=pending`),
        fetch(`${API_BASE}/admin/reports?status=pending`)
      ]);

      setStats(await statsRes.json());
      setSubmissions(await submissionsRes.json());
      setReports(await reportsRes.json());
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

      {/* Tabs - ИСПРАВЛЕНО */}
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
    </div>
  );
};

export default AdminPage;