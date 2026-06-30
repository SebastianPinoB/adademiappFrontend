import React, { useState, useEffect } from 'react';
import {
   obtenerTodosFuncionarios,
   registrarDocente, registrarDirectivo, registrarInspector,
   actualizarDocente, actualizarDirectivo, actualizarInspector,
   eliminarFuncionario,
   obtenerDocentePorId, obtenerInspectorPorId, obtenerDirectivoPorId,
} from '../services/funcionarioService';

const REGIONES_CHILE = [
   'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
   'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío',
   'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
];

const TIPOS = ['DOCENTE', 'DIRECTIVO', 'INSPECTOR'];

const CARGOS_DIRECTIVO = ['Director', 'Subdirector', 'Jefe UTP', 'Orientador', 'Coordinador Académico'];
const NIVELES_INSPECTOR = ['Primer Ciclo Básico', 'Segundo Ciclo Básico', 'Enseñanza Media'];

const initialDireccion = {
   calle: '', numero: '', letra: '',
   nombreComuna: '', nombreCiudad: '', nombreRegion: '', nombrePais: 'Chile',
};

const initialForm = {
   nombre: '', segundoNombre: '', apellidoPaterno: '', apellidoMaterno: '',
   numrun: '', dvRun: '', email: '', password: '', titulo: '',
   // Docente
   especialidad: '',
   // Directivo
   cargoDirectivo: '',
   // Inspector
   nivel: '',
   direcciones: [{ ...initialDireccion }],
};

// ── Validación ──
const validarPaso = (paso, form, tipo, modoEdicion) => {
   const e = {};
   if (paso === 1) {
      if (!form.nombre?.trim()) e.nombre = 'Obligatorio';
      if (!form.apellidoPaterno?.trim()) e.apellidoPaterno = 'Obligatorio';
      if (!form.apellidoMaterno?.trim()) e.apellidoMaterno = 'Obligatorio';
      if (!form.email?.trim()) e.email = 'Obligatorio';
      if (!modoEdicion && !form.password?.trim()) e.password = 'Obligatorio';
      if (!form.numrun) e.numrun = 'Obligatorio';
      if (!form.dvRun?.trim()) e.dvRun = 'Obligatorio';
      if (!form.titulo?.trim()) e.titulo = 'Obligatorio';
      if (tipo === 'DOCENTE' && !form.especialidad?.trim()) e.especialidad = 'Obligatorio';
      if (tipo === 'DIRECTIVO' && !form.cargoDirectivo?.trim()) e.cargoDirectivo = 'Obligatorio';
      if (tipo === 'INSPECTOR' && !form.nivel?.trim()) e.nivel = 'Obligatorio';
   }
   if (paso === 2) {
      const d = form.direcciones[0];
      if (!d.calle?.trim()) e.calle = 'Obligatorio';
      if (!d.numero) e.numero = 'Obligatorio';
      if (!d.nombreRegion?.trim()) e.nombreRegion = 'Obligatorio';
      if (!d.nombreCiudad?.trim()) e.nombreCiudad = 'Obligatorio';
      if (!d.nombreComuna?.trim()) e.nombreComuna = 'Obligatorio';
      if (!d.nombrePais?.trim()) e.nombrePais = 'Obligatorio';
   }
   return e;
};

const Campo = ({ label, error, children, requerido }) => (
   <div className="col-md-6 mb-2">
      <label className="form-label small fw-bold">
         {label} {requerido && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <div className="text-danger" style={{ fontSize: 11 }}>{error}</div>}
   </div>
);

// ── Modal eliminar ──
const ModalEliminar = ({ funcionario, onConfirmar, onCancelar }) => (
   <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
         <div className="modal-content">
            <div className="modal-header border-0">
               <h5 className="modal-title text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle me-2"></i>Confirmar eliminación
               </h5>
            </div>
            <div className="modal-body">
               ¿Estás seguro de eliminar a <strong>{funcionario?.nombreCompleto}</strong>?
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
const GestionFuncionarios = () => {
   const [vista, setVista] = useState('tabla');
   const [paso, setPaso] = useState(1);
   const [tipo, setTipo] = useState('DOCENTE');
   const [modoEdicion, setModoEdicion] = useState(false);
   const [idEditando, setIdEditando] = useState(null);
   const [form, setForm] = useState(initialForm);
   const [errores, setErrores] = useState({});
   const [funcionarios, setFuncionarios] = useState([]);
   const [cargando, setCargando] = useState(true);
   const [guardando, setGuardando] = useState(false);
   const [aEliminar, setAEliminar] = useState(null);
   const [filtro, setFiltro] = useState('TODOS');

   useEffect(() => { cargarFuncionarios(); }, []);

   const cargarFuncionarios = async () => {
      setCargando(true);
      try {
         setFuncionarios(await obtenerTodosFuncionarios());
      } catch {
         alert('No se pudieron cargar los funcionarios');
      } finally {
         setCargando(false);
      }
   };

   const handleChange = (campo, valor) => {
      setForm(prev => ({ ...prev, [campo]: valor }));
      setErrores(prev => ({ ...prev, [campo]: undefined }));
   };

   const handleDirChange = (campo, valor) => {
      setForm(prev => {
         const dirs = [...prev.direcciones];
         dirs[0] = { ...dirs[0], [campo]: valor };
         return { ...prev, direcciones: dirs };
      });
      setErrores(prev => ({ ...prev, [campo]: undefined }));
   };

   const irAlPaso = (siguiente) => {
      const e = validarPaso(paso, form, tipo, modoEdicion);
      if (Object.keys(e).length > 0) { setErrores(e); return; }
      setPaso(siguiente);
   };

   const abrirNuevo = () => {
      setForm(initialForm);
      setErrores({});
      setModoEdicion(false);
      setIdEditando(null);
      setPaso(1);
      setTipo('DOCENTE');
      setVista('formulario');
   };

   const abrirEdicion = async (f) => {
      setTipo(f.cargo);
      setErrores({});
      setModoEdicion(true);
      setIdEditando(f.id);
      setPaso(1);

      try {
         let datos;
         if (f.cargo === 'DOCENTE') datos = await obtenerDocentePorId(f.id);
         else if (f.cargo === 'INSPECTOR') datos = await obtenerInspectorPorId(f.id);
         else datos = await obtenerDirectivoPorId(f.id);

         const mapearDireccion = (d) => ({
            calle: d.add_calle ?? '',
            numero: d.add_numero ?? '',
            letra: d.add_letra ?? '',
            nombreComuna: d.comuna?.comu_nombre ?? '',
            nombreCiudad: d.comuna?.ciudad?.ciudad_nombre ?? '',
            nombreRegion: d.comuna?.ciudad?.region?.regi_nombre ?? '',
            nombrePais: d.comuna?.ciudad?.region?.pais?.pais_nombre ?? 'Chile',
         });

         setForm({
            nombre: datos.usu_nombre ?? '',
            segundoNombre: datos.usu_snombre ?? '',
            apellidoPaterno: datos.usu_appaterno ?? '',
            apellidoMaterno: datos.usu_apmaterno ?? '',
            numrun: datos.numrun ?? '',
            dvRun: datos.usu_dvrun ?? '',
            email: datos.usuEmail ?? '',
            password: '',
            titulo: datos.funci_titulo ?? '',
            especialidad: datos.docen_espec ?? '',
            cargoDirectivo: datos.direct_cargo ?? '',
            nivel: datos.inspec_nivel ?? '',
            direcciones: datos.direcciones?.length > 0
               ? [mapearDireccion(datos.direcciones[0])]
               : [{ ...initialDireccion }],
         });
      } catch {
         alert('No se pudieron cargar los datos del funcionario');
      }

      setVista('formulario');
   };

   const buildPayload = () => ({
      nombre: form.nombre,
      segundoNombre: form.segundoNombre,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      numrun: Number(form.numrun),
      dvRun: form.dvRun?.charAt(0) ?? '',
      email: form.email,
      password: form.password,
      titulo: form.titulo,
      direcciones: form.direcciones.map(d => ({
         ...d,
         numero: Number(d.numero) || 0,
      })),
   });

   const handleGuardar = async () => {
      const e = validarPaso(2, form, tipo, modoEdicion);
      if (Object.keys(e).length > 0) { setErrores(e); return; }

      const base = buildPayload();
      setGuardando(true);
      try {
         if (tipo === 'DOCENTE') {
            const payload = { ...base, especialidad: form.especialidad };
            modoEdicion ? await actualizarDocente(idEditando, payload) : await registrarDocente(payload);
         } else if (tipo === 'DIRECTIVO') {
            const payload = { ...base, cargoDirectivo: form.cargoDirectivo };
            modoEdicion ? await actualizarDirectivo(idEditando, payload) : await registrarDirectivo(payload);
         } else {
            const payload = { ...base, nivel: form.nivel };
            modoEdicion ? await actualizarInspector(idEditando, payload) : await registrarInspector(payload);
         }
         alert(modoEdicion ? 'Funcionario actualizado' : 'Funcionario registrado correctamente');
         setVista('tabla');
         await cargarFuncionarios();
      } catch (err) {
         alert(err.response?.data ?? 'Error al guardar el funcionario');
      } finally {
         setGuardando(false);
      }
   };

   const confirmarEliminar = async () => {
      try {
         await eliminarFuncionario(aEliminar.id);
         setAEliminar(null);
         await cargarFuncionarios();
      } catch {
         alert('No se pudo eliminar el funcionario');
         setAEliminar(null);
      }
   };

   const funcionariosFiltrados = filtro === 'TODOS'
      ? funcionarios
      : funcionarios.filter(f => f.cargo === filtro);

   const badgeColor = (cargo) => ({
      DOCENTE: 'bg-primary', DIRECTIVO: 'bg-danger', INSPECTOR: 'bg-success'
   }[cargo] ?? 'bg-secondary');

   const pasos = ['Datos del Funcionario', 'Dirección'];

   // ── VISTA: TABLA ──
   if (vista === 'tabla') {
      return (
         <div className="container-fluid mt-3">
            {aEliminar && (
               <ModalEliminar
                  funcionario={aEliminar}
                  onConfirmar={confirmarEliminar}
                  onCancelar={() => setAEliminar(null)}
               />
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
               <h4 className="fw-bold mb-0">Gestión de Funcionarios</h4>
               <button className="btn btn-primary" onClick={abrirNuevo}>
                  <i className="bi bi-person-plus me-2"></i>Nuevo Funcionario
               </button>
            </div>

            {/* Filtros */}
            <div className="d-flex gap-2 mb-3">
               {['TODOS', ...TIPOS].map(t => (
                  <button key={t}
                     className={`btn btn-sm ${filtro === t ? 'btn-dark' : 'btn-outline-secondary'}`}
                     onClick={() => setFiltro(t)}>
                     {t}
                  </button>
               ))}
            </div>

            {cargando ? (
               <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted">Cargando funcionarios...</p>
               </div>
            ) : funcionariosFiltrados.length === 0 ? (
               <div className="text-center py-5 text-muted">
                  <i className="bi bi-people fs-1"></i>
                  <p className="mt-2">No hay funcionarios registrados.</p>
               </div>
            ) : (
               <div className="card shadow-sm">
                  <div className="table-responsive">
                     <table className="table table-hover mb-0">
                        <thead className="table-dark">
                           <tr>
                              <th>Nombre</th>
                              <th>Email</th>
                              <th>Tipo</th>
                              <th>Especialidad / Cargo / Nivel</th>
                              <th className="text-center">Acciones</th>
                           </tr>
                        </thead>
                        <tbody>
                           {funcionariosFiltrados.map(f => (
                              <tr key={f.id}>
                                 <td>{f.nombreCompleto}</td>
                                 <td>{f.email}</td>
                                 <td><span className={`badge ${badgeColor(f.cargo)}`}>{f.cargo}</span></td>
                                 <td>{f.especialidad ?? '—'}</td>
                                 <td className="text-center text-nowrap">
                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirEdicion(f)}>
                                       <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => setAEliminar(f)}>
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
      <div className="container mt-4" style={{ maxWidth: 780 }}>
         <div className="d-flex align-items-center mb-3 gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setVista('tabla')}>
               ← Volver
            </button>
            <h5 className="mb-0 fw-semibold">
               {modoEdicion ? 'Editar Funcionario' : 'Registrar Nuevo Funcionario'}
            </h5>
         </div>

         {/* Selector de tipo (solo al crear) */}
         {!modoEdicion && (
            <div className="mb-3 d-flex gap-2">
               {TIPOS.map(t => (
                  <button key={t}
                     className={`btn btn-sm ${tipo === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                     onClick={() => { setTipo(t); setErrores({}); }}>
                     {t}
                  </button>
               ))}
            </div>
         )}

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
                     <div className="flex-grow-1 mb-3"
                        style={{ height: 2, background: paso > i + 1 ? '#198754' : '#dee2e6' }} />
                  )}
               </React.Fragment>
            ))}
         </div>

         <div className="card shadow p-4">

            {/* ── PASO 1: Datos del funcionario ── */}
            {paso === 1 && (
               <>
                  <h5 className="mb-3 fw-semibold">Datos del {tipo}</h5>
                  <div className="row">
                     <Campo label="Nombre" error={errores.nombre} requerido>
                        <input className={`form-control form-control-sm ${errores.nombre ? 'is-invalid' : ''}`}
                           value={form.nombre} onChange={e => handleChange('nombre', e.target.value)} />
                     </Campo>
                     <Campo label="Segundo Nombre" error={null}>
                        <input className="form-control form-control-sm" value={form.segundoNombre}
                           onChange={e => handleChange('segundoNombre', e.target.value)} />
                     </Campo>
                     <Campo label="Apellido Paterno" error={errores.apellidoPaterno} requerido>
                        <input className={`form-control form-control-sm ${errores.apellidoPaterno ? 'is-invalid' : ''}`}
                           value={form.apellidoPaterno} onChange={e => handleChange('apellidoPaterno', e.target.value)} />
                     </Campo>
                     <Campo label="Apellido Materno" error={errores.apellidoMaterno} requerido>
                        <input className={`form-control form-control-sm ${errores.apellidoMaterno ? 'is-invalid' : ''}`}
                           value={form.apellidoMaterno} onChange={e => handleChange('apellidoMaterno', e.target.value)} />
                     </Campo>
                     <Campo label="RUT (número)" error={errores.numrun} requerido>
                        <input type="number" className={`form-control form-control-sm ${errores.numrun ? 'is-invalid' : ''}`}
                           value={form.numrun || ''} disabled={modoEdicion}
                           onChange={e => handleChange('numrun', parseInt(e.target.value) || '')} />
                     </Campo>
                     <Campo label="DV" error={errores.dvRun} requerido>
                        <input className={`form-control form-control-sm ${errores.dvRun ? 'is-invalid' : ''}`}
                           maxLength="1" value={form.dvRun} disabled={modoEdicion}
                           onChange={e => handleChange('dvRun', e.target.value.toUpperCase())} />
                     </Campo>
                     <Campo label="Email" error={errores.email} requerido>
                        <input type="email" className={`form-control form-control-sm ${errores.email ? 'is-invalid' : ''}`}
                           value={form.email} onChange={e => handleChange('email', e.target.value)} />
                     </Campo>
                     {!modoEdicion && (
                        <Campo label="Contraseña" error={errores.password} requerido>
                           <input type="password" className={`form-control form-control-sm ${errores.password ? 'is-invalid' : ''}`}
                              value={form.password} onChange={e => handleChange('password', e.target.value)} />
                        </Campo>
                     )}
                     <Campo label="Título profesional" error={errores.titulo} requerido>
                        <input className={`form-control form-control-sm ${errores.titulo ? 'is-invalid' : ''}`}
                           placeholder="Ej: Profesor de Estado en Matemáticas"
                           value={form.titulo} onChange={e => handleChange('titulo', e.target.value)} />
                     </Campo>

                     {/* Campo específico según tipo */}
                     {tipo === 'DOCENTE' && (
                        <Campo label="Especialidad" error={errores.especialidad} requerido>
                           <input className={`form-control form-control-sm ${errores.especialidad ? 'is-invalid' : ''}`}
                              placeholder="Ej: Matemáticas"
                              value={form.especialidad} onChange={e => handleChange('especialidad', e.target.value)} />
                        </Campo>
                     )}
                     {tipo === 'DIRECTIVO' && (
                        <Campo label="Cargo Directivo" error={errores.cargoDirectivo} requerido>
                           <select className={`form-select form-select-sm ${errores.cargoDirectivo ? 'is-invalid' : ''}`}
                              value={form.cargoDirectivo} onChange={e => handleChange('cargoDirectivo', e.target.value)}>
                              <option value="">-- Selecciona --</option>
                              {CARGOS_DIRECTIVO.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </Campo>
                     )}
                     {tipo === 'INSPECTOR' && (
                        <Campo label="Nivel a cargo" error={errores.nivel} requerido>
                           <select className={`form-select form-select-sm ${errores.nivel ? 'is-invalid' : ''}`}
                              value={form.nivel} onChange={e => handleChange('nivel', e.target.value)}>
                              <option value="">-- Selecciona --</option>
                              {NIVELES_INSPECTOR.map(n => <option key={n} value={n}>{n}</option>)}
                           </select>
                        </Campo>
                     )}
                  </div>
                  <div className="mt-3">
                     <button className="btn btn-primary" onClick={() => irAlPaso(2)}>Siguiente →</button>
                  </div>
               </>
            )}

            {/* ── PASO 2: Dirección ── */}
            {paso === 2 && (
               <>
                  <h5 className="mb-3 fw-semibold">Dirección</h5>
                  <div className="row">
                     <Campo label="Calle" error={errores.calle} requerido>
                        <input className={`form-control form-control-sm ${errores.calle ? 'is-invalid' : ''}`}
                           value={form.direcciones[0].calle} onChange={e => handleDirChange('calle', e.target.value)} />
                     </Campo>
                     <Campo label="Número" error={errores.numero} requerido>
                        <input type="number" className={`form-control form-control-sm ${errores.numero ? 'is-invalid' : ''}`}
                           value={form.direcciones[0].numero || ''} onChange={e => handleDirChange('numero', parseInt(e.target.value) || '')} />
                     </Campo>
                     <Campo label="Letra / Depto" error={null}>
                        <input className="form-control form-control-sm" value={form.direcciones[0].letra}
                           onChange={e => handleDirChange('letra', e.target.value)} />
                     </Campo>
                     <Campo label="Región" error={errores.nombreRegion} requerido>
                        <select className={`form-select form-select-sm ${errores.nombreRegion ? 'is-invalid' : ''}`}
                           value={form.direcciones[0].nombreRegion} onChange={e => handleDirChange('nombreRegion', e.target.value)}>
                           <option value="">-- Selecciona --</option>
                           {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                     </Campo>
                     <Campo label="Ciudad" error={errores.nombreCiudad} requerido>
                        <input className={`form-control form-control-sm ${errores.nombreCiudad ? 'is-invalid' : ''}`}
                           value={form.direcciones[0].nombreCiudad} onChange={e => handleDirChange('nombreCiudad', e.target.value)} />
                     </Campo>
                     <Campo label="Comuna" error={errores.nombreComuna} requerido>
                        <input className={`form-control form-control-sm ${errores.nombreComuna ? 'is-invalid' : ''}`}
                           value={form.direcciones[0].nombreComuna} onChange={e => handleDirChange('nombreComuna', e.target.value)} />
                     </Campo>
                     <Campo label="País" error={errores.nombrePais} requerido>
                        <input className={`form-control form-control-sm ${errores.nombrePais ? 'is-invalid' : ''}`}
                           value={form.direcciones[0].nombrePais} onChange={e => handleDirChange('nombrePais', e.target.value)} />
                     </Campo>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                     <button className="btn btn-secondary" onClick={() => setPaso(1)}>← Atrás</button>
                     <button className="btn btn-success" onClick={handleGuardar} disabled={guardando}>
                        {guardando
                           ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                           : <><i className="bi bi-save me-2"></i>{modoEdicion ? 'Guardar cambios' : 'Registrar'}</>
                        }
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default GestionFuncionarios;