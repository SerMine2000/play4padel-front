// src/interfaces/index.ts
export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  id_rol: number;
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
}

export interface RegisterResponse {
  message: string;
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
}