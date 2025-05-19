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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
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
        setIsAuthenticated(false);
        setUser(null);
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
          telefono: user_data.telefono || "No especificado",
          bio: user_data.bio || "No especificado"
        };
  
        setUser(usuario);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    verificarToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      console.log("Datos del usuario al iniciar sesión:", response);
      const { access_token, user_id, role, user_data } = response;
  
      const userResponse = await api.get(`/user/${user_id}`, access_token);
      const fullUserData = userResponse ? userResponse : {};
  
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
        ...fullUserData,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: mapeoRol[role.toLowerCase()] || 0,
        telefono: fullUserData.telefono ?? user_data.telefono ?? "No especificado",
        bio: fullUserData.bio ?? user_data.bio ?? "No especificado"
      };
  
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(usuario);
      setIsAuthenticated(true);
  
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw new Error('Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    if (!user?.id) return;
  
    try {
      setIsLoading(true);
      const response = await api.get(`/user/${user.id}`);
      console.log("Respuesta completa del backend al refrescar usuario:", response);
  
      const updatedUser = response ?? null;
      console.log("Objeto actualizado recibido del backend:", updatedUser);
  
      if (!updatedUser || Object.keys(updatedUser).length === 0) {
        console.warn("El objeto actualizado está vacío o indefinido.");
        return;
      }
  
      setUser({
        ...user,
        ...updatedUser,
        telefono: updatedUser.telefono !== undefined ? updatedUser.telefono : user.telefono,
        bio: updatedUser.bio !== undefined ? updatedUser.bio : user.bio,
      });
  
    } catch (error) {
      console.error('Error al refrescar el usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);