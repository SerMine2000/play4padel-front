import React, { useEffect, useState } from 'react';
import ProximasReservas, { Reserva } from './ProximasReservas';
import EstadoPistas, { Pista } from './EstadoPistas';
import CardsResumen from './CardsResumen';
import './Home.css';
import { useAuth } from '../../context/AuthContext';
import BienvenidaDashboard from './BienvenidaDashboard';
import { useTheme } from '../../context/ThemeContext';

const DashboardClub: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [esMobile, setEsMobile] = useState(window.innerWidth <= 768);

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

  const partidosJugados: string | number =
    user && typeof (user as any).partidosJugados === 'number'
      ? (user as any).partidosJugados
      : '-';

  const nivel: string | number =
    user && (typeof (user as any).nivel === 'number' || typeof (user as any).nivel === 'string')
      ? (user as any).nivel
      : '-';

  const victorias: string | number =
    user && typeof (user as any).victorias === 'number'
      ? (user as any).victorias
      : '-';

  const torneos: string | number =
    user && typeof (user as any).torneos === 'number'
      ? (user as any).torneos
      : '-';

  const clubesUsuario = user && 'clubs' in user && Array.isArray(user.clubs) ? user.clubs : [];

  const reservas: Reserva[] =
    user && 'reservas' in user && Array.isArray(user.reservas)
      ? user.reservas.map((reserva: any) => {
          let clubNombre = '';
          if (reserva.clubId && clubesUsuario.length > 0) {
            const club = clubesUsuario.find(
              (c: any) => c.id?.toString() === reserva.clubId?.toString()
            );
            if (club) clubNombre = club.nombre;
          }
          return {
            ...reserva,
            clubNombre,
          };
        })
      : [];

  const pistas: Pista[] = user && 'pistas' in user && Array.isArray(user.pistas) ? user.pistas : [];

  return (
    <div
      className={`dashboard-contenido ${esMobile ? 'mobile' : 'desktop'}`}
      style={{ backgroundColor: theme === 'dark' ? '#18191a' : '#f8f9fa' }}
    >
      <BienvenidaDashboard />
      <CardsResumen
        partidosJugados={partidosJugados}
        nivel={nivel}
        victorias={victorias}
        torneos={torneos}
      />
      <div className="reservas-y-pistas">
        <ProximasReservas reservas={reservas} />
        <EstadoPistas />
      </div>
    </div>
  );
};

export default DashboardClub;