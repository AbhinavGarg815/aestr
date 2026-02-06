import { useEffect, useState } from "react";
import GoogleSignInForm from "./GoogleSignInForm.jsx";

const storageKey = "aestrUser";

const readStoredUser = () => {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const AuthGate = ({ role, title, children }) => {
  const [user, setUser] = useState(readStoredUser());
  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem(storageKey);
    setUser(null);
  };

  if (!user || user.role !== role) {
    return (
      <div className="card">
        <h2 className="section-title">{title}</h2>
        <p className="muted">Verified access required. Continue with Google.</p>
        <GoogleSignInForm role={role} onSuccess={() => setUser(readStoredUser())} />
      </div>
    );
  }

  return (
    <div className="list">
      <div className="card">
        <div className="split">
          <div>
            <p className="muted">Signed in as</p>
            <p>{user.name}</p>
            <p className="muted">{user.email}</p>
          </div>
          <button className="button ghost" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AuthGate;
