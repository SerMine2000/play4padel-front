// src/services/auth.service.ts
import { LoginRequest, LoginResponse, RegisterRequest, User, UpdatePasswordRequest } from '../interfaces';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import apiService from './api.service';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, credentials);
      
      // Guardar información del usuario en localStorage
      localStorage.setItem(STORAGE_KEYS.USER_ID, response.user_id.toString());
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, response.role);
      
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Error al iniciar sesión. Verifica tus credenciales.');
    }
  }
  
  async register(userData: RegisterRequest): Promise<void> {
    try {
      console.log("Enviando solicitud de creación de usuario", userData);
      // Si es registro como club, usamos un flujo diferente
      if (userData.tipo_cuenta === 'club') {
        console.log("Registrando como club:", userData);
        
        // Eliminar tipo_cuenta antes de enviar al backend
        const { tipo_cuenta, club_data, ...userDataToSend } = userData;
        
        // Registrar al usuario administrador primero
        const userResponse = await apiService.post(API_ENDPOINTS.REGISTER, userDataToSend);
        
        console.log("Respuesta de creación de usuario:", userResponse);
        
        // Luego registrar el club asociado al usuario
        if (club_data && userResponse?.user_id) {
          const clubData = {
            nombre: club_data.nombre,
            direccion: club_data.direccion,
            horario_apertura: club_data.horario_apertura,
            horario_cierre: club_data.horario_cierre,
            descripcion: club_data.descripcion || '',
            telefono: club_data.telefono || userData.telefono || '',
            email: club_data.email || userData.email,
            id_administrador: userResponse.user_id
          };
          
          console.log("Creando club con datos:", clubData);
          
          const clubResponse = await apiService.post(API_ENDPOINTS.CLUBS, clubData);
          console.log("Respuesta de creación de club:", clubResponse);
        } else {
          console.error("Falta información del club o ID de usuario:", { 
            clubData: club_data, 
            userId: userResponse?.user_id 
          });
          throw new Error('No se pudo crear el club: faltan datos necesarios');
        }
      } else {
        // Registro normal de usuario
        // Eliminar tipo_cuenta si existe
        const { tipo_cuenta, ...dataToSend } = userData;
        await apiService.post(API_ENDPOINTS.REGISTER, dataToSend);
      }
    } catch (error: any) {
      console.error("Error completo en register:", error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Error al registrar usuario. Inténtalo de nuevo.');
    }
  }
  
  async logout(userId: number): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT, { user_id: userId });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar localStorage incluso si la petición falla
      this.clearSession();
    }
  }
  
  async getCurrentUser(userId: number): Promise<User> {
    try {
      return await apiService.get(`${API_ENDPOINTS.USER}/${userId}`);
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Error al obtener información del usuario.');
    }
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    try {
      await apiService.put(API_ENDPOINTS.UPDATE_PASSWORD, data);
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Error al actualizar la contraseña.');
    }
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.USER_ID);
  }
  
  getUserId(): number | null {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  }
  
  getUserRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  }
  
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export default new AuthService();