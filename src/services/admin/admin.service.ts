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
}

export default new AdminStatsService();