// src/services/auth.service.ts
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UpdatePasswordRequest,
} from '../interfaces';

import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import apiService from './api.service';


class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Enviando credenciales al backend:', credentials);

      const response = await apiService.post(API_ENDPOINTS.LOGIN, credentials);
      const { access_token, user_id, role, user_data, message } = response.data;

      if (!user_id || !role || !access_token) {
        throw new Error('Faltan datos clave en la respuesta del backend');
      }

      // Guardar token en localStorage para persistencia
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);

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
      throw new Error('Error al iniciar sesión');
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    try {
      console.log("📨 Registrando usuario:", userData);

      if (userData.tipo_cuenta === 'club') {
        console.log("🏢 Registro como club");

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

          console.log("🏗️ Creando club:", clubPayload);
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
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }


  async getCurrentUser(userId: number): Promise<User> {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USER}/${userId}`);
      return response.data;
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
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getUserId(): number | null {
    return null;
  }

  getUserRole(): string | null {
    return null;
  }

}
