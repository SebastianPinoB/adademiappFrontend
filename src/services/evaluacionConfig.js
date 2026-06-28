import api from "./axiosConfig";

//Llamado obtener todas las notas
export const obtenerTodasLasNotas = async () => {

   try {
      const respueta = await api.get("/evaluacion");
      return respueta.data;

   } catch (error) {
      console.error("Error al obtener todas las evaluaciones");
      throw error;
   }

}