import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudNotas from '../components/CrudNotas';
import Asignaturas from '../components/Asignaturas';
import Bitacora from '../components/Bitacora';
import GestionAlumnos from '../components/GestionAlumnos';
import GestionFuncionarios from '../components/GestionFuncionarios';
import ModulosVidaEstudiantil from '../components/ModulosVidaEstudiantil';
import ReportesPage from '../components/Reportes';
import MatriculaPage from '../components/Matricula';
import AnotacionesPage from '../components/Anotacion';
import PortalAlumnoApoderado from '../components/PortalAlumnoApoderado';
import MensajeriaPage from '../components/MensajeriaPage';
import EventosCalendariosPage from '../components/EventosCalendariosPage';

const NAV_ITEMS = [
  { key: 'alumnos',          icon: 'bi-people',          label: 'Gestionar Alumnos' },
  { key: 'funcionarios',     icon: 'bi-person-badge',    label: 'Gestionar Funcionarios' },
  { key: 'vidaestudiantil',  icon: 'bi-clipboard-pulse', label: 'Vida Estudiantil' },
  { key: 'asignaturas',      icon: 'bi-book',            label: 'Gestión Académica' },
  { key: 'notas',            icon: 'bi-pencil-square',   label: 'Registro de Notas' },
  { key: 'bitacora',         icon: 'bi-journal-text',    label: 'Bitácora de Asignatura' },
  { key: 'mensajeria',       icon: 'bi-chat-dots',       label: 'Mensajería' },
  { key: 'eventos',          icon: 'bi-calendar-event',  label: 'Calendario y Muro' },
  { key: 'reportes',         icon: 'bi-clipboard-data',  label: 'Reportes' },
  { key: 'matricula',        icon: 'bi-person-check',    label: 'Matrícula' },
  { key: 'anotaciones',      icon: 'bi-journal-check',   label: 'Anotaciones' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bienvenida');

  const role = localStorage.getItem('role');
  const roleUpper = role?.toUpperCase();
  if (roleUpper === 'ALUMNO' || roleUpper === 'APODERADO') {
    return <PortalAlumnoApoderado />;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-md-2 bg-dark vh-100 p-3 text-white position-fixed" style={{ overflowY: 'auto' }}>
          <h4 className="mb-4 fw-bold text-primary">AcademiApp</h4>
          <ul className="nav flex-column">
            {NAV_ITEMS.map(item => (
              <li className="nav-item mb-2" key={item.key}>
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`nav-link text-start btn w-100 ${activeTab === item.key ? 'btn-primary text-white' : 'text-white-50'}`}>
                  <i className={`bi ${item.icon} me-2`}></i>{item.label}
                </button>
              </li>
            ))}
            <li className="nav-item mt-4">
              <button
                onClick={() => navigate('/')}
                className="btn btn-link nav-link text-danger border-top pt-3 w-100 text-start"
                style={{ textDecoration: 'none' }}>
                <i className="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>

        {/* CONTENIDO DINÁMICO */}
        <div className="col-md-10 offset-md-2 p-4 bg-light min-vh-100">
          {activeTab === 'bienvenida' && (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
              <h1 className="fw-bold text-primary mb-2">Bienvenido a AcademiApp</h1>
              <p className="text-muted mb-1" style={{ fontSize: '22px' }}>Colegio Bernardo O'Higgins</p>
              <p className="text-muted mb-4">Año Académico 2026</p>
              <p className="text-secondary" style={{ fontSize: '18px' }}>Selecciona el módulo que necesites desde el menú lateral para comenzar.</p>
            </div>
          )}
          {activeTab === 'alumnos'         && <GestionAlumnos />}
          {activeTab === 'funcionarios'    && <GestionFuncionarios />}
          {activeTab === 'notas'           && <CrudNotas />}
          {activeTab === 'asignaturas'     && <Asignaturas />}
          {activeTab === 'bitacora'        && <Bitacora />}
          {activeTab === 'vidaestudiantil' && <ModulosVidaEstudiantil />}
          {activeTab === 'mensajeria'      && <MensajeriaPage />}
          {activeTab === 'eventos'         && <EventosCalendariosPage />}
          {activeTab === 'reportes'        && <ReportesPage />}
          {activeTab === 'matricula'       && <MatriculaPage />}
          {activeTab === 'anotaciones'     && <AnotacionesPage />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;