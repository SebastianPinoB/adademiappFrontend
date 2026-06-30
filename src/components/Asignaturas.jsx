import React, { useState, useEffect } from 'react';
import {
  obtenerAsignaturas, obtenerSalas, obtenerCursos,
  crearSala, actualizarSala, eliminarSala,
  crearCurso, actualizarCurso, eliminarCurso,
  obtenerEvaluaciones, crearEvaluacion, actualizarEvaluacion, eliminarEvaluacion,
} from '../services/bitacoraService';
import { gestionAcademicaApi } from '../services/axiosConfigB';
import { guardarRelacionEva } from './evaRelaciones'; // helper de localStorage

const crearAsignatura = async (data) => (await gestionAcademicaApi.post('/asignaturas', data)).data;
const actualizarAsignatura = async (id, data) => (await gestionAcademicaApi.put(`/asignaturas/${id}`, data)).data;
const eliminarAsignatura = async (id) => await gestionAcademicaApi.delete(`/asignaturas/${id}`);

const ModalEliminar = ({ nombre, onConfirmar, onCancelar }) => (
  <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header border-0">
          <h5 className="modal-title text-danger fw-bold">
            <i className="bi bi-exclamation-triangle me-2"></i>Confirmar eliminación
          </h5>
        </div>
        <div className="modal-body">
          ¿Estás seguro de eliminar <strong>{nombre}</strong>?
        </div>
        <div className="modal-footer border-0">
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirmar}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  </div>
);

const TablaGenerica = ({ columnas, filas, onEditar, onEliminar, cargando, vacio }) =>
  cargando ? (
    <div className="text-center py-4"><div className="spinner-border text-primary" role="status" /></div>
  ) : filas.length === 0 ? (
    <div className="text-center py-4 text-muted">{vacio}</div>
  ) : (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-dark">
          <tr>
            {columnas.map(c => <th key={c.key}>{c.label}</th>)}
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              {columnas.map(c => <td key={c.key}>{fila[c.key] ?? '—'}</td>)}
              <td className="text-center text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEditar(fila)}>
                  <i className="bi bi-pencil"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(fila)}>
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );


//  COMPONENTE PRINCIPAL
const Asignaturas = () => {
  const [tab, setTab] = useState('asignaturas');
  const [asignaturas, setAsignaturas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ── Formularios ──
  const [formAsig, setFormAsig] = useState({ asigNombre: '', asigDesc: '' });
  const [editAsigId, setEditAsigId] = useState(null);
  const [errAsig, setErrAsig] = useState({});

  const [formSala, setFormSala] = useState({ salaNombre: '', salaCapacidad: '' });
  const [editSalaId, setEditSalaId] = useState(null);
  const [errSala, setErrSala] = useState({});

  const [formCurso, setFormCurso] = useState({ cursoLetra: '', nivelNombre: '', salaNombre: '', salaCapacidad: '' });
  const [editCursoId, setEditCursoId] = useState(null);
  const [errCurso, setErrCurso] = useState({});

  // Evaluaciones
  const [formEva, setFormEva] = useState({ evaTipo: '', evaFecha: '', evaPuntaje: '', asigId: '', cursoId: '' });
  const [editEvaId, setEditEvaId] = useState(null);
  const [errEva, setErrEva] = useState({});

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const [a, s, c, e] = await Promise.all([
        obtenerAsignaturas(), obtenerSalas(), obtenerCursos(), obtenerEvaluaciones(),
      ]);
      setAsignaturas(a); setSalas(s); setCursos(c); setEvaluaciones(e);
    } catch {
      alert('No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  // ── Resets ──
  const resetAsig = () => { setFormAsig({ asigNombre: '', asigDesc: '' }); setEditAsigId(null); setErrAsig({}); };
  const resetSala = () => { setFormSala({ salaNombre: '', salaCapacidad: '' }); setEditSalaId(null); setErrSala({}); };
  const resetCurso = () => { setFormCurso({ cursoLetra: '', nivelNombre: '', salaNombre: '', salaCapacidad: '' }); setEditCursoId(null); setErrCurso({}); };
  const resetEva = () => { setFormEva({ evaTipo: '', evaFecha: '', evaPuntaje: '', asigId: '', cursoId: '' }); setEditEvaId(null); setErrEva({}); };

  // ── Asignaturas ──
  const handleEditarAsig = (a) => { setFormAsig({ asigNombre: a.asigNombre, asigDesc: a.asigDesc }); setEditAsigId(a.asigId); setErrAsig({}); };
  const handleGuardarAsig = async () => {
    const e = {};
    if (!formAsig.asigNombre?.trim()) e.asigNombre = 'El nombre es obligatorio';
    if (!formAsig.asigDesc?.trim()) e.asigDesc = 'La descripción es obligatoria';
    if (Object.keys(e).length > 0) { setErrAsig(e); return; }
    setGuardando(true);
    try {
      if (editAsigId) await actualizarAsignatura(editAsigId, formAsig);
      else await crearAsignatura(formAsig);
      resetAsig();
      setAsignaturas(await obtenerAsignaturas());
    } catch (err) {
      alert(err.response?.data ?? 'Error al guardar la asignatura');
    } finally { setGuardando(false); }
  };

  // ── Salas ──
  const handleEditarSala = (s) => { setFormSala({ salaNombre: s.salaNombre, salaCapacidad: s.salaCapacidad }); setEditSalaId(s.salaId); setErrSala({}); };
  const handleGuardarSala = async () => {
    const e = {};
    if (!formSala.salaNombre?.trim()) e.salaNombre = 'El nombre es obligatorio';
    if (!formSala.salaCapacidad) e.salaCapacidad = 'La capacidad es obligatoria';
    if (Object.keys(e).length > 0) { setErrSala(e); return; }
    setGuardando(true);
    try {
      const payload = { salaNombre: formSala.salaNombre, salaCapacidad: Number(formSala.salaCapacidad) };
      if (editSalaId) await actualizarSala(editSalaId, payload);
      else await crearSala(payload);
      resetSala();
      setSalas(await obtenerSalas());
    } catch (err) {
      alert(err.response?.data ?? 'Error al guardar la sala');
    } finally { setGuardando(false); }
  };

  // ── Cursos ──
  const handleEditarCurso = (c) => {
    setFormCurso({
      cursoLetra: c.cursoLetra ?? '',
      nivelNombre: c.nivel?.nivelNombre ?? '',
      salaNombre: c.sala?.salaNombre ?? '',
      salaCapacidad: c.sala?.salaCapacidad ?? '',
    });
    setEditCursoId(c.cursoId);
    setErrCurso({});
  };
  const handleGuardarCurso = async () => {
    const e = {};
    if (!formCurso.cursoLetra?.trim()) e.cursoLetra = 'La letra es obligatoria';
    if (!formCurso.nivelNombre?.trim()) e.nivelNombre = 'El nivel es obligatorio';
    if (!formCurso.salaNombre?.trim()) e.salaNombre = 'La sala es obligatoria';
    if (Object.keys(e).length > 0) { setErrCurso(e); return; }
    setGuardando(true);
    try {
      const payload = {
        cursoLetra: formCurso.cursoLetra,
        nivel: { nivelNombre: formCurso.nivelNombre },
        sala: { salaNombre: formCurso.salaNombre, salaCapacidad: Number(formCurso.salaCapacidad) || 0 },
      };
      if (editCursoId) await actualizarCurso(editCursoId, payload);
      else await crearCurso(payload);
      resetCurso();
      setCursos(await obtenerCursos());
    } catch (err) {
      alert(err.response?.data ?? 'Error al guardar el curso');
    } finally { setGuardando(false); }
  };

  // ── Evaluaciones ──
  const handleEditarEva = (eva) => {
    const rels = JSON.parse(localStorage.getItem('eva_relaciones') || '{}');
    const rel = rels[eva.evaId] ?? {};
    // Intentar resolver asigId desde asignaturas anidadas primero, luego localStorage
    const asigFromNested = asignaturas.find(a => a.evaluaciones?.some(e => e.evaId === eva.evaId))?.asigId;
    const asigId = asigFromNested ?? rel.asigId ?? '';
    setFormEva({
      evaTipo: eva.evaTipo ?? '',
      evaFecha: eva.evaFecha ? eva.evaFecha.substring(0, 10) : '',
      evaPuntaje: eva.evaPuntaje ?? '',
      asigId: asigId ? String(asigId) : '',
      cursoId: rel.cursoId ? String(rel.cursoId) : '',
    });
    setEditEvaId(eva.evaId);
    setErrEva({});
  };

  const handleGuardarEva = async () => {
    const e = {};
    if (!formEva.evaTipo?.trim()) e.evaTipo = 'El tipo es obligatorio';
    if (!formEva.evaFecha) e.evaFecha = 'La fecha es obligatoria';
    if (!formEva.evaPuntaje) e.evaPuntaje = 'El puntaje es obligatorio';
    if (!formEva.asigId) e.asigId = 'Selecciona una asignatura';
    if (!formEva.cursoId) e.cursoId = 'Selecciona un curso';
    if (Object.keys(e).length > 0) { setErrEva(e); return; }

    setGuardando(true);
    try {
      const payload = {
        evaTipo: formEva.evaTipo,
        evaFecha: formEva.evaFecha,
        evaPuntaje: Number(formEva.evaPuntaje),
        asignaturaId: Number(formEva.asigId), // el backend requiere este campo
      };
      let evaId = editEvaId;
      if (editEvaId) await actualizarEvaluacion(editEvaId, payload);
      else {
        const nueva = await crearEvaluacion(payload);
        evaId = nueva.evaId;
      }
      // Solo guardamos cursoId en localStorage (asigId va al backend)
      guardarRelacionEva(evaId, Number(formEva.asigId), Number(formEva.cursoId));
      resetEva();
      setEvaluaciones(await obtenerEvaluaciones());
    } catch (err) {
      alert(err.response?.data ?? 'Error al guardar la evaluación');
    } finally { setGuardando(false); }
  };

  // ── Eliminar ──
  const confirmarEliminar = async () => {
    const { tipo, item } = modalEliminar;
    try {
      if (tipo === 'asignatura') { await eliminarAsignatura(item.asigId); setAsignaturas(await obtenerAsignaturas()); }
      if (tipo === 'sala') { await eliminarSala(item.salaId); setSalas(await obtenerSalas()); }
      if (tipo === 'curso') { await eliminarCurso(item.cursoId); setCursos(await obtenerCursos()); }
      if (tipo === 'evaluacion') { await eliminarEvaluacion(item.evaId); setEvaluaciones(await obtenerEvaluaciones()); }
    } catch {
      alert('No se pudo eliminar el elemento.');
    } finally {
      setModalEliminar(null);
    }
  };

  // ── Helpers de vista para evaluaciones ──
  const nombreAsig = (id) => asignaturas.find(a => a.asigId === Number(id))?.asigNombre ?? '—';
  const nombreCurso = (id) => {
    const c = cursos.find(c => c.cursoId === Number(id));
    return c ? `${c.nivel?.nivelNombre ?? ''} ${c.cursoLetra ?? ''}`.trim() : '—';
  };

  // Busca asigId: 1° desde asignaturas anidadas, 2° desde localStorage
  const resolverAsigId = (evaId, rels) => {
    for (const asig of asignaturas) {
      if (asig.evaluaciones?.some(e => e.evaId === evaId)) return asig.asigId;
    }
    return rels[evaId]?.asigId ?? null;
  };

  const evaluacionesConRelacion = () => {
    const rels = JSON.parse(localStorage.getItem('eva_relaciones') || '{}');
    return evaluaciones.map(eva => {
      const asigId = resolverAsigId(eva.evaId, rels);
      return {
        ...eva,
        asignatura: nombreAsig(asigId),
        curso: nombreCurso(rels[eva.evaId]?.cursoId),
        evaFechaCorta: eva.evaFecha ? eva.evaFecha.substring(0, 10) : '—',
      };
    });
  };

  const tabs = [
    { key: 'asignaturas', label: 'Asignaturas', icon: 'bi-book' },
    { key: 'salas', label: 'Salas', icon: 'bi-door-open' },
    { key: 'cursos', label: 'Cursos', icon: 'bi-mortarboard' },
    { key: 'evaluaciones', label: 'Evaluaciones', icon: 'bi-clipboard-check' },
  ];

  return (
    <div className="container-fluid mt-3">
      {modalEliminar && (
        <ModalEliminar
          nombre={
            modalEliminar.tipo === 'asignatura' ? modalEliminar.item.asigNombre :
              modalEliminar.tipo === 'sala' ? modalEliminar.item.salaNombre :
                modalEliminar.tipo === 'evaluacion' ? modalEliminar.item.evaTipo :
                  `${modalEliminar.item.nivel?.nivelNombre} ${modalEliminar.item.cursoLetra}`
          }
          onConfirmar={confirmarEliminar}
          onCancelar={() => setModalEliminar(null)}
        />
      )}

      <h4 className="fw-bold mb-3">Gestión Académica</h4>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map(t => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${tab === t.key ? 'active fw-semibold' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`bi ${t.icon} me-2`}></i>{t.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="row g-4">

        {/* ── ASIGNATURAS ── */}
        {tab === 'asignaturas' && (
          <>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">
                  {editAsigId ? '📝 Editar Asignatura' : '➕ Nueva Asignatura'}
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombre <span className="text-danger">*</span></label>
                    <input
                      className={`form-control form-control-sm ${errAsig.asigNombre ? 'is-invalid' : ''}`}
                      value={formAsig.asigNombre}
                      onChange={e => { setFormAsig(p => ({ ...p, asigNombre: e.target.value })); setErrAsig(p => ({ ...p, asigNombre: undefined })); }}
                    />
                    {errAsig.asigNombre && <div className="text-danger" style={{ fontSize: 12 }}>{errAsig.asigNombre}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Descripción <span className="text-danger">*</span></label>
                    <textarea
                      rows={3}
                      className={`form-control form-control-sm ${errAsig.asigDesc ? 'is-invalid' : ''}`}
                      value={formAsig.asigDesc}
                      onChange={e => { setFormAsig(p => ({ ...p, asigDesc: e.target.value })); setErrAsig(p => ({ ...p, asigDesc: undefined })); }}
                    />
                    {errAsig.asigDesc && <div className="text-danger" style={{ fontSize: 12 }}>{errAsig.asigDesc}</div>}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleGuardarAsig} disabled={guardando}>
                      {editAsigId ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editAsigId && <button className="btn btn-secondary btn-sm" onClick={resetAsig}>Cancelar</button>}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">📋 Asignaturas registradas</div>
                <TablaGenerica
                  cargando={cargando} vacio="No hay asignaturas registradas."
                  columnas={[{ key: 'asigNombre', label: 'Nombre' }, { key: 'asigDesc', label: 'Descripción' }]}
                  filas={asignaturas}
                  onEditar={handleEditarAsig}
                  onEliminar={(a) => setModalEliminar({ tipo: 'asignatura', item: a })}
                />
              </div>
            </div>
          </>
        )}

        {/* ── SALAS ── */}
        {tab === 'salas' && (
          <>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">
                  {editSalaId ? '📝 Editar Sala' : '➕ Nueva Sala'}
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombre <span className="text-danger">*</span></label>
                    <input
                      className={`form-control form-control-sm ${errSala.salaNombre ? 'is-invalid' : ''}`}
                      value={formSala.salaNombre}
                      onChange={e => { setFormSala(p => ({ ...p, salaNombre: e.target.value })); setErrSala(p => ({ ...p, salaNombre: undefined })); }}
                    />
                    {errSala.salaNombre && <div className="text-danger" style={{ fontSize: 12 }}>{errSala.salaNombre}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Capacidad <span className="text-danger">*</span></label>
                    <input
                      type="number" min="1"
                      className={`form-control form-control-sm ${errSala.salaCapacidad ? 'is-invalid' : ''}`}
                      value={formSala.salaCapacidad}
                      onChange={e => { setFormSala(p => ({ ...p, salaCapacidad: e.target.value })); setErrSala(p => ({ ...p, salaCapacidad: undefined })); }}
                    />
                    {errSala.salaCapacidad && <div className="text-danger" style={{ fontSize: 12 }}>{errSala.salaCapacidad}</div>}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleGuardarSala} disabled={guardando}>
                      {editSalaId ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editSalaId && <button className="btn btn-secondary btn-sm" onClick={resetSala}>Cancelar</button>}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">📋 Salas registradas</div>
                <TablaGenerica
                  cargando={cargando} vacio="No hay salas registradas."
                  columnas={[{ key: 'salaNombre', label: 'Nombre' }, { key: 'salaCapacidad', label: 'Capacidad' }]}
                  filas={salas}
                  onEditar={handleEditarSala}
                  onEliminar={(s) => setModalEliminar({ tipo: 'sala', item: s })}
                />
              </div>
            </div>
          </>
        )}

        {/* ── CURSOS ── */}
        {tab === 'cursos' && (
          <>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">
                  {editCursoId ? '📝 Editar Curso' : '➕ Nuevo Curso'}
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nivel <span className="text-danger">*</span></label>
                    <input
                      className={`form-control form-control-sm ${errCurso.nivelNombre ? 'is-invalid' : ''}`}
                      placeholder="Ej: 1° Medio"
                      value={formCurso.nivelNombre}
                      onChange={e => { setFormCurso(p => ({ ...p, nivelNombre: e.target.value })); setErrCurso(p => ({ ...p, nivelNombre: undefined })); }}
                    />
                    {errCurso.nivelNombre && <div className="text-danger" style={{ fontSize: 12 }}>{errCurso.nivelNombre}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Letra <span className="text-danger">*</span></label>
                    <input
                      className={`form-control form-control-sm ${errCurso.cursoLetra ? 'is-invalid' : ''}`}
                      placeholder="Ej: A"
                      value={formCurso.cursoLetra}
                      onChange={e => { setFormCurso(p => ({ ...p, cursoLetra: e.target.value })); setErrCurso(p => ({ ...p, cursoLetra: undefined })); }}
                    />
                    {errCurso.cursoLetra && <div className="text-danger" style={{ fontSize: 12 }}>{errCurso.cursoLetra}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Sala <span className="text-danger">*</span></label>
                    <select
                      className={`form-select form-select-sm ${errCurso.salaNombre ? 'is-invalid' : ''}`}
                      value={formCurso.salaNombre}
                      onChange={e => {
                        const sala = salas.find(s => s.salaNombre === e.target.value);
                        setFormCurso(p => ({ ...p, salaNombre: e.target.value, salaCapacidad: sala?.salaCapacidad ?? '' }));
                        setErrCurso(p => ({ ...p, salaNombre: undefined }));
                      }}
                    >
                      <option value="">-- Selecciona una sala --</option>
                      {salas.map(s => <option key={s.salaId} value={s.salaNombre}>{s.salaNombre} (cap. {s.salaCapacidad})</option>)}
                    </select>
                    {errCurso.salaNombre && <div className="text-danger" style={{ fontSize: 12 }}>{errCurso.salaNombre}</div>}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleGuardarCurso} disabled={guardando}>
                      {editCursoId ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editCursoId && <button className="btn btn-secondary btn-sm" onClick={resetCurso}>Cancelar</button>}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">📋 Cursos registrados</div>
                <TablaGenerica
                  cargando={cargando} vacio="No hay cursos registrados."
                  columnas={[
                    { key: 'nivel', label: 'Nivel' },
                    { key: 'cursoLetra', label: 'Letra' },
                    { key: 'sala', label: 'Sala' },
                  ]}
                  filas={cursos.map(c => ({
                    ...c,
                    nivel: c.nivel?.nivelNombre ?? '—',
                    sala: c.sala ? `${c.sala.salaNombre} (cap. ${c.sala.salaCapacidad})` : '—',
                  }))}
                  onEditar={(fila) => handleEditarCurso(cursos.find(c => c.cursoId === fila.cursoId))}
                  onEliminar={(fila) => setModalEliminar({ tipo: 'curso', item: cursos.find(c => c.cursoId === fila.cursoId) })}
                />
              </div>
            </div>
          </>
        )}

        {/* ── EVALUACIONES ── */}
        {tab === 'evaluaciones' && (
          <>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">
                  {editEvaId ? '📝 Editar Evaluación' : '➕ Nueva Evaluación'}
                </div>
                <div className="card-body">

                  {/* Asignatura */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Asignatura <span className="text-danger">*</span></label>
                    <select
                      className={`form-select form-select-sm ${errEva.asigId ? 'is-invalid' : ''}`}
                      value={formEva.asigId}
                      onChange={e => { setFormEva(p => ({ ...p, asigId: e.target.value })); setErrEva(p => ({ ...p, asigId: undefined })); }}
                    >
                      <option value="">-- Selecciona --</option>
                      {asignaturas.map(a => <option key={a.asigId} value={a.asigId}>{a.asigNombre}</option>)}
                    </select>
                    {errEva.asigId && <div className="text-danger" style={{ fontSize: 12 }}>{errEva.asigId}</div>}
                  </div>

                  {/* Curso */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Curso <span className="text-danger">*</span></label>
                    <select
                      className={`form-select form-select-sm ${errEva.cursoId ? 'is-invalid' : ''}`}
                      value={formEva.cursoId}
                      onChange={e => { setFormEva(p => ({ ...p, cursoId: e.target.value })); setErrEva(p => ({ ...p, cursoId: undefined })); }}
                    >
                      <option value="">-- Selecciona --</option>
                      {cursos.map(c => (
                        <option key={c.cursoId} value={c.cursoId}>
                          {c.nivel?.nivelNombre ?? ''} {c.cursoLetra ?? ''}
                        </option>
                      ))}
                    </select>
                    {errEva.cursoId && <div className="text-danger" style={{ fontSize: 12 }}>{errEva.cursoId}</div>}
                  </div>

                  {/* Tipo */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Tipo <span className="text-danger">*</span></label>
                    <input
                      className={`form-control form-control-sm ${errEva.evaTipo ? 'is-invalid' : ''}`}
                      placeholder="Ej: Solemne 1, Tarea, Quiz..."
                      value={formEva.evaTipo}
                      onChange={e => { setFormEva(p => ({ ...p, evaTipo: e.target.value })); setErrEva(p => ({ ...p, evaTipo: undefined })); }}
                    />
                    {errEva.evaTipo && <div className="text-danger" style={{ fontSize: 12 }}>{errEva.evaTipo}</div>}
                  </div>

                  {/* Fecha */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Fecha <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className={`form-control form-control-sm ${errEva.evaFecha ? 'is-invalid' : ''}`}
                      value={formEva.evaFecha}
                      onChange={e => { setFormEva(p => ({ ...p, evaFecha: e.target.value })); setErrEva(p => ({ ...p, evaFecha: undefined })); }}
                    />
                    {errEva.evaFecha && <div className="text-danger" style={{ fontSize: 12 }}>{errEva.evaFecha}</div>}
                  </div>

                  {/* Puntaje */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Puntaje total <span className="text-danger">*</span></label>
                    <input
                      type="number" min="1"
                      className={`form-control form-control-sm ${errEva.evaPuntaje ? 'is-invalid' : ''}`}
                      value={formEva.evaPuntaje}
                      onChange={e => { setFormEva(p => ({ ...p, evaPuntaje: e.target.value })); setErrEva(p => ({ ...p, evaPuntaje: undefined })); }}
                    />
                    {errEva.evaPuntaje && <div className="text-danger" style={{ fontSize: 12 }}>{errEva.evaPuntaje}</div>}
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleGuardarEva} disabled={guardando}>
                      {editEvaId ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editEvaId && <button className="btn btn-secondary btn-sm" onClick={resetEva}>Cancelar</button>}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">📋 Evaluaciones registradas</div>
                <TablaGenerica
                  cargando={cargando} vacio="No hay evaluaciones registradas."
                  columnas={[
                    { key: 'asignatura', label: 'Asignatura' },
                    { key: 'curso', label: 'Curso' },
                    { key: 'evaTipo', label: 'Tipo' },
                    { key: 'evaFechaCorta', label: 'Fecha' },
                    { key: 'evaPuntaje', label: 'Puntaje' },
                  ]}
                  filas={evaluacionesConRelacion()}
                  onEditar={handleEditarEva}
                  onEliminar={(eva) => setModalEliminar({ tipo: 'evaluacion', item: eva })}
                />
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Asignaturas;