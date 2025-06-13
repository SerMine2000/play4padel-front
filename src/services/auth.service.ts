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

/**
 * Servicio de autenticación que maneja login, registro, logout y gestión de sesiones.
 * Encapsula toda la lógica relacionada con la autenticación de usuarios y administración de tokens JWT.
 */
class AuthService {
  /**
   * Realiza el proceso de autenticación de usuario mediante credenciales.
   * Gestiona el almacenamiento de tokens JWT y retorna información del usuario autenticado.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Enviamos las credenciales al endpoint de login
      const response = await apiService.post(API_ENDPOINTS.LOGIN, credentials);
      
      // Extraemos los datos de respuesta del backend
      const { access_token, refresh_token, user_id, role, user_data, message } = response;

      // Validamos que tengamos todos los datos necesarios
      if (!user_id || !role || !access_token || !refresh_token) {
        console.error('❌ Respuesta incompleta del backend:', response);
        throw new Error('Faltan datos clave en la respuesta del backend');
      }

      // Almacenamos los tokens en localStorage para persistencia de sesión
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Retornamos la respuesta de login estructurada
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
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * Maneja tanto el registro de usuarios normales como de administradores de club.
   * Para administradores de club, crea primero el usuario y luego el club asociado.
   */
  async register(userData: RegisterRequest): Promise<void> {
    try {
      // Verificamos si es un registro de administrador de club
      if (userData.tipo_cuenta === 'club') {
        const { tipo_cuenta, club_data, ...userPayload } = userData;

        // Primero creamos el usuario administrador del club
        const userResponse = await apiService.post(API_ENDPOINTS.REGISTER, userPayload);
        const createdUserId = userResponse?.user_id;

        // Si tenemos datos del club y el usuario fue creado exitosamente
        if (club_data && createdUserId) {
          // Preparamos los datos del club con el ID del administrador
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

          // Creamos el club asociado al usuario administrador
          await apiService.post(API_ENDPOINTS.CLUBS, clubPayload);
        } else {
          console.error("❌ Faltan datos del club o ID del usuario:", {
            club_data,
            createdUserId,
          });
          throw new Error('No se pudo crear el club: faltan datos necesarios');
        }
      } else {
        // Registro estándar de usuario normal
        const { tipo_cuenta, ...normalUser } = userData;
        await apiService.post(API_ENDPOINTS.REGISTER, normalUser);
      }
    } catch (error: any) {
      console.error("❌ Error completo en register:", error);
      throw new Error(error.message || 'Error al registrar usuario. Inténtalo de nuevo.');
    }
  }


  /**
   * Cierra la sesión del usuario notificando al servidor y limpiando la sesión local.
   * Siempre limpia la sesión local, incluso si falla la notificación al servidor.
   */
  async logout(userId: number): Promise<void> {
    try {
      // Notificamos al servidor sobre el logout
      await apiService.post(API_ENDPOINTS.LOGOUT, { user_id: userId });
    } catch (error) {
      console.error('⚠️ Error en logout:', error);
    } finally {
      // Siempre limpiamos la sesión local
      this.clearSession();
    }
  }

  /**
   * Limpia todos los datos de sesión almacenados localmente.
   * Elimina tokens de acceso y refresh del localStorage.
   */
  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Obtiene la información completa del usuario actual desde el servidor.
   * Utiliza el ID del usuario para hacer la consulta autenticada.
   */
  async getCurrentUser(userId: number): Promise<User> {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USER}/${userId}`);
      return response;
    } catch (error: any) {
      console.error('❌ Error al obtener el usuario:', error);
      throw new Error(error.message || 'Error al obtener información del usuario.');
    }
  }

  /**
   * Actualiza la contraseña del usuario actual.
   * Requiere la contraseña actual para validar la operación.
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    try {
      await apiService.put(API_ENDPOINTS.UPDATE_PASSWORD, data);
    } catch (error: any) {
      console.error('❌ Error al actualizar la contraseña:', error);
      throw new Error(error.message || 'Error al actualizar la contraseña.');
    }
  }

  /**
   * Verifica si el usuario tiene una sesión activa válida.
   * Comprueba la existencia del token de acceso en localStorage.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Obtiene el ID del usuario actual.
   * Método placeholder que debe ser implementado según las necesidades.
   */
  getUserId(): number | null {
    return null;
  }

  /**
   * Obtiene el rol del usuario actual.
   * Método placeholder que debe ser implementado según las necesidades.
   */
  getUserRole(): string | null {
    return null;
  }

  /**
   * Renueva el token de acceso utilizando el refresh token.
   * Implementa la misma lógica que ApiService pero como método público.
   */
  async refreshAccessToken(): Promise<void> {
    try {
      // Obtenemos el refresh token almacenado
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }
      
      // Realizamos la petición de renovación
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

      // Guardamos el nuevo token de acceso
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
    } catch (error) {
      console.error('❌ Error al renovar token:', error);
      this.clearSession();
      throw error;
    }
  }

}

// Exportamos una instancia única del servicio de autenticación
export default new AuthService();