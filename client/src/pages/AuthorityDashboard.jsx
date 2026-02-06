import { useEffect, useState } from "react";
import AuthGate from "../components/AuthGate.jsx";

const AuthorityDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        const response = await fetch("/api/complaints");
        const data = await response.json();
        setComplaints((data.items || []).filter((item) => item.status !== "resolved"));
      } catch (error) {
        setComplaints([]);
      }
    };
    loadAssigned();
  }, []);

  const handleResolve = async (event) => {
    event.preventDefault();
    if (!selected) {
      return;
    }
    setStatus("submitting");

    try {
      const payload = new FormData();
      if (event.target.verificationImage.files[0]) {
        payload.append("verificationImage", event.target.verificationImage.files[0]);
      }

      const response = await fetch(`/api/complaints/${selected._id}/resolve`, {
        method: "PUT",
        body: payload
      });

      if (!response.ok) {
        throw new Error("Failed to resolve");
      }

      const updated = await response.json();
      setComplaints((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setSelected(updated);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <AuthGate role="authority" title="Authority access">
      <div className="list">
        <div className="card">
          <h2 className="section-title">Assigned complaints</h2>
          <div className="list">
            {complaints.length === 0 && <p className="muted">No assigned complaints yet.</p>}
            {complaints.map((item) => (
              <button
                className="card button-card"
                type="button"
                key={item._id || item.title}
                onClick={() => setSelected(item)}
              >
                <div className="split">
                  <h3>{item.title}</h3>
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                </div>
                <p className="muted" style={{ marginTop: 8 }}>{item.locationText}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Resolution verification</h2>
          {!selected && <p className="muted">Select a complaint to verify resolution.</p>}
          {selected && (
            <form className="list" onSubmit={handleResolve}>
              <div>
                <h3>{selected.title}</h3>
                <p className="muted" style={{ marginTop: 8 }}>{selected.description}</p>
              </div>
              {selected.imageUrl && (
                <img className="image-preview" src={selected.imageUrl} alt={selected.title} />
              )}
              <label className="form-control">
                Upload verification image
                <input type="file" name="verificationImage" accept="image/*" />
              </label>
              <button className="button" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Uploading..." : "Mark as resolved"}
              </button>
              {status === "success" && <p className="success-text">Resolution submitted.</p>}
              {status === "error" && <p className="error-text">Resolution failed. Try again.</p>}
            </form>
          )}
        </div>
      </div>
    </AuthGate>
  );
};

export default AuthorityDashboard;
