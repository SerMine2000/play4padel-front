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

// ===== UTILIDADES PARA AVATARES =====
export interface DatosAvatar {
  colorFondo: string;
  colorTexto: string;
  inicial: string;
}

// Colores para avatares de usuarios - paleta profesional
const COLORES_AVATAR = [
  '#1abc9c', // Verde agua
  '#3498db', // Azul
  '#9b59b6', // Púrpura
  '#f39c12', // Naranja
  '#e67e22', // Naranja oscuro
  '#e74c3c', // Rojo
  '#2ecc71', // Verde
  '#7f8c8d', // Gris
  '#34495e', // Azul oscuro
  '#f1c40f', // Amarillo
  '#d35400', // Naranja fuerte
  '#8e44ad', // Púrpura oscuro
];

/**
 * Genera un color de avatar basado en el ID del usuario
 * @param idUsuario - ID del usuario
 * @returns Color hexadecimal
 */
export const obtenerColorAvatar = (idUsuario: number): string => {
  return COLORES_AVATAR[idUsuario % COLORES_AVATAR.length];
};

/**
 * Obtiene la inicial del nombre del usuario
 * @param nombre - Nombre del usuario
 * @returns Primera letra en mayúscula o 'U' si no hay nombre
 */
export const obtenerInicialUsuario = (nombre?: string): string => {
  if (!nombre || nombre.trim() === '') return 'U';
  return nombre.charAt(0).toUpperCase();
};

/**
 * Genera los datos completos para un avatar (color de fondo, color de texto e inicial)
 * @param idUsuario - ID del usuario
 * @param nombre - Nombre del usuario
 * @returns Objeto con colorFondo, colorTexto e inicial
 */
export const generarDatosAvatar = (idUsuario: number, nombre?: string): DatosAvatar => {
  const colorFondo = obtenerColorAvatar(idUsuario);
  const inicial = obtenerInicialUsuario(nombre);
  
  return {
    colorFondo,
    colorTexto: '#ffffff',
    inicial
  };
};

/**
 * Estilos CSS para un avatar generado
 * @param idUsuario - ID del usuario
 * @param nombre - Nombre del usuario
 * @param tamaño - Tamaño del avatar en píxeles
 * @returns Objeto de estilos CSS
 */
export const obtenerEstilosAvatar = (idUsuario: number, nombre?: string, tamaño: number = 42) => {
  const datosAvatar = generarDatosAvatar(idUsuario, nombre);
  
  return {
    backgroundColor: datosAvatar.colorFondo,
    color: datosAvatar.colorTexto,
    width: `${tamaño}px`,
    height: `${tamaño}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: `${tamaño * 0.4}px`
  };
};