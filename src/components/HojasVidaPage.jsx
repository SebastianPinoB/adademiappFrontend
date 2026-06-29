import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vidaEstudiantilApi, usuarioApi } from '../services/axiosConfigB';

function HojasVidaPage({ onVerDetalle }) {
  const [hojas, setHojas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteId, setEstudianteId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarHojas();
    cargarEstudiantes();
  }, []);

  const cargarHojas = () => {
    vidaEstudiantilApi.get('/hojas-vida')
      .then(response => setHojas(response.data))
      .catch(err => {
        setError('No se pudo conectar con el Servicio de Vida Estudiantil.');
        console.error(err);
      });
  };

  const cargarEstudiantes = () => {
    usuarioApi.get('/registro/alumno')
      .then(response => setEstudiantes(response.data))
      .catch(err => {
        console.error('No se pudo cargar la lista de estudiantes.', err);
      });
  };

  const crearHoja = (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    vidaEstudiantilApi.post('/hojas-vida', { estudianteId: parseInt(estudianteId) })
      .then(() => {
        setMensaje('Hoja de vida creada correctamente.');
        setEstudianteId('');
        cargarHojas();
      })
      .catch(err => {
        const msg = err.response?.data || 'Error al crear la hoja de vida.';
        setError(typeof msg === 'string' ? msg : 'Error al crear la hoja de vida.');
      });
  };

  const eliminarHoja = (hojaId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta hoja de vida?')) return;

    vidaEstudiantilApi.delete(`/hojas-vida/${hojaId}`)
      .then(() => {
        setMensaje('Hoja de vida eliminada.');
        cargarHojas();
      })
      .catch(() => setError('No se pudo eliminar la hoja de vida.'));
  };

  // Busca el nombre del estudiante para mostrarlo en la tabla
  const nombreEstudiante = (id) => {
    const est = estudiantes.find(e => e.usuId === id);
    return est ? `${est.usu_nombre} ${est.usu_appaterno}` : `ID ${id}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

        <div style={cardStyle('40%')}>
          <h5 style={cardTitleStyle}> + Registrar Hoja de Vida</h5>

          {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
          {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

          <form onSubmit={crearHoja}>
            <label style={labelStyle}>Estudiante</label>
            <select
              value={estudianteId}
              onChange={(e) => setEstudianteId(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">-- Selecciona un estudiante --</option>
              {estudiantes.map(est => (
                <option key={est.usuId} value={est.usuId}>
                  {est.usuId} - {est.usu_nombre} {est.usu_appaterno}
                </option>
              ))}
            </select>

            <button type="submit" style={buttonStyle}>
              Guardar Hoja de Vida
            </button>
          </form>
        </div>

        <div style={cardStyle('55%')}>
          <h5 style={cardTitleStyle}> ‖ Registros Existentes</h5>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                <th style={thStyle}>ID Hoja</th>
                <th style={thStyle}>Estudiante</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hojas.map(hoja => (
                <tr key={hoja.hojaId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{hoja.hojaId}</td>
                  <td style={tdStyle}>{nombreEstudiante(hoja.estudianteId)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => onVerDetalle(hoja.hojaId)} style={linkBtnStyle}>
                      Ver Detalle
                    </button>
                    {' '}
                    <button onClick={() => eliminarHoja(hoja.hojaId)} style={deleteBtnStyle}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const cardStyle = (width) => ({
  backgroundColor: '#fff', borderRadius: '8px', padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width, minWidth: '300px'
});
const cardTitleStyle = { marginBottom: '20px', fontWeight: '600', fontSize: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px 12px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' });
const thStyle = { padding: '10px 8px', fontSize: '14px', color: '#555' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };
const linkBtnStyle = { padding: '5px 10px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' };
const deleteBtnStyle = { padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' };

export default HojasVidaPage;