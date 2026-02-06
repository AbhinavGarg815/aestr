import { NavLink } from "react-router-dom";

const Navbar = () => (
  <header className="navbar">
    <div className="navbar-content">
      <div>
        <strong>Unified Civic Issue Platform</strong>
      </div>
      <nav className="nav-links">
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/user">Citizen</NavLink>
        <NavLink to="/authority">Authority</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
    </div>
  </header>
);

export default Navbar;
