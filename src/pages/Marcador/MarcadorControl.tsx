import {
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton, 
  IonIcon,
  IonLoading,
  IonToast,
  IonText,
  IonSpinner,
  IonLabel,
  IonInput,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  tennisballOutline, 
  refreshOutline, 
  playOutline, 
  addOutline,
  settingsOutline,
  createOutline,
  trophyOutline,
  arrowBack,
  arrowUndo,
  shuffleOutline
} from 'ionicons/icons';
import axios from 'axios';
import './MarcadorView.css';

/**
 * Página de control del marcador.
 * Permite controlar el marcador de un partido, asignando puntos a los equipos,
 * reiniciando el partido y mostrando el marcador en pantalla completa.
 */
const MarcadorControl: React.FC = () => {
  const navigate = useNavigate();
  // Estado del marcador con valores iniciales seguros
  const [estado, setEstado] = useState<any>({
    puntos: { A: 0, B: 0 },
    juegos: { A: 0, B: 0 },
    sets: [{ A: 0, B: 0 }],
    tie_break: false,
    terminado: false
  });
  
  // Estados para configuración del partido
  const [nombreEquipoA, setNombreEquipoA] = useState<string>('EQUIPO A');
  const [nombreEquipoB, setNombreEquipoB] = useState<string>('EQUIPO B');
  const [tituloPista, setTituloPista] = useState<string>('CENTER COURT');
  const [tipoPista, setTipoPista] = useState<string>('Pista 1');
  
  // Referencia a la ventana del marcador
  const marcadorWindowRef = useRef<Window | null>(null);
  
  // Estados de UI
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<string>('success');

  /**
   * Obtiene el estado actual del marcador desde el servidor
   */
  const fetchMarcador = async () => {
    try {
      const res = await axios.get('/marcador');
      if (res.data) {
        const estadoSeguro = {
          puntos: res.data.puntos || { A: 0, B: 0 },
          juegos: res.data.juegos || { A: 0, B: 0 },
          sets: res.data.sets || [{ A: 0, B: 0 }],
          tie_break: Boolean(res.data.tie_break),
          terminado: Boolean(res.data.terminado),
          bola_de_oro: Boolean(res.data.bola_de_oro),
          saque: res.data.saque || 'A' // Asegurar que el saque siempre esté presente
        };
        setEstado(estadoSeguro);
        // También actualizar la ventana del marcador si está abierta
        actualizarVentanaMarcador(estadoSeguro);
      }
    } catch (error) {
      console.error('Error al obtener datos del marcador:', error);
    }
  };
  

  /**
   * Asigna un punto al equipo especificado
   * @param equipo - Equipo al que asignar el punto ('A' o 'B')
   */
  const anotarPunto = async (equipo: 'A' | 'B') => {
    try {
      // Esta URL debe coincidir con la configuración del proxy en vite.config.ts
      const url = '/marcador/punto';
      // console.log(`Anotando punto para equipo ${equipo}. URL:`, url);

      const res = await axios.post(url, { equipo });
      // console.log('Respuesta al anotar punto:', res.data);
      
      // Actualizar el estado del marcador
      if (res.data) {
        setEstado(res.data);
        
        // Actualizar la ventana del marcador
        actualizarVentanaMarcador(res.data);
      }
      
      mostrarToast(`Punto anotado para el equipo ${equipo}`, 'success');
    } catch (err: any) {
      console.error(`Error al anotar punto para equipo ${equipo}:`, err);
      console.error('Detalles del error:', err.response || err.message);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        mostrarToast(err.response.data.error, 'danger');
      } else {
        setError(`Error al anotar punto para equipo ${equipo}: ${err.message || 'Error desconocido'}`);
        mostrarToast(`Error al anotar punto para equipo ${equipo}`, 'danger');
      }
    }
  };

  /**
   * Reinicia el marcador del partido
   */
  const reiniciar = async () => {
    try {
      // Esta URL debe coincidir con la configuración del proxy en vite.config.ts
      const url = '/marcador/reset';
      // console.log('Reiniciando marcador. URL:', url);
      
      const res = await axios.post(url);
      // console.log('Respuesta al reiniciar marcador:', res.data);
      
      // Recargar el estado actual
      fetchMarcador();
      
      if (res.data && res.data.message) {
        mostrarToast(res.data.message, 'success');
      } else {
        mostrarToast('Marcador reiniciado correctamente', 'success');
      }
    } catch (err: any) {
      console.error('Error al reiniciar el marcador:', err);
      console.error('Detalles del error:', err.response || err.message);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        mostrarToast(err.response.data.error, 'danger');
      } else {
        setError(`Error al reiniciar el marcador: ${err.message || 'Error desconocido'}`);
        mostrarToast('Error al reiniciar el marcador', 'danger');
      }
    }
  };

  /**
   * Abre una ventana con el marcador en pantalla completa
   */
  const abrirMarcador = () => {
    // Guardar en localStorage antes de abrir la ventana
    const config = {
      estado,
      nombreEquipoA,
      nombreEquipoB,
      tituloPista,
      tipoPista
    };
    localStorage.setItem('marcador-config', JSON.stringify(config));
  
    // Usar la ruta del componente React del marcador
    const url = `${window.location.origin}/club/marcador`;
    console.log('Abriendo marcador en URL:', url);
    marcadorWindowRef.current = window.open(url, 'marcador', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
    
    // Enviar datos iniciales después de un breve delay
    setTimeout(() => {
      actualizarVentanaMarcador(estado);
    }, 1000);
  };

  /**
   * Envía los datos de configuración a la ventana del marcador
   */
  const actualizarVentanaMarcador = (datos: any) => {
    if (marcadorWindowRef.current && !marcadorWindowRef.current.closed) {
      // Asegurar que todos los datos estén incluidos
      const datosCompletos = {
        puntos: datos.puntos || { A: 0, B: 0 },
        juegos: datos.juegos || { A: 0, B: 0 },
        sets: datos.sets || [{ A: 0, B: 0 }],
        tie_break: Boolean(datos.tie_break),
        terminado: Boolean(datos.terminado),
        bola_de_oro: Boolean(datos.bola_de_oro),
        saque: datos.saque || 'A'  // Asegurar que el saque siempre esté presente
      };
      
      // Enviar el estado del marcador y la configuración del partido
      marcadorWindowRef.current.postMessage({
        type: 'ACTUALIZAR_MARCADOR',
        data: {
          ...datosCompletos,
          config: {
            nombreEquipoA,
            nombreEquipoB,
            tituloPista,
            tipoPista
          }
        }
      }, '*');
    }
  };

  /**
   * Activar o desactivar manualmente el tie-break
   */
  const toggleTieBreak = async (checked: boolean) => {
    try {
      await axios.post('/marcador/tiebreak', { tie_break: checked });
  
      // Enviar mensaje a la ventana abierta del marcador para que recargue
      if (marcadorWindowRef.current) {
        marcadorWindowRef.current.postMessage({ tipo: 'actualizar_estado' }, '*');
      }
  
      // console.log('Estado de tie-break actualizado:', checked);
    } catch (error) {
      console.error('Error al cambiar estado de tie-break:', error);
    }
  };

  const toggleBolaDeOro = async (checked: boolean) => {
    try {
      await axios.post('/marcador/bolaOro', { bola_de_oro: checked });
  
      if (marcadorWindowRef.current) {
        marcadorWindowRef.current.postMessage({ tipo: 'actualizar_estado' }, '*');
      }
  
      // console.log('Bola de oro activada:', checked);
    } catch (error) {
      console.error('Error al activar bola de oro:', error);
    }
  };
  

  /**
   * Finalizar el partido manualmente
   */
  const finalizarPartido = async () => {
    try {
      await axios.post('/marcador/finalizar');
      fetchMarcador();
    } catch (err) {
      console.error("Error al finalizar partido:", err);
    }
  };

  /**
   * Retrocede un punto hacia atrás
   */
  const retrocederPunto = async () => {
    try {
      const res = await axios.post('/marcador/retroceder');
      
      if (res.data) {
        setEstado(res.data);
        actualizarVentanaMarcador(res.data);
        mostrarToast('Punto retrocedido correctamente', 'success');
      }
    } catch (err: any) {
      console.error('Error al retroceder punto:', err);
      
      if (err.response && err.response.data && err.response.data.error) {
        mostrarToast(err.response.data.error, 'warning');
      } else {
        mostrarToast('Error al retroceder punto', 'danger');
      }
    }
  };

  /**
   * Asigna el saque de forma aleatoria
   */
  const saqueAleatorio = async () => {
    try {
      const res = await axios.post('/marcador/saque-aleatorio');
      
      if (res.data && res.data.estado) {
        setEstado(res.data.estado);
        actualizarVentanaMarcador(res.data.estado);
        mostrarToast(res.data.message || 'Saque asignado aleatoriamente', 'success');
      }
    } catch (err: any) {
      console.error('Error al asignar saque aleatorio:', err);
      
      if (err.response && err.response.data && err.response.data.error) {
        mostrarToast(err.response.data.error, 'danger');
      } else {
        mostrarToast('Error al asignar saque aleatorio', 'danger');
      }
    }
  };

  /**
   * Actualiza todas las configuraciones del partido en la ventana del marcador
   */
  const actualizarConfiguracion = () => {
    actualizarVentanaMarcador(estado);
    mostrarToast('Configuración actualizada', 'success');
  };

  /**
   * Muestra un mensaje toast
   */
  const mostrarToast = (mensaje: string, color: string = 'success') => {
    setToastMessage(mensaje);
    setToastColor(color);
    setShowToast(true);
  };

  // Cerrar la ventana del marcador cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (marcadorWindowRef.current && !marcadorWindowRef.current.closed) {
        marcadorWindowRef.current.close();
      }
    };
  }, []);

  // Efecto para cargar el marcador al iniciar y cada 2 segundos
  useEffect(() => {
    fetchMarcador();
  }, []);

  return (
    <div className="marcador-control-page">
      {/* Header principal */}
      <div className="page-header">
        <h1>Control de Marcador</h1>
        <p>Gestiona el marcador en tiempo real para {tipoPista}</p>
      </div>
      
      {/* Contenedor principal con grid responsive */}
      <div className="marcador-control-container">
        <IonGrid className="marcador-grid">
          <IonRow>
            {/* Vista previa del marcador - Columna izquierda */}
            <IonCol size="12" sizeLg="6">
              <IonCard className="preview-card">
                <IonCardHeader className="preview-header">
                  <IonCardTitle>Vista Previa del Marcador</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="preview-content">
                  {/* Estado del marcador con mejor presentación */}
                  {cargando && !estado ? (
                    <div className="loading-state">
                      <IonSpinner name="crescent" color="primary"/>
                      <IonText className="loading-text">Cargando marcador...</IonText>
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <IonIcon icon={refreshOutline} className="error-icon" />
                      <IonText className="error-text">{error}</IonText>
                      <IonButton fill="outline" size="small" onClick={fetchMarcador} className="retry-button">
                        <IonIcon slot="start" icon={refreshOutline} />
                        Reintentar
                      </IonButton>
                    </div>
                  ) : (
                    <div className="marcador-preview">
                      <div className="marcador-miniatura">
                        <div className="scoreboard-mini">
                          <div className="header-mini">{tituloPista}</div>
                          
                          <div className="score-table-mini">
                            <div className="header-row-mini">
                              <div className="header-spacer-mini"></div>
                              <div className="header-cell-mini">SETS</div>
                              <div className="header-cell-mini">JUEGOS</div>
                              <div className="header-cell-mini">PUNTOS</div>
                            </div>
                            <div className="team-row-mini team-a-mini">
                              <div className="team-name-mini">
                                {nombreEquipoA}
                                <div className={`serve-ball-visual-mini ${estado.saque === 'A' ? 'active' : ''}`}>
                                  <img src="/favicon.png" alt="Pelota de pádel" className="ball-image-mini" />
                                </div>
                              </div>
                              <div className="score-cell-mini">{estado.sets ? estado.sets.filter((set: { A: number, B: number }) => set.A > set.B).length : 0}</div>
                              <div className="score-cell-mini">{estado.juegos.A}</div>
                              <div className="score-cell-mini">{estado.tie_break ? estado.puntos.A : (estado.puntos.A === 0 ? '0' : estado.puntos.A === 1 ? '15' : estado.puntos.A === 2 ? '30' : estado.puntos.A === 3 ? '40' : estado.puntos.A === 4 ? 'AD' : estado.puntos.A)}</div>
                            </div>
                            <div className="team-row-mini team-b-mini">
                              <div className="team-name-mini">
                                {nombreEquipoB}
                                <div className={`serve-ball-visual-mini ${estado.saque === 'B' ? 'active' : ''}`}>
                                  <img src="/favicon.png" alt="Pelota de pádel" className="ball-image-mini" />
                                </div>
                              </div>
                              <div className="score-cell-mini">{estado.sets ? estado.sets.filter((set: { A: number, B: number }) => set.B > set.A).length : 0}</div>
                              <div className="score-cell-mini">{estado.juegos.B}</div>
                              <div className="score-cell-mini">{estado.tie_break ? estado.puntos.B : (estado.puntos.B === 0 ? '0' : estado.puntos.B === 1 ? '15' : estado.puntos.B === 2 ? '30' : estado.puntos.B === 3 ? '40' : estado.puntos.B === 4 ? 'AD' : estado.puntos.B)}</div>
                            </div>
                          </div>
                          {estado.tie_break && <div className="match-status-mini tie-break-mini">TIE BREAK</div>}
                          {estado.terminado && <div className="match-status-mini terminado-mini">PARTIDO TERMINADO</div>}
                          {estado.tie_break === false && estado.bola_de_oro && estado.puntos.A === 40 && estado.puntos.B === 40 &&
                            <div className="match-status-mini bola-oro-mini">BOLA DE ORO</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            {/* Panel de controles principales - Columna derecha */}
            <IonCol size="12" sizeLg="6">
              <IonCard className="controls-card">
                <IonCardHeader className="controls-header">
                  <IonCardTitle>Controles de Puntuación</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="controls-content">
                  {/* Botones de puntuación principales */}
                  <div className="score-buttons-container">
                    <div className="team-score-section">
                      <div className="team-info">
                        <h3 className="team-name-display">{nombreEquipoA}</h3>
                        <div className="team-score-display">{estado?.puntos?.A || 0}</div>
                      </div>
                      <IonButton 
                        className="score-button team-a-button"
                        disabled={!estado || estado.terminado} 
                        onClick={() => anotarPunto("A")}
                      >
                        <IonIcon slot="start" icon={addOutline} />
                        +1 Punto
                      </IonButton>
                    </div>
                    
                    <div className="vs-divider">
                      <span>VS</span>
                    </div>
                    
                    <div className="team-score-section">
                      <div className="team-info">
                        <h3 className="team-name-display">{nombreEquipoB}</h3>
                        <div className="team-score-display">{estado?.puntos?.B || 0}</div>
                      </div>
                      <IonButton 
                        className="score-button team-b-button"
                        disabled={!estado || estado.terminado}
                        onClick={() => anotarPunto("B")}
                      >
                        <IonIcon slot="start" icon={addOutline} />
                        +1 Punto
                      </IonButton>
                    </div>
                  </div>
                  
                  {/* Indicador de saque */}
                  <div className="serve-indicator">
                    <h4>Saque: <span className="serve-team">{estado?.saque === 'A' ? nombreEquipoA : nombreEquipoB}</span></h4>
                    <div className="serve-visual">
                      <div className={`serve-ball ${estado?.saque === 'A' ? 'team-a-serve' : 'team-b-serve'}`}>
                        <img src="/favicon.png" alt="Pelota de pádel" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Controles de acción */}
                  <div className="action-controls">
                    <IonButton className="action-button undo-button" onClick={retrocederPunto}>
                      <IonIcon slot="start" icon={arrowUndo} />
                      Retroceder
                    </IonButton>
                    <IonButton className="action-button reset-button" onClick={reiniciar}>
                      <IonIcon slot="start" icon={refreshOutline} />
                      Reiniciar
                    </IonButton>
                    <IonButton className="action-button display-button" onClick={abrirMarcador}>
                      <IonIcon slot="start" icon={playOutline} />
                      Mostrar Pantalla
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          
          {/* Segunda fila - Configuración */}
          <IonRow>
            <IonCol size="12" sizeLg="6">
              <IonCard className="config-card">
                <IonCardHeader className="config-header">
                  <IonCardTitle>
                    <IonIcon icon={settingsOutline} className="config-icon" />
                    Configuración del Partido
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="config-content">
                  <div className="config-grid">
                    <div className="config-group">
                      <h4 className="config-group-title">Equipos</h4>
                      <div className="config-inputs">
                        <div className="input-group">
                          <IonLabel className="input-label">Nombre Equipo A</IonLabel>
                          <IonInput
                            className="config-input"
                            value={nombreEquipoA}
                            onIonChange={e => setNombreEquipoA(e.detail.value as string)}
                            placeholder="Ej: Los Aces"
                          />
                        </div>
                        <div className="input-group">
                          <IonLabel className="input-label">Nombre Equipo B</IonLabel>
                          <IonInput
                            className="config-input"
                            value={nombreEquipoB}
                            onIonChange={e => setNombreEquipoB(e.detail.value as string)}
                            placeholder="Ej: Los Raquetas"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="config-group">
                      <h4 className="config-group-title">Pista</h4>
                      <div className="config-inputs">
                        <div className="input-group">
                          <IonLabel className="input-label">Título del Marcador</IonLabel>
                          <IonInput
                            className="config-input"
                            value={tituloPista}
                            onIonChange={e => setTituloPista(e.detail.value as string)}
                            placeholder="Ej: CENTER COURT"
                          />
                        </div>
                        <div className="input-group">
                          <IonLabel className="input-label">Tipo de Pista</IonLabel>
                          <IonSelect
                            className="config-select"
                            value={tipoPista}
                            onIonChange={e => setTipoPista(e.detail.value)}
                          >
                            <IonSelectOption value="Pista 1">Pista 1</IonSelectOption>
                            <IonSelectOption value="Pista 2">Pista 2</IonSelectOption>
                            <IonSelectOption value="Pista 3">Pista 3</IonSelectOption>
                            <IonSelectOption value="Pista Central">Pista Central</IonSelectOption>
                          </IonSelect>
                        </div>
                      </div>
                    </div>
                    
                    <div className="config-actions">
                      <IonButton className="apply-config-button" onClick={actualizarConfiguracion}>
                        <IonIcon slot="start" icon={createOutline} />
                        Aplicar Configuración
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            {/* Controles avanzados */}
            <IonCol size="12" sizeLg="6">
              <IonCard className="advanced-card">
                <IonCardHeader className="advanced-header">
                  <IonCardTitle>
                    <IonIcon icon={tennisballOutline} className="advanced-icon" />
                    Controles Avanzados
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="advanced-content">
                  <div className="advanced-controls">
                    <div className="toggle-group">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <IonLabel className="toggle-label">Tie-Break</IonLabel>
                          <IonText className="toggle-description">Activar modo tie-break</IonText>
                        </div>
                        <IonToggle 
                          className="toggle-switch"
                          disabled={estado.terminado || !estado.tie_break && (estado.juegos.A !== 6 || estado.juegos.B !== 6)}
                          checked={estado.tie_break} 
                          onIonChange={(e) => toggleTieBreak(e.detail.checked)}
                        />
                      </div>
                      
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <IonLabel className="toggle-label">Bola de Oro</IonLabel>
                          <IonText className="toggle-description">Punto decisivo especial</IonText>
                        </div>
                        <IonToggle 
                          className="toggle-switch"
                          checked={estado.bola_de_oro} 
                          disabled={estado.terminado} 
                          onIonChange={(e) => toggleBolaDeOro(e.detail.checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="advanced-actions">
                      <IonButton 
                        className="random-serve-button"
                        disabled={estado.terminado}
                        onClick={saqueAleatorio}
                      >
                        <IonIcon slot="start" icon={shuffleOutline} />
                        Saque Aleatorio
                      </IonButton>
                      <IonButton 
                        className="finish-button"
                        disabled={estado.terminado}
                        onClick={finalizarPartido}
                      >
                        <IonIcon slot="start" icon={trophyOutline} />
                        Finalizar Partido
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
      
      {/* Loading y toast para notificaciones */}
      <IonLoading isOpen={cargando && !estado} message="Cargando marcador..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastColor}
      />
    </div>
  );
};

export default MarcadorControl;