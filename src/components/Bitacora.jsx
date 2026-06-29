import React, { useState, useEffect } from 'react';
import { obtenerAsignaturas, obtenerBitacoras, crearBitacora, actualizarBitacora } from '../services/bitacoraService';

const initialForm = {
  bitNombre: '',
  bitFechaRegistro: '',
  bitFechaRealClase: '',
  bitObjAprend: '',
  bitTemasTratadoClase: '',
  bitHoraIni: '',
  bitHoraFin: '',
  asignaturaId: '',
};

// ISO date → yyyy-MM-dd para inputs type="date"
const isoAFecha = (iso) => iso ? iso.substring(0, 10) : '';

const Campo = ({ label, error, children, requerido }) => (
  <div>
    <label className="form-label">
      {label} {requerido && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && <div className="text-danger" style={{ fontSize: 12, marginTop: 2 }}>{error}</div>}
  </div>
);

const validarForm = (form) => {
  const errores = {};
  if (!form.bitNombre?.trim()) errores.bitNombre = 'El nombre es obligatorio';
  if (!form.bitFechaRegistro) errores.bitFechaRegistro = 'La fecha de registro es obligatoria';
  if (!form.bitFechaRealClase) errores.bitFechaRealClase = 'La fecha real de clase es obligatoria';
  if (!form.bitObjAprend?.trim()) errores.bitObjAprend = 'El objetivo de aprendizaje es obligatorio';
  if (!form.bitTemasTratadoClase?.trim()) errores.bitTemasTratadoClase = 'Los temas tratados son obligatorios';
  if (!form.bitHoraIni) errores.bitHoraIni = 'La hora de inicio es obligatoria';
  if (!form.bitHoraFin) errores.bitHoraFin = 'La hora de fin es obligatoria';
  if (!form.asignaturaId) errores.asignaturaId = 'Debes seleccionar una asignatura';
  return errores;
};

const Bitacora = () => {
  const [vista, setVista] = useState('lista');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoAsig, setCargandoAsig] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setCargandoAsig(true);
    try {
      const [bits, asigs] = await Promise.all([obtenerBitacoras(), obtenerAsignaturas()]);
      setBitacoras(bits);
      setAsignaturas(asigs);
    } catch {
      alert('No se pudieron cargar los datos');
    } finally {
      setCargando(false);
      setCargandoAsig(false);
    }
  };

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: undefined }));
  };

  const abrirFormularioNuevo = () => {
    setForm(initialForm);
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setVista('formulario');
  };

  // Cruza bitácoras con asignaturas para encontrar el asigId padre
  const buscarAsignaturaId = (bitAsignId) => {
    for (const asig of asignaturas) {
      if (asig.bitacoras?.some(b => b.bitAsignId === bitAsignId)) {
        return asig.asigId;
      }
    }
    return '';
  };

  const abrirFormularioEdicion = (bit) => {
    setForm({
      bitNombre: bit.bitNombre ?? '',
      bitFechaRegistro: isoAFecha(bit.bitFechaRegistro),
      bitFechaRealClase: isoAFecha(bit.bitFechaRealClase),
      bitObjAprend: bit.bitObjetivoAprendizaje ?? '',
      bitTemasTratadoClase: bit.bitTemaTratadoClase ?? '',
      bitHoraIni: bit.bitHoraInicio ?? '',
      bitHoraFin: bit.bitHoraFin ?? '',
      asignaturaId: buscarAsignaturaId(bit.bitAsignId),
    });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(bit.bitAsignId); // bitAsignId es el ID único de la bitácora
    setVista('formulario');
  };

  const handleGuardar = async () => {
    const e = validarForm(form);
    if (Object.keys(e).length > 0) { setErrores(e); return; }

    const payload = {
      bitNombre: form.bitNombre,
      bitFechaRegistro: form.bitFechaRegistro,
      bitFechaRealClase: form.bitFechaRealClase,
      bitObjAprend: form.bitObjAprend,
      bitTemasTratadoClase: form.bitTemasTratadoClase,
      bitHoraIni: form.bitHoraIni,
      bitHoraFin: form.bitHoraFin,
      asignaturaId: Number(form.asignaturaId),
    };

    setGuardando(true);
    try {
      if (modoEdicion) {
        await actualizarBitacora(idEditando, payload);
        alert('Bitácora actualizada correctamente');
      } else {
        await crearBitacora(payload);
        alert('Bitácora creada correctamente');
      }
      setVista('lista');
      await cargarDatos();
    } catch {
      alert('Error al guardar la bitácora. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const nombreAsignatura = (bitAsignId) => {
    for (const asig of asignaturas) {
      if (asig.bitacoras?.some(b => b.bitAsignId === bitAsignId)) {
        return asig.asigNombre;
      }
    }
    return '—';
  };

  const asigSeleccionada = asignaturas.find(a => a.asigId === Number(form.asignaturaId));

  // ── VISTA: LISTA ──
  if (vista === 'lista') {
    return (
      <div className="container-fluid mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Bitácoras</h4>
          <button className="btn btn-primary" onClick={abrirFormularioNuevo}>
            <i className="bi bi-journal-plus me-2"></i>Nueva Bitácora
          </button>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Cargando bitácoras...</p>
          </div>
        ) : bitacoras.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-journal-text fs-1"></i>
            <p className="mt-2">No hay bitácoras registradas aún.</p>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Asignatura</th>
                    <th>Fecha clase</th>
                    <th>Horario</th>
                    <th>Objetivo</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacoras.map(bit => (
                    <tr key={bit.bitId}>
                      <td>{bit.bitNombre}</td>
                      <td>{nombreAsignatura(bit.bitAsignId)}</td>
                      <td>{isoAFecha(bit.bitFechaRealClase)}</td>
                      <td className="text-nowrap">{bit.bitHoraInicio} – {bit.bitHoraFin}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bit.bitObjetivoAprendizaje}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Editar"
                          onClick={() => abrirFormularioEdicion(bit)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
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

  // ── VISTA: FORMULARIO ──
  return (
    <div className="container mt-4" style={{ maxWidth: 760 }}>
      <div className="d-flex align-items-center mb-3 gap-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setVista('lista')}>
          ← Volver
        </button>
        <h5 className="mb-0 fw-semibold">{modoEdicion ? 'Editar Bitácora' : 'Nueva Bitácora'}</h5>
      </div>

      <div className="card shadow p-4">
        <div className="row g-3">

          <div className="col-12">
            <Campo label="Asignatura" error={errores.asignaturaId} requerido>
              {cargandoAsig ? (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="text-muted small">Cargando asignaturas...</span>
                </div>
              ) : (
                <select
                  className={`form-select ${errores.asignaturaId ? 'is-invalid' : ''}`}
                  value={form.asignaturaId}
                  onChange={e => handleChange('asignaturaId', e.target.value)}
                >
                  <option value="">-- Selecciona una asignatura --</option>
                  {asignaturas.map(a => (
                    <option key={a.asigId} value={a.asigId}>{a.asigNombre}</option>
                  ))}
                </select>
              )}
            </Campo>
            {asigSeleccionada?.asigDesc && (
              <div className="text-muted small mt-1">
                <i className="bi bi-info-circle me-1"></i>{asigSeleccionada.asigDesc}
              </div>
            )}
          </div>

          <div className="col-12">
            <Campo label="Nombre de la bitácora" error={errores.bitNombre} requerido>
              <input
                className={`form-control ${errores.bitNombre ? 'is-invalid' : ''}`}
                placeholder="Ej: Bitácora de Mayo - Clase 1"
                value={form.bitNombre}
                onChange={e => handleChange('bitNombre', e.target.value)}
              />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo label="Fecha de registro" error={errores.bitFechaRegistro} requerido>
              <input type="date"
                className={`form-control ${errores.bitFechaRegistro ? 'is-invalid' : ''}`}
                value={form.bitFechaRegistro}
                onChange={e => handleChange('bitFechaRegistro', e.target.value)}
              />
            </Campo>
          </div>
          <div className="col-md-6">
            <Campo label="Fecha real de clase" error={errores.bitFechaRealClase} requerido>
              <input type="date"
                className={`form-control ${errores.bitFechaRealClase ? 'is-invalid' : ''}`}
                value={form.bitFechaRealClase}
                onChange={e => handleChange('bitFechaRealClase', e.target.value)}
              />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo label="Hora de inicio" error={errores.bitHoraIni} requerido>
              <input type="time"
                className={`form-control ${errores.bitHoraIni ? 'is-invalid' : ''}`}
                value={form.bitHoraIni}
                onChange={e => handleChange('bitHoraIni', e.target.value)}
              />
            </Campo>
          </div>
          <div className="col-md-6">
            <Campo label="Hora de fin" error={errores.bitHoraFin} requerido>
              <input type="time"
                className={`form-control ${errores.bitHoraFin ? 'is-invalid' : ''}`}
                value={form.bitHoraFin}
                onChange={e => handleChange('bitHoraFin', e.target.value)}
              />
            </Campo>
          </div>

          <div className="col-12">
            <Campo label="Objetivo de aprendizaje" error={errores.bitObjAprend} requerido>
              <textarea rows={3}
                className={`form-control ${errores.bitObjAprend ? 'is-invalid' : ''}`}
                placeholder="Ej: Comprender los ciclos de control en Spring Boot."
                value={form.bitObjAprend}
                onChange={e => handleChange('bitObjAprend', e.target.value)}
              />
            </Campo>
          </div>

          <div className="col-12">
            <Campo label="Temas tratados en clase" error={errores.bitTemasTratadoClase} requerido>
              <textarea rows={3}
                className={`form-control ${errores.bitTemasTratadoClase ? 'is-invalid' : ''}`}
                placeholder="Ej: Inyección de dependencias, CRUD Service, Controladores"
                value={form.bitTemasTratadoClase}
                onChange={e => handleChange('bitTemasTratadoClase', e.target.value)}
              />
            </Campo>
          </div>

        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => setVista('lista')}>Cancelar</button>
          <button className="btn btn-success" onClick={handleGuardar} disabled={guardando}>
            {guardando
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Guardando...</>
              : <><i className="bi bi-save me-2"></i>{modoEdicion ? 'Guardar cambios' : 'Guardar Bitácora'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bitacora;