// src/utils/constants.ts
export const API_URL = 'https://backend-1-uvqp.onrender.com';
// export const API_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/create-user',
  LOGOUT: '/logout',
  USER: '/user',
  UPDATE_PASSWORD: '/update-password',
  CLUBS: '/clubs',
  RESERVAS: '/reservas',
  CREAR_RESERVA: '/crear-reserva',
  DISPONIBILIDAD_PISTA: '/pistas'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  CLUB: 'CLUB',
  PROFESOR: 'PROFESOR',
  EMPLEADO: 'EMPLEADO',
  USUARIO: 'USUARIO',
  SOCIO: 'SOCIO',
};

export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada', 
  CANCELADA: 'cancelada',
  COMPLETADA: 'completada'
};

export const TIPOS_CUENTA = {
  USUARIO: 'USUARIO',
  CLUB: 'CLUB'
};