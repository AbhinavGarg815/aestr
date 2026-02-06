import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AuthorityDashboard from "./pages/AuthorityDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

const App = () => (
  <BrowserRouter>
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/authority" element={<AuthorityDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
