// src/interfaces/index.ts
export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  id_rol: number;
  id_club?: number;
  avatar_url?: string;
  bio?: string;
  activo: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
  role: string;
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