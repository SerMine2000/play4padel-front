import React, { useState, useEffect, useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownSharp, businessSharp } from 'ionicons/icons';
import apiService from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

export interface Pista {
  id: string;
  numero?: string;
  nombre?: string;
  estado: 'disponible' | 'ocupada' | 'mantenimiento' | 'cerrada' | 'Disponible' | 'Ocupada' | 'Mantenimiento' | 'Cerrada';
}

interface Club {
  id: string;
  nombre: string;
  pistas: Pista[];
}

const EstadoPistas: React.FC = () => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [clubSeleccionado, setClubSeleccionado] = useState<Club | null>(null);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Función para obtener el club de la última reserva
  const obtenerClubUltimaReserva = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      console.log('🔍 Buscando última reserva del usuario para determinar club por defecto...');
      
      let endpoint = '';
      if (user.role?.toUpperCase() === 'CLUB' || user.id_rol?.toUpperCase() === 'CLUB') {
        endpoint = `/reservas?id_club=${user.id}`;
      } else {
        endpoint = `/reservas?id_usuario=${user.id}`;
      }
      
      const reservas = await apiService.get(endpoint);
      console.log('📋 Reservas obtenidas para club por defecto:', reservas);
      
      if (!reservas || !Array.isArray(reservas) || reservas.length === 0) {
        console.log('📭 No hay reservas, no se puede determinar club por defecto');
        return null;
      }
      
      // Ordenar por fecha_reserva o por fecha más reciente
      const reservasOrdenadas = reservas.sort((a: any, b: any) => {
        const fechaA = new Date(a.fecha_reserva || a.fecha || 0);
        const fechaB = new Date(b.fecha_reserva || b.fecha || 0);
        return fechaB.getTime() - fechaA.getTime(); // Más reciente primero
      });
      
      const ultimaReserva = reservasOrdenadas[0];
      console.log('📅 Última reserva encontrada:', ultimaReserva);
      
      // Obtener información de la pista para saber el club
      if (ultimaReserva.id_pista) {
        try {
          const pista = await apiService.get(`/pistas/${ultimaReserva.id_pista}`);
          console.log('🎾 Pista de la última reserva:', pista);
          
          if (pista && pista.id_club) {
            console.log(`✅ Club por defecto determinado: ${pista.id_club}`);
            return pista.id_club.toString();
          }
        } catch (error) {
          console.log('❌ Error obteniendo información de la pista:', error);
        }
      }
      
      // Fallback: si hay información de club directamente en la reserva
      if (ultimaReserva.id_club) {
        console.log(`✅ Club por defecto desde reserva: ${ultimaReserva.id_club}`);
        return ultimaReserva.id_club.toString();
      }
      
      console.log('⚠️ No se pudo determinar el club de la última reserva');
      return null;
      
    } catch (error) {
      console.error('❌ Error obteniendo club de última reserva:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        let clubs: Club[] = [];
        
        if (user?.role.toUpperCase() === 'CLUB') {
          // Si es un club, solo mostrar su propio club
          const clubData = await apiService.get(`/clubs/${user.id}`);
          clubs = [clubData];
          setClubSeleccionado(clubData);
          await fetchPistasDelClub(clubData.id);
        } else {
          // Si es usuario/socio, mostrar todos los clubes disponibles
          const clubsResponse = await apiService.get<Club[]>('/clubs');
          clubs = clubsResponse || [];
          
          if (clubs.length === 0) {
            console.warn('No se encontraron clubes disponibles');
            return;
          }
          
          // Determinar club por defecto basado en última reserva
          const clubUltimaReserva = await obtenerClubUltimaReserva();
          
          let clubPorDefecto = null;
          
          if (clubUltimaReserva) {
            // Buscar el club de la última reserva
            clubPorDefecto = clubs.find((c: Club) => c.id.toString() === clubUltimaReserva);
            if (clubPorDefecto) {
              console.log(`🎯 Usando club de última reserva como defecto: ${clubPorDefecto.nombre}`);
            }
          }
          
          // Fallback: club guardado en localStorage
          if (!clubPorDefecto) {
            const clubGuardado = localStorage.getItem('clubSeleccionadoPistas');
            if (clubGuardado) {
              clubPorDefecto = clubs.find((c: Club) => c.id.toString() === clubGuardado);
              if (clubPorDefecto) {
                console.log(`💾 Usando club guardado como defecto: ${clubPorDefecto.nombre}`);
              }
            }
          }
          
          // Establecer club por defecto
          if (clubPorDefecto) {
            setClubSeleccionado(clubPorDefecto);
            await fetchPistasDelClub(clubPorDefecto.id);
          } else if (clubs.length > 0) {
            // Último fallback: primer club de la lista
            console.log(`🔄 Usando primer club como defecto: ${clubs[0].nombre}`);
            setClubSeleccionado(clubs[0]);
            await fetchPistasDelClub(clubs[0].id);
          }
        }
        
        setClubes(clubs);
      } catch (error) {
        console.error('Error cargando clubes:', error);
        setClubes([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchPistasDelClub = async (clubId: string) => {
      try {
        const pistasData = await apiService.get(`/clubs/${clubId}/pistas`);
        setPistas(pistasData || []);
      } catch (error) {
        console.error('Error cargando pistas:', error);
        setPistas([]);
      }
    };

    fetchClubs();
  }, [user]);

  // Función para cargar pistas de un club específico
  const fetchPistasDelClub = async (clubId: string) => {
    try {
      const pistasData = await apiService.get(`/clubs/${clubId}/pistas`);
      setPistas(pistasData || []);
    } catch (error) {
      console.error('Error cargando pistas:', error);
      setPistas([]);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectClub = async (club: Club) => {
    setClubSeleccionado(club);
    setShowDropdown(false);
    
    // Solo guardar en localStorage si es usuario/socio
    if (user?.role.toUpperCase() !== 'CLUB') {
      localStorage.setItem('clubSeleccionadoPistas', club.id);
    }

    // Cargar pistas del club seleccionado
    try {
      const pistasData = await apiService.get(`/clubs/${club.id}/pistas`);
      setPistas(pistasData || []);
    } catch (error) {
      console.error('Error cargando pistas del club:', error);
      setPistas([]);
    }
  };

  const toggleDropdown = () => {
    if (user?.role.toUpperCase() !== 'CLUB') {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="estado-pistas">
      <div className="estado-pistas-header">
        <div>
          <h2>Estado de las Pistas</h2>
          {clubSeleccionado && (
            <div className="club-nombre-bajo">{clubSeleccionado.nombre}</div>
          )}
        </div>

        {/* Nuevo dropdown selector solo para usuarios/socios */}
        {user?.role.toUpperCase() !== 'CLUB' && (
          <div className="club-selector-dropdown" ref={dropdownRef}>
            <button 
              className="club-selector-button" 
              onClick={toggleDropdown}
              disabled={loading}
            >
              {clubSeleccionado ? 'Cambiar club' : 'Seleccionar club'}
              <IonIcon icon={chevronDownSharp} />
            </button>

            {showDropdown && (
              <div className="club-dropdown-content">
                {loading ? (
                  <div className="club-dropdown-item" style={{ 
                    justifyContent: 'center', 
                    opacity: 0.7,
                    cursor: 'default'
                  }}>
                    Cargando clubes...
                  </div>
                ) : (
                  clubes.map((club) => (
                    <div
                      key={club.id}
                      className="club-dropdown-item"
                      onClick={() => handleSelectClub(club)}
                    >
                      <IonIcon icon={businessSharp} />
                      {club.nombre}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!clubSeleccionado ? (
        <div className="sin-reservas-centrado">
          {user?.role.toUpperCase() === 'CLUB' 
            ? 'Cargando información del club...'
            : 'Selecciona un club para ver el estado de las pistas.'
          }
        </div>
      ) : pistas.length === 0 ? (
        <div className="sin-reservas-centrado">
          No hay pistas disponibles en este club.
        </div>
      ) : (
        <div className="estado-pistas-grid-2col">
          {pistas.map((pista) => (
            <div className="estado-pista-row" key={pista.id}>
              <span className="pista-nombre">
                {pista.nombre || `Pista ${pista.numero || pista.id}`}
              </span>
              <span
                className={`estado-badge ${
                  pista.estado.toLowerCase() === 'disponible'
                    ? 'disponible'
                    : pista.estado.toLowerCase() === 'ocupada'
                    ? 'ocupada'
                    : pista.estado.toLowerCase() === 'cerrada'
                    ? 'cerrada'
                    : 'mantenimiento'
                }`}
              >
                {pista.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstadoPistas;
