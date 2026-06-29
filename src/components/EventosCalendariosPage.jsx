import React, { useState, useEffect } from 'react';
import { eventosCalendarioApi, usuarioApi } from '../services/axiosConfigB';

function EventosCalendariosPage() {
  const [tab, setTab] = useState('calendario');

  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);

  const [eventos, setEventos] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  const [evento, setEvento] = useState({ cursoId: '', asignaturaId: '', docenteId: '', calEstFecha: '', calEstDescripcion: '', calEstOa: '', calEstTipo: 'EVALUACION' });
  const [publicacion, setPublicacion] = useState({ docenteId: '', asignaturaId: '', muroConte: '', muroTipoConte: 'ASIGNATURA' });

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usuarioApi.get('/registro/funcionario/docente').then(r => setDocentes(r.data)).catch(() => {});
    eventosCalendarioApi.get('/calendario/cursos-disponibles').then(r => setCursos(r.data)).catch(() => {});
    eventosCalendarioApi.get('/calendario/asignaturas-disponibles').then(r => setAsignaturas(r.data)).catch(() => {});
    cargarEventos();
    cargarPublicaciones();
  }, []);

  const cargarEventos = () => {
    eventosCalendarioApi.get('/calendario').then(r => setEventos(r.data)).catch(() => {});
  };

  const cargarPublicaciones = () => {
    eventosCalendarioApi.get('/muro-digital').then(r => setPublicaciones(r.data)).catch(() => {});
  };

  const mostrarMensaje = (texto) => { setMensaje(texto); setError(''); setTimeout(() => setMensaje(''), 3000); };
  const mostrarError = (err, fallback) => {
    const msg = err.response?.data || fallback;
    setError(typeof msg === 'string' ? msg : fallback);
  };

  const crearEvento = (e) => {
    e.preventDefault();
    eventosCalendarioApi.post('/calendario', {
      ...evento,
      cursoId: parseInt(evento.cursoId),
      asignaturaId: parseInt(evento.asignaturaId),
      docenteId: parseInt(evento.docenteId)
    })
      .then(() => {
        mostrarMensaje('Evento publicado en el calendario.');
        setEvento({ cursoId: '', asignaturaId: '', docenteId: '', calEstFecha: '', calEstDescripcion: '', calEstOa: '', calEstTipo: 'EVALUACION' });
        cargarEventos();
      })
      .catch(err => mostrarError(err, 'Error al crear el evento.'));
  };

  const eliminarEvento = (id) => {
    if (!window.confirm('¿Eliminar este evento del calendario?')) return;
    eventosCalendarioApi.delete(`/calendario/${id}`)
      .then(() => { mostrarMensaje('Evento eliminado.'); cargarEventos(); })
      .catch(() => setError('No se pudo eliminar el evento.'));
  };

  const crearPublicacion = (e) => {
    e.preventDefault();
    eventosCalendarioApi.post('/muro-digital', {
      ...publicacion,
      docenteId: parseInt(publicacion.docenteId),
      asignaturaId: parseInt(publicacion.asignaturaId)
    })
      .then(() => {
        mostrarMensaje('Publicación creada en el muro digital.');
        setPublicacion({ docenteId: '', asignaturaId: '', muroConte: '', muroTipoConte: 'ASIGNATURA' });
        cargarPublicaciones();
      })
      .catch(err => mostrarError(err, 'Error al publicar.'));
  };

  const eliminarPublicacion = (id) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    eventosCalendarioApi.delete(`/muro-digital/${id}`)
      .then(() => { mostrarMensaje('Publicación eliminada.'); cargarPublicaciones(); })
      .catch(() => setError('No se pudo eliminar la publicación.'));
  };

  // eslint-disable-next-line
  const nombreDocente = (id) => {
    const d = docentes.find(x => x.id === id);
    return d ? d.nombreCompleto : `ID ${id}`;
  };

  const nombreAsignatura = (id) => {
    const a = asignaturas.find(x => x.asigId === id);
    return a ? a.asigNombre : `ID ${id}`;
  };

  const nombreCurso = (id) => {
    const c = cursos.find(x => x.cursoId === id);
    return c ? `${c.nivel?.nivelNombre} ${c.cursoLetra}` : `ID ${id}`;
  };

  return (
    <div>
      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('calendario')} style={tabStyle(tab === 'calendario')}>Calendario</button>
        <button onClick={() => setTab('muro')} style={tabStyle(tab === 'muro')}>Muro Digital</button>
      </div>

      {tab === 'calendario' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={cardStyle('40%')}>
            <h5 style={cardTitleStyle}>+ Publicar Evento</h5>
            <form onSubmit={crearEvento}>
              <label style={labelStyle}>Docente</label>
              <select value={evento.docenteId} onChange={e => setEvento({ ...evento, docenteId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona docente --</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.id} - {d.nombreCompleto}</option>)}
              </select>

              <label style={labelStyle}>Curso</label>
              <select value={evento.cursoId} onChange={e => setEvento({ ...evento, cursoId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona curso --</option>
                {cursos.map(c => <option key={c.cursoId} value={c.cursoId}>{c.nivel?.nivelNombre} {c.cursoLetra}</option>)}
              </select>

              <label style={labelStyle}>Asignatura</label>
              <select value={evento.asignaturaId} onChange={e => setEvento({ ...evento, asignaturaId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona asignatura --</option>
                {asignaturas.map(a => <option key={a.asigId} value={a.asigId}>{a.asigNombre}</option>)}
              </select>

              <label style={labelStyle}>Fecha</label>
              <input type="date" value={evento.calEstFecha} onChange={e => setEvento({ ...evento, calEstFecha: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Tipo</label>
              <select value={evento.calEstTipo} onChange={e => setEvento({ ...evento, calEstTipo: e.target.value })} style={inputStyle}>
                <option value="EVALUACION">Evaluación</option>
                <option value="TRABAJO">Trabajo</option>
                <option value="EVENTO">Evento</option>
              </select>

              <label style={labelStyle}>Descripción</label>
              <input type="text" value={evento.calEstDescripcion} onChange={e => setEvento({ ...evento, calEstDescripcion: e.target.value })} style={inputStyle} required />

              <label style={labelStyle}>Objetivos de Aprendizaje (OA)</label>
              <input type="text" placeholder="Ej: OA 5, OA 8" value={evento.calEstOa} onChange={e => setEvento({ ...evento, calEstOa: e.target.value })} style={inputStyle} required />

              <button type="submit" style={buttonStyle}>Publicar Evento</button>
            </form>
          </div>

          <div style={cardStyle('55%')}>
            <h5 style={cardTitleStyle}>⁜ Eventos Publicados</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Curso</th>
                  <th style={thStyle}>Asignatura</th><th style={thStyle}>Tipo</th><th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(ev => (
                  <tr key={ev.calEstId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{ev.calEstFecha}</td>
                    <td style={tdStyle}>{nombreCurso(ev.cursoId)}</td>
                    <td style={tdStyle}>{nombreAsignatura(ev.asignaturaId)}</td>
                    <td style={tdStyle}>{ev.calEstTipo}</td>
                    <td style={tdStyle}>
                      <button onClick={() => eliminarEvento(ev.calEstId)} style={deleteBtnStyle}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'muro' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={cardStyle('40%')}>
            <h5 style={cardTitleStyle}>+ Nueva Publicación</h5>
            <form onSubmit={crearPublicacion}>
              <label style={labelStyle}>Docente</label>
              <select value={publicacion.docenteId} onChange={e => setPublicacion({ ...publicacion, docenteId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona docente --</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.id} - {d.nombreCompleto}</option>)}
              </select>

              <label style={labelStyle}>Asignatura</label>
              <select value={publicacion.asignaturaId} onChange={e => setPublicacion({ ...publicacion, asignaturaId: e.target.value })} style={inputStyle} required>
                <option value="">-- Selecciona asignatura --</option>
                {asignaturas.map(a => <option key={a.asigId} value={a.asigId}>{a.asigNombre}</option>)}
              </select>

              <label style={labelStyle}>Contenido</label>
              <textarea value={publicacion.muroConte} onChange={e => setPublicacion({ ...publicacion, muroConte: e.target.value })}
                style={{ ...inputStyle, minHeight: '100px' }} required />

              <button type="submit" style={buttonStyle}>Publicar</button>
            </form>
          </div>

          <div style={cardStyle('55%')}>
            <h5 style={cardTitleStyle}>‖ Publicaciones</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Asignatura</th><th style={thStyle}>Contenido</th>
                  <th style={thStyle}>Fecha</th><th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.map(p => (
                  <tr key={p.muroDigId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{nombreAsignatura(p.asignaturaId)}</td>
                    <td style={tdStyle}>{p.muroConte}</td>
                    <td style={tdStyle}>{new Date(p.muroFecPubli).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <button onClick={() => eliminarPublicacion(p.muroDigId)} style={deleteBtnStyle}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = (width) => ({ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width, minWidth: '300px' });
const cardTitleStyle = { marginBottom: '20px', fontWeight: '600', fontSize: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px 12px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' });
const thStyle = { padding: '10px 8px', fontSize: '14px', color: '#555' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };
const deleteBtnStyle = { padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' };
const tabStyle = (active) => ({ padding: '10px 18px', border: 'none', borderRadius: '6px', backgroundColor: active ? '#2563eb' : '#e5e7eb', color: active ? '#fff' : '#333', cursor: 'pointer', fontSize: '14px' });

export default EventosCalendariosPage;