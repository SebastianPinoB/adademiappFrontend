import React, { useState, useEffect } from 'react';
import { reportesApi, usuarioApi } from '../services/axiosConfigB';
import { obtenerTodosLosAlumnos } from '../services/estudiantes';
import { obtenerTodosLosCursos } from '../services/curso';

function ReportesPage() {
  const [tab, setTab] = useState('citas');

  // Datos para selects
  const [alumnos, setAlumnos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [cursos, setCursos] = useState([]);

  // Listados
  const [citas, setCitas] = useState([]);
  const [actasApoderados, setActasApoderados] = useState([]);
  const [actasGenerales, setActasGenerales] = useState([]);

  // Forms
  const formInicial = { fecha: '', hora: '', descripcion: '', temasTratados: '', acuerdos: '', observaciones: '' };
  const [citaForm, setCitaForm] = useState({ ...formInicial, usuId: '' });
  const [actaApoForm, setActaApoForm] = useState({ ...formInicial, cursoId: '' });
  const [actaGenForm, setActaGenForm] = useState({ ...formInicial, idFuncionario: '' });

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerTodosLosAlumnos().then(data => setAlumnos(data)).catch(() => {});
    usuarioApi.get('/registro/funcionario/docente').then(r => setFuncionarios(r.data)).catch(() => {});
    obtenerTodosLosCursos().then(data => setCursos(data)).catch(() => {});
    cargarCitas();
    cargarActasApoderados();
    cargarActasGenerales();
  }, []);

  const mostrarMensaje = (texto) => { setMensaje(texto); setError(''); setTimeout(() => setMensaje(''), 3000); };
  const mostrarError = (err, fallback) => {
    const msg = err.response?.data || fallback;
    setError(typeof msg === 'string' ? msg : fallback);
  };

  const cargarCitas = () => {
    reportesApi.get('/api/bitacoras/citas').then(r => setCitas(r.data)).catch(() => {});
  };
  const cargarActasApoderados = () => {
    reportesApi.get('/api/bitacoras/actas/apoderados').then(r => setActasApoderados(r.data)).catch(() => {});
  };
  const cargarActasGenerales = () => {
    reportesApi.get('/api/bitacoras/actas/generales').then(r => setActasGenerales(r.data)).catch(() => {});
  };

  const registrarCita = (e) => {
    e.preventDefault();
    reportesApi.post('/api/bitacoras/citas', {
      ...citaForm,
      usuId: parseInt(citaForm.usuId)
    })
      .then(() => {
        mostrarMensaje('Cita registrada correctamente.');
        setCitaForm({ ...formInicial, usuId: '' });
        cargarCitas();
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, 'Error al registrar la cita.');
      });
  };

  const registrarActaApoderados = (e) => {
    e.preventDefault();
    reportesApi.post('/api/bitacoras/actas', {
      ...actaApoForm,
      cursoId: parseInt(actaApoForm.cursoId)
    })
      .then(() => {
        mostrarMensaje('Acta de apoderados registrada correctamente.');
        setActaApoForm({ ...formInicial, cursoId: '' });
        cargarActasApoderados();
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, 'Error al registrar el acta de apoderados.');
      });
  };

  const registrarActaGeneral = (e) => {
    e.preventDefault();
    reportesApi.post('/api/bitacoras/actas', {
      ...actaGenForm,
      idFuncionario: parseInt(actaGenForm.idFuncionario)
    })
      .then(() => {
        mostrarMensaje('Acta general registrada correctamente.');
        setActaGenForm({ ...formInicial, idFuncionario: '' });
        cargarActasGenerales();
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, 'Error al registrar el acta general.');
      });
  };

  return (
    <div>
      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('citas')} style={tabStyle(tab === 'citas')}>Citas</button>
        <button onClick={() => setTab('apoderados')} style={tabStyle(tab === 'apoderados')}>Actas de Apoderados</button>
        <button onClick={() => setTab('generales')} style={tabStyle(tab === 'generales')}>Actas Generales</button>
      </div>

      {tab === 'citas' && (
        <>
          <div style={cardStyle}>
            <h5 style={cardTitleStyle}>Registrar Cita</h5>
            <form onSubmit={registrarCita}>
              <label style={labelStyle}>Alumno</label>
              <select value={citaForm.usuId} onChange={e => setCitaForm({ ...citaForm, usuId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona un alumno --</option>
                {alumnos.map(a => (
                  <option key={a.usuId} value={a.usuId}>{a.usuId} - {a.usu_nombre} {a.usu_appaterno}</option>
                ))}
              </select>

              <label style={labelStyle}>Fecha</label>
              <input type="date" value={citaForm.fecha} onChange={e => setCitaForm({ ...citaForm, fecha: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Hora</label>
              <input type="time" value={citaForm.hora} onChange={e => setCitaForm({ ...citaForm, hora: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Descripción</label>
              <textarea value={citaForm.descripcion} onChange={e => setCitaForm({ ...citaForm, descripcion: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }} maxLength={500} required />

              <label style={labelStyle}>Temas Tratados (opcional)</label>
              <input type="text" value={citaForm.temasTratados} onChange={e => setCitaForm({ ...citaForm, temasTratados: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Acuerdos (opcional)</label>
              <input type="text" value={citaForm.acuerdos} onChange={e => setCitaForm({ ...citaForm, acuerdos: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Observaciones (opcional)</label>
              <textarea value={citaForm.observaciones} onChange={e => setCitaForm({ ...citaForm, observaciones: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px' }} maxLength={500} />

              <button type="submit" style={buttonStyle}>Registrar Cita</button>
            </form>
          </div>

          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h5 style={cardTitleStyle}>Citas Registradas</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Hora</th>
                  <th style={thStyle}>Estudiante</th><th style={thStyle}>Descripción</th>
                  <th style={thStyle}>Firma Apoderado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.idBitacoraCitaApoderado} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{c.fecha}</td>
                    <td style={tdStyle}>{c.hora}</td>
                    <td style={tdStyle}>{c.nombreEstudiante}</td>
                    <td style={tdStyle}>{c.descripcion}</td>
                    <td style={tdStyle}>{c.bitFirmaApo ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'apoderados' && (
        <>
          <div style={cardStyle}>
            <h5 style={cardTitleStyle}>Registrar Acta de Reunión de Apoderados</h5>
            <form onSubmit={registrarActaApoderados}>
              <label style={labelStyle}>Curso</label>
              <select value={actaApoForm.cursoId} onChange={e => setActaApoForm({ ...actaApoForm, cursoId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona un curso --</option>
                {cursos.map(c => (
                  <option key={c.cursoId} value={c.cursoId}>{c.nivel?.nivelNombre} {c.cursoLetra}</option>
                ))}
              </select>

              <label style={labelStyle}>Fecha</label>
              <input type="date" value={actaApoForm.fecha} onChange={e => setActaApoForm({ ...actaApoForm, fecha: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Hora</label>
              <input type="time" value={actaApoForm.hora} onChange={e => setActaApoForm({ ...actaApoForm, hora: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Descripción</label>
              <textarea value={actaApoForm.descripcion} onChange={e => setActaApoForm({ ...actaApoForm, descripcion: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }} maxLength={500} required />

              <label style={labelStyle}>Temas Tratados (opcional)</label>
              <input type="text" value={actaApoForm.temasTratados} onChange={e => setActaApoForm({ ...actaApoForm, temasTratados: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Acuerdos (opcional)</label>
              <input type="text" value={actaApoForm.acuerdos} onChange={e => setActaApoForm({ ...actaApoForm, acuerdos: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Observaciones (opcional)</label>
              <textarea value={actaApoForm.observaciones} onChange={e => setActaApoForm({ ...actaApoForm, observaciones: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px' }} maxLength={500} />

              <button type="submit" style={buttonStyle}>Registrar Acta</button>
            </form>
          </div>

          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h5 style={cardTitleStyle}>Actas de Apoderados Registradas</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Hora</th>
                  <th style={thStyle}>Curso</th><th style={thStyle}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {actasApoderados.map(a => (
                  <tr key={a.idActa} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{a.fecha}</td>
                    <td style={tdStyle}>{a.hora}</td>
                    <td style={tdStyle}>{a.infoCurso}</td>
                    <td style={tdStyle}>{a.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'generales' && (
        <>
          <div style={cardStyle}>
            <h5 style={cardTitleStyle}>Registrar Acta de Reunión General</h5>
            <form onSubmit={registrarActaGeneral}>
              <label style={labelStyle}>Funcionario</label>
              <select value={actaGenForm.idFuncionario} onChange={e => setActaGenForm({ ...actaGenForm, idFuncionario: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona un funcionario --</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.id} - {f.nombreCompleto}</option>
                ))}
              </select>

              <label style={labelStyle}>Fecha</label>
              <input type="date" value={actaGenForm.fecha} onChange={e => setActaGenForm({ ...actaGenForm, fecha: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Hora</label>
              <input type="time" value={actaGenForm.hora} onChange={e => setActaGenForm({ ...actaGenForm, hora: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Descripción</label>
              <textarea value={actaGenForm.descripcion} onChange={e => setActaGenForm({ ...actaGenForm, descripcion: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }} maxLength={500} required />

              <label style={labelStyle}>Temas Tratados (opcional)</label>
              <input type="text" value={actaGenForm.temasTratados} onChange={e => setActaGenForm({ ...actaGenForm, temasTratados: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Acuerdos (opcional)</label>
              <input type="text" value={actaGenForm.acuerdos} onChange={e => setActaGenForm({ ...actaGenForm, acuerdos: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Observaciones (opcional)</label>
              <textarea value={actaGenForm.observaciones} onChange={e => setActaGenForm({ ...actaGenForm, observaciones: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px' }} maxLength={500} />

              <button type="submit" style={buttonStyle}>Registrar Acta</button>
            </form>
          </div>

          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h5 style={cardTitleStyle}>Actas Generales Registradas</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Hora</th>
                  <th style={thStyle}>Funcionario</th><th style={thStyle}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {actasGenerales.map(a => (
                  <tr key={a.idActa} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{a.fecha}</td>
                    <td style={tdStyle}>{a.hora}</td>
                    <td style={tdStyle}>{a.nombreFuncionario}</td>
                    <td style={tdStyle}>{a.descripcion}</td>
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

export default ReportesPage;