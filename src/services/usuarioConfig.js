import api from "./axiosConfig";

export const loginUsuario = async (email, password) => {
   // La API devolvueklve el token como un string directo
   const respuesta = await api.post("api/auth/login", { email, password });
   return respuesta.data; // Aquí viene el token
};

