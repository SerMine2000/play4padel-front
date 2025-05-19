// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api.service';
import { User } from '../interfaces';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verificarToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/verify-token', storedToken);
        const { user_id, role, user_data } = res;

        const mapeoRol: { [key: string]: number } = {
          admin: 1,
          club: 2,
          profesor: 3,
          empleado: 4,
          usuario: 5,
          socio: 6,
        };

        const usuario: User = {
          ...user_data,
          id: user_id,
          role: role.toLowerCase(),
          id_rol: mapeoRol[role.toLowerCase()] || 0,
        };

        setUser(usuario);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        if (error instanceof Error && error.message && (error.message.includes('invalid_token') || error.message.includes('401'))) {
          console.warn('⚠️ Token inválido detectado, cerrando sesión automáticamente.');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);

        } else {
          console.error('❌ Error al verificar token:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verificarToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando sesión con credenciales:', { email, password });

      const response = await api.post('/login', { email, password });
      const { access_token, user_id, role, user_data } = response;

      const mapeoRol: { [key: string]: number } = {
        admin: 1,
        club: 2,
        profesor: 3,
        empleado: 4,
        usuario: 5,
        socio: 6,
      };

      const usuario: User = {
        ...user_data,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: mapeoRol[role.toLowerCase()] || 0,
      };

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(usuario);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw new Error('Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);