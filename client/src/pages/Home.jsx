import { useNavigate } from "react-router-dom";
import GoogleSignInForm from "../components/GoogleSignInForm.jsx";

const Home = () => {
  const navigate = useNavigate();

  const handleSuccess = (role) => {
    const target = role === "user" ? "/user" : `/${role}`;
    navigate(target);
  };

  return (
    <section className="hero">
      <div>
        <h1>Unified Civic Issue Detection & Grievance Redressal</h1>
        <p>
          Report neighborhood issues with evidence, route them to the right authority, and
          keep the city accountable with transparent progress tracking.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a className="button" href="/user#complaint">Complaint as guest</a>
          <a className="button secondary" href="/admin">Admin portal</a>
        </div>
      </div>
      <div className="card">
        <h3>Portal access</h3>
        <p className="muted" style={{ marginBottom: 12 }}>
          Sign in with Google to access role dashboards. Authority and admin require verified accounts.
        </p>
        <GoogleSignInForm showRoleSelect onSuccess={handleSuccess} />
      </div>
    </section>
  );
};

export default Home;
