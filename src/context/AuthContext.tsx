// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api.service';
import authService from '../services/auth.service';
import { RegisterRequest, User } from '../interfaces';
import { API_URL } from '../utils/constants';

/**
 * Interfaz que define la estructura del contexto de autenticación.
 * Contiene todas las propiedades y métodos disponibles para componentes que usen el contexto.
 */
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

/**
 * Contexto de React que proporciona funcionalidad de autenticación a toda la aplicación.
 * Inicializado con valores por defecto para evitar errores en componentes.
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  refreshAccessToken: async () => {},
  register: async () => {},
  deleteAccount: async () => {},
});

/**
 * Proveedor del contexto de autenticación que envuelve la aplicación.
 * Maneja el estado global de autenticación y proporciona métodos para login, logout, registro, etc.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados principales del contexto de autenticación
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Flag para evitar renovaciones concurrentes de token
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  /**
   * Función interna para renovar el token de acceso.
   * Evita referencias circulares con el servicio API y maneja renovaciones concurrentes.
   */
  const refreshAccessTokenInternal = async (): Promise<void> => {
    // Prevenir múltiples renovaciones simultáneas
    if (isRefreshingToken) {
      throw new Error('Token refresh already in progress');
    }

    const storedRefreshToken = localStorage.getItem('refresh_token');
    
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      setIsRefreshingToken(true);
      
      // Realizamos la petición de renovación de token
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedRefreshToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Verificamos el estado de la respuesta
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Refresh token expired - login required');
        }
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No se recibió un nuevo access token');
      }

      // Actualizamos el token en localStorage y el estado
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
    } catch (error) {
      console.error('❌ Error al refrescar access token:', error);
      // Si falla la renovación, cerramos sesión
      logout();
      throw error;
    } finally {
      setIsRefreshingToken(false);
    }
  };

  // Creamos un objeto con los métodos que necesita el servicio API
  const authContextForAPI = {
    refreshAccessToken: refreshAccessTokenInternal,
    logout: () => logout()
  };

  // Efecto para inyectar el contexto en el servicio API al inicializar
  useEffect(() => {
    api.setAuthContext(authContextForAPI);
  }, []);

  // Efecto para cargar el usuario al montar el componente
  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * Función para autenticar al usuario con email y contraseña.
   * Maneja el almacenamiento de tokens y actualización del estado de autenticación.
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Enviamos las credenciales al servidor
      const response = await api.post('/login', { email, password });
      
      // Extraemos los datos de la respuesta del servidor
      const { access_token, refresh_token, user_id, role, user_data } = response;

      console.log("🔍 DATOS RECIBIDOS DEL LOGIN:");
      console.log("📦 Response completo:", response);
      console.log("👤 user_data:", user_data);
      console.log("📞 user_data.telefono:", user_data.telefono);
      console.log("📝 user_data.bio:", user_data.bio);

      // Validamos que tengamos los datos mínimos necesarios
      if (!access_token || !user_id || !role) {
        throw new Error('Respuesta del servidor incompleta');
      }

      // Almacenamos los tokens en localStorage y el estado
      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
        setRefreshToken(refresh_token);
      }
      
      setToken(access_token);
      setIsAuthenticated(true);

      // Construimos el objeto usuario con todos los datos recibidos
      const usuario: User = {
        ...user_data,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: role.toUpperCase(),
        telefono: user_data.telefono || "",
        bio: user_data.bio || ""
      };

      console.log("🔍 USUARIO FINAL CONSTRUIDO EN LOGIN:");
      console.log("👤 usuario:", usuario);
      console.log("📞 usuario.telefono:", usuario.telefono);
      console.log("📝 usuario.bio:", usuario.bio);

      setUser(usuario);
      setError(null);
      
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      // Limpiamos todo en caso de error
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

  /**
   * Función para cerrar sesión del usuario.
   * Notifica al servidor y limpia el estado local de autenticación.
   */
  const logout = async () => {
    try {
      // Notificamos al backend si hay un usuario activo
      if (user?.id) {
        await authService.logout(user.id);
      }
    } catch (error) {
      console.error('⚠️ Error al notificar logout al backend:', error);
    } finally {
      // Limpiamos la sesión local siempre, incluso si hay error en el servidor
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
    }
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
      
      console.log("🔍 DATOS RECIBIDOS DEL REFRESH USER:");
      console.log("📦 userResponse completo:", userResponse);
      console.log("📞 userResponse.telefono:", userResponse.telefono);
      console.log("📝 userResponse.bio:", userResponse.bio);
      
      if (!userResponse) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }

      const usuario: User = {
        ...userResponse,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: role.toUpperCase(),
        telefono: userResponse.telefono || "",
        bio: userResponse.bio || ""
      };

      console.log("🔍 USUARIO FINAL CONSTRUIDO:");
      console.log("👤 usuario:", usuario);
      console.log("📞 usuario.telefono:", usuario.telefono);
      console.log("📝 usuario.bio:", usuario.bio);

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
    return refreshAccessTokenInternal();
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await api.post('/create-user', data);
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
      await logout();
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

/**
 * Hook personalizado para usar el contexto de autenticación.
 * Proporciona acceso a todas las funciones y estado de autenticación.
 */
export const useAuth = () => useContext(AuthContext);