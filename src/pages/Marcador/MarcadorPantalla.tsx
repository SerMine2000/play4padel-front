import { useEffect, useState } from 'react';
import axios from 'axios';
import "./MarcadorView.css";

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
  

  const formatearPuntos = (puntos: number): string => {
    if (estado.tie_break) {
      return puntos.toString();
    }

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
    const res = await axios.get('/marcador');
    setEstado({
      puntos: res.data.puntos,
      juegos: res.data.juegos,
      sets: res.data.sets,
      tie_break: res.data.tie_break,
      terminado: res.data.terminado,
      bola_de_oro: res.data.bola_de_oro
    });
  }
  

  // Escuchar mensajes de la ventana de control
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'ACTUALIZAR_MARCADOR') {
          const { data } = event.data;
          
          if (data) {
            setEstado({
              puntos: data.puntos || estado.puntos,
              juegos: data.juegos || estado.juegos,
              sets: data.sets || estado.sets,
              tie_break: data.tie_break !== undefined ? data.tie_break : estado.tie_break,
              terminado: data.terminado !== undefined ? data.terminado : estado.terminado
            });
      
            if (data.config) {
              setConfig(data.config);
            }
          }
        } else if (event.data.tipo === 'actualizar_estado') {
          // 🔥 Este es el añadido nuevo
          fetchEstado(); // Recarga del backend el estado completo actualizado
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
    // Intentar leer configuración desde localStorage al cargar
    const configRaw = localStorage.getItem('marcador-config');
    if (configRaw) {
      try {
        const parsed = JSON.parse(configRaw);
        if (parsed.estado) setEstado(parsed.estado);
        if (parsed.nombreEquipoA || parsed.nombreEquipoB || parsed.tituloPista || parsed.tipoPista) {
          setConfig({
            nombreEquipoA: parsed.nombreEquipoA || 'EQUIPO A',
            nombreEquipoB: parsed.nombreEquipoB || 'EQUIPO B',
            tituloPista: parsed.tituloPista || 'CENTER COURT',
            tipoPista: parsed.tipoPista || 'Pista 1',
          });
        }
      } catch (e) {
        console.error('Error al cargar config desde localStorage', e);
      }
    }
  
    fetchEstado();
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
  
  useEffect(() => {
    if (
      estado.juegos.A === 0 && 
      estado.juegos.B === 0 && 
      estado.sets.length === 1 && 
      estado.sets[0].A === 0 && 
      estado.sets[0].B === 0 &&
      estado.puntos.A === 0 && 
      estado.puntos.B === 0 &&
      !estado.terminado
    ) {
      setTiempo(0); // 🔥 Resetear cronómetro
    }
  }, [estado]);
  

  // Formatear el tiempo en formato mm:ss
  const formatearTiempo = (): string => {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    return `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
  };

  const contarSetsGanados = (equipo: 'A' | 'B'): number => {
    return estado.sets.filter((set: { A: number, B: number }) => set[equipo] > set[equipo === 'A' ? 'B' : 'A']).length;
  };
  

  // Obtener el set actual
  const setActual = estado.sets && estado.sets.length > 0 
    ? estado.sets[estado.sets.length - 1] 
    : { A: 0, B: 0 };

  return (
    <div className="marcador-pantalla-container">
      <div className="scoreboard"  >
        <div className="header">{config.tituloPista}</div>
      
        <div className="score-table">
          <div className="header-row">
            <div className="header-spacer"></div>
            <div className="header-cell">SETS</div>
            <div className="header-cell">JUEGOS</div>
            <div className="header-cell">PUNTOS</div>
          </div>
          <div className="team-row team-a">
            <div className="team-name">{config.nombreEquipoA}</div>
            <div className="score-cell">{contarSetsGanados('A')}</div>
            <div className="score-cell">{estado.juegos.A}</div>
            <div className="score-cell">{formatearPuntos(estado.puntos.A)}</div>
          </div>
          <div className="team-row team-b">
            <div className="team-name">{config.nombreEquipoB}</div>
            <div className="score-cell">{contarSetsGanados('B')}</div>
            <div className="score-cell">{estado.juegos.B}</div>
            <div className="score-cell">{formatearPuntos(estado.puntos.B)}</div>
          </div>
        </div>
        {estado.tie_break && <div className="match-status tie-break">TIE BREAK</div>}
        {estado.terminado && <div className="match-status terminado">PARTIDO TERMINADO</div>}
        {estado.tie_break === false && estado.bola_de_oro && estado.puntos.A === 40 && estado.puntos.B === 40 &&
          <div className="match-status bola-oro">BOLA DE ORO</div>}
        <div className="footer">
          <div className="time">{formatearTiempo()}</div>
        </div>
      </div>
    </div>
  );
};

export default MarcadorPantalla;