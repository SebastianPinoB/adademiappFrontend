import React, { useState, useEffect } from 'react';
import { crearAlumnoConApoderado, obtenerTodosLosAlumnos, actualizarAlumno, eliminarAlumno, obtenerTodosLosApoderados, obtenerAlumnoPorId } from '../services/estudiantes';

const REGIONES_CHILE = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío',
  'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
];

const initialDireccion = {
  calle: '', numero: '', letra: '',
  nombreComuna: '', nombreCiudad: '', nombreRegion: '', nombrePais: 'Chile',
};

const initialPersona = {
  nombre: '', segundoNombre: '', apellidoPaterno: '', apellidoMaterno: '',
  numrun: '', dvRun: '', email: '', password: '',
  direcciones: [{ ...initialDireccion }],
};

const initialForm = {
  alumno: { ...initialPersona, parentesco: 'HIJO' },
  apoderado: { ...initialPersona, parentesco: 'MADRE' },
};

// ── Validación ──
const validarPersona = (datos, modoEdicion) => {
  const errores = {};
  if (!datos.nombre?.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!datos.apellidoPaterno?.trim()) errores.apellidoPaterno = 'El apellido paterno es obligatorio';
  if (!datos.apellidoMaterno?.trim()) errores.apellidoMaterno = 'El apellido materno es obligatorio';
  if (!datos.email?.trim()) errores.email = 'El email es obligatorio';
  if (!modoEdicion && !datos.password?.trim()) errores.password = 'La contraseña es obligatoria';
  if (!datos.numrun) errores.numrun = 'El RUT es obligatorio';
  if (!datos.dvRun?.trim()) errores.dvRun = 'El dígito verificador es obligatorio';
  return errores;
};

const validarDireccion = (dir) => {
  const errores = {};
  if (!dir.calle?.trim()) errores.calle = 'La calle es obligatoria';
  if (!dir.numero) errores.numero = 'El número es obligatorio';
  if (!dir.nombreComuna?.trim()) errores.nombreComuna = 'La comuna es obligatoria';
  if (!dir.nombreCiudad?.trim()) errores.nombreCiudad = 'La ciudad es obligatoria';
  if (!dir.nombreRegion?.trim()) errores.nombreRegion = 'La región es obligatoria';
  if (!dir.nombrePais?.trim()) errores.nombrePais = 'El país es obligatorio';
  return errores;
};

// ── Campo con error inline ──
const Campo = ({ label, error, children, requerido }) => (
  <div>
    <label className="form-label">
      {label} {requerido && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && <div className="text-danger" style={{ fontSize: 12, marginTop: 2 }}>{error}</div>}
  </div>
);

// ── Dirección ──
const DireccionFields = ({ dir, onChange, errores = {} }) => (
  <div className="row g-3">
    <div className="col-md-8">
      <Campo label="Calle" error={errores.calle} requerido>
        <input className={`form-control ${errores.calle ? 'is-invalid' : ''}`} value={dir.calle}
          onChange={e => onChange('calle', e.target.value)} />
      </Campo>
    </div>
    <div className="col-md-2">
      <Campo label="Número" error={errores.numero} requerido>
        <input type="number" className={`form-control ${errores.numero ? 'is-invalid' : ''}`} value={dir.numero || ''}
          onChange={e => onChange('numero', parseInt(e.target.value) || '')} />
      </Campo>
    </div>
    <div className="col-md-2">
      <Campo label="Letra / Depto" error={null}>
        <input className="form-control" value={dir.letra}
          onChange={e => onChange('letra', e.target.value)} />
      </Campo>
    </div>
    <div className="col-md-6">
      <Campo label="Región" error={errores.nombreRegion} requerido>
        <select className={`form-select ${errores.nombreRegion ? 'is-invalid' : ''}`} value={dir.nombreRegion}
          onChange={e => onChange('nombreRegion', e.target.value)}>
          <option value="">-- Selecciona una región --</option>
          {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </Campo>
    </div>
    <div className="col-md-6">
      <Campo label="Ciudad" error={errores.nombreCiudad} requerido>
        <input className={`form-control ${errores.nombreCiudad ? 'is-invalid' : ''}`} value={dir.nombreCiudad}
          onChange={e => onChange('nombreCiudad', e.target.value)} />
      </Campo>
    </div>
    <div className="col-md-6">
      <Campo label="Comuna" error={errores.nombreComuna} requerido>
        <input className={`form-control ${errores.nombreComuna ? 'is-invalid' : ''}`} value={dir.nombreComuna}
          onChange={e => onChange('nombreComuna', e.target.value)} />
      </Campo>
    </div>
    <div className="col-md-6">
      <Campo label="País" error={errores.nombrePais} requerido>
        <input className={`form-control ${errores.nombrePais ? 'is-invalid' : ''}`} value={dir.nombrePais}
          onChange={e => onChange('nombrePais', e.target.value)} />
      </Campo>
    </div>
  </div>
);

// ── Modal eliminar ──
const ModalEliminar = ({ alumno, onConfirmar, onCancelar }) => (
  <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header border-0">
          <h5 className="modal-title text-danger fw-bold">
            <i className="bi bi-exclamation-triangle me-2"></i>Confirmar eliminación
          </h5>
        </div>
        <div className="modal-body">
          <p>¿Estás seguro de eliminar a <strong>{alumno?.usu_nombre} {alumno?.usu_appaterno}</strong>?</p>
          <p className="text-muted small">Si el apoderado no tiene más alumnos asociados, también será eliminado.</p>
        </div>
        <div className="modal-footer border-0">
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirmar}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════
const GestionAlumnos = () => {
  const [vista, setVista] = useState('tabla');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [paso, setPaso] = useState(1);
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [errores, setErrores] = useState({ alumno: {}, dirAlumno: {}, apoderado: {}, dirApoderado: {} });

  useEffect(() => { cargarAlumnos(); }, []);

  const cargarAlumnos = async () => {
    setCargando(true);
    try {
      const datos = await obtenerTodosLosAlumnos();
      setAlumnos(datos);
    } catch {
      alert('No se pudieron cargar los estudiantes');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (rol, campo, valor) => {
    setFormData(prev => ({ ...prev, [rol]: { ...prev[rol], [campo]: valor } }));
    setErrores(prev => ({ ...prev, [rol]: { ...prev[rol], [campo]: undefined } }));
  };

  const handleDireccionChange = (rol, campo, valor) => {
    setFormData(prev => {
      const direcciones = [...prev[rol].direcciones];
      direcciones[0] = { ...direcciones[0], [campo]: valor };
      return { ...prev, [rol]: { ...prev[rol], direcciones } };
    });
    const key = rol === 'alumno' ? 'dirAlumno' : 'dirApoderado';
    setErrores(prev => ({ ...prev, [key]: { ...prev[key], [campo]: undefined } }));
  };

  // Valida el paso actual, retorna true si es válido
  const validarPaso = () => {
    if (paso === 1) {
      const e = validarPersona(formData.alumno, modoEdicion);
      setErrores(prev => ({ ...prev, alumno: e }));
      return Object.keys(e).length === 0;
    }
    if (paso === 2) {
      const e = validarDireccion(formData.alumno.direcciones[0]);
      setErrores(prev => ({ ...prev, dirAlumno: e }));
      return Object.keys(e).length === 0;
    }
    if (paso === 3) {
      const eApo = validarPersona(formData.apoderado, modoEdicion);
      const eDirApo = validarDireccion(formData.apoderado.direcciones[0]);
      setErrores(prev => ({ ...prev, apoderado: eApo, dirApoderado: eDirApo }));
      return Object.keys(eApo).length === 0 && Object.keys(eDirApo).length === 0;
    }
    return true;
  };

  const irAlPaso = (siguiente) => {
    if (validarPaso()) setPaso(siguiente);
  };

  const abrirFormularioNuevo = () => {
    setFormData(initialForm);
    setErrores({ alumno: {}, dirAlumno: {}, apoderado: {}, dirApoderado: {} });
    setModoEdicion(false);
    setIdEditando(null);
    setPaso(1);
    setVista('formulario');
  };

  const abrirFormularioEdicion = async (alumno) => {
    const mapearPersona = (a, parentesco) => ({
      nombre: a.usu_nombre ?? '',
      segundoNombre: a.usu_snombre ?? '',
      apellidoPaterno: a.usu_appaterno ?? '',
      apellidoMaterno: a.usu_apmaterno ?? '',
      numrun: a.numrun ?? '',
      dvRun: a.usu_dvrun ?? '',
      email: a.usuEmail ?? '',
      password: '',
      parentesco: parentesco ?? '',
      direcciones: a.direcciones?.length > 0
        ? a.direcciones.map(d => ({
          calle: d.add_calle ?? '',
          numero: d.add_numero ?? '',
          letra: d.add_letra ?? '',
          nombreComuna: d.comuna?.comu_nombre ?? '',
          nombreCiudad: d.comuna?.ciudad?.ciudad_nombre ?? '',
          nombreRegion: d.comuna?.ciudad?.region?.regi_nombre ?? '',
          nombrePais: d.comuna?.ciudad?.region?.pais?.pais_nombre ?? 'Chile',
        }))
        : [{ ...initialDireccion }],
    });

    let datosApoderado = { ...initialPersona, parentesco: 'MADRE' };
    try {
      // GET /alumno/{id} nos da el apoderadoId
      const detalle = await obtenerAlumnoPorId(alumno.usuId);

      if (detalle.apoderadoId) {
        const apoderados = await obtenerTodosLosApoderados();
        const apo = apoderados.find(a => a.usuId === detalle.apoderadoId);
        if (apo) datosApoderado = mapearPersona(apo, apo.apode_parentesco);
      }
    } catch (e) {
      console.warn('No se pudo cargar el apoderado', e);
    }

    setFormData({
      alumno: mapearPersona(alumno, alumno.estu_parentesco), // ← usa la entidad completa de la tabla
      apoderado: datosApoderado,
    });
    setErrores({ alumno: {}, dirAlumno: {}, apoderado: {}, dirApoderado: {} });
    setModoEdicion(true);
    setIdEditando(alumno.usuId);
    setPaso(1);
    setVista('formulario');
  };

  const handleGuardar = async () => {
    if (!validarPaso()) return;

    const payload = {
      alumno: { ...formData.alumno, dvRun: formData.alumno.dvRun?.charAt(0) ?? '', numrun: Number(formData.alumno.numrun) },
      apoderado: { ...formData.apoderado, dvRun: formData.apoderado.dvRun?.charAt(0) ?? '', numrun: Number(formData.apoderado.numrun) },
    };

    try {
      if (modoEdicion) {
        await actualizarAlumno(idEditando, payload);
        alert('Alumno actualizado correctamente');
      } else {
        await crearAlumnoConApoderado(payload);
        alert('Registro exitoso');
      }
      setVista('tabla');
      await cargarAlumnos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar. Revisa la consola para más detalles.');
    }
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarAlumno(alumnoAEliminar.usuId);
      setAlumnoAEliminar(null);
      await cargarAlumnos();
    } catch {
      alert('No se pudo eliminar el alumno.');
      setAlumnoAEliminar(null);
    }
  };

  const pasos = ['Datos del Alumno', 'Dirección del Alumno', 'Datos del Apoderado'];

  // ── VISTA: TABLA ──
  if (vista === 'tabla') {
    return (
      <div className="container-fluid mt-3">
        {alumnoAEliminar && (
          <ModalEliminar alumno={alumnoAEliminar} onConfirmar={confirmarEliminar} onCancelar={() => setAlumnoAEliminar(null)} />
        )}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Gestión de Alumnos</h4>
          <button className="btn btn-primary" onClick={abrirFormularioNuevo}>
            <i className="bi bi-person-plus me-2"></i>Nuevo Alumno
          </button>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Cargando alumnos...</p>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people fs-1"></i>
            <p className="mt-2">No hay alumnos registrados aún.</p>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>RUT</th>
                    <th>Nombre completo</th>
                    <th>Email</th>
                    <th>Parentesco</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map(alumno => (
                    <tr key={alumno.usuId}>
                      <td className="text-nowrap">{alumno.numrun}-{alumno.usu_dvrun}</td>
                      <td>{alumno.usu_nombre} {alumno.usu_snombre} {alumno.usu_appaterno} {alumno.usu_apmaterno}</td>
                      <td>{alumno.usuEmail}</td>
                      <td><span className="badge bg-secondary">{alumno.estu_parentesco}</span></td>
                      <td className="text-center text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-2" title="Editar" onClick={() => abrirFormularioEdicion(alumno)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => setAlumnoAEliminar(alumno)}>
                          <i className="bi bi-trash"></i>
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
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setVista('tabla')}>← Volver a la lista</button>
        <h5 className="mb-0 fw-semibold">{modoEdicion ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}</h5>
      </div>

      {/* Indicador de pasos */}
      <div className="d-flex align-items-center mb-4 gap-2">
        {pasos.map((label, i) => (
          <React.Fragment key={i}>
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32, height: 32, fontSize: 14,
                  background: paso === i + 1 ? '#0d6efd' : paso > i + 1 ? '#198754' : '#dee2e6',
                  color: paso >= i + 1 ? '#fff' : '#6c757d'
                }}>
                {paso > i + 1 ? '✓' : i + 1}
              </div>
              <small className="mt-1 text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{label}</small>
            </div>
            {i < pasos.length - 1 && (
              <div className="flex-grow-1 mb-3" style={{ height: 2, background: paso > i + 1 ? '#198754' : '#dee2e6' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card shadow p-4">

        {/* ── PASO 1 ── */}
        {paso === 1 && (
          <>
            <h5 className="mb-3 fw-semibold">Datos del Alumno</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <Campo label="Nombre" error={errores.alumno.nombre} requerido>
                  <input className={`form-control ${errores.alumno.nombre ? 'is-invalid' : ''}`} value={formData.alumno.nombre}
                    onChange={e => handleChange('alumno', 'nombre', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Segundo Nombre" error={null}>
                  <input className="form-control" value={formData.alumno.segundoNombre}
                    onChange={e => handleChange('alumno', 'segundoNombre', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Apellido Paterno" error={errores.alumno.apellidoPaterno} requerido>
                  <input className={`form-control ${errores.alumno.apellidoPaterno ? 'is-invalid' : ''}`} value={formData.alumno.apellidoPaterno}
                    onChange={e => handleChange('alumno', 'apellidoPaterno', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Apellido Materno" error={errores.alumno.apellidoMaterno} requerido>
                  <input className={`form-control ${errores.alumno.apellidoMaterno ? 'is-invalid' : ''}`} value={formData.alumno.apellidoMaterno}
                    onChange={e => handleChange('alumno', 'apellidoMaterno', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-4">
                <Campo label="RUT (número)" error={errores.alumno.numrun} requerido>
                  <input type="number" className={`form-control ${errores.alumno.numrun ? 'is-invalid' : ''}`} value={formData.alumno.numrun || ''}
                    onChange={e => handleChange('alumno', 'numrun', parseInt(e.target.value) || '')}
                    disabled={modoEdicion} />
                </Campo>
              </div>
              <div className="col-md-2">
                <Campo label="DV" error={errores.alumno.dvRun} requerido>
                  <input className={`form-control ${errores.alumno.dvRun ? 'is-invalid' : ''}`} maxLength="1" value={formData.alumno.dvRun}
                    onChange={e => handleChange('alumno', 'dvRun', e.target.value.toUpperCase())}
                    disabled={modoEdicion} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Email" error={errores.alumno.email} requerido>
                  <input type="email" className={`form-control ${errores.alumno.email ? 'is-invalid' : ''}`} value={formData.alumno.email}
                    onChange={e => handleChange('alumno', 'email', e.target.value)} />
                </Campo>
              </div>
              {!modoEdicion && (
                <div className="col-md-6">
                  <Campo label="Contraseña" error={errores.alumno.password} requerido>
                    <input type="password" className={`form-control ${errores.alumno.password ? 'is-invalid' : ''}`} value={formData.alumno.password}
                      onChange={e => handleChange('alumno', 'password', e.target.value)} />
                  </Campo>
                </div>
              )}
              <div className="col-md-6">
                <Campo label="Parentesco" error={null} requerido>
                  <select className="form-select" value={formData.alumno.parentesco}
                    onChange={e => handleChange('alumno', 'parentesco', e.target.value)}>
                    <option value="HIJO">HIJO</option>
                    <option value="HIJA">HIJA</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </Campo>
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary" onClick={() => irAlPaso(2)}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ── PASO 2 ── */}
        {paso === 2 && (
          <>
            <h5 className="mb-3 fw-semibold">Dirección del Alumno</h5>
            <DireccionFields
              dir={formData.alumno.direcciones[0]}
              onChange={(campo, valor) => handleDireccionChange('alumno', campo, valor)}
              errores={errores.dirAlumno}
            />
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>← Atrás</button>
              <button className="btn btn-primary" onClick={() => irAlPaso(3)}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ── PASO 3 ── */}
        {paso === 3 && (
          <>
            <h5 className="mb-3 fw-semibold">Datos del Apoderado</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <Campo label="Nombre" error={errores.apoderado.nombre} requerido>
                  <input className={`form-control ${errores.apoderado.nombre ? 'is-invalid' : ''}`} value={formData.apoderado.nombre}
                    onChange={e => handleChange('apoderado', 'nombre', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Segundo Nombre" error={null}>
                  <input className="form-control" value={formData.apoderado.segundoNombre}
                    onChange={e => handleChange('apoderado', 'segundoNombre', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Apellido Paterno" error={errores.apoderado.apellidoPaterno} requerido>
                  <input className={`form-control ${errores.apoderado.apellidoPaterno ? 'is-invalid' : ''}`} value={formData.apoderado.apellidoPaterno}
                    onChange={e => handleChange('apoderado', 'apellidoPaterno', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Apellido Materno" error={errores.apoderado.apellidoMaterno} requerido>
                  <input className={`form-control ${errores.apoderado.apellidoMaterno ? 'is-invalid' : ''}`} value={formData.apoderado.apellidoMaterno}
                    onChange={e => handleChange('apoderado', 'apellidoMaterno', e.target.value)} />
                </Campo>
              </div>
              <div className="col-md-4">
                <Campo label="RUT (número)" error={errores.apoderado.numrun} requerido>
                  <input type="number" className={`form-control ${errores.apoderado.numrun ? 'is-invalid' : ''}`} value={formData.apoderado.numrun || ''}
                    onChange={e => handleChange('apoderado', 'numrun', parseInt(e.target.value) || '')} />
                </Campo>
              </div>
              <div className="col-md-2">
                <Campo label="DV" error={errores.apoderado.dvRun} requerido>
                  <input className={`form-control ${errores.apoderado.dvRun ? 'is-invalid' : ''}`} maxLength="1" value={formData.apoderado.dvRun}
                    onChange={e => handleChange('apoderado', 'dvRun', e.target.value.toUpperCase())} />
                </Campo>
              </div>
              <div className="col-md-6">
                <Campo label="Email" error={errores.apoderado.email} requerido>
                  <input type="email" className={`form-control ${errores.apoderado.email ? 'is-invalid' : ''}`} value={formData.apoderado.email}
                    onChange={e => handleChange('apoderado', 'email', e.target.value)} />
                </Campo>
              </div>
              {!modoEdicion && (
                <div className="col-md-6">
                  <Campo label="Contraseña" error={errores.apoderado.password} requerido>
                    <input type="password" className={`form-control ${errores.apoderado.password ? 'is-invalid' : ''}`} value={formData.apoderado.password}
                      onChange={e => handleChange('apoderado', 'password', e.target.value)} />
                  </Campo>
                </div>
              )}
              <div className="col-md-6">
                <Campo label="Parentesco" error={null} requerido>
                  <select className="form-select" value={formData.apoderado.parentesco}
                    onChange={e => handleChange('apoderado', 'parentesco', e.target.value)}>
                    <option value="MADRE">MADRE</option>
                    <option value="PADRE">PADRE</option>
                    <option value="TUTOR">TUTOR</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </Campo>
              </div>

              <div className="col-12 mt-2"><hr /><h6 className="fw-semibold text-muted">Dirección del Apoderado</h6></div>
            </div>

            <DireccionFields
              dir={formData.apoderado.direcciones[0]}
              onChange={(campo, valor) => handleDireccionChange('apoderado', campo, valor)}
              errores={errores.dirApoderado}
            />

            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setPaso(2)}>← Atrás</button>
              <button className="btn btn-success" onClick={handleGuardar}>
                {modoEdicion ? 'Guardar cambios' : 'Enviar al Servidor'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GestionAlumnos;