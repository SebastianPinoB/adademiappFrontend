import React, { useState, useEffect } from 'react';
import { eventosCalendarioApi } from '../services/axiosConfigB';

function MiCalendarioMuro() {
  const [eventos, setEventos] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    eventosCalendarioApi.get('/calendario')
      .then(r => {
        const ordenados = r.data.sort((a, b) => new Date(a.calEstFecha) - new Date(b.calEstFecha));
        setEventos(ordenados);
      }).catch(() => {});
    eventosCalendarioApi.get('/muro-digital')
      .then(r => {
        const ordenados = r.data.sort((a, b) => new Date(b.muroFecPubli) - new Date(a.muroFecPubli));
        setPublicaciones(ordenados);
      }).catch(() => {});
  }, []);

  const tipoBadge = (tipo) => {
    const colores = { EVALUACION: '#dc3545', TRABAJO: '#fd7e14', EVENTO: '#0d6efd' };
    return {
      backgroundColor: colores[tipo] || '#6c757d',
      color: '#fff', padding: '2px 8px',
      borderRadius: '4px', fontSize: '12px'
    };
  };

  return (
    <div>
      <div style={cardStyle}>
        <h5 style={titleStyle}>Calendario de Evaluaciones y Eventos</h5>
        {eventos.length === 0 ? <p>No hay eventos registrados.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {eventos.map(ev => (
              <li key={ev.calEstId} style={{ borderBottom: '1px solid #eee', padding: '12px 0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '100px', fontWeight: '600', color: '#2563eb' }}>
                  {ev.calEstFecha}
                </div>
                <div>
                  <span style={tipoBadge(ev.calEstTipo)}>{ev.calEstTipo}</span>
                  <span style={{ marginLeft: '8px' }}>{ev.calEstDescripcion}</span>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    OA: {ev.calEstOa}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={cardStyle}>
        <h5 style={titleStyle}>Muro Digital</h5>
        {publicaciones.length === 0 ? <p>No hay publicaciones.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {publicaciones.map(p => (
              <li key={p.muroDigId} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
                <p style={{ margin: 0 }}>{p.muroConte}</p>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {new Date(p.muroFecPubli).toLocaleString()}
                </div>
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