import axios from 'axios';

// cada microservicio con su propio puerto
export const vidaEstudiantilApi = axios.create({
  baseURL: 'http://localhost:5002',
});

export const eventosCalendarioApi = axios.create({
  baseURL: 'http://localhost:5003',
});

export const mensajeriaApi = axios.create({
  baseURL: 'http://localhost:5004',
});

export const usuarioApi = axios.create({
  baseURL: 'http://localhost:5000',
});

export const gestionAcademicaApi = axios.create({ 
  baseURL: 'http://localhost:5008' 
});
