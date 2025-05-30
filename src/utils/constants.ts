// src/utils/constants.ts

//export const API_URL = 'https://backend-1-uvqp.onrender.com';
export const API_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/create-user',
  LOGOUT: '/logout',
  USER: '/user',
  UPDATE_PASSWORD: '/update-password',
  CLUBS: '/clubs',
  RESERVAS: '/reservas',
  CREAR_RESERVA: '/crear-reserva',
  DISPONIBILIDAD_PISTA: '/pistas',
  
  // Torneos
  TORNEOS: '/torneos',
  CREAR_TORNEO: '/torneos/crear',
  TORNEO_DETALLE: (id: number) => `/torneos/${id}`,
  INSCRIBIR_PAREJA_TORNEO: (id: number) => `/torneos/${id}/inscribir_pareja_torneo`,
  GENERAR_FIXTURE: (id: number) => `/torneos/${id}/generar_fixture`,
  AVANZAR_RONDA: (id: number, ronda: string) => `/torneos/${id}/rondas/${ronda}/avanzar`,
  CREAR_CONSOLACION: (id: number, ronda: string) => `/torneos/${id}/rondas/${ronda}/consolacion`,
  
  // Ligas
  LIGAS: '/ligas',
  LIGA_DETALLE: (id: number) => `/ligas/${id}`,
  INSCRIBIR_PAREJA_LIGA: (id: number) => `/ligas/${id}/inscribir_pareja`,
  PAREJAS_LIGA: (id: number) => `/ligas/${id}/parejas`,
  GENERAR_PARTIDOS_LIGA: (id: number) => `/ligas/${id}/generar_partidos`,
  PARTIDOS_LIGA: (id: number) => `/ligas/${id}/partidos`,
  CLASIFICACION_LIGA: (id: number) => `/ligas/${id}/clasificacion`,
  REGISTRAR_RESULTADO: (partidoId: number) => `/partidos/${partidoId}/resultado`,
  
  // Parejas
  PAREJA_DETALLE: (id: number) => `/parejas_liga/${id}`
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