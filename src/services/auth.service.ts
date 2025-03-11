// src/services/auth.service.ts
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../interfaces';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import apiService from './api.service';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post(API_ENDPOINTS.LOGIN, credentials);
    
    // Guardar información del usuario en localStorage
    localStorage.setItem(STORAGE_KEYS.USER_ID, response.user_id.toString());
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, response.role);
    
    return response;
  }
  
  async register(userData: RegisterRequest): Promise<void> {
    await apiService.post(API_ENDPOINTS.REGISTER, userData);
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
    return await apiService.get(`${API_ENDPOINTS.USER}/${userId}`);
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