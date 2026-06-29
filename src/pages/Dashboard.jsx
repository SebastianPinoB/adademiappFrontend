import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudNotas from '../components/CrudNotas';
import Asignaturas from '../components/Asignaturas';
import Bitacora from '../components/Bitacora';
import GestionAlumnos from '../components/GestionAlumnos';
import ModulosVidaEstudiantil from '../components/ModulosVidaEstudiantil';
import ReportesPage from '../components/Reportes';
import MatriculaPage from '../components/Matricula';
import AnotacionesPage from '../components/Anotacion';
import PortalAlumnoApoderado from '../components/PortalAlumnoApoderado';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notas');


const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notas');

  const role = localStorage.getItem('role');

  if (role === 'ALUMNO' || role === 'APODERADO') {
    return <PortalAlumnoApoderado />;
  }


  return (
    <div className="container-fluid">
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-md-2 bg-dark vh-100 p-3 text-white position-fixed">
          <h4 className="mb-4 fw-bold text-primary">AcademiApp</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('asignaturas')} className={`nav-link text-start btn w-100 ${activeTab === 'asignaturas' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-book me-2"></i>Asignaturas
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('notas')} className={`nav-link text-start btn w-100 ${activeTab === 'notas' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-person-badge me-2"></i>Notas (CRUD)
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('bitacora')} className={`nav-link text-start btn w-100 ${activeTab === 'bitacora' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-journal-text me-2"></i>Bitácora
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                onClick={() => setActiveTab('alumnos')}
                className={`nav-link text-start btn w-100 ${activeTab === 'alumnos' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-people me-2"></i>Gestionar Alumnos
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('vidaestudiantil')} className={`nav-link text-start btn w-100 ${activeTab === 'vidaestudiantil' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-clipboard-pulse me-2"></i>Vida Estudiantil
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('reportes')} className={`nav-link text-start btn w-100 ${activeTab === 'reportes' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-clipboard-data me-2"></i>Reportes
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('matricula')} className={`nav-link text-start btn w-100 ${activeTab === 'matricula' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-person-check me-2"></i>Matrícula
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => setActiveTab('anotaciones')} className={`nav-link text-start btn w-100 ${activeTab === 'anotaciones' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-journal-check me-2"></i>Anotaciones
              </button>
            </li>
            <li className="nav-item mt-5">
              <button onClick={() => navigate('/')} className="btn btn-link nav-link text-danger border-top pt-3 w-100 text-start" style={{ textDecoration: 'none' }}>
                <i className="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
        {/* CONTENIDO DINÁMICO */}
        <div className="col-md-10 offset-md-2 p-4 bg-light min-vh-100">
          {activeTab === 'notas' && <CrudNotas />}
          {activeTab === 'alumnos' && <GestionAlumnos />}
          {activeTab === 'asignaturas' && <Asignaturas />}
          {activeTab === 'bitacora' && <Bitacora />}
          {activeTab === 'vidaestudiantil' && <ModulosVidaEstudiantil />}
          {activeTab === 'reportes' && <ReportesPage />}
          {activeTab === 'matricula' && <MatriculaPage />}
          {activeTab === 'anotaciones' && <AnotacionesPage />}
        </div>
      </div>
    </div>
  );
  };
}
export default Dashboard;