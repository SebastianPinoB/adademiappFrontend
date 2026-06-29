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