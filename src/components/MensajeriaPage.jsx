import React, { useState, useEffect } from 'react';
import { mensajeriaApi, usuarioApi } from '../services/axiosConfigB';

function MensajeriaPage() {
  const [tab, setTab] = useState('individual');

  // Datos para selects
  const [alumnos, setAlumnos] = useState([]);
  const [apoderados, setApoderados] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);

  // Forms
  const [individual, setIndividual] = useState({ msjIdEmisor: '', msjIdReceptor: '', msjContenido: '' });
  const [colectivo, setColectivo] = useState({ msjIdEmisor: '', cursoId: '', msjContenido: '' });

  // Bandeja
  const [usuarioConsulta, setUsuarioConsulta] = useState('');
  const [bandeja, setBandeja] = useState([]);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usuarioApi.get('/registro/alumno').then(r => setAlumnos(r.data)).catch(() => {});
    usuarioApi.get('/registro/apoderado').then(r => setApoderados(r.data)).catch(() => {});
    usuarioApi.get('/registro/funcionario/docente').then(r => setDocentes(r.data)).catch(() => {});
    mensajeriaApi.get('/mensajeria/cursos-disponibles').then(r => setCursos(r.data)).catch(() => {});
  }, []);

  const mostrarMensaje = (texto) => { setMensaje(texto); setError(''); setTimeout(() => setMensaje(''), 3000); };
  const mostrarError = (err, fallback) => {
    const msg = err.response?.data || fallback;
    setError(typeof msg === 'string' ? msg : fallback);
  };

  // Lista unificada de personas: alumnos + apoderados + docentes
  const todasLasPersonas = [
    ...alumnos.map(a => ({ id: a.usuId, label: `${a.usuId} - ${a.usu_nombre} ${a.usu_appaterno} (Alumno)` })),
    ...apoderados.map(a => ({ id: a.usuId, label: `${a.usuId} - ${a.usu_nombre} ${a.usu_appaterno} (Apoderado)` })),
    ...docentes.map(d => ({ id: d.id, label: `${d.id} - ${d.nombreCompleto} (Docente)` }))
  ];

  const enviarIndividual = (e) => {
    e.preventDefault();
    mensajeriaApi.post('/mensajeria/individual', {
      ...individual,
      msjIdEmisor: parseInt(individual.msjIdEmisor),
      msjIdReceptor: parseInt(individual.msjIdReceptor)
    })
      .then(() => {
        mostrarMensaje('Mensaje enviado correctamente.');
        setIndividual({ msjIdEmisor: '', msjIdReceptor: '', msjContenido: '' });
      })
      .catch(err => {
        console.log('MENSAJE DE ERROR:', err.response?.data);
        mostrarError(err, 'Error al enviar el mensaje.');
      });
  };

  const enviarColectivo = (e) => {
    e.preventDefault();
    mensajeriaApi.post('/mensajeria/colectivo', {
      ...colectivo,
      msjIdEmisor: parseInt(colectivo.msjIdEmisor),
      cursoId: parseInt(colectivo.cursoId)
    })
      .then(() => {
        mostrarMensaje('Mensaje colectivo enviado al curso.');
        setColectivo({ msjIdEmisor: '', cursoId: '', msjContenido: '' });
      })
      .catch(err => mostrarError(err, 'Error al enviar el mensaje colectivo.'));
  };

  const consultarBandeja = () => {
    if (!usuarioConsulta) return;
    mensajeriaApi.get(`/mensajeria/bandeja/${usuarioConsulta}`)
      .then(r => setBandeja(r.data))
      .catch(() => setError('No se pudo cargar la bandeja.'));
  };

  return (
    <div>
      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('individual')} style={tabStyle(tab === 'individual')}>Mensaje Individual</button>
        <button onClick={() => setTab('colectivo')} style={tabStyle(tab === 'colectivo')}>Mensaje Colectivo</button>
        <button onClick={() => setTab('bandeja')} style={tabStyle(tab === 'bandeja')}>Bandeja de Entrada</button>
      </div>

      {tab === 'individual' && (
        <div style={cardStyle}>
          <h5 style={cardTitleStyle}>Enviar Mensaje Individual</h5>
          <form onSubmit={enviarIndividual}>
            <label style={labelStyle}>Emisor</label>
            <select value={individual.msjIdEmisor} onChange={e => setIndividual({ ...individual, msjIdEmisor: e.target.value })} style={inputStyle} required>
              <option value="">-- Selecciona quién envía --</option>
              {todasLasPersonas.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            <label style={labelStyle}>Receptor</label>
            <select value={individual.msjIdReceptor} onChange={e => setIndividual({ ...individual, msjIdReceptor: e.target.value })} style={inputStyle} required>
              <option value="">-- Selecciona destinatario --</option>
              {todasLasPersonas.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            <label style={labelStyle}>Mensaje</label>
            <textarea value={individual.msjContenido} onChange={e => setIndividual({ ...individual, msjContenido: e.target.value })}
              style={{ ...inputStyle, minHeight: '100px' }} maxLength={1000} required />

            <button type="submit" style={buttonStyle}>Enviar Mensaje</button>
          </form>
        </div>
      )}

      {tab === 'colectivo' && (
        <div style={cardStyle}>
          <h5 style={cardTitleStyle}>Enviar Mensaje Colectivo a un Curso</h5>
          <form onSubmit={enviarColectivo}>
            <label style={labelStyle}>Emisor</label>
            <select value={colectivo.msjIdEmisor} onChange={e => setColectivo({ ...colectivo, msjIdEmisor: e.target.value })} style={inputStyle} required>
              <option value="">-- Selecciona quién envía --</option>
              {todasLasPersonas.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            <label style={labelStyle}>Curso Destino</label>
            <select value={colectivo.cursoId} onChange={e => setColectivo({ ...colectivo, cursoId: e.target.value })} style={inputStyle} required>
              <option value="">-- Selecciona curso --</option>
              {cursos.map(c => (
                <option key={c.cursoId} value={c.cursoId}>
                  {c.nivel?.nivelNombre} {c.cursoLetra}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Mensaje</label>
            <textarea value={colectivo.msjContenido} onChange={e => setColectivo({ ...colectivo, msjContenido: e.target.value })}
              style={{ ...inputStyle, minHeight: '100px' }} maxLength={1000} required />

            <button type="submit" style={buttonStyle}>Enviar a Todo el Curso</button>
          </form>
        </div>
      )}

      {tab === 'bandeja' && (
        <div style={cardStyle}>
          <h5 style={cardTitleStyle}>Consultar Bandeja de Entrada</h5>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select value={usuarioConsulta} onChange={e => setUsuarioConsulta(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flexGrow: 1 }}>
              <option value="">-- Selecciona un usuario --</option>
              {todasLasPersonas.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <button onClick={consultarBandeja} style={{ ...buttonStyle, width: 'auto', padding: '8px 20px' }}>Ver Bandeja</button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                <th style={thStyle}>Emisor</th><th style={thStyle}>Mensaje</th>
                <th style={thStyle}>Fecha</th><th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {bandeja.map(m => (
                <tr key={m.msjId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{m.msjIdEmisor}</td>
                  <td style={tdStyle}>{m.msjContenido}</td>
                  <td style={tdStyle}>{new Date(m.msjFechaEnvio).toLocaleString()}</td>
                  <td style={tdStyle}>{m.msjEstado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default MensajeriaPage;