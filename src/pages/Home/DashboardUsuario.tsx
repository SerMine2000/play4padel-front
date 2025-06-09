import React, { useEffect, useState } from 'react';
import ProximasReservas from './ProximasReservas';
import EstadoPistas from './EstadoPistas';
import CardsResumen from './CardsResumen';
import './Home.css';
import { useAuth } from '../../context/AuthContext';
import BienvenidaDashboard from './BienvenidaDashboard';
import axios from 'axios';

const DashboardUsuario: React.FC = () => {
  const { user } = useAuth();
  const [esMobile, setEsMobile] = useState(window.innerWidth <= 768);
  const [userStats, setUserStats] = useState({
    reservasActivas: '-' as string | number,
    partidosJugados: '-' as string | number,
    ultimaReserva: '-' as string | number,
    frecuenciaSemanal: '-' as string | number
  });

  useEffect(() => {
    const manejarCambioTamaño = () => {
      setEsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', manejarCambioTamaño);
    manejarCambioTamaño();
    
    return () => {
      window.removeEventListener('resize', manejarCambioTamaño);
    };
  }, []);

  useEffect(() => {
    const cargarEstadisticasUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        // Obtener reservas del usuario
        const reservasResponse = await axios.get(`http://localhost:5000/reservas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const todasReservas = reservasResponse.data || [];
        const reservasUsuario = todasReservas.filter((r: any) => r.id_usuario === user.id);
        const reservasActivas = reservasUsuario.filter((r: any) => r.estado === 'confirmada').length;

        // Calcular última reserva (basado en la fecha programada, no en cuándo se creó)
        let ultimaReserva = 'Nunca';
        if (reservasUsuario.length > 0) {
          // Filtrar solo reservas pasadas (ya jugadas) y ordenar por fecha programada
          const reservasPasadas = reservasUsuario.filter((r: any) => {
            const fechaReserva = new Date(r.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Solo comparar fechas, no horas
            return fechaReserva < hoy;
          });

          if (reservasPasadas.length > 0) {
            const reservasOrdenadas = reservasPasadas.sort((a: any, b: any) => 
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            const fechaUltimaReserva = new Date(reservasOrdenadas[0].fecha);
            const ahora = new Date();
            ahora.setHours(0, 0, 0, 0);
            const diferenciaDias = Math.floor((ahora.getTime() - fechaUltimaReserva.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diferenciaDias === 0) {
              ultimaReserva = 'Hoy';
            } else if (diferenciaDias === 1) {
              ultimaReserva = 'Ayer';
            } else if (diferenciaDias < 7) {
              ultimaReserva = `Hace ${diferenciaDias} días`;
            } else {
              ultimaReserva = `Hace ${Math.floor(diferenciaDias / 7)} sem`;
            }
          }
        }

        // Calcular frecuencia semanal (últimas 4 semanas)
        let frecuenciaSemanal = '💤 Inactivo';
        if (reservasUsuario.length > 0) {
          const hace4Semanas = new Date();
          hace4Semanas.setDate(hace4Semanas.getDate() - 28);
          
          const reservasUltimas4Semanas = reservasUsuario.filter((r: any) => 
            new Date(r.fecha_reserva) >= hace4Semanas
          );
          
          const promedio = reservasUltimas4Semanas.length / 4;
          
          if (promedio >= 3) {
            frecuenciaSemanal = '🔥 Muy activo';
          } else if (promedio >= 1.5) {
            frecuenciaSemanal = '⚡ Activo';
          } else if (promedio >= 0.5) {
            frecuenciaSemanal = '📅 Regular';
          } else if (promedio > 0) {
            frecuenciaSemanal = '🌱 Esporádico';
          }
        }

        // Datos del usuario (placeholder por ahora hasta tener estos campos en la BD)
        const partidosJugados = (user as any).partidos_jugados || 0;

        setUserStats({
          reservasActivas,
          partidosJugados,
          ultimaReserva,
          frecuenciaSemanal
        });

      } catch (error) {
        console.error('Error cargando estadísticas del usuario:', error);
      }
    };

    if (user) {
      cargarEstadisticasUsuario();
    }
  }, [user]);

  return (
    <div className="home-container">
      <div className="home-content">
        <div
          className={`dashboard-contenido ${esMobile ? 'mobile' : 'desktop'}`}
        >
          <BienvenidaDashboard />
          <CardsResumen
            partidosJugados={userStats.reservasActivas}
            nivel={userStats.partidosJugados}
            victorias={userStats.ultimaReserva}
            torneos={userStats.frecuenciaSemanal}
            isClubDashboard={false}
          />
          <div className="reservas-y-pistas">
            <ProximasReservas />
            <EstadoPistas />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsuario;