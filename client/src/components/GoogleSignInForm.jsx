import { useState } from "react";

const storageKey = "aestrUser";

const roleOptions = [
  { value: "user", label: "Citizen" },
  { value: "authority", label: "Authority" },
  { value: "admin", label: "Admin" }
];

const GoogleSignInForm = ({ role, showRoleSelect = false, onSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", role: role || "user" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const resolvedRole = role || form.role;
      if (!form.name || !form.email) {
        throw new Error("Name and email are required");
      }

      const user = {
        id: `demo-${Date.now()}`,
        name: form.name,
        email: form.email,
        role: resolvedRole
      };

      window.localStorage.setItem(storageKey, JSON.stringify(user));
      setStatus("success");
      if (onSuccess) {
        onSuccess(resolvedRole);
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "Sign in failed");
    }
  };

  return (
    <form className="list" onSubmit={handleSubmit}>
      {showRoleSelect && (
        <label className="form-control">
          Choose role
          <select name="role" value={form.role} onChange={handleChange}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="form-control">
        Full name
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>
      <label className="form-control">
        Google account email
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Signing in..." : "Continue with Google"}
      </button>
      {status === "error" && <p className="error-text">{error}</p>}
    </form>
  );
};

export default GoogleSignInForm;
