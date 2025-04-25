import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, LoginRequest, RegisterRequest, User } from '../interfaces';
import authService from '../services/auth.service';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../utils/constants';

// Crear el contexto con un valor inicial
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  deleteAccount: async () => {},
});

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // Verificar si hay un user_id en localStorage
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const userId = authService.getUserId();
          if (userId) {
            // Cargar datos del usuario
            const userData = await authService.getCurrentUser(userId);
            setUser(userData);
          }
        }
      } catch (error: any) {
        console.error('Error al verificar autenticación:', error);
        setError(error.message);
        // Limpiar la sesión si hay un error
        authService.clearSession();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Función para iniciar sesión
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamar al servicio de autenticación
      const response = await authService.login(credentials);
      
      // Si la respuesta es exitosa, cargar los datos del usuario
      if (response.user_id) {
        const userData = await authService.getCurrentUser(response.user_id);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamar al servicio de registro
      await authService.register(userData);
      
      // No autenticamos automáticamente después del registro
      // El usuario debe iniciar sesión explícitamente
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar los datos del usuario
  const refreshUser = async () => {
    try {
      if (!isAuthenticated) return;
      
      const userId = authService.getUserId();
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      // Obtener los datos actualizados del usuario
      const userData = await authService.getCurrentUser(userId);
      setUser(userData);
      
    } catch (error: any) {
      console.error('Error al refrescar datos del usuario:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (user?.id) {
        await authService.logout(user.id);
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar el estado local
      authService.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  //Funcion para eliminar cuenta
  const deleteAccount = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;
      await apiService.delete(`/users/${userId}`);
      logout(); // Cierra sesión tras eliminar
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };

  // Valor del contexto
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    deleteAccount
  };



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};