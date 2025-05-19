import { CardsResumenProps } from '../../interfaces';

const CardsResumen: React.FC<CardsResumenProps> = ({ partidosJugados, nivel, victorias, torneos }) => {
  const cards = [
    { titulo: 'Partidos Jugados', valor: partidosJugados },
    { titulo: 'Nivel', valor: nivel },
    { titulo: 'Victorias', valor: victorias },
    { titulo: 'Torneos', valor: torneos },
  ];

  return (
    <div className="cards-resumen-grid">
      {cards.map((card, idx) => (
        <div className="card-resumen" key={idx}>
          <div className="card-titulo">{card.titulo}</div>
          <div className="card-valor">{card.valor}</div>
        </div>
      ))}
    </div>
  );
};
