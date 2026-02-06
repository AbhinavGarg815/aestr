import { useEffect, useState } from "react";
import AuthGate from "../components/AuthGate.jsx";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({ total: 0, open: 0, assigned: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, complaintsRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/complaints")
        ]);
        const analyticsData = await analyticsRes.json();
        const complaintsData = await complaintsRes.json();
        setAnalytics(analyticsData);
        setComplaints(complaintsData.items || []);
      } catch (error) {
        setAnalytics({ total: 0, open: 0, assigned: 0, resolved: 0 });
        setComplaints([]);
      }
    };
    loadData();
  }, []);

  return (
    <AuthGate role="admin" title="Admin access">
      <div className="list">
        <div className="card">
          <h2 className="section-title">Citywide analytics</h2>
          <div className="card-grid">
            <div className="card">
              <h3>Total complaints</h3>
              <p className="metric">{analytics.total}</p>
            </div>
            <div className="card">
              <h3>Open</h3>
              <p className="metric">{analytics.open}</p>
            </div>
            <div className="card">
              <h3>Assigned</h3>
              <p className="metric">{analytics.assigned}</p>
            </div>
            <div className="card">
              <h3>Resolved</h3>
              <p className="metric">{analytics.resolved}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Issue register</h2>
          <div className="list">
            {complaints.length === 0 && <p className="muted">No complaints available.</p>}
            {complaints.map((item) => (
              <div className="card" key={item._id || item.title}>
                <div className="split">
                  <h3>{item.title}</h3>
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                </div>
                <p className="muted" style={{ marginTop: 8 }}>{item.description}</p>
                <p className="meta" style={{ marginTop: 8 }}>Location: {item.locationText}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGate>
  );
};

export default AdminDashboard;
