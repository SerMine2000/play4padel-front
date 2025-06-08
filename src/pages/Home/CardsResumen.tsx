import React from 'react';
import { CardsResumenProps } from '../../interfaces';

const CardsResumen: React.FC<CardsResumenProps> = ({ partidosJugados, nivel, victorias, torneos, isClubDashboard = false }) => {
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

  // Función para detectar si un valor contiene emojis
  const hasEmoji = (text: string | number) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return typeof text === 'string' && emojiRegex.test(text);
  };

  return (
    <div className="cards-resumen-grid">
      {cards.map((card, idx) => (
        <div className="card-resumen" key={idx}>
          <div className="card-titulo">{card.titulo}</div>
          <div 
            className="card-valor" 
            data-has-emoji={hasEmoji(card.valor)}
          >
            {card.valor}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardsResumen;