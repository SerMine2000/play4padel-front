import ApiService from './api.service';
import { API_ENDPOINTS } from '../utils/constants';
import { Torneo, ParejaTorneo, Partido } from '../interfaces';

export class TorneosService {
  // Obtener todos los torneos
  static async getTorneos(): Promise<Torneo[]> {
    const response = await ApiService.get(API_ENDPOINTS.TORNEOS);
    return response || [];
  }

  // Obtener detalles de un torneo
  static async getTorneo(id: number): Promise<Torneo | null> {
    return await ApiService.get(API_ENDPOINTS.TORNEO_DETALLE(id));
  }

  // Crear un nuevo torneo
  static async createTorneo(torneoData: Partial<Torneo>) {
    return await ApiService.post(API_ENDPOINTS.CREAR_TORNEO, torneoData);
  }

  // Actualizar un torneo
  static async updateTorneo(id: number, torneoData: Partial<Torneo>) {
    return await ApiService.put(API_ENDPOINTS.TORNEO_DETALLE(id), torneoData);
  }

  // Eliminar un torneo
  static async deleteTorneo(id: number) {
    return await ApiService.delete(API_ENDPOINTS.TORNEO_DETALLE(id));
  }

  // Inscribir pareja en torneo
  static async inscribirPareja(
    torneoId: number, 
    parejaData: { jugador1_id: number; jugador2_id: number; categoria: string }
  ) {
    return await ApiService.post(API_ENDPOINTS.INSCRIBIR_PAREJA_TORNEO(torneoId), parejaData);
  }

  // Obtener parejas de un torneo
  static async getParejasTorneo(torneoId: number): Promise<ParejaTorneo[]> {
    const response = await ApiService.get(`${API_ENDPOINTS.TORNEOS}/${torneoId}/parejas`);
    return response || [];
  }

  // Generar fixture
  static async generarFixture(torneoId: number) {
    return await ApiService.post(API_ENDPOINTS.GENERAR_FIXTURE(torneoId), {});
  }

  // Obtener partidos de un torneo
  static async getPartidosTorneo(torneoId: number): Promise<Partido[]> {
    const response = await ApiService.get(`${API_ENDPOINTS.TORNEOS}/${torneoId}/partidos`);
    return response || [];
  }

  // Avanzar ronda
  static async avanzarRonda(torneoId: number, rondaActual: string) {
    return await ApiService.post(API_ENDPOINTS.AVANZAR_RONDA(torneoId, rondaActual), {});
  }

  // Crear cuadro de consolación
  static async crearConsolacion(torneoId: number, rondaOrigen: string) {
    return await ApiService.post(API_ENDPOINTS.CREAR_CONSOLACION(torneoId, rondaOrigen), {});
  }
}

export default TorneosService;