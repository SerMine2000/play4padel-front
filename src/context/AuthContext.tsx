import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, LoginRequest, RegisterRequest, User } from '../interfaces';
import authService from '../services/auth.service';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../utils/constants';

// Crear el contexto con un valor inicial
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para verificar autenticación tras login
  const checkAuthStatus = async () => {
    console.log('Auth: Verificando autenticación...');
    try {
      const isAuth = authService.isAuthenticated();
      console.log('Auth: ¿Está autenticado?:', isAuth);

      if (isAuth) {
        const userId = authService.getUserId();
        console.log('Auth: userId encontrado:', userId);

        if (userId) {
          const userData = await authService.getCurrentUser(userId);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error al verificar autenticación:', error);
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (credentials: LoginRequest) => {
    console.log('Iniciando sesión con credenciales:', credentials);
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await authService.login(credentials);
      console.log('Respuesta del login:', response);
  
      if (!response.user_id) {
        setError('Credenciales incorrectas');
        setIsAuthenticated(false);
        return;
      }
  
      const userData = await authService.getCurrentUser(response.user_id);
      console.log('Datos del usuario obtenidos:', userData);
  
      const roleMap = {
        club: 2,
        empleado: 4, // 👈 Tu intención original y correcta
      } as const;
      
      const rawRole = typeof response.role === 'string' ? response.role.trim().toLowerCase() : '';
      const id_rol = rawRole && roleMap[rawRole as keyof typeof roleMap];
  
      if (!id_rol) {
        setError('Rol no reconocido');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
  
      setUser({ ...userData, id_rol });
      setIsAuthenticated(true);
  
      console.log('Rol mapeado:', rawRole, '→ id_rol:', id_rol);
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Función para registrar un nuevo usuario
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.register(userData);
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        await authService.logout(user.id);
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      authService.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;
      await apiService.delete(`/users/${userId}`);
      logout();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser: checkAuthStatus,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;