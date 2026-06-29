import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vidaEstudiantilApi, usuarioApi } from '../services/axiosConfigB';

function HojaVidaDetallePage({ hojaId, onVolver }) {
  // const { hojaId } = useParams();
  // const navigate = useNavigate();

  const [hoja, setHoja] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [apoderadoVinculado, setApoderadoVinculado] = useState(null);

  // formularios
  const [medico, setMedico] = useState({ antMedEdad: '', antMedPeso: '', antMedAltura: '', antMedGrupoSang: '', antMedPats: '', antMedFarmaco: '', antMedObs: '' });
  const [academico, setAcademico] = useState({ antAcaAnio: '', antAcaPromGen: '', antAcaObs: '', antAcaCompor: '' });
  const [apoderado, setApoderado] = useState({ apoderadoId: '', antApoNumTelf: '', antApoMail: '', antApoProfesion: '', antApoLugarTrab: '' });

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hojaId]);

    useEffect(() => {
        if (apoderadoVinculado) {
        setApoderado(prev => ({ ...prev, apoderadoId: apoderadoVinculado.id }));
        }
    }, [apoderadoVinculado]);

  const cargarDetalle = () => {
    vidaEstudiantilApi.get(`/hojas-vida/${hojaId}`)
        .then(response => {
        setHoja(response.data);
        if (response.data.antecedenteMedico) {
            setMedico(response.data.antecedenteMedico);
        }

        // búsqueda apoderado vinculado a este estudiante en serv usuario 
        usuarioApi.get(`/registro/alumno/${response.data.estudianteId}`)
            .then(res => {
            if (res.data.apoderadoId) {
                setApoderadoVinculado({
                id: res.data.apoderadoId,
                nombre: res.data.nombreApoderado
                });
            } else {
                setApoderadoVinculado(null);
            }
            })
            .catch(() => setApoderadoVinculado(null));
        })
        .catch(() => setError('No se pudo cargar la hoja de vida.'));
    };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setError('');
    setTimeout(() => setMensaje(''), 3000);
  };

  const mostrarError = (err, fallback) => {
    const msg = err.response?.data || fallback;
    setError(typeof msg === 'string' ? msg : fallback);
    };

  // ---- medico ----
  const guardarMedico = (e) => {
    e.preventDefault();
    vidaEstudiantilApi.put(`/hojas-vida/${hojaId}/antecedente-medico`, {
      ...medico,
      antMedEdad: parseInt(medico.antMedEdad),
      antMedPeso: parseFloat(medico.antMedPeso) || 0,
      antMedAltura: parseFloat(medico.antMedAltura) || 0
    })
      .then(() => { mostrarMensaje('Antecedente médico guardado.'); cargarDetalle(); })
      .catch(err => mostrarError(err, 'Error al guardar antecedente médico.'));
  };

  // ---- academico ----
  const agregarAcademico = (e) => {
    e.preventDefault();
    vidaEstudiantilApi.post(`/hojas-vida/${hojaId}/antecedentes-academicos`, {
      ...academico,
      antAcaAnio: parseInt(academico.antAcaAnio),
      antAcaPromGen: parseFloat(academico.antAcaPromGen) || 0
    })
      .then(() => {
        mostrarMensaje('Antecedente académico agregado.');
        setAcademico({ antAcaAnio: '', antAcaPromGen: '', antAcaObs: '', antAcaCompor: '' });
        cargarDetalle();
      })
      .catch(err => mostrarError(err, 'Error al agregar antecedente académico.'));
  };

  // ---- apoderado ----
  const agregarApoderado = (e) => {
    e.preventDefault();
    vidaEstudiantilApi.post(`/hojas-vida/${hojaId}/antecedentes-apoderado`, {
      ...apoderado,
      apoderadoId: parseInt(apoderado.apoderadoId)
    })
      .then(() => {
        mostrarMensaje('Apoderado agregado.');
        setApoderado({ apoderadoId: '', antApoNumTelf: '', antApoMail: '', antApoProfesion: '', antApoLugarTrab: '' });
        cargarDetalle();
      })
      .catch(err => mostrarError(err, 'Error al agregar apoderado.'));
  };

  const eliminarApoderado = (antApoId) => {
    if (!window.confirm('¿Eliminar este apoderado de la hoja de vida?')) return;
    vidaEstudiantilApi.delete(`/hojas-vida/${hojaId}/antecedentes-apoderado/${antApoId}`)
      .then(() => { mostrarMensaje('Apoderado eliminado.'); cargarDetalle(); })
      .catch(() => setError('No se pudo eliminar el apoderado.'));
  };

  if (!hoja) {
    return <div><p>{error || 'Cargando hoja de vida...'}</p></div>;
  }

  return (
    <div>
      <button onClick={onVolver} style={backBtnStyle}>← Volver al listado</button>

      {mensaje && <div style={alertStyle('#d4edda', '#155724')}>{mensaje}</div>}
      {error && <div style={alertStyle('#f8d7da', '#721c24')}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>

        {/* Antecedente medico */}
        <div style={cardStyle('100%')}>
          <h5 style={cardTitleStyle}>† Antecedente Médico</h5>
          <form onSubmit={guardarMedico} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="number" placeholder="Edad" value={medico.antMedEdad}
              onChange={e => setMedico({ ...medico, antMedEdad: e.target.value })}
              style={{ ...inputSmall }} required />
            <input type="number" step="0.1" placeholder="Peso (kg)" value={medico.antMedPeso}
              onChange={e => setMedico({ ...medico, antMedPeso: e.target.value })} style={inputSmall} />
            <input type="number" step="0.01" placeholder="Altura (m)" value={medico.antMedAltura}
              onChange={e => setMedico({ ...medico, antMedAltura: e.target.value })} style={inputSmall} />
            <input type="text" placeholder="Grupo Sang." value={medico.antMedGrupoSang || ''}
              onChange={e => setMedico({ ...medico, antMedGrupoSang: e.target.value })} style={inputSmall} />
            <input type="text" placeholder="Patologías" value={medico.antMedPats || ''}
              onChange={e => setMedico({ ...medico, antMedPats: e.target.value })} style={inputSmall} />
            <input type="text" placeholder="Fármacos" value={medico.antMedFarmaco || ''}
              onChange={e => setMedico({ ...medico, antMedFarmaco: e.target.value })} style={inputSmall} />
            <input type="text" placeholder="Observaciones" value={medico.antMedObs || ''}
              onChange={e => setMedico({ ...medico, antMedObs: e.target.value })} style={{ ...inputSmall, flexGrow: 1 }} />
            <button type="submit" style={{ ...buttonStyle, width: 'auto', padding: '8px 20px' }}>Guardar</button>
          </form>
        </div>

        {/* Antecedentes academicos */}
        <div style={cardStyle('100%')}>
          <h5 style={cardTitleStyle}>± Antecedentes Académicos</h5>
          <form onSubmit={agregarAcademico} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <input type="number" placeholder="Año" value={academico.antAcaAnio}
              onChange={e => setAcademico({ ...academico, antAcaAnio: e.target.value })} style={inputSmall} required />
            <input type="number" step="0.1" placeholder="Promedio" value={academico.antAcaPromGen}
              onChange={e => setAcademico({ ...academico, antAcaPromGen: e.target.value })} style={inputSmall} />
            <input type="text" placeholder="Observaciones" value={academico.antAcaObs}
              onChange={e => setAcademico({ ...academico, antAcaObs: e.target.value })} style={{ ...inputSmall, flexGrow: 1 }} />
            <input type="text" placeholder="Comportamiento" value={academico.antAcaCompor}
              onChange={e => setAcademico({ ...academico, antAcaCompor: e.target.value })} style={{ ...inputSmall, flexGrow: 1 }} />
            <button type="submit" style={{ ...buttonStyle, width: 'auto', padding: '8px 20px' }}>Agregar</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                <th style={thStyle}>Año</th><th style={thStyle}>Promedio</th>
                <th style={thStyle}>Observación</th><th style={thStyle}>Comportamiento</th>
              </tr>
            </thead>
            <tbody>
              {hoja.antecedentesAcademicos?.map(a => (
                <tr key={a.antAcaId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{a.antAcaAnio}</td>
                  <td style={tdStyle}>{a.antAcaPromGen}</td>
                  <td style={tdStyle}>{a.antAcaObs}</td>
                  <td style={tdStyle}>{a.antAcaCompor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Antecedentes apoderado */}
        <div style={cardStyle('100%')}>
          <h5 style={cardTitleStyle}>¶ Apoderados Registrados</h5>
          <form onSubmit={agregarApoderado} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <input
                type="text"
                value={apoderadoVinculado ? `${apoderadoVinculado.id} - ${apoderadoVinculado.nombre}` : 'Sin apoderado vinculado'}
                readOnly
                style={{ ...inputSmall, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <input type="text" placeholder="Teléfono" value={apoderado.antApoNumTelf}
              onChange={e => setApoderado({ ...apoderado, antApoNumTelf: e.target.value })} style={inputSmall} required />
            <input type="email" placeholder="Email" value={apoderado.antApoMail}
              onChange={e => setApoderado({ ...apoderado, antApoMail: e.target.value })} style={inputSmall} />
            <input type="text" placeholder="Profesión" value={apoderado.antApoProfesion}
              onChange={e => setApoderado({ ...apoderado, antApoProfesion: e.target.value })} style={inputSmall} required />
            <input type="text" placeholder="Lugar de trabajo" value={apoderado.antApoLugarTrab}
              onChange={e => setApoderado({ ...apoderado, antApoLugarTrab: e.target.value })} style={inputSmall} />
            <button type="submit" style={{ ...buttonStyle, width: 'auto', padding: '8px 20px' }}>Agregar</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                <th style={thStyle}>ID Apoderado</th><th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Email</th><th style={thStyle}>Profesión</th><th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hoja.antecedentesApoderado?.map(a => (
                <tr key={a.antApoId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{a.apoderadoId}</td>
                  <td style={tdStyle}>{a.antApoNumTelf}</td>
                  <td style={tdStyle}>{a.antApoMail}</td>
                  <td style={tdStyle}>{a.antApoProfesion}</td>
                  <td style={tdStyle}>
                    <button onClick={() => eliminarApoderado(a.antApoId)} style={deleteBtnStyle}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const cardStyle = (width) => ({
  backgroundColor: '#fff', borderRadius: '8px', padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width, minWidth: '300px'
});
const cardTitleStyle = { marginBottom: '15px', fontWeight: '600', fontSize: '16px' };
const inputSmall = { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '120px' };
const buttonStyle = { backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const alertStyle = (bg, color) => ({ backgroundColor: bg, color, padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' });
const thStyle = { padding: '10px 8px', fontSize: '13px', color: '#555' };
const tdStyle = { padding: '10px 8px', fontSize: '13px' };
const deleteBtnStyle = { padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' };
const backBtnStyle = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', padding: 0 };

export default HojaVidaDetallePage;