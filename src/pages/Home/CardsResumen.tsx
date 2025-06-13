import React from 'react';
import { CardsResumenProps } from '../../interfaces';

/**
 * Componente que renderiza las tarjetas de resumen del dashboard.
 * Muestra estadísticas del usuario o del club en un formato de cuadrícula.
 */
const CardsResumen: React.FC<CardsResumenProps> = ({ partidosJugados, nivel, victorias, torneos, isClubDashboard = false }) => {
  
  // Configurar las tarjetas según el tipo de dashboard (usuario o club)
  const cards = isClubDashboard ? [
    { titulo: 'Miembros Club', valor: partidosJugados },
    { titulo: 'Total Reservas', valor: nivel },
    { titulo: 'Total Pistas', valor: victorias },
    { titulo: 'Ingresos Mes', valor: torneos },
  ] : [
    { titulo: 'Reservas Activas', valor: partidosJugados },
    { titulo: 'Partidos Jugados', valor: nivel },
    { titulo: 'Última Reserva', valor: victorias },
    { titulo: 'Frecuencia', valor: torneos },
  ];

  return (
    <div className="cards-resumen-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="card-resumen">
          <div className="card-titulo">{card.titulo}</div>
          <div className="card-valor">{card.valor}</div>
        </div>
      ))}
    </div>
  );
};

export default CardsResumen;