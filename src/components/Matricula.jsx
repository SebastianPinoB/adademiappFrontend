import React, { useState, useEffect } from 'react';
import { obtenerTodasLasMatriculas, gestionarMatricula, desvincularEstudiante } from '../services/matricula';
import { obtenerTodosLosAlumnos } from '../services/estudiantes';

function MatriculaPage() {
  const [tab, setTab] = useState('matriculas');

  // Datos para selects
  const [alumnos, setAlumnos] = useState([]);

  // Listados
  const [matriculas, setMatriculas] = useState([]);

  // Forms
  const formMatriculaInicial = { usuId: '', fecha: '' };
  const formDesvinculacionInicial = { usuId: '', fechaDesvinculacion: '', motivo: '' };
  const [matriculaForm, setMatriculaForm] = useState({ ...formMatriculaInicial });
  const [desvinculacionForm, setDesvinculacionForm] = useState({ ...formDesvinculacionInicial });

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerTodosLosAlumnos().then(data => setAlumnos(data)).catch(() => {});
    cargarMatriculas();
  }, []);

  const mostrarMensaje = (texto) => { setMensaje(texto); setError(''); setTimeout(() => setMensaje(''), 3000); };
  const mostrarError = (err, fallback) => {
    const msg = err.response?.data || fallback;
    setError(typeof msg === 'string' ? msg : fallback);
  };

  const cargarMatriculas = () => {
    obtenerTodasLasMatriculas().then(data => setMatriculas(data)).catch(() => {});
  };

  const registrarMatricula = (e) => {
    e.preventDefault();
    gestionarMatricula({
      ...matriculaForm,
      usuId: parseInt(matriculaForm.usuId)
    })
      .then(() => {
        mostrarMensaje('Matrícula registrada correctamente.');
        setMatriculaForm({ ...formMatriculaInicial });
        cargarMatriculas();
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, 'Error al registrar la matrícula.');
      });
  };

  const registrarDesvinculacion = (e) => {
    e.preventDefault();
    desvincularEstudiante({
      ...desvinculacionForm,
      usuId: parseInt(desvinculacionForm.usuId)
    })
      .then(() => {
        mostrarMensaje('Estudiante desvinculado correctamente.');
        setDesvinculacionForm({ ...formDesvinculacionInicial });
        cargarMatriculas();
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, 'Error al desvincular al estudiante.');
      });
  };

  // El DTO de matrícula solo trae el usuId (no el nombre), así que para mostrar
  // algo legible en la tabla buscamos el nombre dentro de los alumnos ya cargados.
  const nombreAlumno = (usuId) => {
    const alumno = alumnos.find(a => a.usuId === usuId);
    return alumno ? `${alumno.usuId} - ${alumno.usu_nombre} ${alumno.usu_appaterno}` : usuId;
  };

  return (
    <div>
      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('matriculas')} style={tabStyle(tab === 'matriculas')}>Matrículas</button>
        <button onClick={() => setTab('desvinculacion')} style={tabStyle(tab === 'desvinculacion')}>Desvinculación</button>
      </div>

      {tab === 'matriculas' && (
        <>
          <div style={cardStyle}>
            <h5 style={cardTitleStyle}>Gestionar Matrícula</h5>
            <form onSubmit={registrarMatricula}>
              <label style={labelStyle}>Alumno</label>
              <select value={matriculaForm.usuId} onChange={e => setMatriculaForm({ ...matriculaForm, usuId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona un alumno --</option>
                {alumnos.map(a => (
                  <option key={a.usuId} value={a.usuId}>{a.usuId} - {a.usu_nombre} {a.usu_appaterno}</option>
                ))}
              </select>

              <label style={labelStyle}>Fecha</label>
              <input type="date" value={matriculaForm.fecha} onChange={e => setMatriculaForm({ ...matriculaForm, fecha: e.target.value })} style={inputStyle} required />

              <button type="submit" style={buttonStyle}>Guardar Matrícula</button>
            </form>
          </div>

          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h5 style={cardTitleStyle}>Matrículas Registradas</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>ID</th><th style={thStyle}>Alumno</th>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{m.id}</td>
                    <td style={tdStyle}>{nombreAlumno(m.usuId)}</td>
                    <td style={tdStyle}>{m.fecha}</td>
                    <td style={tdStyle}>{m.estVig ? 'Vigente' : 'No Vigente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'desvinculacion' && (
        <>
          <div style={cardStyle}>
            <h5 style={cardTitleStyle}>Desvincular Estudiante</h5>
            <form onSubmit={registrarDesvinculacion}>
              <label style={labelStyle}>Alumno</label>
              <select value={desvinculacionForm.usuId} onChange={e => setDesvinculacionForm({ ...desvinculacionForm, usuId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona un alumno --</option>
                {alumnos.map(a => (
                  <option key={a.usuId} value={a.usuId}>{a.usuId} - {a.usu_nombre} {a.usu_appaterno}</option>
                ))}
              </select>

              <label style={labelStyle}>Fecha de Desvinculación</label>
              <input type="date" value={desvinculacionForm.fechaDesvinculacion} onChange={e => setDesvinculacionForm({ ...desvinculacionForm, fechaDesvinculacion: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Motivo</label>
              <textarea value={desvinculacionForm.motivo} onChange={e => setDesvinculacionForm({ ...desvinculacionForm, motivo: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }} maxLength={300} required />

              <button type="submit" style={buttonStyle}>Desvincular</button>
            </form>
          </div>

          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h5 style={cardTitleStyle}>Matrículas Registradas</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>ID</th><th style={thStyle}>Alumno</th>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{m.id}</td>
                    <td style={tdStyle}>{nombreAlumno(m.usuId)}</td>
                    <td style={tdStyle}>{m.fecha}</td>
                    <td style={tdStyle}>{m.estVig ? 'Vigente' : 'No Vigente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '700px' };
const cardTitleStyle = { marginBottom: '20px', fontWeight: '600', fontSize: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px 12px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' });
const thStyle = { padding: '10px 8px', fontSize: '14px', color: '#555' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };
const tabStyle = (active) => ({
  padding: '10px 18px', border: 'none', borderRadius: '6px',
  backgroundColor: active ? '#2563eb' : '#e5e7eb',
  color: active ? '#fff' : '#333', cursor: 'pointer', fontSize: '14px'
});

export default MatriculaPage;