// src/utils/constants.ts
export const API_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/create-user',
  LOGOUT: '/logout',
  USER: '/user',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  PROFESOR: 'PROFESOR',
  EMPLEADO: 'EMPLEADO',
  USUARIO: 'USUARIO',
  SOCIO: 'SOCIO',
};