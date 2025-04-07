// src/components/MarcadorView.tsx
import React from 'react';

interface Props {
  estado: {
    puntos: any;
    juegos: any;
    sets: Array<any>;
    tie_break: boolean;
    terminado: boolean;
  };
}

const MarcadorView: React.FC<Props> = ({ estado }) => {
  // Verificar si estado existe antes de usarlo
  if (!estado) {
    return <div>Cargando marcador...</div>;
  }

  // Verificar si estado.sets existe y tiene elementos
  const setActual = estado.sets && estado.sets.length > 0 
    ? estado.sets[estado.sets.length - 1] 
    : { A: 0, B: 0 };

  return (
    <div>
      <h2>Marcador</h2>
      <p><strong>Set actual:</strong> A {setActual.A} - B {setActual.B}</p>
      <p><strong>Juegos:</strong> A {estado.juegos?.A || 0} - B {estado.juegos?.B || 0}</p>
      <p><strong>Puntos:</strong> A {estado.puntos?.A || 0} - B {estado.puntos?.B || 0}</p>
      {estado.tie_break && <p><em>En tie-break</em></p>}
      {estado.terminado && <p><strong>¡Partido Terminado!</strong></p>}
    </div>
  );
};

export default MarcadorView;