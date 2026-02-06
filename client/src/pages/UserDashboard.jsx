import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GoogleSignInForm from "../components/GoogleSignInForm.jsx";

const emptyForm = {
  title: "",
  description: "",
  locationText: "",
  image: null
};

const storageKey = "aestrUser";

const UserDashboard = () => {
  const location = useLocation();
  const [formData, setFormData] = useState(emptyForm);
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [account, setAccount] = useState(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await fetch("/api/complaints");
        const data = await response.json();
        setSubmissions(data.items || []);
      } catch (error) {
        setSubmissions([]);
      }
    };
    loadComplaints();
  }, []);

  useEffect(() => {
    if (location.hash === "#complaint") {
      const target = document.getElementById("complaint-form");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSignedIn = () => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setAccount(null);
      return;
    }
    try {
      setAccount(JSON.parse(raw));
    } catch (error) {
      setAccount(null);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(storageKey);
    setAccount(null);
  };

  const handleGuest = () => {
    const target = document.getElementById("complaint-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("locationText", formData.locationText);
      if (account?.id) {
        payload.append("createdBy", account.id);
      }
      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      const created = await response.json();
      setSubmissions((prev) => [created, ...prev]);
      setFormData(emptyForm);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="list">
      <div className="card">
        <h2 className="section-title">Citizen access</h2>
        {!account && (
          <div className="list">
            <GoogleSignInForm role="user" onSuccess={handleSignedIn} />
            <button className="button ghost" type="button" onClick={handleGuest}>
              Complaint as guest
            </button>
          </div>
        )}
        {account && (
          <div className="split">
            <div>
              <p className="muted">Signed in as</p>
              <p>{account.name}</p>
              <p className="muted">{account.email}</p>
            </div>
            <button className="button ghost" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>

      <div className="card" id="complaint-form">
        <h2 className="section-title">Report a civic issue</h2>
        <form className="list" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-control">
              Issue title
              <input name="title" value={formData.title} onChange={handleChange} required />
            </label>
            <label className="form-control">
              Location (text)
              <input
                name="locationText"
                value={formData.locationText}
                onChange={handleChange}
                placeholder="Street, landmark, ward"
                required
              />
            </label>
          </div>
          <label className="form-control">
            Description
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </label>
          <label className="form-control">
            Upload image
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
          </label>
          <button className="button" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit complaint"}
          </button>
          {status === "success" && <p className="success-text">Complaint submitted successfully.</p>}
          {status === "error" && <p className="error-text">Submission failed. Try again.</p>}
        </form>
      </div>

      {/* <div className="card">
        <h2 className="section-title">Recent submissions</h2>
        <div className="list">
          {submissions.length === 0 && <p className="muted">No complaints yet.</p>}
          {submissions.map((item) => (
            <div className="card" key={item._id || item.title}>
              <div className="split">
                <h3>{item.title}</h3>
                <span className={`status-pill ${item.status}`}>{item.status}</span>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>{item.description}</p>
              <p className="meta" style={{ marginTop: 8 }}>Location: {item.locationText}</p>
              {item.imageUrl && (
                <img className="image-preview" src={item.imageUrl} alt={item.title} />
              )}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default UserDashboard;
