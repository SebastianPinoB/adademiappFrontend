import React, { useState, useEffect } from 'react';
import { crearAlumnoConApoderado, obtenerTodosLosAlumnos, actualizarAlumno } from '../services/estudiantes';

const initialDireccion = {
  calle: '',
  numero: '',
  letra: '',
  nombreComuna: '',
  nombreCiudad: '',
  nombreRegion: '',
  nombrePais: 'Chile',
};

const initialPersona = {
  nombre: '',
  segundoNombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  numrun: 0,
  dvRun: '',
  email: '',
  password: '',
  direcciones: [{ ...initialDireccion }],
};

const initialForm = {
  alumno: { ...initialPersona, parentesco: 'HIJO' },
  apoderado: { ...initialPersona, parentesco: 'MADRE' },
};

const GestionAlumnos = () => {
  const [vista, setVista] = useState('tabla');       // 'tabla' | 'formulario'
  const [paso, setPaso] = useState(1);
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState(initialForm);

  // Carga los alumnos al montar el componente
  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    setCargando(true);
    try {
      const datos = await obtenerTodosLosAlumnos();
      setAlumnos(datos);
    } catch (error) {
      console.error(error);
      alert('No se pudieron cargar los estudiantes');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (rol, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [rol]: { ...prev[rol], [campo]: valor },
    }));
  };

  const handleDireccionChange = (rol, campo, valor) => {
    setFormData(prev => {
      const direcciones = [...prev[rol].direcciones];
      direcciones[0] = { ...direcciones[0], [campo]: valor };
      return { ...prev, [rol]: { ...prev[rol], direcciones } };
    });
  };

  const handleGuardar = async () => {
    const payload = {
      alumno: {
        ...formData.alumno,
        dvRun: formData.alumno.dvRun?.charAt(0) ?? '',
        numrun: Number(formData.alumno.numrun),
      },
      apoderado: {
        ...formData.apoderado,
        dvRun: formData.apoderado.dvRun?.charAt(0) ?? '',
        numrun: Number(formData.apoderado.numrun),
      },
    };

    try {
      await crearAlumnoConApoderado(payload);
      alert('Registro exitoso');
      setFormData(initialForm);
      setPaso(1);
      setVista('tabla');
      await cargarAlumnos(); // refresca la tabla
    } catch (error) {
      console.error(error);
      alert('Error: Revisa que todos los campos obligatorios estén llenos.');
    }
  };

  const pasos = ['Datos del Alumno', 'Dirección del Alumno', 'Datos del Apoderado'];

  // ── VISTA: TABLA ──
  if (vista === 'tabla') {
    return (
      <div className="container-fluid mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Gestión de Alumnos</h4>
          <button
            className="btn btn-primary"
            onClick={() => { setFormData(initialForm); setPaso(1); setVista('formulario'); }}
          >
            + Nuevo Alumno
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
                    <th>Nombre</th>
                    <th>Apellido Paterno</th>
                    <th>Apellido Materno</th>
                    <th>Email</th>
                    <th>Parentesco</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((alumno) => (
                    <tr key={alumno.usuId ?? alumno.numrun}>
                      <td>{alumno.numrun}-{alumno.usu_dvrun}</td>
                      <td>{alumno.usu_nombre} {alumno.usu_snombre}</td>
                      <td>{alumno.usu_appaterno}</td>
                      <td>{alumno.usu_apmaterno}</td>
                      <td>{alumno.usuEmail}</td>
                      <td><span className="badge bg-secondary">{alumno.estu_parentesco}</span></td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger">
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
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setVista('tabla')}>
          ← Volver a la lista
        </button>
        <h5 className="mb-0 fw-semibold">Registrar Nuevo Alumno</h5>
      </div>

      {/* Indicador de pasos */}
      <div className="d-flex align-items-center mb-4 gap-2">
        {pasos.map((label, i) => (
          <React.Fragment key={i}>
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32,
                  height: 32,
                  background: paso === i + 1 ? '#0d6efd' : paso > i + 1 ? '#198754' : '#dee2e6',
                  color: paso >= i + 1 ? '#fff' : '#6c757d',
                  fontSize: 14,
                }}
              >
                {paso > i + 1 ? '✓' : i + 1}
              </div>
              <small className="mt-1 text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                {label}
              </small>
            </div>
            {i < pasos.length - 1 && (
              <div
                className="flex-grow-1 mb-3"
                style={{ height: 2, background: paso > i + 1 ? '#198754' : '#dee2e6' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card shadow p-4">
        {/* ── PASO 1: Datos del Alumno ── */}
        {paso === 1 && (
          <>
            <h5 className="mb-3 fw-semibold">Datos del Alumno</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre *</label>
                <input className="form-control" value={formData.alumno.nombre}
                  onChange={e => handleChange('alumno', 'nombre', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Segundo Nombre</label>
                <input className="form-control" value={formData.alumno.segundoNombre}
                  onChange={e => handleChange('alumno', 'segundoNombre', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellido Paterno *</label>
                <input className="form-control" value={formData.alumno.apellidoPaterno}
                  onChange={e => handleChange('alumno', 'apellidoPaterno', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellido Materno</label>
                <input className="form-control" value={formData.alumno.apellidoMaterno}
                  onChange={e => handleChange('alumno', 'apellidoMaterno', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">RUT (número) *</label>
                <input type="number" className="form-control" value={formData.alumno.numrun || ''}
                  onChange={e => handleChange('alumno', 'numrun', parseInt(e.target.value) || 0)} />
              </div>
              <div className="col-md-2">
                <label className="form-label">DV *</label>
                <input className="form-control" maxLength="1" value={formData.alumno.dvRun}
                  onChange={e => handleChange('alumno', 'dvRun', e.target.value.toUpperCase())} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" value={formData.alumno.email}
                  onChange={e => handleChange('alumno', 'email', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contraseña *</label>
                <input type="password" className="form-control" value={formData.alumno.password}
                  onChange={e => handleChange('alumno', 'password', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Parentesco</label>
                <select className="form-select" value={formData.alumno.parentesco}
                  onChange={e => handleChange('alumno', 'parentesco', e.target.value)}>
                  <option value="HIJO">HIJO</option>
                  <option value="HIJA">HIJA</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary" onClick={() => setPaso(2)}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ── PASO 2: Dirección del Alumno ── */}
        {paso === 2 && (
          <>
            <h5 className="mb-3 fw-semibold">Dirección del Alumno</h5>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Calle *</label>
                <input className="form-control" value={formData.alumno.direcciones[0].calle}
                  onChange={e => handleDireccionChange('alumno', 'calle', e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Número</label>
                <input type="number" className="form-control" value={formData.alumno.direcciones[0].numero || ''}
                  onChange={e => handleDireccionChange('alumno', 'numero', parseInt(e.target.value) || '')} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Letra / Depto</label>
                <input className="form-control" value={formData.alumno.direcciones[0].letra}
                  onChange={e => handleDireccionChange('alumno', 'letra', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Comuna *</label>
                <input className="form-control" value={formData.alumno.direcciones[0].nombreComuna}
                  onChange={e => handleDireccionChange('alumno', 'nombreComuna', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ciudad *</label>
                <input className="form-control" value={formData.alumno.direcciones[0].nombreCiudad}
                  onChange={e => handleDireccionChange('alumno', 'nombreCiudad', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Región *</label>
                <input className="form-control" value={formData.alumno.direcciones[0].nombreRegion}
                  onChange={e => handleDireccionChange('alumno', 'nombreRegion', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">País</label>
                <input className="form-control" value={formData.alumno.direcciones[0].nombrePais}
                  onChange={e => handleDireccionChange('alumno', 'nombrePais', e.target.value)} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>← Atrás</button>
              <button className="btn btn-primary" onClick={() => setPaso(3)}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ── PASO 3: Datos del Apoderado ── */}
        {paso === 3 && (
          <>
            <h5 className="mb-3 fw-semibold">Datos del Apoderado</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre *</label>
                <input className="form-control" value={formData.apoderado.nombre}
                  onChange={e => handleChange('apoderado', 'nombre', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Segundo Nombre</label>
                <input className="form-control" value={formData.apoderado.segundoNombre}
                  onChange={e => handleChange('apoderado', 'segundoNombre', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellido Paterno *</label>
                <input className="form-control" value={formData.apoderado.apellidoPaterno}
                  onChange={e => handleChange('apoderado', 'apellidoPaterno', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellido Materno</label>
                <input className="form-control" value={formData.apoderado.apellidoMaterno}
                  onChange={e => handleChange('apoderado', 'apellidoMaterno', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">RUT (número) *</label>
                <input type="number" className="form-control" value={formData.apoderado.numrun || ''}
                  onChange={e => handleChange('apoderado', 'numrun', parseInt(e.target.value) || 0)} />
              </div>
              <div className="col-md-2">
                <label className="form-label">DV *</label>
                <input className="form-control" maxLength="1" value={formData.apoderado.dvRun}
                  onChange={e => handleChange('apoderado', 'dvRun', e.target.value.toUpperCase())} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" value={formData.apoderado.email}
                  onChange={e => handleChange('apoderado', 'email', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contraseña *</label>
                <input type="password" className="form-control" value={formData.apoderado.password}
                  onChange={e => handleChange('apoderado', 'password', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Parentesco</label>
                <select className="form-select" value={formData.apoderado.parentesco}
                  onChange={e => handleChange('apoderado', 'parentesco', e.target.value)}>
                  <option value="MADRE">MADRE</option>
                  <option value="PADRE">PADRE</option>
                  <option value="TUTOR">TUTOR</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>

              <div className="col-12 mt-2"><hr /><h6 className="fw-semibold text-muted">Dirección del Apoderado</h6></div>
              <div className="col-md-8">
                <label className="form-label">Calle *</label>
                <input className="form-control" value={formData.apoderado.direcciones[0].calle}
                  onChange={e => handleDireccionChange('apoderado', 'calle', e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Número</label>
                <input type="number" className="form-control" value={formData.apoderado.direcciones[0].numero || ''}
                  onChange={e => handleDireccionChange('apoderado', 'numero', parseInt(e.target.value) || '')} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Letra / Depto</label>
                <input className="form-control" value={formData.apoderado.direcciones[0].letra}
                  onChange={e => handleDireccionChange('apoderado', 'letra', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Comuna *</label>
                <input className="form-control" value={formData.apoderado.direcciones[0].nombreComuna}
                  onChange={e => handleDireccionChange('apoderado', 'nombreComuna', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ciudad *</label>
                <input className="form-control" value={formData.apoderado.direcciones[0].nombreCiudad}
                  onChange={e => handleDireccionChange('apoderado', 'nombreCiudad', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Región *</label>
                <input className="form-control" value={formData.apoderado.direcciones[0].nombreRegion}
                  onChange={e => handleDireccionChange('apoderado', 'nombreRegion', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">País</label>
                <input className="form-control" value={formData.apoderado.direcciones[0].nombrePais}
                  onChange={e => handleDireccionChange('apoderado', 'nombrePais', e.target.value)} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setPaso(2)}>← Atrás</button>
              <button className="btn btn-success" onClick={handleGuardar}>Enviar al Servidor</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GestionAlumnos;
