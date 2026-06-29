import React, { useState, useEffect } from 'react';
import { mensajeriaApi } from '../services/axiosConfigB';

function MiMensajeria({ miUsuId }) {
  const [bandeja, setBandeja] = useState([]);
  const [receptorId, setReceptorId] = useState('');
  const [contenido, setContenido] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { cargarBandeja(); }, []);

  const cargarBandeja = () => {
    mensajeriaApi.get(`/mensajeria/bandeja/${miUsuId}`).then(r => setBandeja(r.data)).catch(() => {});
  };

  const enviar = (e) => {
    e.preventDefault();
    mensajeriaApi.post('/mensajeria/individual', {
      msjIdEmisor: miUsuId,
      msjIdReceptor: parseInt(receptorId),
      msjContenido: contenido
    })
      .then(() => { setMensaje('Mensaje enviado.'); setContenido(''); setReceptorId(''); cargarBandeja(); })
      .catch(err => setError(err.response?.data || 'Error al enviar.'));
  };

  return (
    <div>
      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{typeof error === 'string' ? error : 'Error'}</div>}

      <div style={cardStyle}>
        <h5 style={titleStyle}>✉️ Enviar Mensaje</h5>
        <form onSubmit={enviar}>
          <input type="number" placeholder="ID del destinatario" value={receptorId}
            onChange={e => setReceptorId(e.target.value)} style={inputStyle} required />
          <textarea placeholder="Mensaje" value={contenido} onChange={e => setContenido(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px' }} required />
          <button type="submit" style={buttonStyle}>Enviar</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h5 style={titleStyle}>📥 Mis Mensajes</h5>
        {bandeja.length === 0 ? <p>No tienes mensajes.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {bandeja.map(m => (
              <li key={m.msjId} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <b>De: {m.msjIdEmisor}</b> — {m.msjContenido}
                <div style={{ fontSize: '12px', color: '#888' }}>{new Date(m.msjFechaEnvio).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px', maxWidth: '600px' };
const titleStyle = { marginBottom: '15px', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '8px 12px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '6px' };
const buttonStyle = { padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '10px', borderRadius: '6px', marginBottom: '16px' });

export default MiMensajeria;