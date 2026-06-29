import React, { useState, useEffect } from 'react';
import { obtenerTodosLosAlumnos } from '../services/estudiantes';
import {
  obtenerEvaluaciones,
  obtenerAsignaturas,
  obtenerCursos,
  obtenerNotasPorEstudiante,
  crearNota,
  actualizarNota,
  eliminarNota,
} from '../services/bitacoraService';

import { obtenerRelaciones } from './evaRelaciones';

const initialForm = {
  asigId: '',
  cursoId: '',
  evaluacionId: '',
  notaValor: '',
  notaFecha: '',
};

const Campo = ({ label, error, children, requerido }) => (
  <div className="mb-3">
    <label className="form-label small fw-bold">
      {label} {requerido && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && (
      <div className="text-danger" style={{ fontSize: 12, marginTop: 2 }}>
        {error}
      </div>
    )}
  </div>
);

const validarForm = (form) => {
  const errores = {};
  if (!form.asigId) errores.asigId = 'Selecciona una asignatura';
  if (!form.cursoId) errores.cursoId = 'Selecciona un curso';
  if (!form.evaluacionId) errores.evaluacionId = 'Selecciona una evaluación';
  if (!form.notaValor) errores.notaValor = 'La nota es obligatoria';
  else if (form.notaValor < 1 || form.notaValor > 7)
    errores.notaValor = 'La nota debe estar entre 1.0 y 7.0';
  if (!form.notaFecha) errores.notaFecha = 'La fecha es obligatoria';
  return errores;
};

const CrudNotas = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [relaciones, setRelaciones] = useState({});

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errores, setErrores] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatosBase();
  }, []);

  const cargarDatosBase = async () => {
    setCargando(true);
    try {
      const [als, evas, asigs, curs] = await Promise.all([
        obtenerTodosLosAlumnos(),
        obtenerEvaluaciones(),
        obtenerAsignaturas(),
        obtenerCursos(),
      ]);
      setAlumnos(als);
      setEvaluaciones(evas);
      setAsignaturas(asigs);
      setCursos(curs);
      setRelaciones(obtenerRelaciones());
    } catch {
      alert('No se pudieron cargar los datos base');
    } finally {
      setCargando(false);
    }
  };

  const cargarNotas = async (estudianteId) => {
    setCargandoNotas(true);
    try {
      const datos = await obtenerNotasPorEstudiante(estudianteId);
      setNotas(datos);
    } catch {
      alert('No se pudieron cargar las notas del alumno');
    } finally {
      setCargandoNotas(false);
    }
  };

  // ── Selects encadenados ──
  const evaluacionesFiltradas = evaluaciones.filter((eva) => {
    const rel = relaciones[eva.evaId];
    if (!rel) return false;
    const asigOk = !form.asigId || rel.asigId === Number(form.asigId);
    const cursoOk = !form.cursoId || rel.cursoId === Number(form.cursoId);
    return asigOk && cursoOk;
  });

  // Cursos que tienen al menos una evaluación asociada a la asignatura elegida
  const cursosFiltrados = form.asigId
    ? cursos.filter((c) =>
      Object.values(relaciones).some(
        (r) => r.asigId === Number(form.asigId) && r.cursoId === c.cursoId
      )
    )
    : cursos;

  // ── Handlers ──
  const handleAlumnoChange = (e) => {
    const id = e.target.value;
    setAlumnoSeleccionado(id);
    setForm(initialForm);
    setErrores({});
    setEditandoId(null);
    if (id) cargarNotas(id);
    else setNotas([]);
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => {
      const next = { ...prev, [campo]: valor };
      // Resetear cascada hacia abajo
      if (campo === 'asigId') { next.cursoId = ''; next.evaluacionId = ''; }
      if (campo === 'cursoId') { next.evaluacionId = ''; }
      return next;
    });
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const handleEditar = (nota) => {
    const rel = relaciones[nota.evaId] ?? {};
    setEditandoId(nota.notaId);
    setForm({
      asigId: rel.asigId ? String(rel.asigId) : '',
      cursoId: rel.cursoId ? String(rel.cursoId) : '',
      evaluacionId: nota.evaId ? String(nota.evaId) : '',
      notaValor: nota.notaValor,
      notaFecha: nota.notaFecha ? nota.notaFecha.substring(0, 10) : '',
    });
    setErrores({});
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(initialForm);
    setErrores({});
  };

  const handleGuardar = async () => {
    const e = validarForm(form);
    if (Object.keys(e).length > 0) { setErrores(e); return; }

    const payload = {
      notaValor: parseFloat(form.notaValor),
      notaFecha: form.notaFecha,
      evaluacionId: Number(form.evaluacionId),
      estudianteId: Number(alumnoSeleccionado),
    };

    setGuardando(true);
    try {
      if (editandoId) await actualizarNota(editandoId, payload);
      else await crearNota(payload);

      setEditandoId(null);
      setForm(initialForm);
      await cargarNotas(alumnoSeleccionado);
    } catch {
      alert('Error al guardar la nota.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;
    try {
      await eliminarNota(id);
      await cargarNotas(alumnoSeleccionado);
    } catch {
      alert('No se pudo eliminar la nota.');
    }
  };

  // ── Helpers de enriquecimiento para la tabla ──
  const enriquecerNota = (nota) => {
    const rel = relaciones[nota.evaluacionId] ?? relaciones[nota.evaId] ?? {};
    const asig = asignaturas.find((a) => a.asigId === rel.asigId);
    const curso = cursos.find((c) => c.cursoId === rel.cursoId);
    const eva = evaluaciones.find(
      (e) => e.evaId === (nota.evaluacionId ?? nota.evaId)
    );
    return {
      ...nota,
      evaId: nota.evaluacionId ?? nota.evaId,
      evaTipo: eva?.evaTipo ?? '—',
      asignatura: asig?.asigNombre ?? '—',
      curso: curso
        ? `${curso.nivel?.nivelNombre ?? ''} ${curso.cursoLetra ?? ''}`.trim()
        : '—',
    };
  };

  const notasEnriquecidas = notas.map(enriquecerNota);

  const nombreAlumno = (id) => {
    const a = alumnos.find((a) => a.usuId === Number(id));
    return a ? `${a.usu_nombre} ${a.usu_appaterno}` : '';
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Módulo de Notas</h2>
        <span className="badge bg-info text-dark p-2">Año Académico 2026</span>
      </div>

      {/* Selector de alumno */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label fw-bold">Seleccionar Alumno</label>
          <select
            className="form-select"
            value={alumnoSeleccionado}
            onChange={handleAlumnoChange}
          >
            <option value="">-- Selecciona un alumno --</option>
            {alumnos.map((a) => (
              <option key={a.usuId} value={a.usuId}>
                {a.usu_nombre} {a.usu_snombre} {a.usu_appaterno}{' '}
                {a.usu_apmaterno} — RUT: {a.numrun}-{a.usu_dvrun}
              </option>
            ))}
          </select>
        </div>
      </div>

      {alumnoSeleccionado && (
        <div className="row g-4">
          {/* Formulario */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold border-bottom">
                {editandoId ? '📝 Editar Nota' : '➕ Registrar Nota'}
              </div>
              <div className="card-body">

                {/* 1. Asignatura */}
                <Campo label="Asignatura" error={errores.asigId} requerido>
                  <select
                    className={`form-select form-select-sm ${errores.asigId ? 'is-invalid' : ''}`}
                    value={form.asigId}
                    onChange={(e) => handleChange('asigId', e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {asignaturas.map((a) => (
                      <option key={a.asigId} value={a.asigId}>
                        {a.asigNombre}
                      </option>
                    ))}
                  </select>
                </Campo>

                {/* 2. Curso (filtrado por asignatura) */}
                <Campo label="Curso" error={errores.cursoId} requerido>
                  <select
                    className={`form-select form-select-sm ${errores.cursoId ? 'is-invalid' : ''}`}
                    value={form.cursoId}
                    onChange={(e) => handleChange('cursoId', e.target.value)}
                    disabled={!form.asigId}
                  >
                    <option value="">-- Selecciona --</option>
                    {cursosFiltrados.map((c) => (
                      <option key={c.cursoId} value={c.cursoId}>
                        {c.nivel?.nivelNombre ?? ''} {c.cursoLetra ?? ''}
                      </option>
                    ))}
                  </select>
                  {!form.asigId && (
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      Primero selecciona una asignatura
                    </div>
                  )}
                </Campo>

                {/* 3. Evaluación (filtrada por asignatura + curso) */}
                <Campo label="Evaluación" error={errores.evaluacionId} requerido>
                  <select
                    className={`form-select form-select-sm ${errores.evaluacionId ? 'is-invalid' : ''}`}
                    value={form.evaluacionId}
                    onChange={(e) => handleChange('evaluacionId', e.target.value)}
                    disabled={!form.cursoId}
                  >
                    <option value="">-- Selecciona --</option>
                    {evaluacionesFiltradas.map((eva) => (
                      <option key={eva.evaId} value={eva.evaId}>
                        {eva.evaTipo}
                      </option>
                    ))}
                  </select>
                  {form.asigId && form.cursoId && evaluacionesFiltradas.length === 0 && (
                    <div className="text-warning" style={{ fontSize: 11 }}>
                      No hay evaluaciones para esta combinación. Créalas en Gestión Académica.
                    </div>
                  )}
                  {!form.cursoId && (
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      Primero selecciona un curso
                    </div>
                  )}
                </Campo>

                {/* Nota */}
                <Campo label="Nota (1.0 - 7.0)" error={errores.notaValor} requerido>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="7"
                    className={`form-control form-control-sm ${errores.notaValor ? 'is-invalid' : ''}`}
                    value={form.notaValor}
                    onChange={(e) => handleChange('notaValor', e.target.value)}
                  />
                </Campo>

                {/* Fecha */}
                <Campo label="Fecha" error={errores.notaFecha} requerido>
                  <input
                    type="date"
                    className={`form-control form-control-sm ${errores.notaFecha ? 'is-invalid' : ''}`}
                    value={form.notaFecha}
                    onChange={(e) => handleChange('notaFecha', e.target.value)}
                  />
                </Campo>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-grow-1"
                    onClick={handleGuardar}
                    disabled={guardando}
                  >
                    {guardando ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : editandoId ? (
                      'Actualizar'
                    ) : (
                      'Guardar Nota'
                    )}
                  </button>
                  {editandoId && (
                    <button className="btn btn-secondary btn-sm" onClick={handleCancelar}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold border-bottom">
                📋 Notas de {nombreAlumno(alumnoSeleccionado)}
              </div>
              <div className="card-body p-0">
                {cargandoNotas ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <p className="mt-2 text-muted small">Cargando notas...</p>
                  </div>
                ) : notasEnriquecidas.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-journal-x fs-3"></i>
                    <p className="mt-2 small">Este alumno no tiene notas registradas.</p>
                  </div>
                ) : (
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Asignatura</th>
                        <th>Curso</th>
                        <th>Evaluación</th>
                        <th>Fecha</th>
                        <th>Nota</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasEnriquecidas.map((n) => (
                        <tr
                          key={n.notaId}
                          className={editandoId === n.notaId ? 'table-warning' : ''}
                        >
                          <td>{n.asignatura}</td>
                          <td>{n.curso}</td>
                          <td>{n.evaTipo}</td>
                          <td>{n.notaFecha ? n.notaFecha.substring(0, 10) : '—'}</td>
                          <td
                            className={`fw-bold ${n.notaValor >= 4.0 ? 'text-success' : 'text-danger'}`}
                          >
                            {n.notaValor.toFixed(1)}
                          </td>
                          <td className="text-center text-nowrap">
                            <button
                              className="btn btn-sm btn-outline-warning me-2"
                              onClick={() => handleEditar(n)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleEliminar(n.notaId)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudNotas;