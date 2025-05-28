import axios from 'axios';

export const API = axios.create({
  baseURL: '/', // Todo proxied a http://localhost:5000
  withCredentials: true // Envía y recibe cookies automáticamente
});