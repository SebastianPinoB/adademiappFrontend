import React, { useState, useEffect } from 'react';
import { vidaEstudiantilApi } from '../services/axiosConfigB';

function MiHojaDeVida({ estudianteId }) {
  const [hoja, setHoja] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    vidaEstudiantilApi.get(`/hojas-vida/estudiante/${estudianteId}`)
      .then(res => setHoja(res.data))
      .catch(() => setError('Aún no tienes una hoja de vida registrada.'));
  }, [estudianteId]);

  if (error) return <p>{error}</p>;
  if (!hoja) return <p>Cargando...</p>;

  return (
    <div>
      <div style={cardStyle}>
        <h5 style={titleStyle}>Antecedente Médico</h5>
        {hoja.antecedenteMedico ? (
          <ul style={listStyle}>
            <li><b>Edad:</b> {hoja.antecedenteMedico.antMedEdad}</li>
            <li><b>Peso:</b> {hoja.antecedenteMedico.antMedPeso} kg</li>
            <li><b>Altura:</b> {hoja.antecedenteMedico.antMedAltura} m</li>
            <li><b>Grupo Sanguíneo:</b> {hoja.antecedenteMedico.antMedGrupoSang}</li>
            <li><b>Patologías:</b> {hoja.antecedenteMedico.antMedPats}</li>
            <li><b>Fármacos:</b> {hoja.antecedenteMedico.antMedFarmaco}</li>
          </ul>
        ) : <p>Sin información médica registrada.</p>}
      </div>

      <div style={cardStyle}>
        <h5 style={titleStyle}>Antecedentes Académicos</h5>
        {hoja.antecedentesAcademicos?.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thStyle}>Año</th><th style={thStyle}>Promedio</th><th style={thStyle}>Observación</th></tr></thead>
            <tbody>
              {hoja.antecedentesAcademicos.map(a => (
                <tr key={a.antAcaId}>
                  <td style={tdStyle}>{a.antAcaAnio}</td>
                  <td style={tdStyle}>{a.antAcaPromGen}</td>
                  <td style={tdStyle}>{a.antAcaObs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Sin antecedentes académicos.</p>}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' };
const titleStyle = { marginBottom: '15px', fontWeight: '600' };
const listStyle = { listStyle: 'none', padding: 0, lineHeight: '1.8' };
const thStyle = { textAlign: 'left', padding: '8px', borderBottom: '2px solid #e0e0e0' };
const tdStyle = { padding: '8px' };

export default MiHojaDeVida;