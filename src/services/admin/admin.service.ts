import apiService from '../api.service';

export interface AdminDashboardStats {
  totalUsers: number;
  totalClubs: number;
  totalReservations: number;
  totalRevenue: number;
  activeUsers: number;
  recentUsers: any[];
  recentClubs: any[];
  monthlyGrowth: {
    users: number;
    reservations: number;
    revenue: number;
  };
  currentMonth: {
    users: number;
    reservations: number;
    revenue: number;
  };
  previousMonth: {
    users: number;
    reservations: number;
    revenue: number;
  };
}

export interface SolicitudClub {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
  };
  nombre_club: string;
  descripcion: string;
  direccion: string;
  telefono?: string;
  email?: string;
  horario_apertura: string;
  horario_cierre: string;
  sitio_web?: string;
  redes_sociales?: any;
  imagen_url?: string;
  motivo_solicitud: string;
  experiencia_previa?: string;
  numero_pistas_estimado?: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fecha_solicitud: string;
  fecha_respuesta?: string;
  comentarios_admin?: string;
  motivo_rechazo?: string;
}

class AdminService {
  /**
   * Obtiene estadísticas para el dashboard administrativo
   */
  async getDashboardStats(): Promise<AdminDashboardStats | null> {
    try {
      const response = await apiService.get<AdminDashboardStats>('/admin/stats/dashboard');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las solicitudes de club
   */
  async getSolicitudesClub(estado?: string) {
    try {
      const url = estado ? `/admin/solicitudes-club?estado=${estado}` : '/admin/solicitudes-club';
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error al obtener solicitudes de club:', error);
      throw error;
    }
  }

  /**
   * Aprueba una solicitud de club
   */
  async aprobarSolicitudClub(solicitudId: number, data: { comentarios?: string }) {
    try {
      const response = await apiService.post(`/admin/solicitudes-club/${solicitudId}/aprobar`, data);
      return response;
    } catch (error) {
      console.error('Error al aprobar solicitud de club:', error);
      throw error;
    }
  }

  /**
   * Rechaza una solicitud de club
   */
  async rechazarSolicitudClub(solicitudId: number, data: { motivo_rechazo: string; comentarios?: string }) {
    try {
      const response = await apiService.post(`/admin/solicitudes-club/${solicitudId}/rechazar`, data);
      return response;
    } catch (error) {
      console.error('Error al rechazar solicitud de club:', error);
      throw error;
    }
  }
}

export default new AdminService();