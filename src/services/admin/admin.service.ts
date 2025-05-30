import apiService from '../api.service';

export interface AdminDashboardStats {
  totalUsers: number;
  totalClubs: number;
  totalReservations: number;
  totalRevenue: number;
  activeUsers: number;
  pendingReservations: number;
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

export interface UserStats {
  roleDistribution: { [key: string]: number };
  activeUsers: number;
  inactiveUsers: number;
  monthlyRegistrations: Array<{
    month: string;
    count: number;
  }>;
}

export interface ClubStats {
  activeClubs: number;
  inactiveClubs: number;
  topClubs: Array<{
    id: number;
    nombre: string;
    total_reservations: number;
  }>;
}

export interface ReservationStats {
  reservationsByStatus: { [key: string]: number };
  reservationsByWeekday: Array<{
    day: string;
    count: number;
  }>;
}

class AdminStatsService {
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
   * Obtiene estadísticas detalladas de usuarios
   */
  async getUserStats(): Promise<UserStats | null> {
    try {
      const response = await apiService.get<UserStats>('/admin/stats/users');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas detalladas de clubes
   */
  async getClubStats(): Promise<ClubStats | null> {
    try {
      const response = await apiService.get<ClubStats>('/admin/stats/clubs');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas de clubes:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas detalladas de reservas
   */
  async getReservationStats(): Promise<ReservationStats | null> {
    try {
      const response = await apiService.get<ReservationStats>('/admin/stats/reservations');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas de reservas:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las estadísticas de una vez
   */
  async getAllStats(): Promise<{
    dashboard: AdminDashboardStats | null;
    users: UserStats | null;
    clubs: ClubStats | null;
    reservations: ReservationStats | null;
  }> {
    try {
      const [dashboard, users, clubs, reservations] = await Promise.all([
        this.getDashboardStats(),
        this.getUserStats(),
        this.getClubStats(),
        this.getReservationStats()
      ]);

      return {
        dashboard,
        users,
        clubs,
        reservations
      };
    } catch (error) {
      console.error('Error al obtener todas las estadísticas:', error);
      throw error;
    }
  }
}

export default new AdminStatsService();