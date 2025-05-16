import React from 'react';
import ProximasReservas, { Reserva } from './ProximasReservas';
import EstadoPistas, { Pista } from './EstadoPistas';
import CardsResumen from './CardsResumen';
import './Home.css';
import { useAuth } from '../../context/AuthContext';
import BienvenidaDashboard from './BienvenidaDashboard';
import { useTheme } from '../../context/ThemeContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

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

  const userClubs = user && 'clubs' in user && Array.isArray(user.clubs) ? user.clubs : [];

  const reservas: Reserva[] =
    user && 'reservas' in user && Array.isArray(user.reservas)
      ? user.reservas.map((reserva: any) => {
          let clubNombre = '';
          if (reserva.clubId && userClubs.length > 0) {
            const club = userClubs.find(
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
      className="dashboard-contenido"
      style={{ backgroundColor: theme === 'dark' ? '#18191a' : '#f8f9fa', minHeight: '100vh' }}
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

export default Home;