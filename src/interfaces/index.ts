// src/interfaces/index.ts
export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  role: string;
  telefono?: string;
  id_rol: string;
  id_club?: number;
  avatar_url?: string;
  bio?: string;
  activo: boolean;
  rol?: {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: any;
    created_at: string;
    updated_at: string;
  };
}

export interface Pista {
  id: number;
  numero: number;
  id_club: number;
  tipo: string;
  estado: string;
  precio_hora: number;
  iluminacion: boolean;
  techada: boolean;
  imagen_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
  role: string;
  access_token: string;
  user_data?: User;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  id_rol: number;
  telefono?: string;
  avatar_url?: string;
  bio?: string;
  tipo_cuenta?: string;
  // Campos específicos para club
  club_data?: {
    nombre: string;
    direccion: string;
    horario_apertura: string;
    horario_cierre: string;
    descripcion?: string;
    telefono?: string;
    email?: string;
  };
}

export interface RegisterResponse {
  message: string;
  user_id?: number;
}

export interface UpdatePasswordRequest {
  user_id: number;
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  avatar_url?: string;
  bio?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export interface ClubData {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  horario_apertura: string;
  horario_cierre: string;
  id_administrador: number;
  fecha_registro: string;
  activo: boolean;
  imagen_url?: string;
  sitio_web?: string;
  redes_sociales?: any;
}

export interface CardsResumenProps {
  partidosJugados: string | number;
  nivel: string | number;
  victorias: string | number;
  torneos: string | number;
  isClubDashboard?: boolean;
}

// Interfaces para Torneos
export interface Torneo {
  id: number;
  nombre: string;
  id_club: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: string;
  estado?: string;
  descripcion?: string;
  precio_inscripcion?: number;
  max_parejas?: number;
  imagen_url?: string;
}

export interface ParejaTorneo {
  id: number;
  id_torneo: number;
  jugador1_id: number;
  jugador2_id: number;
  categoria: string;
  fecha_creacion: string;
  jugador1?: User;
  jugador2?: User;
}

export interface InscripcionTorneo {
  id: number;
  id_torneo: number;
  id_usuario: number;
  id_pareja: number;
  categoria: string;
  fecha_inscripcion: string;
}

// Interfaces para Ligas
export interface Liga {
  id: number;
  nombre: string;
  id_club: number;
  fecha_inicio: string;
  fecha_fin: string;
  categoria: string;
  nivel: string;
  precio_inscripcion: number;
  estado: string;
  max_parejas: number;
  descripcion?: string;
  reglas?: string;
  premio?: string;
  imagen_url?: string;
  puntos_victoria?: number;
  puntos_empate?: number;
  puntos_derrota?: number;
  permite_empate?: boolean;
}

export interface ParejasLiga {
  id: number;
  id_liga: number;
  id_jugador1: number;
  id_jugador2: number;
  nombre_equipo: string;
  puntos: number;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_perdidos: number;
  jugador1?: User;
  jugador2?: User;
}

export interface Partido {
  id: number;
  id_torneo?: number;
  id_liga?: number;
  id_equipo1: number;
  id_equipo2: number;
  ronda?: string;
  estado: string;
  resultado?: string;
  fecha_partido?: string;
  fecha?: string;
  hora_inicio?: string;
  pista_id?: number;
  equipo1?: ParejaTorneo | ParejasLiga;
  equipo2?: ParejaTorneo | ParejasLiga;
  nombre_equipo1?: string;
  nombre_equipo2?: string;
}
