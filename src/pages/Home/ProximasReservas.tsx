import React from 'react';
import { IonCard } from '@ionic/react';
import './Home.css';

export interface Reserva {
  pista: string;
  clubNombre: string;
  fecha: string; // Ejemplo: "2025-04-24 - 18:00"
}

interface ProximasReservasProps {
  reservas: Reserva[];
}

const ProximasReservas: React.FC<ProximasReservasProps> = ({ reservas }) => {
  return (
    <div className="proximas-reservas">
      <h2>Próximas Reservas</h2>
      {reservas.length === 0 && <div className="sin-reservas">No tienes próximas reservas.</div>}
      {reservas.map((reserva, idx) => (
        <IonCard className="reserva-card" key={idx}>
          <div className="info">
            <p className="reserva-pista">{reserva.pista}</p>
            <p className="reserva-club">{reserva.clubNombre}</p>
          </div>
          <div className="reserva-fecha">
            {reserva.fecha}
          </div>
        </IonCard>
      ))}
    </div>
  );
};

export default ProximasReservas;
