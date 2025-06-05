// src/common/utils/api.ts
import axios from 'axios';

export const API = axios.create({
  baseURL: 'https://localhost:5001',
  withCredentials: true,
});
