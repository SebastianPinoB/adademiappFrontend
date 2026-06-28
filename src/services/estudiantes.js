import api from "./axiosConfig";

export const obtenerTodosLosAlumnos = async () => {

   try {
      const respueta = await api.get("/registro/alumno");
      return respueta.data;

   } catch (error) {
      console.error("Error al obtener todos los estudiantes");
      throw error;
   }

}

export const crearAlumnoConApoderado = async (nuevoEstudiante) => {
   try {
      const respuesta = await api.post("/registro/alumno", nuevoEstudiante);
      return respuesta.data;
   } catch (error) {
      console.error("Error al crear estudiante");
      throw error;
   }
};

export const actualizarAlumno = async (id, estudianteActualizado) => {
   try {
      const respuesta = await api.put(`/registro/alumno/${id}`, estudianteActualizado);
      return respuesta.data;
   }
   catch (error) {
      console.error("Error al actualizar el alumno");
   }

}

export const eliminarAlumno = async (id) => {
  try {
    await api.delete(`/registro/alumno/${id}`);
  } catch (error) {
    console.error("Error al eliminar alumno");
    throw error;
  }
};