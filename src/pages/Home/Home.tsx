import React from 'react';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/react';
import ProximasReservas, { Reserva } from './ProximasReservas';
import EstadoPistas, { Pista } from './EstadoPistas';
import CardsResumen from './CardsResumen';
import './Home.css';
import { useAuth } from '../../context/AuthContext';
import BienvenidaDashboard from './BienvenidaDashboard';
import { useTheme } from '../../context/ThemeContext';
import { moon, sunny } from 'ionicons/icons';
import DisposicionDashboard from '../../componentes/DisposicionDashboard';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Acceso temporal con casting any hasta que la interfaz User se extienda
  const partidosJugados: string | number = (user && typeof (user as any).partidosJugados === 'number') ? (user as any).partidosJugados : '-';
  const nivel: string | number = (user && (typeof (user as any).nivel === 'number' || typeof (user as any).nivel === 'string')) ? (user as any).nivel : '-';
  const victorias: string | number = (user && typeof (user as any).victorias === 'number') ? (user as any).victorias : '-';
  const torneos: string | number = (user && typeof (user as any).torneos === 'number') ? (user as any).torneos : '-';

  // Datos dinámicos para reservas y pistas
  // Adaptar reservas para incluir clubNombre
  const userClubs = (user && 'clubs' in user && Array.isArray(user.clubs)) ? user.clubs : [];
  const reservas: Reserva[] = (user && 'reservas' in user && Array.isArray(user.reservas))
    ? user.reservas.map((reserva: any) => {
        let clubNombre = '';
        if (reserva.clubId && userClubs.length > 0) {
          const club = userClubs.find((c: any) => c.id?.toString() === reserva.clubId?.toString());
          if (club) clubNombre = club.nombre;
        }
        return {
          ...reserva,
          clubNombre,
        };
      })
    : [];

  const pistas: Pista[] = (user && 'pistas' in user && Array.isArray(user.pistas)) ? user.pistas : [];

  return (
    <IonPage>
      <IonContent>
        <div>
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
