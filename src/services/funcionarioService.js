import api from './axiosConfig';

// ── GET ──
export const obtenerTodosFuncionarios = async () => {
   try {
      const r = await api.get('/registro/funcionario');
      return r.data;
   } catch (e) { console.error('Error al obtener funcionarios'); throw e; }
};

// ── POST ──
export const registrarDocente = async (data) => {
   try {
      await api.post('/registro/funcionario/docente', data);
   } catch (e) { console.error('Error al registrar docente'); throw e; }
};

export const registrarDirectivo = async (data) => {
   try {
      await api.post('/registro/funcionario/directivo', data);
   } catch (e) { console.error('Error al registrar directivo'); throw e; }
};

export const registrarInspector = async (data) => {
   try {
      await api.post('/registro/funcionario/inspector', data);
   } catch (e) { console.error('Error al registrar inspector'); throw e; }
};

// ── PUT ──
export const actualizarDocente = async (id, data) => {
   try {
      await api.put(`/registro/funcionario/docente/${id}`, data);
   } catch (e) { console.error('Error al actualizar docente'); throw e; }
};

export const actualizarDirectivo = async (id, data) => {
   try {
      await api.put(`/registro/funcionario/directivo/${id}`, data);
   } catch (e) { console.error('Error al actualizar directivo'); throw e; }
};

export const actualizarInspector = async (id, data) => {
   try {
      await api.put(`/registro/funcionario/inspector/${id}`, data);
   } catch (e) { console.error('Error al actualizar inspector'); throw e; }
};

// ── DELETE ──
export const eliminarFuncionario = async (id) => {
   try {
      await api.delete(`/registro/funcionario/${id}`);
   } catch (e) { console.error('Error al eliminar funcionario'); throw e; }
};

// ── GET por tipo e ID (para edición) ──
export const obtenerDocentePorId = async (id) => {
   try {
      const r = await api.get(`/registro/funcionario/docente/${id}`);
      return r.data;
   } catch (e) { console.error('Error al obtener docente'); throw e; }
};

export const obtenerInspectorPorId = async (id) => {
   try {
      const r = await api.get(`/registro/funcionario/inspector/${id}`);
      return r.data;
   } catch (e) { console.error('Error al obtener inspector'); throw e; }
};

export const obtenerDirectivoPorId = async (id) => {
   try {
      const r = await api.get(`/registro/funcionario/directivo/${id}`);
      return r.data;
   } catch (e) { console.error('Error al obtener directivo'); throw e; }
};