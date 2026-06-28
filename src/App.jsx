import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Eliminamos la etiqueta <option> errónea para que no rompa el render */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta del Dashboard del servicio académico */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;