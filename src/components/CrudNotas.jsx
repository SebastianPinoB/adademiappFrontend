import React, { useState } from 'react';
import { useEffect } from 'react';

const CrudNotas = () => {
  const [notas, setNotas] = useState([
    { id: 1, alumno: 'Juan Pérez', asignatura: 'Matemáticas', curso: '1° Medio A', valor: 6.5, descripcion: 'Prueba 1' },
    { id: 2, alumno: 'María López', asignatura: 'Matemáticas', curso: '1° Medio A', valor: 5.8, descripcion: 'Prueba 1' }
  ]);

  

  const [alumno, setAlumno] = useState('');
  const [asignatura, setAsignatura] = useState('Matemáticas');
  const [curso, setCurso] = useState('1° Medio A');
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmitNota = (e) => {
    e.preventDefault();
    if (editingId) {
      setNotas(notas.map(n => n.id === editingId ? { ...n, alumno, asignatura, curso, valor: parseFloat(valor), descripcion } : n));
      setEditingId(null);
    } else {
      setNotas([...notas, { id: Date.now(), alumno, asignatura, curso, valor: parseFloat(valor), descripcion }]);
    }
    resetForm();
  };

  const handleEditNota = (nota) => {
    setEditingId(nota.id);
    setAlumno(nota.alumno);
    setAsignatura(nota.asignatura);
    setCurso(nota.curso);
    setValor(nota.valor);
    setDescripcion(nota.descripcion);
  };

  const handleDeleteNota = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta calificación?")) {
      setNotas(notas.filter(n => n.id !== id));
    }
  };

  const resetForm = () => {
    setAlumno('');
    setValor('');
    setDescripcion('');
    setEditingId(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Módulo de Notas</h2>
        <span className="badge bg-info text-dark p-2">Año Académico 2026</span>
      </div>

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold border-bottom">
              {editingId ? '📝 Editar Calificación' : '➕ Registrar Nueva Nota'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmitNota}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Nombre del Alumno</label>
                  <input type="text" className="form-control form-control-sm" value={alumno} onChange={(e) => setAlumno(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Evaluación / Descripción</label>
                  <input type="text" className="form-control form-control-sm" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label small fw-bold">Asignatura</label>
                    <select className="form-select form-select-sm" value={asignatura} onChange={(e) => setAsignatura(e.target.value)}>
                      <option>Matemáticas</option>
                      <option>Lenguaje</option>
                    </select>
                  </div>
                  <div className="col">
                    <label className="form-label small fw-bold">Curso</label>
                    <select className="form-select form-select-sm" value={curso} onChange={(e) => setCurso(e.target.value)}>
                      <option>1° Medio A</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Nota (1.0 - 7.0)</label>
                  <input type="number" step="0.1" min="1" max="7" className="form-control form-control-sm" value={valor} onChange={(e) => setValor(e.target.value)} required />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm flex-grow-1">
                    {editingId ? 'Actualizar' : 'Guardar Nota'}
                  </button>
                  {editingId && <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Cancelar</button>}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold border-bottom">📋 Registros Existentes</div>
            <div className="card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Alumno</th>
                    <th>Curso</th>
                    <th>Asignatura</th>
                    <th>Detalle</th>
                    <th>Nota</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map((n) => (
                    <tr key={n.id}>
                      <td>{n.alumno}</td>
                      <td><span className="badge bg-secondary">{n.curso}</span></td>
                      <td>{n.asignatura}</td>
                      <td>{n.descripcion}</td>
                      <td className={`fw-bold ${n.valor >= 4.0 ? 'text-success' : 'text-danger'}`}>{n.valor.toFixed(1)}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditNota(n)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteNota(n.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrudNotas;