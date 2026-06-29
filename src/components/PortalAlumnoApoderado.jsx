import React, { useState, useEffect } from 'react';
import { usuarioApi } from '../services/axiosConfigB';
import MiHojaDeVida from './MiHojaDeVida';
import MiMensajeria from './MiMensajeria';
import MiCalendarioMuro from './MiCalendarioMuro';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function PortalAlumnoApoderado() {
  const [tab, setTab] = useState('hojavida');
  const [misDatos, setMisDatos] = useState(null);
  const [estudianteId, setEstudianteId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    resolverIdentidad();
  }, []);

  const navigate = useNavigate();
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

    const usuario = { email, role };
    if (!usuario) { setError('No hay sesión activa.'); setCargando(false); return; }

    try {
      if (usuario.role === 'ALUMNO') {
        const res = await usuarioApi.get('/registro/alumno');
        const propio = res.data.find(a => a.usuEmail === usuario.email);
        if (!propio) throw new Error('No se encontró tu registro como alumno.');
        setMisDatos({ ...propio, rol: 'ALUMNO' });
        setEstudianteId(propio.usuId);

      } else if (usuario.role === 'APODERADO') {
        const resApo = await usuarioApi.get('/registro/apoderado');
        const propioApo = resApo.data.find(a => a.usuEmail === usuario.email);
        if (!propioApo) throw new Error('No se encontró tu registro como apoderado.');

        // Buscamos cuál estudiante tiene este apoderado vinculado
        const resAlumnos = await usuarioApi.get('/registro/alumno');
        let hijoEncontrado = null;
        for (const alumno of resAlumnos.data) {
          try {
            const detalle = await usuarioApi.get(`/registro/alumno/${alumno.usuId}`);
            if (detalle.data.apoderadoId === propioApo.usuId) {
              hijoEncontrado = detalle.data;
              break;
            }
          } catch (errInterno) {
            console.warn(`No se pudo consultar el alumno ID ${alumno.usuId}, se omite:`, errInterno.message);
            // sigue con el siguiente alumno en vez de morir aquí
          }
        }

        if (!hijoEncontrado) throw new Error('No se encontró un estudiante a tu cargo.');

        setMisDatos({ ...propioApo, rol: 'APODERADO', hijoNombre: hijoEncontrado.nombre });
        setEstudianteId(hijoEncontrado.usuId);
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
  if (error) return <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{/* tu título existente */}</h2>
            <button onClick={cerrarSesion} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cerrar Sesión
            </button>
        </div>
      <h2>
        {misDatos.rol === 'ALUMNO' ? `Hola, ${misDatos.usu_nombre}` : `Portal de ${misDatos.usu_nombre} (Apoderado de ${misDatos.hijoNombre})`}
      </h2>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setTab('hojavida')} style={tabStyle(tab === 'hojavida')}>Hoja de Vida</button>
        <button onClick={() => setTab('mensajeria')} style={tabStyle(tab === 'mensajeria')}>Mensajería</button>
        <button onClick={() => setTab('eventos')} style={tabStyle(tab === 'eventos')}>Calendario y Muro</button>
      </div>

      {tab === 'hojavida' && <MiHojaDeVida estudianteId={estudianteId} />}
      {tab === 'mensajeria' && <MiMensajeria miUsuId={misDatos.usuId} />}
      {tab === 'eventos' && <MiCalendarioMuro />}
    </div>
  );
}

const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '15px', borderRadius: '6px', margin: '20px' });
const tabStyle = (active) => ({ padding: '10px 18px', border: 'none', borderRadius: '6px', backgroundColor: active ? '#2563eb' : '#e5e7eb', color: active ? '#fff' : '#333', cursor: 'pointer', fontSize: '14px' });

export default PortalAlumnoApoderado;