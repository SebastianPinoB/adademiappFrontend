// Helpers para guardar/leer la relación evaId ↔ asigId + cursoId en localStorage
// Esto es necesario porque el backend no expone esa relación en sus endpoints.

const LS_KEY = 'eva_relaciones';

export const guardarRelacionEva = (evaId, asigId, cursoId) => {
  const prev = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  prev[evaId] = { asigId, cursoId };
  localStorage.setItem(LS_KEY, JSON.stringify(prev));
};

export const obtenerRelaciones = () =>
  JSON.parse(localStorage.getItem(LS_KEY) || '{}');