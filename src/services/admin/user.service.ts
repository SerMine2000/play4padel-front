import apiService from '../api.service';

export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  id_rol: number;
  id_club_socio?: number;
  fecha_registro: string;
  activo: boolean;
  ultima_conexion?: string;
  avatar_url?: string;
  bio?: string;
  rol?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface UserFormData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  id_rol: number;
  id_club_socio?: number;
  avatar_url?: string;
  bio?: string;
  password?: string;
}

export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
}

class UsersService {
  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>('/users');
      return response || [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario específico por ID
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const response = await apiService.get<User>(`/user/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: UserFormData): Promise<any> {
    try {
      const response = await apiService.post('/create-user', userData);
      return response;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(id: number, userData: Partial<UserFormData>): Promise<any> {
    try {
      const response = await apiService.put(`/update-user/${id}`, userData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateUserProfile(id: number, profileData: Partial<UserFormData>): Promise<any> {
    try {
      const response = await apiService.put(`/user/${id}`, profileData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar perfil del usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(id: number): Promise<any> {
    try {
      const response = await apiService.delete(`/delete-user/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   */
  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response = await apiService.put('/update-password', {
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword
      });
      return response;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  /**
   * Añade un socio a un club
   */
  async addClubMember(userId: number, clubId: number): Promise<any> {
    try {
      const response = await apiService.post('/add-club-member', {
        user_id: userId,
        club_id: clubId
      });
      return response;
    } catch (error) {
      console.error('Error al añadir socio al club:', error);
      throw error;
    }
  }

  /**
   * Remueve un socio de un club
   */
  async removeClubMember(userId: number): Promise<any> {
    try {
      const response = await apiService.post('/remove-club-member', {
        user_id: userId
      });
      return response;
    } catch (error) {
      console.error('Error al remover socio del club:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo rol (solo administradores)
   */
  async createRole(roleName: string, description?: string, permissions?: any): Promise<any> {
    try {
      const response = await apiService.post('/create-role', {
        nombre: roleName,
        descripcion: description,
        permisos: permissions
      });
      return response;
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  }

  /**
   * Obtiene usuarios disponibles para ser administradores de club
   * (usuarios que no sean ya administradores)
   */
  async getAvailableAdministrators(): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      // Filtrar usuarios que pueden ser administradores
      // Excluir usuarios que ya sean administradores de club o que tengan rol ADMIN
      return allUsers.filter(user => 
        user.rol?.nombre !== 'ADMIN' && 
        user.rol?.nombre !== 'CLUB' && 
        user.activo
      );
    } catch (error) {
      console.error('Error al obtener administradores disponibles:', error);
      throw error;
    }
  }
}

export default new UsersService();
