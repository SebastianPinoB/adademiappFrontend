import { anotacionesApi } from "./axiosConfigB";

// METODOS ANOTACION

export const obtenerTodasLasAnotaciones = async () => {
   try {
      const respuesta = await anotacionesApi.get("/api/anotaciones");
      return respuesta.data;
   } catch (error) {
      console.error("Error al obtener todas las anotaciones");
      throw error;
   }
};

export const obtenerAnotacionPorId = async (id) => {
   try {
      const respuesta = await anotacionesApi.get(`/api/anotaciones/${id}`);
      return respuesta.data;
   } catch (error) {
      console.error("Error al obtener la anotacion");
      throw error;
   }
};

export const crearAnotacion = async (nuevaAnotacion) => {
   try {
      const respuesta = await anotacionesApi.post("/api/anotaciones", nuevaAnotacion);
      return respuesta.data;
   } catch (error) {
      console.error("Error al crear la anotacion");
      throw error;
   }
};

export const actualizarAnotacion = async (id, anotacionActualizada) => {
   try {
      const respuesta = await anotacionesApi.put(`/api/anotaciones/${id}`, anotacionActualizada);
      return respuesta.data;
   } catch (error) {
      console.error("Error al actualizar la anotacion");
      throw error;
   }
};