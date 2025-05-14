// src/pages/MarcadorView.tsx
import React from 'react';

interface Props {
  estado: {
    puntos: any;
    juegos: any;
    sets: Array<any>;
    tie_break: boolean;
    terminado: boolean;
  };
  estilo?: 'simple' | 'completo';
}

const MarcadorView: React.FC<Props> = ({ estado, estilo = 'simple' }) => {
  // Verificación de datos completa con valores por defecto
  const setActual = estado && estado.sets && estado.sets.length > 0
    ? estado.sets[estado.sets.length - 1]
    : { A: 0, B: 0 };
  
  const juegos = estado && estado.juegos ? estado.juegos : { A: 0, B: 0 };
  const puntos = estado && estado.puntos ? estado.puntos : { A: 0, B: 0 };
  const enTieBreak = estado && estado.tie_break ? estado.tie_break : false;
  const partidoTerminado = estado && estado.terminado ? estado.terminado : false;

  // Si no hay datos de estado, mostrar un estado de carga
  if (!estado) {
    return (
      <div>
        <h2>Marcador</h2>
        <p>Cargando datos del marcador...</p>
      </div>
    );
  }

  // Si estilo es completo, usar el diseño avanzado con clases CSS
  if (estilo === 'completo') {
    return (
      <div className="marcador-container">
        <div className="equipo equipo-a">
          <h2>Equipo A</h2>
          <p>Sets: {setActual.A}</p>
          <p>Juegos: {juegos.A}</p>
          <p className="puntos">{puntos.A}</p>
        </div>
        <div className="separador">VS</div>
        <div className="equipo equipo-b">
          <h2>Equipo B</h2>
          <p>Sets: {setActual.B}</p>
          <p>Juegos: {juegos.B}</p>
          <p className="puntos">{puntos.B}</p>
        </div>
        {enTieBreak && <p className="estado-info">En Tie-Break</p>}
        {partidoTerminado && <p className="estado-fin">¡Partido Terminado!</p>}
      </div>
    );
  }

  // Diseño simple (por defecto)
  return (
    <div>
      <h2>Marcador</h2>
      <p><strong>Set actual:</strong> A {setActual.A} - B {setActual.B}</p>
      <p><strong>Juegos:</strong> A {juegos.A} - B {juegos.B}</p>
      <p><strong>Puntos:</strong> A {puntos.A} - B {puntos.B}</p>
      {enTieBreak && <p><em>En tie-break</em></p>}
      {partidoTerminado && <p><strong>¡Partido Terminado!</strong></p>}
    </div>
  );
};

export default MarcadorView;