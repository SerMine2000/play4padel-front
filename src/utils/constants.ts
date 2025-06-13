// src/utils/constants.ts

/**
 * Archivo de constantes globales para la aplicación Play4Padel.
 * Centraliza URLs, endpoints de API, roles, estados y utilidades comunes.
 */

// URL base del backend - cambiar según el entorno (desarrollo/producción)
// export const API_URL = 'https://backend-1-uvqp.onrender.com'; // Producción
export const API_URL = 'http://localhost:5000'; // Desarrollo local

/**
 * Endpoints de la API REST organizados por funcionalidad.
 * Incluye endpoints estáticos y funciones que generan endpoints dinámicos.
 */
export const API_ENDPOINTS = {
  // Endpoints de autenticación y usuarios
  LOGIN: '/login',
  REGISTER: '/create-user',
  LOGOUT: '/logout',
  USER: '/user',
  UPDATE_PASSWORD: '/update-password',
  
  // Endpoints de clubes y reservas
  CLUBS: '/clubs',
  RESERVAS: '/reservas',
  CREAR_RESERVA: '/crear-reserva',
  DISPONIBILIDAD_PISTA: '/pistas',
  
  // Endpoints de torneos - incluyen funciones para generar URLs dinámicas
  TORNEOS: '/torneos',
  CREAR_TORNEO: '/torneos/crear',
  TORNEO_DETALLE: (id: number) => `/torneos/${id}`,
  INSCRIBIR_PAREJA_TORNEO: (id: number) => `/torneos/${id}/inscribir_pareja_torneo`,
  GENERAR_FIXTURE: (id: number) => `/torneos/${id}/generar_fixture`,
  AVANZAR_RONDA: (id: number, ronda: string) => `/torneos/${id}/rondas/${ronda}/avanzar`,
  CREAR_CONSOLACION: (id: number, ronda: string) => `/torneos/${id}/rondas/${ronda}/consolacion`,
  
  // Endpoints de ligas - sistema de competición por puntos
  LIGAS: '/ligas',
  LIGA_DETALLE: (id: number) => `/ligas/${id}`,
  INSCRIBIR_PAREJA_LIGA: (id: number) => `/ligas/${id}/inscribir_pareja`,
  PAREJAS_LIGA: (id: number) => `/ligas/${id}/parejas`,
  GENERAR_PARTIDOS_LIGA: (id: number) => `/ligas/${id}/generar_partidos`,
  PARTIDOS_LIGA: (id: number) => `/ligas/${id}/partidos`,
  CLASIFICACION_LIGA: (id: number) => `/ligas/${id}/clasificacion`,
  REGISTRAR_RESULTADO: (partidoId: number) => `/partidos/${partidoId}/resultado`,
  
  // Endpoints de parejas
  PAREJA_DETALLE: (id: number) => `/parejas_liga/${id}`
};

/**
 * Claves utilizadas para almacenar datos en localStorage.
 * Centralizadas para evitar errores de escritura y facilitar cambios.
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
};

/**
 * Roles de usuario del sistema definidos como constantes.
 * Corresponden con los enums del backend para autorización.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  CLUB: 'CLUB',
  PROFESOR: 'PROFESOR',
  EMPLEADO: 'EMPLEADO',
  USUARIO: 'USUARIO',
  SOCIO: 'SOCIO',
};

/**
 * Estados posibles de las reservas en el sistema.
 * Utilizados para el ciclo de vida de las reservas de pistas.
 */
export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada', 
  CANCELADA: 'cancelada',
  COMPLETADA: 'completada'
};

/**
 * Tipos de cuenta disponibles en el registro.
 * Determina si se registra un usuario normal o administrador de club.
 */
export const TIPOS_CUENTA = {
  USUARIO: 'USUARIO',
  CLUB: 'CLUB'
};

// ===== UTILIDADES PARA AVATARES =====

/**
 * Interfaz que define la estructura de datos para generar avatares de usuario.
 * Utilizada cuando no hay imagen de avatar personalizada.
 */
export interface DatosAvatar {
  colorFondo: string;
  colorTexto: string;
  inicial: string;
}

/**
 * Paleta de colores profesional para avatares generados automáticamente.
 * Se asignan de forma determinística basándose en el ID del usuario.
 */
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