import ApiService from './api.service';
import { API_ENDPOINTS } from '../utils/constants';
import { Liga, ParejasLiga, Partido } from '../interfaces';

export class LigasService {
  // Obtener todas las ligas
  static async getLigas(): Promise<Liga[]> {
    const response = await ApiService.get(API_ENDPOINTS.LIGAS);
    return response || [];
  }

  // Obtener detalles de una liga
  static async getLiga(id: number): Promise<Liga | null> {
    return await ApiService.get(API_ENDPOINTS.LIGA_DETALLE(id));
  }

  // Crear una nueva liga
  static async createLiga(ligaData: Partial<Liga>) {
    return await ApiService.post(API_ENDPOINTS.LIGAS, ligaData);
  }

  // Actualizar una liga
  static async updateLiga(id: number, ligaData: Partial<Liga>) {
    return await ApiService.put(API_ENDPOINTS.LIGA_DETALLE(id), ligaData);
  }

  // Eliminar una liga
  static async deleteLiga(id: number) {
    return await ApiService.delete(API_ENDPOINTS.LIGA_DETALLE(id));
  }

  // Inscribir pareja en liga
  static async inscribirPareja(
    ligaId: number, 
    parejaData: { id_jugador1: number; id_jugador2: number; nombre_equipo: string }
  ) {
    return await ApiService.post(API_ENDPOINTS.INSCRIBIR_PAREJA_LIGA(ligaId), parejaData);
  }

  // Obtener parejas de una liga
  static async getParejasLiga(ligaId: number): Promise<ParejasLiga[]> {
    const response = await ApiService.get(API_ENDPOINTS.PAREJAS_LIGA(ligaId));
    return response || [];
  }

  // Eliminar pareja de liga
  static async eliminarPareja(parejaId: number) {
    return await ApiService.delete(API_ENDPOINTS.PAREJA_DETALLE(parejaId));
  }

  // Generar partidos (round robin)
  static async generarPartidos(ligaId: number) {
    return await ApiService.post(API_ENDPOINTS.GENERAR_PARTIDOS_LIGA(ligaId), {});
  }

  // Obtener partidos de una liga
  static async getPartidosLiga(ligaId: number): Promise<any[]> {
    const response = await ApiService.get(API_ENDPOINTS.PARTIDOS_LIGA(ligaId));
    return response || [];
  }

  // Registrar resultado de un partido
  static async registrarResultado(
    partidoId: number, 
    resultadoData: {
      resultado: string;
      ganador?: number;
      empate?: boolean;
      bonus_equipo1?: number;
      bonus_equipo2?: number;
    }
  ) {
    return await ApiService.put(API_ENDPOINTS.REGISTRAR_RESULTADO(partidoId), resultadoData);
  }

  // Obtener clasificación de una liga
  static async getClasificacion(ligaId: number): Promise<any[]> {
    const response = await ApiService.get(API_ENDPOINTS.CLASIFICACION_LIGA(ligaId));
    return response || [];
  }

  // Obtener estadísticas de una liga
  static async getEstadisticasLiga(ligaId: number) {
    try {
      const [parejas, partidos, clasificacion] = await Promise.all([
        this.getParejasLiga(ligaId),
        this.getPartidosLiga(ligaId),
        this.getClasificacion(ligaId)
      ]);

      const partidosJugados = partidos.filter(p => p.estado === 'finalizado').length;
      const totalPartidos = partidos.length;
      const porcentajeCompletado = totalPartidos > 0 ? (partidosJugados / totalPartidos) * 100 : 0;

      return {
        totalParejas: parejas.length,
        totalPartidos,
        partidosJugados,
        partidosPendientes: totalPartidos - partidosJugados,
        porcentajeCompletado: Math.round(porcentajeCompletado),
        clasificacion: clasificacion.slice(0, 3), // Top 3
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}

export default LigasService;