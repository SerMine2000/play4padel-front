// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api.service';
import { RegisterRequest, User } from '../interfaces';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  register: async () => {},
  deleteAccount: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const usuario: User = {
          ...user_data,
          id: user_id,
          role: role.toLowerCase(),       // e.g. "club"
          id_rol: role.toUpperCase(),     // e.g. "CLUB"
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
      const { access_token, user_id, role, user_data } = response;

      const userResponse = await api.get(`/user/${user_id}`, access_token);
      const fullUserData = userResponse ? userResponse : {};

      const usuario: User = {
        ...user_data,
        ...fullUserData,
        id: user_id,
        role: role.toLowerCase(),
        id_rol: role.toUpperCase(),
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
      if (!response || Object.keys(response).length === 0) return;

      setUser({
        ...user,
        ...response,
        telefono: response.telefono ?? user.telefono,
        bio: response.bio ?? user.bio,
      });
    } catch (error) {
      console.error('Error al refrescar el usuario:', error);
    } finally {
      setIsLoading(false);
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
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
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