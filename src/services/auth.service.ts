// src/services/auth.service.ts
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UpdatePasswordRequest,
} from '../interfaces';

import { API_ENDPOINTS, STORAGE_KEYS, API_URL } from '../utils/constants';
import apiService from './api.service';


class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, credentials);
      
      // La respuesta viene directamente del backend, no anidada bajo .data
      const { access_token, refresh_token, user_id, role, user_data, message } = response;

      if (!user_id || !role || !access_token || !refresh_token) {
        console.error('❌ Respuesta incompleta del backend:', response);
        throw new Error('Faltan datos clave en la respuesta del backend');
      }

      // Guardar ambos tokens en localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return {
        message: message || 'Inicio de sesión correcto',
        user_id,
        role: role.toLowerCase(),
        access_token,
        user_data: {
          ...user_data,
          role: role.toLowerCase(),
        },
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error; // Mantener el error original para mejor debugging
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    try {
      if (userData.tipo_cuenta === 'club') {
        const { tipo_cuenta, club_data, ...userPayload } = userData;

        // Crear usuario administrador del club
        const userResponse = await apiService.post(API_ENDPOINTS.REGISTER, userPayload);
        const createdUserId = userResponse?.user_id;

        if (club_data && createdUserId) {
          const clubPayload = {
            nombre: club_data.nombre,
            direccion: club_data.direccion,
            horario_apertura: club_data.horario_apertura,
            horario_cierre: club_data.horario_cierre,
            descripcion: club_data.descripcion || '',
            telefono: club_data.telefono || userData.telefono || '',
            email: club_data.email || userData.email,
            id_administrador: createdUserId,
          };

          await apiService.post(API_ENDPOINTS.CLUBS, clubPayload);
        } else {
          console.error("❌ Faltan datos del club o ID del usuario:", {
            club_data,
            createdUserId,
          });
          throw new Error('No se pudo crear el club: faltan datos necesarios');
        }
      } else {
        // Registro estándar
        const { tipo_cuenta, ...normalUser } = userData;
        await apiService.post(API_ENDPOINTS.REGISTER, normalUser);
      }
    } catch (error: any) {
      console.error("❌ Error completo en register:", error);
      throw new Error(error.message || 'Error al registrar usuario. Inténtalo de nuevo.');
    }
  }


  async logout(userId: number): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT, { user_id: userId });
    } catch (error) {
      console.error('⚠️ Error en logout:', error);
    } finally {
      this.clearSession();
    }
  }


  clearSession(): void {
    // Usar la misma clave que api.service
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }


  async getCurrentUser(userId: number): Promise<User> {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USER}/${userId}`);
      return response;
    } catch (error: any) {
      console.error('❌ Error al obtener el usuario:', error);
      throw new Error(error.message || 'Error al obtener información del usuario.');
    }
  }


  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    try {
      await apiService.put(API_ENDPOINTS.UPDATE_PASSWORD, data);
    } catch (error: any) {
      console.error('❌ Error al actualizar la contraseña:', error);
      throw new Error(error.message || 'Error al actualizar la contraseña.');
    }
  }


  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): number | null {
    return null;
  }

  getUserRole(): string | null {
    return null;
  }

  async refreshAccessToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }
      
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al renovar token');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
    } catch (error) {
      console.error('❌ Error al renovar token:', error);
      this.clearSession();
      throw error;
    }
  }

}

export default new AuthService();