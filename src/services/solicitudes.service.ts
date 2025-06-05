import apiService from './api.service';

export interface SolicitudClubData {
  nombre_club: string;
  descripcion?: string;
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
}

export interface MiSolicitudClub {
  id: number;
  nombre_club: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fecha_solicitud: string;
  fecha_respuesta?: string;
  motivo_rechazo?: string;
  comentarios_admin?: string;
}

class SolicitudesService {
  /**
   * Envía una solicitud para crear un club
   */
  async solicitarClub(data: SolicitudClubData) {
    try {
      const response = await apiService.post('/solicitar-club', data);
      return response;
    } catch (error) {
      console.error('Error al enviar solicitud de club:', error);
      throw error;
    }
  }

  /**
   * Obtiene las solicitudes de club del usuario actual
   */
  async misSolicitudesClub(): Promise<{ data: MiSolicitudClub[] }> {
    try {
      const response = await apiService.get('/mis-solicitudes-club');
      return response;
    } catch (error) {
      console.error('Error al obtener mis solicitudes de club:', error);
      throw error;
    }
  }
}

export default new SolicitudesService();