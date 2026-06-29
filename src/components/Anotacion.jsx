import React, { useState, useEffect } from 'react';
import { usuarioApi } from '../services/axiosConfigB';
import { obtenerTodosLosAlumnos } from '../services/estudiantes';
import {
  obtenerTodasLasAnotaciones,
  crearAnotacion,
  actualizarAnotacion
} from '../services/anotacion';

function AnotacionesPage() {
  // Datos para selects
  const [alumnos, setAlumnos] = useState([]);
  const [docentes, setDocentes] = useState([]);

  // Listado
  const [anotaciones, setAnotaciones] = useState([]);

  // Form (id !== null => estamos editando una anotación existente)
  const formInicial = { id: null, anotDesc: '', tipo: 'POSITIVA', fecha: '', hora: '', idEstudiante: '', idDocente: '' };
  const [anotacionForm, setAnotacionForm] = useState({ ...formInicial });
  const editando = anotacionForm.id !== null;

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerTodosLosAlumnos().then(data => setAlumnos(data)).catch(() => {});
    usuarioApi.get('/registro/funcionario/docente').then(r => setDocentes(r.data)).catch(() => {});
    cargarAnotaciones();
  }, []);

  const mostrarMensaje = (texto) => { setMensaje(texto); setError(''); setTimeout(() => setMensaje(''), 3000); };
  const mostrarError = (err, fallback) => {
    const msg = err.response?.data || fallback;
    setError(typeof msg === 'string' ? msg : fallback);
  };

  const cargarAnotaciones = () => {
    obtenerTodasLasAnotaciones().then(data => setAnotaciones(data)).catch(() => {});
  };

  const registrarAnotacion = (e) => {
    e.preventDefault();

    const payload = {
      anotDesc: anotacionForm.anotDesc,
      tipo: anotacionForm.tipo,
      fecha: anotacionForm.fecha,
      hora: anotacionForm.hora,
      idEstudiante: parseInt(anotacionForm.idEstudiante),
      idDocente: parseInt(anotacionForm.idDocente)
    };

    const peticion = editando
      ? actualizarAnotacion(anotacionForm.id, payload)
      : crearAnotacion(payload);

    peticion
      .then(() => {
        mostrarMensaje(editando ? 'Anotación actualizada correctamente.' : 'Anotación registrada correctamente.');
        setAnotacionForm({ ...formInicial });
        cargarAnotaciones();
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, editando ? 'Error al actualizar la anotación.' : 'Error al registrar la anotación.');
      });
  };

  const seleccionarParaEditar = (anotacion) => {
    setAnotacionForm({
      id: anotacion.id,
      anotDesc: anotacion.anotDesc,
      tipo: anotacion.tipo,
      fecha: anotacion.fecha,
      hora: anotacion.hora,
      idEstudiante: anotacion.idEstudiante,
      idDocente: anotacion.idDocente
    });
    setMensaje('');
    setError('');
  };

  const cancelarEdicion = () => {
    setAnotacionForm({ ...formInicial });
  };

  return (
    <div>
      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

      <div style={cardStyle}>
        <h5 style={cardTitleStyle}>{editando ? 'Editar Anotación' : 'Registrar Anotación'}</h5>
        <form onSubmit={registrarAnotacion}>
          <label style={labelStyle}>Alumno</label>
          <select value={anotacionForm.idEstudiante} onChange={e => setAnotacionForm({ ...anotacionForm, idEstudiante: e.target.value })} style={inputStyle} required>
            <option value="">-- Selecciona un alumno --</option>
            {alumnos.map(a => (
              <option key={a.usuId} value={a.usuId}>{a.usuId} - {a.usu_nombre} {a.usu_appaterno}</option>
            ))}
          </select>

          <label style={labelStyle}>Docente</label>
          <select value={anotacionForm.idDocente} onChange={e => setAnotacionForm({ ...anotacionForm, idDocente: e.target.value })} style={inputStyle} required>
            <option value="">-- Selecciona un docente --</option>
            {docentes.map(d => (
              <option key={d.id} value={d.id}>{d.id} - {d.nombreCompleto}</option>
            ))}
          </select>

          <label style={labelStyle}>Tipo</label>
          <select value={anotacionForm.tipo} onChange={e => setAnotacionForm({ ...anotacionForm, tipo: e.target.value })} style={inputStyle} required>
            <option value="POSITIVA">Positiva</option>
            <option value="NEGATIVA">Negativa</option>
          </select>

          <label style={labelStyle}>Fecha</label>
          <input type="date" value={anotacionForm.fecha} onChange={e => setAnotacionForm({ ...anotacionForm, fecha: e.target.value })} style={inputStyle} required />

          <label style={labelStyle}>Hora</label>
          <input type="time" value={anotacionForm.hora} onChange={e => setAnotacionForm({ ...anotacionForm, hora: e.target.value })} style={inputStyle} required />

          <label style={labelStyle}>Descripción</label>
          <textarea value={anotacionForm.anotDesc} onChange={e => setAnotacionForm({ ...anotacionForm, anotDesc: e.target.value })}
            style={{ ...inputStyle, minHeight: '80px' }} maxLength={500} required />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={buttonStyle}>{editando ? 'Guardar Cambios' : 'Registrar Anotación'}</button>
            {editando && (
              <button type="button" onClick={cancelarEdicion} style={cancelButtonStyle}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div style={{ ...cardStyle, marginTop: '20px' }}>
        <h5 style={cardTitleStyle}>Anotaciones Registradas</h5>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
              <th style={thStyle}>Fecha</th><th style={thStyle}>Hora</th>
              <th style={thStyle}>Estudiante</th><th style={thStyle}>Docente</th>
              <th style={thStyle}>Tipo</th><th style={thStyle}>Descripción</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {anotaciones.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>{a.fecha}</td>
                <td style={tdStyle}>{a.hora}</td>
                <td style={tdStyle}>{a.nombreAlumno}</td>
                <td style={tdStyle}>{a.nombreDocente}</td>
                <td style={tdStyle}>{a.tipo}</td>
                <td style={tdStyle}>{a.anotDesc}</td>
                <td style={tdStyle}>
                  <button onClick={() => seleccionarParaEditar(a)} style={editButtonStyle}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '700px' };
const cardTitleStyle = { marginBottom: '20px', fontWeight: '600', fontSize: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px 12px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const cancelButtonStyle = { padding: '10px 20px', backgroundColor: '#9ca3af', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' });
const thStyle = { padding: '10px 8px', fontSize: '14px', color: '#555' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };
const editButtonStyle = { padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' };

export default AnotacionesPage;