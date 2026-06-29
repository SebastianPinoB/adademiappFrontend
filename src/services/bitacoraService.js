import { gestionAcademicaApi } from './axiosConfigB';

export const obtenerAsignaturas = async () => {
   try {
      const respuesta = await gestionAcademicaApi.get('/asignaturas');
      return respuesta.data;
   } catch (error) {
      console.error('Error al obtener asignaturas');
      throw error;
   }
};

export const obtenerBitacoras = async () => {
   try {
      const respuesta = await gestionAcademicaApi.get('/bitacora');
      return respuesta.data;
   } catch (error) {
      console.error('Error al obtener bitácoras');
      throw error;
   }
};

export const crearBitacora = async (nuevaBitacora) => {
   try {
      const respuesta = await gestionAcademicaApi.post('/bitacora', nuevaBitacora);
      return respuesta.data;
   } catch (error) {
      console.error('Error al crear bitácora');
      throw error;
   }
};

export const actualizarBitacora = async (id, bitacora) => {
   try {
      const respuesta = await gestionAcademicaApi.put(`/bitacora/${id}`, bitacora);
      return respuesta.data;
   } catch (error) {
      console.error('Error al actualizar bitácora');
      throw error;
   }
};

// ── Evaluaciones ──
export const obtenerEvaluaciones = async () => {
   try {
      const respuesta = await gestionAcademicaApi.get('/evaluacion');
      return respuesta.data;
   } catch (error) {
      console.error('Error al obtener evaluaciones');
      throw error;
   }
};

// ── Notas ──
export const obtenerNotasPorEstudiante = async (estudianteId) => {
   try {
      const respuesta = await gestionAcademicaApi.get(`/nota/estudiante/${estudianteId}`);
      return respuesta.data;
   } catch (error) {
      console.error('Error al obtener notas del estudiante');
      throw error;
   }
};

export const crearNota = async (nota) => {
   try {
      const respuesta = await gestionAcademicaApi.post('/nota', nota);
      return respuesta.data;
   } catch (error) {
      console.error('Error al crear nota');
      throw error;
   }
};

export const actualizarNota = async (id, nota) => {
   try {
      const respuesta = await gestionAcademicaApi.put(`/nota/${id}`, nota);
      return respuesta.data;
   } catch (error) {
      console.error('Error al actualizar nota');
      throw error;
   }
};

export const eliminarNota = async (id) => {
   try {
      await gestionAcademicaApi.delete(`/nota/${id}`);
   } catch (error) {
      console.error('Error al eliminar nota');
      throw error;
   }
};

// ── Salas ──
export const obtenerSalas = async () => {
   try {
      const respuesta = await gestionAcademicaApi.get('/salas');
      return respuesta.data;
   } catch (error) {
      console.error('Error al obtener salas');
      throw error;
   }
};

export const crearSala = async (sala) => {
   try {
      const respuesta = await gestionAcademicaApi.post('/salas', sala);
      return respuesta.data;
   } catch (error) {
      console.error('Error al crear sala');
      throw error;
   }
};

export const actualizarSala = async (id, sala) => {
   try {
      const respuesta = await gestionAcademicaApi.put(`/salas/${id}`, sala);
      return respuesta.data;
   } catch (error) {
      console.error('Error al actualizar sala');
      throw error;
   }
};

export const eliminarSala = async (id) => {
   try {
      await gestionAcademicaApi.delete(`/salas/${id}`);
   } catch (error) {
      console.error('Error al eliminar sala');
      throw error;
   }
};

// ── Cursos ──
export const obtenerCursos = async () => {
   try {
      const respuesta = await gestionAcademicaApi.get('/cursos');
      return respuesta.data;
   } catch (error) {
      console.error('Error al obtener cursos');
      throw error;
   }
};

export const crearCurso = async (curso) => {
   try {
      const respuesta = await gestionAcademicaApi.post('/cursos', curso);
      return respuesta.data;
   } catch (error) {
      console.error('Error al crear curso');
      throw error;
   }
};

export const actualizarCurso = async (id, curso) => {
   try {
      const respuesta = await gestionAcademicaApi.put(`/cursos/${id}`, curso);
      return respuesta.data;
   } catch (error) {
      console.error('Error al actualizar curso');
      throw error;
   }
};

export const eliminarCurso = async (id) => {
   try {
      await gestionAcademicaApi.delete(`/cursos/${id}`);
   } catch (error) {
      console.error('Error al eliminar curso');
      throw error;
   }
};

// ── Evaluaciones ──
export const crearEvaluacion = async (data) => {
   try {
      const respuesta = await gestionAcademicaApi.post('/evaluacion', data);
      return respuesta.data;
   } catch (error) {
      console.error('Error al crear evaluación');
      throw error;
   }
};

export const actualizarEvaluacion = async (id, data) => {
   try {
      const respuesta = await gestionAcademicaApi.put(`/evaluacion/${id}`, data);
      return respuesta.data;
   } catch (error) {
      console.error('Error al actualizar evaluación');
      throw error;
   }
};

export const eliminarEvaluacion = async (id) => {
   try {
      await gestionAcademicaApi.delete(`/evaluacion/${id}`);
   } catch (error) {
      console.error('Error al eliminar evaluación');
      throw error;
   }
};