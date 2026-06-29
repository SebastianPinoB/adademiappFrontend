import React, { useState, useEffect } from 'react';
import { eventosCalendarioApi } from '../services/axiosConfigB';

function MiCalendarioMuro() {
  const [eventos, setEventos] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    eventosCalendarioApi.get('/calendario').then(r => setEventos(r.data)).catch(() => {});
    eventosCalendarioApi.get('/muro-digital').then(r => setPublicaciones(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div style={cardStyle}>
        <h5 style={titleStyle}>📅 Próximas Evaluaciones y Eventos</h5>
        {eventos.length === 0 ? <p>No hay eventos próximos.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {eventos.map(ev => (
              <li key={ev.calEstId} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <b>{ev.calEstFecha}</b> — {ev.calEstDescripcion} ({ev.calEstTipo})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={cardStyle}>
        <h5 style={titleStyle}>📰 Muro Digital</h5>
        {publicaciones.length === 0 ? <p>No hay publicaciones.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {publicaciones.map(p => (
              <li key={p.muroDigId} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                {p.muroConte}
                <div style={{ fontSize: '12px', color: '#888' }}>{new Date(p.muroFecPubli).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' };
const titleStyle = { marginBottom: '15px', fontWeight: '600' };

export default MiCalendarioMuro;