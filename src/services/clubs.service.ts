import apiService from './api.service';

export interface Club {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  horario_apertura: string;
  horario_cierre: string;
  id_administrador: number;
  fecha_registro: string;
  activo: boolean;
  imagen_url?: string;
  sitio_web?: string;
  redes_sociales?: any;
  total_pistas?: number;
}

export interface ClubFormData {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  horario_apertura: string;
  horario_cierre: string;
  id_administrador: number;
  sitio_web?: string;
  imagen_url?: string;
  redes_sociales?: any;
}

class ClubsService {
  /**
   * Obtiene todos los clubes
   */
  async getAllClubs(filters?: { activo?: boolean, id_administrador?: number }): Promise<Club[]> {
    try {
      let endpoint = '/clubs';
      const params = new URLSearchParams();
      
      if (filters?.activo !== undefined) {
        params.append('activo', filters.activo.toString());
      }
      
      if (filters?.id_administrador) {
        params.append('id_administrador', filters.id_administrador.toString());
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await apiService.get<Club[]>(endpoint);
      return response || [];
    } catch (error) {
      console.error('Error al obtener clubes:', error);
      throw error;
    }
  }

  /**
   * Obtiene un club específico por ID
   */
  async getClubById(id: number): Promise<Club | null> {
    try {
      const response = await apiService.get<Club>(`/clubs/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener club ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo club
   */
  async createClub(clubData: ClubFormData): Promise<any> {
    try {
      const response = await apiService.post('/clubs', clubData);
      return response;
    } catch (error) {
      console.error('Error al crear club:', error);
      throw error;
    }
  }

  /**
   * Actualiza un club existente
   */
  async updateClub(id: number, clubData: Partial<ClubFormData>): Promise<any> {
    try {
      const response = await apiService.put(`/clubs/${id}`, clubData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar club ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activa o desactiva un club
   */
  async toggleClubStatus(id: number, activo: boolean): Promise<any> {
    try {
      if (activo) {
        // Activar club
        const response = await apiService.put(`/clubs/${id}`, { activo: true });
        return response;
      } else {
        // Desactivar club
        const response = await apiService.put(`/clubs/${id}/deactivate`, {});
        return response;
      }
    } catch (error) {
      console.error(`Error al cambiar estado del club ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un club permanentemente
   */
  async deleteClub(id: number): Promise<any> {
    try {
      const response = await apiService.delete(`/clubs/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al eliminar club ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el club que administra el usuario actual
   */
  async getMyClub(): Promise<Club | null> {
    try {
      const response = await apiService.get<Club>('/my-club');
      return response;
    } catch (error) {
      console.error('Error al obtener mi club:', error);
      throw error;
    }
  }
}

export default new ClubsService();
