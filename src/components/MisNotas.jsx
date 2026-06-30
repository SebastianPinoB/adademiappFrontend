import React, { useState, useEffect } from 'react';
import { gestionAcademicaApi } from '../services/axiosConfigB';

function MisNotas({ estudianteId }) {
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estudianteId) return;
    gestionAcademicaApi.get('/evaluacion')
      .then(res => {
        const misNotas = [];
        res.data.forEach(eva => {
          eva.notas?.forEach(nota => {
            if (Number(nota.estudianteId) === Number(estudianteId)) {
              misNotas.push({
                notaId: nota.notaId,
                notaValor: nota.notaValor,
                notaFecha: nota.notaFecha,
                evaTipo: eva.evaTipo,
                evaPuntaje: eva.evaPuntaje,
              });
            }
          });
        });
        setNotas(misNotas);
      })
      .catch(() => setNotas([]))
      .finally(() => setCargando(false));
  }, [estudianteId]);

  if (cargando) return <p>Cargando notas...</p>;

  return (
    <div>
      <div style={cardStyle}>
        <h5 style={titleStyle}>⁂ Mis Notas</h5>
        {notas.length === 0 ? (
          <p>No hay notas registradas.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                <th style={thStyle}>Tipo Evaluación</th>
                <th style={thStyle}>Puntaje Máx.</th>
                <th style={thStyle}>Nota</th>
                <th style={thStyle}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {notas.map(n => (
                <tr key={n.notaId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{n.evaTipo}</td>
                  <td style={tdStyle}>{n.evaPuntaje}</td>
                  <td style={tdStyle}>
                    <span style={{ color: n.notaValor >= 4 ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                      {n.notaValor}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(n.notaFecha).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' };
const titleStyle = { marginBottom: '15px', fontWeight: '600' };
const thStyle = { padding: '10px 8px', fontSize: '14px', color: '#555' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };

export default MisNotas;