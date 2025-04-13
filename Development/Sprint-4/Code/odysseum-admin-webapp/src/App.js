import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* Fallback route: if no match, show Login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
