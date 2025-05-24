// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api.service';
import { RegisterRequest, User } from '../interfaces';
import { API_URL } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  refreshAccessToken: async () => {},
  register: async () => {},
  deleteAccount: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/login', { email, password });
      
      // Verificar la estructura de respuesta
      console.log('Respuesta del backend:', response);
      
      const { access_token, refresh_token, user_id, role, user_data } = response;

      if (!access_token || !user_id || !role) {
        throw new Error('Respuesta del servidor incompleta');
      }

      // Guardar ambos tokens en localStorage
      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
        setRefreshToken(refresh_token);
      }
      
      setToken(access_token);
      setIsAuthenticated(true);

      // Construir objeto usuario con los datos recibidos
      const usuario: User = {
        ...user_data,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: role.toUpperCase(),
        telefono: user_data.telefono ?? "No especificado",
        bio: user_data.bio ?? "No especificado"
      };

      setUser(usuario);
      setError(null);
      
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw new Error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    
    if (!storedToken) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Usar el endpoint de verificación de token en lugar de obtener usuario directamente
      const response = await api.get('/verify-token', storedToken);
      
      if (!response) {
        throw new Error('Token inválido');
      }
      
      const { user_id, role } = response;
      
      // Ahora obtener los datos completos del usuario
      const userResponse = await api.get(`/user/${user_id}`, storedToken);
      
      if (!userResponse) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }

      const usuario: User = {
        ...userResponse,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: role.toUpperCase(),
        telefono: userResponse.telefono ?? "No especificado",
        bio: userResponse.bio ?? "No especificado"
      };

      setUser(usuario);
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Error al refrescar el usuario:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 Intentando refrescar access token...');
      
      // Enviar el refresh_token en el header Authorization
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedRefreshToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No se recibió un nuevo access token');
      }

      // Guardar el nuevo token
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
      console.log('✅ Access token refrescado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al refrescar access token:', error);
      // Si falla el refresh, hacer logout completo
      logout();
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await api.post('/register', data);
      setError(null);
    } catch (err) {
      console.error("Error en el registro:", err);
      setError('Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await api.delete('/delete-account');
      logout();
      setError(null);
    } catch (err) {
      console.error("Error al eliminar la cuenta:", err);
      setError('Error al eliminar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
        refreshAccessToken,
        register,
        deleteAccount,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);