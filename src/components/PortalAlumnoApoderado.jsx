import React, { useState, useEffect } from 'react';
import { usuarioApi } from '../services/axiosConfigB';
import MiHojaDeVida from './MiHojaDeVida';
import MiMensajeria from './MiMensajeria';
import MiCalendarioMuro from './MiCalendarioMuro';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import MisNotas from './MisNotas';

function PortalAlumnoApoderado() {
  const [tab, setTab] = useState('notas');
  const [misDatos, setMisDatos] = useState(null);
  const [estudianteId, setEstudianteId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    resolverIdentidad();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const resolverIdentidad = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = token ? jwtDecode(token).sub : null;

    if (!email || !role) {
      setError('No hay sesión activa.');
      setCargando(false);
      return;
    }

    try {
      if (role === 'ALUMNO') {
        const res = await usuarioApi.get('/registro/alumno');
        const propio = res.data.find(a => a.usuEmail === email);
        if (!propio) throw new Error('No se encontró tu registro como alumno.');
        setMisDatos({ ...propio, rol: 'ALUMNO' });
        setEstudianteId(propio.usuId);

      } else if (role === 'APODERADO') {
        const resApo = await usuarioApi.get('/registro/apoderado');
        const propioApo = resApo.data.find(a => a.usuEmail === email);
        if (!propioApo) throw new Error('No se encontró tu registro como apoderado.');

        const resAlumnos = await usuarioApi.get('/registro/alumno');
        let hijoEncontrado = null;
        for (const alumno of resAlumnos.data) {
          try {
            const detalle = await usuarioApi.get(`/registro/alumno/${alumno.usuId}`);
            if (Number(detalle.data.apoderadoId) === Number(propioApo.usuId)) {
              hijoEncontrado = detalle.data;
              break;
            }
          } catch (errInterno) {
            console.warn(`No se pudo consultar el alumno ID ${alumno.usuId}:`, errInterno.message);
          }
        }

        if (!hijoEncontrado) throw new Error('No se encontró un estudiante a tu cargo.');
        setMisDatos({ ...propioApo, rol: 'APODERADO', hijoNombre: `${hijoEncontrado.nombre} ${hijoEncontrado.apellidoPaterno}` });
        setEstudianteId(hijoEncontrado.id);

      } else {
        setError('Este portal es solo para Alumnos y Apoderados.');
      }
    } catch (e) {
      setError(e.message || 'Error al cargar tu información.');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <p style={{ padding: '20px' }}>Cargando tu información...</p>;
  if (error) return <div style={alertStyle}>{error}</div>;

  return (
    <div className="container-fluid">
      <div className="row">

        {/* SIDEBAR */}
        <div className="col-md-2 bg-dark vh-100 p-3 text-white position-fixed">
          <h4 className="mb-1 fw-bold text-primary">AcademiApp</h4>
          <p className="text-white-50 small mb-4">
            {misDatos.rol === 'ALUMNO'
              ? misDatos.usu_nombre
              : `${misDatos.usu_nombre} (Apoderado de ${misDatos.hijoNombre})`}
          </p>

          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button
                onClick={() => setTab('notas')}
                className={`nav-link text-start btn w-100 ${tab === 'notas' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-file-earmark-text me-2"></i>Mis Notas
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                onClick={() => setTab('hojavida')}
                className={`nav-link text-start btn w-100 ${tab === 'hojavida' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-clipboard-pulse me-2"></i>Hoja de Vida
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                onClick={() => setTab('mensajeria')}
                className={`nav-link text-start btn w-100 ${tab === 'mensajeria' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-chat-dots me-2"></i>Mensajería
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                onClick={() => setTab('eventos')}
                className={`nav-link text-start btn w-100 ${tab === 'eventos' ? 'btn-primary text-white' : 'text-white-50'}`}>
                <i className="bi bi-calendar-event me-2"></i>Calendario y Muro
              </button>
            </li>

            <li className="nav-item mt-5">
              <button
                onClick={cerrarSesion}
                className="btn btn-link nav-link text-danger border-top pt-3 w-100 text-start"
                style={{ textDecoration: 'none' }}>
                <i className="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>

        {/* CONTENIDO */}
        <div className="col-md-10 offset-md-2 p-4 bg-light min-vh-100">
          {tab === 'notas' && <MisNotas estudianteId={estudianteId} />}
          {tab === 'hojavida' && <MiHojaDeVida estudianteId={estudianteId} />}
          {tab === 'mensajeria' && <MiMensajeria miUsuId={misDatos.usuId} />}
          {tab === 'eventos' && <MiCalendarioMuro />}
        </div>

      </div>
    </div>
  );
}

const alertStyle = { backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '6px', margin: '20px' };

export default PortalAlumnoApoderado;