import { useEffect, useState } from 'react';
import axios from 'axios';
import './css/MarcadorView.css';

/**
 * Página de visualización del marcador en formato de tablero deportivo.
 * Diseñada para mostrarse en una pantalla secundaria para los espectadores.
 */
const MarcadorPantalla: React.FC = () => {
  // Estado del marcador con valores iniciales seguros
  const [estado, setEstado] = useState<any>({
    puntos: { A: 0, B: 0 },
    juegos: { A: 0, B: 0 },
    sets: [{ A: 0, B: 0 }],
    tie_break: false,
    terminado: false
  });

  // Configuración personalizada
  const [config, setConfig] = useState<any>({
    nombreEquipoA: 'EQUIPO A',
    nombreEquipoB: 'EQUIPO B',
    tituloPista: 'CENTER COURT',
    tipoPista: 'Pista 1'
  });

  // Estados para UI
  const [tiempo, setTiempo] = useState<number>(0);
  
  // Función para formatear puntos de tenis (0, 15, 30, 40, AD)
  const formatearPuntos = (puntos: number): string => {
    switch(puntos) {
      case 0: return "0";
      case 1: return "15";
      case 2: return "30";
      case 3: return "40";
      case 4: return "AD";
      default: return puntos.toString();
    }
  };

  // Obtener el estado actual del marcador desde el servidor
  const fetchEstado = async () => {
    try {
      const url = '/marcador';
      const res = await axios.get(url);
      
      if (res.data) {
        // Asegurar que el estado tiene la estructura esperada
        const estadoSeguro = {
          puntos: res.data.puntos || { A: 0, B: 0 },
          juegos: res.data.juegos || { A: 0, B: 0 },
          sets: res.data.sets && res.data.sets.length > 0 ? 
                res.data.sets : [{ A: 0, B: 0 }],
          tie_break: Boolean(res.data.tie_break),
          terminado: Boolean(res.data.terminado)
        };
        
        setEstado(estadoSeguro);
      }
    } catch (err) {
      console.error('Error al obtener el marcador:', err);
    }
  };

  // Escuchar mensajes de la ventana de control
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ACTUALIZAR_MARCADOR') {
        const { data } = event.data;
        
        // Actualizar estado del marcador
        if (data) {
          setEstado({
            puntos: data.puntos || estado.puntos,
            juegos: data.juegos || estado.juegos,
            sets: data.sets || estado.sets,
            tie_break: data.tie_break !== undefined ? data.tie_break : estado.tie_break,
            terminado: data.terminado !== undefined ? data.terminado : estado.terminado
          });
          
          // Actualizar configuración personalizada si está presente
          if (data.config) {
            setConfig(data.config);
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [estado]);

  // Efecto para cargar el marcador al iniciar y cada 2 segundos
  useEffect(() => {
    fetchEstado();
    const interval = setInterval(fetchEstado, 2000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para incrementar el tiempo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      if (!estado.terminado) {
        setTiempo(prevTiempo => prevTiempo + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [estado.terminado]);

  // Formatear el tiempo en formato mm:ss
  const formatearTiempo = (): string => {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    return `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
  };

  // Obtener el set actual
  const setActual = estado.sets && estado.sets.length > 0 
    ? estado.sets[estado.sets.length - 1] 
    : { A: 0, B: 0 };

  return (
    <div className="scoreboard">
      <div className="header">{config.tituloPista}</div>
      
      <div className="score-table">
        <div className="header-row">
          <div className="header-spacer"></div>
          <div className="header-cell">PUNTOS</div>
          <div className="header-cell">JUEGOS</div>
          <div className="header-cell">SETS</div>
        </div>
        
        <div className="team-row team-a">
          <div className="team-name">{config.nombreEquipoA}</div>
          <div className="score-cell">{formatearPuntos(estado.puntos.A)}</div>
          <div className="score-cell">{estado.juegos.A}</div>
          <div className="score-cell">{setActual.A}</div>
        </div>
        
        <div className="team-row team-b">
          <div className="team-name">{config.nombreEquipoB}</div>
          <div className="score-cell">{formatearPuntos(estado.puntos.B)}</div>
          <div className="score-cell">{estado.juegos.B}</div>
          <div className="score-cell">{setActual.B}</div>
        </div>
      </div>
      
      {estado.tie_break && <div className="match-status tie-break">TIE BREAK</div>}
      {estado.terminado && <div className="match-status terminado">PARTIDO TERMINADO</div>}
      
      <div className="footer">
        <div className="time">{formatearTiempo()}</div>
      </div>
    </div>
  );
};

export default MarcadorPantalla;