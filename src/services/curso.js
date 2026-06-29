import { gestionAcademicaApi } from "./axiosConfigB";

// METODOS CURSO
export const obtenerTodosLosCursos = async () => {
   try {
      const respuesta = await gestionAcademicaApi.get("/cursos");
      return respuesta.data;
   } catch (error) {
      console.error("Error al obtener todos los cursos");
      throw error;
   }
};

export const crearCurso = async (nuevoCurso) => {
   try {
      const respuesta = await gestionAcademicaApi.post("/cursos", nuevoCurso);
      return respuesta.data;
   } catch (error) {
      console.error("Error al crear curso");
      throw error;
   }
};

export const actualizarCurso = async (id, cursoActualizado) => {
   try {
      const respuesta = await gestionAcademicaApi.put(`/cursos/${id}`, cursoActualizado);
      return respuesta.data;
   } catch (error) {
      console.error("Error al actualizar el curso");
      throw error;
   }
};

export const eliminarCurso = async (id) => {
   try {
      await gestionAcademicaApi.delete(`/cursos/${id}`);
   } catch (error) {
      console.error("Error al eliminar curso");
      throw error;
   }
};

export const obtenerCursoPorId = async (id) => {
   try {
      const respuesta = await gestionAcademicaApi.get(`/cursos/${id}`);
      return respuesta.data;
   } catch (error) {
      console.error("Error al obtener el curso");
      throw error;
   }
};