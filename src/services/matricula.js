import { matriculasApi } from "./axiosConfigB";

// METODOS MATRICULA

export const obtenerTodasLasMatriculas = async () => {
   try {
      const respuesta = await matriculasApi.get("/matriculas");
      return respuesta.data;
   } catch (error) {
      console.error("Error al obtener todas las matriculas");
      throw error;
   }
};

export const gestionarMatricula = async (nuevaMatricula) => {
   try {
      const respuesta = await matriculasApi.post("/matriculas", nuevaMatricula);
      return respuesta.data;
   } catch (error) {
      console.error("Error al gestionar la matricula");
      throw error;
   }
};

export const obtenerMatriculaPorUsuario = async (usuId) => {
   try {
      const respuesta = await matriculasApi.get(`/matriculas/usuario/${usuId}`);
      return respuesta.data;
   } catch (error) {
      console.error("Error al obtener la matricula del usuario");
      throw error;
   }
};

export const desvincularEstudiante = async (datosDesvinculacion) => {
   try {
      const respuesta = await matriculasApi.put("/matriculas/desvincular", datosDesvinculacion);
      return respuesta.data;
   } catch (error) {
      console.error("Error al desvincular al estudiante");
      throw error;
   }
};