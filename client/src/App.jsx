import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

const App = () => (
  <BrowserRouter>
    <div className="app-shell">
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaint" element={<UserDashboard />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
