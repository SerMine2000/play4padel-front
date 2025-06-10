import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonAlert,
  IonBadge,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent
} from '@ionic/react';
import {
  arrowBackOutline,
  addOutline,
  trophyOutline,
  calendarOutline,
  peopleOutline,
  podiumOutline,
  playOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  createOutline,
  ribbonOutline,
  arrowForwardOutline,
  gitBranchOutline,
  flashOutline,
  informationCircleOutline,
  closeOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Torneo, ParejaTorneo, Partido, User } from '../../interfaces';
import ApiService from '../../services/api.service';
import TorneosService from '../../services/torneos.service';
import './TorneoDetalle.css';

const TorneoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [parejas, setParejas] = useState<ParejaTorneo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('info');
  const [isInscriptionModalOpen, setIsInscriptionModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showGenerateFixtureAlert, setShowGenerateFixtureAlert] = useState(false);
  const [bracketData, setBracketData] = useState<any>(null);
  const [estadoTorneo, setEstadoTorneo] = useState<any>(null);

  // Formulario de inscripción
  const [inscriptionData, setInscriptionData] = useState({
    jugador1_id: '',
    jugador2_id: '',
    categoria: ''
  });

  // Formulario de resultado de torneo
  const [resultData, setResultData] = useState({
    resultado: '',
    ganador: ''
  });

  const userRole = (user?.role || '').toUpperCase();
  const canManage = ['ADMIN', 'CLUB'].includes(userRole);

  useEffect(() => {
    if (id) {
      loadTorneoData();
    }
  }, [id]);

  const loadTorneoData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTorneo(),
        loadParejas(),
        loadPartidos(),
        loadUsuarios(),
        loadBracketData(),
        loadEstadoTorneo()
      ]);
    } catch (error) {
      console.error('Error al cargar datos del torneo:', error);
      setToastMessage('Error al cargar los datos del torneo');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadTorneo = async () => {
    const response = await ApiService.get(`/torneos/${id}`);
    if (response) {
      setTorneo(response);
    }
  };

  const loadParejas = async () => {
    const response = await ApiService.get(`/torneos/${id}/parejas`);
    if (response && Array.isArray(response)) {
      setParejas(response);
    }
  };

  const loadPartidos = async () => {
    const response = await ApiService.get(`/torneos/${id}/partidos`);
    if (response && Array.isArray(response)) {
      setPartidos(response);
    }
  };

  const loadUsuarios = async () => {
    const response = await ApiService.get('/users');
    if (response && Array.isArray(response)) {
      console.log('Usuarios cargados:', response);
      setUsuarios(response);
    }
  };

  const loadBracketData = async () => {
    try {
      const response = await TorneosService.getBracketTorneo(parseInt(id!));
      if (response) {
        setBracketData(response);
      }
    } catch (error) {
      console.error('Error al cargar bracket:', error);
    }
  };

  const loadEstadoTorneo = async () => {
    try {
      const response = await TorneosService.getEstadoTorneo(parseInt(id!));
      if (response) {
        setEstadoTorneo(response);
      }
    } catch (error) {
      console.error('Error al cargar estado del torneo:', error);
    }
  };

  const handleInscribirPareja = async () => {
    try {
      if (!inscriptionData.jugador1_id || !inscriptionData.jugador2_id || !inscriptionData.categoria) {
        setToastMessage('Por favor completa todos los campos');
        setShowToast(true);
        return;
      }

      if (inscriptionData.jugador1_id === inscriptionData.jugador2_id) {
        setToastMessage('Los jugadores deben ser diferentes');
        setShowToast(true);
        return;
      }

      const response = await ApiService.post(`/torneos/${id}/inscribir_pareja_torneo`, {
        jugador1_id: parseInt(inscriptionData.jugador1_id),
        jugador2_id: parseInt(inscriptionData.jugador2_id),
        categoria: inscriptionData.categoria
      });

      if (response) {
        setToastMessage('Pareja inscrita exitosamente');
        setShowToast(true);
        setIsInscriptionModalOpen(false);
        resetInscriptionForm();
        loadParejas();
      }
    } catch (error) {
      console.error('Error al inscribir pareja:', error);
      setToastMessage('Error al inscribir la pareja');
      setShowToast(true);
    }
  };

  const handleGenerateFixture = async () => {
    try {
      const response = await ApiService.post(`/torneos/${id}/generar_fixture`, {});
      if (response) {
        setToastMessage('Cuadro generado exitosamente');
        setShowToast(true);
        setShowGenerateFixtureAlert(false);
        loadPartidos();
        loadBracketData();
        loadEstadoTorneo();
      }
    } catch (error) {
      console.error('Error al generar fixture:', error);
      setToastMessage('Error al generar el cuadro');
      setShowToast(true);
    }
  };

  const handleRegistrarResultadoTorneo = async () => {
    try {
      if (!resultData.resultado || !resultData.ganador) {
        setToastMessage('Por favor ingresa el resultado y selecciona el ganador');
        setShowToast(true);
        return;
      }

      const response = await TorneosService.registrarResultadoTorneo(
        selectedPartido?.id!,
        {
          resultado: resultData.resultado,
          ganador: parseInt(resultData.ganador)
        }
      );

      if (response) {
        setToastMessage('Resultado registrado exitosamente');
        setShowToast(true);
        setIsResultModalOpen(false);
        resetResultForm();
        loadPartidos();
        loadBracketData();
        loadEstadoTorneo();
      }
    } catch (error) {
      console.error('Error al registrar resultado:', error);
      setToastMessage('Error al registrar el resultado');
      setShowToast(true);
    }
  };

  const handleAvanzarRonda = async (rondaActual: string) => {
    try {
      const response = await ApiService.post(`/torneos/${id}/rondas/${rondaActual}/avanzar`, {});
      if (response) {
        setToastMessage(`Avanzado a ${response.ronda_siguiente} exitosamente`);
        setShowToast(true);
        loadPartidos();
        loadBracketData();
        loadEstadoTorneo();
      }
    } catch (error) {
      console.error('Error al avanzar ronda:', error);
      setToastMessage('Error al avanzar de ronda. Verifica que todos los partidos estén finalizados');
      setShowToast(true);
    }
  };

  const handleCrearConsolacion = async (rondaOrigen: string) => {
    try {
      const response = await ApiService.post(`/torneos/${id}/rondas/${rondaOrigen}/consolacion`, {});
      if (response) {
        setToastMessage('Cuadro de consolación creado exitosamente');
        setShowToast(true);
        loadPartidos();
        loadBracketData();
        loadEstadoTorneo();
      }
    } catch (error) {
      console.error('Error al crear consolación:', error);
      setToastMessage('Error al crear el cuadro de consolación');
      setShowToast(true);
    }
  };

  const resetInscriptionForm = () => {
    setInscriptionData({
      jugador1_id: '',
      jugador2_id: '',
      categoria: ''
    });
  };

  const resetResultForm = () => {
    setResultData({
      resultado: '',
      ganador: ''
    });
    setSelectedPartido(null);
  };

  // Función para formatear precio/premio
  const formatPrecio = (precio: any) => {
    if (!precio) return '';
    
    if (typeof precio === 'string') {
      return precio;
    }
    
    if (typeof precio === 'number') {
      return `€${precio}`;
    }
    
    if (typeof precio === 'object') {
      // Si es un objeto, convertirlo a string descriptivo
      const premios = [];
      if (precio.primer_puesto) {
        premios.push(`1º lugar: ${precio.primer_puesto}`);
      }
      if (precio.segundo_puesto) {
        premios.push(`2º lugar: ${precio.segundo_puesto}`);
      }
      if (precio.tercer_puesto) {
        premios.push(`3º lugar: ${precio.tercer_puesto}`);
      }
      return premios.join(' • ') || 'Premio disponible';
    }
    
    return String(precio);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserName = (userId: number) => {
    const usuario = usuarios.find(u => u.id === userId);
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Usuario no encontrado';
  };

  const getPartidoEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'finalizado':
        return 'success';
      case 'en_curso':
        return 'warning';
      case 'programado':
        return 'medium';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <IonSpinner />
      </div>
    );
  }

  if (!torneo) {
    return (
      <div className="torneo-not-found">
        <IonIcon icon={closeCircleOutline} />
        <h2>Torneo no encontrado</h2>
        <IonButton fill="clear" onClick={() => navigate(-1)}>
          <IonIcon icon={arrowBackOutline} slot="start" />
          Volver
        </IonButton>
      </div>
    );
  }

  return (
    <div className={`torneo-detalle-container ${theme}`}>
      <div className="torneo-content">
      {/* Header rediseñado */}
      <div className="torneo-header">
        <div className="header-top">
          <IonButton fill="clear" onClick={() => navigate(-1)}>
            <IonIcon icon={arrowBackOutline} />
            Volver
          </IonButton>
          <div className="title-section">
            <h1>{torneo.nombre}</h1>
            <div className="status-chips">
              <IonChip className="status-chip chip-activo">
                <IonIcon icon={trophyOutline} className="icon-themed" />
                <IonLabel>Torneo Activo</IonLabel>
              </IonChip>
              {partidos.length > 0 && (
                <IonChip className="status-chip">
                  <IonIcon icon={playOutline} />
                  <IonLabel>Cuadro Generado</IonLabel>
                </IonChip>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-bottom">
          {canManage && (
            <div className="header-actions">
              <IonButton onClick={() => setIsInscriptionModalOpen(true)} className="inscribir-button">
                <IonIcon icon={addOutline} slot="start" className="icon-themed" />
                <IonLabel>Inscribir Pareja</IonLabel>
              </IonButton>
              
              {parejas.length >= 2 && (
                <IonButton 
                  onClick={() => setShowGenerateFixtureAlert(true)}
                  disabled={partidos.length > 0}
                >
                  <IonIcon icon={playOutline} slot="start" />
                  <IonLabel>{partidos.length > 0 ? 'Cuadro Ya Generado' : 'Generar Cuadro'}</IonLabel>
                </IonButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <IonSegment value={selectedTab} onIonChange={(e) => setSelectedTab(e.detail.value as string)} className="tabs-header">
        <IonSegmentButton value="info">
          <IonLabel>Información</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="parejas">
          <IonLabel>Parejas ({parejas.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="bracket">
          <IonLabel>Cuadro</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="fixture">
          <IonLabel>Partidos ({partidos.length})</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {/* Contenido según tab seleccionado */}
      <div className="tab-content">
        {selectedTab === 'info' && (
          <div className="info-tab">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Información del Torneo</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="info-grid">
                  <div className="info-item">
                    <IonIcon icon={calendarOutline} />
                    <div>
                      <h3>Fechas</h3>
                      <p>{formatDate(torneo.fecha_inicio)} - {formatDate(torneo.fecha_fin)}</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <IonIcon icon={trophyOutline} />
                    <div>
                      <h3>Tipo</h3>
                      <p>{torneo.tipo}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <IonIcon icon={peopleOutline} />
                    <div>
                      <h3>Parejas Inscritas</h3>
                      <p>{parejas.length} {torneo.max_parejas ? `/ ${torneo.max_parejas}` : ''}</p>
                    </div>
                  </div>

                  {torneo.precio_inscripcion && (
                    <div className="info-item">
                      <IonIcon icon={podiumOutline} />
                      <div>
                        <h3>Precio</h3>
                        <p>{formatPrecio(torneo.precio_inscripcion)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {torneo.descripcion && (
                  <div className="descripcion-section">
                    <h3>Descripción</h3>
                    <p>{torneo.descripcion}</p>
                  </div>
                )}
              </IonCardContent>
            </IonCard>

          </div>
        )}

        {selectedTab === 'parejas' && (
          <div className="parejas-tab">
            {parejas.length === 0 ? (
              <IonCard className="empty-state">
                <IonCardContent>
                  <IonIcon icon={peopleOutline} />
                  <h2>No hay parejas inscritas</h2>
                  <p>Las parejas aparecerán aquí cuando se inscriban al torneo.</p>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonGrid>
                <IonRow>
                  {parejas.map((pareja, index) => (
                    <IonCol size="12" sizeMd="6" key={pareja.id}>
                      <IonCard className="pareja-card">
                        <IonCardContent>
                          <div className="pareja-header">
                            <IonBadge color="primary">#{index + 1}</IonBadge>
                            <IonChip color="secondary">{pareja.categoria}</IonChip>
                          </div>
                          
                          <div className="jugadores">
                            <div className="jugador">
                              <div className="jugador-avatar">
                                {(() => {
                                  const usuario = usuarios.find(u => u.id === pareja.jugador1_id);
                                  const avatarUrl = usuario?.avatar_url;
                                  
                                  if (avatarUrl && avatarUrl.trim() !== '') {
                                    return (
                                      <>
                                        <img 
                                          src={avatarUrl} 
                                          alt={getUserName(pareja.jugador1_id)}
                                          onError={(e) => {
                                            console.log('Error cargando imagen para:', usuario?.nombre, avatarUrl);
                                            e.currentTarget.style.display = 'none';
                                            const iconElement = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (iconElement) {
                                              iconElement.style.display = 'flex';
                                            }
                                          }}
                                        />
                                        <IonIcon 
                                          icon={personOutline} 
                                          style={{ display: 'none' }}
                                        />
                                      </>
                                    );
                                  } else {
                                    return <IonIcon icon={personOutline} />;
                                  }
                                })()}
                              </div>
                              <div className="jugador-info">
                                <div className="jugador-nombre">{getUserName(pareja.jugador1_id)}</div>
                                <div className="jugador-email">{usuarios.find(u => u.id === pareja.jugador1_id)?.email || ''}</div>
                              </div>
                            </div>
                            
                            <div className="jugador">
                              <div className="jugador-avatar">
                                {(() => {
                                  const usuario = usuarios.find(u => u.id === pareja.jugador2_id);
                                  const avatarUrl = usuario?.avatar_url;
                                  
                                  if (avatarUrl && avatarUrl.trim() !== '') {
                                    return (
                                      <>
                                        <img 
                                          src={avatarUrl} 
                                          alt={getUserName(pareja.jugador2_id)}
                                          onError={(e) => {
                                            console.log('Error cargando imagen para:', usuario?.nombre, avatarUrl);
                                            e.currentTarget.style.display = 'none';
                                            const iconElement = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (iconElement) {
                                              iconElement.style.display = 'flex';
                                            }
                                          }}
                                        />
                                        <IonIcon 
                                          icon={personOutline} 
                                          style={{ display: 'none' }}
                                        />
                                      </>
                                    );
                                  } else {
                                    return <IonIcon icon={personOutline} />;
                                  }
                                })()}
                              </div>
                              <div className="jugador-info">
                                <div className="jugador-nombre">{getUserName(pareja.jugador2_id)}</div>
                                <div className="jugador-email">{usuarios.find(u => u.id === pareja.jugador2_id)?.email || ''}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="fecha-inscripcion">
                            <small>Inscrita: {formatDate(pareja.fecha_creacion)}</small>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}
          </div>
        )}

        {selectedTab === 'bracket' && (
          <div className="bracket-tab">
            {!bracketData || Object.keys(bracketData.bracket || {}).length === 0 ? (
              <IonCard className="empty-state">
                <IonCardContent>
                  <IonIcon icon={gitBranchOutline} />
                  <h2>No hay bracket disponible</h2>
                  <p>El bracket aparecerá cuando se genere el cuadro del torneo.</p>
                </IonCardContent>
              </IonCard>
            ) : (
              <div className="bracket-container">
                {Object.entries(bracketData.bracket).map(([ronda, partidosRonda]: [string, any]) => (
                  <IonCard key={ronda} className="ronda-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={ribbonOutline} />
                        {ronda.toUpperCase()}
                        
                        {canManage && (
                          <div className="ronda-actions">
                            {estadoTorneo && estadoTorneo.rondas && estadoTorneo.rondas[ronda] && 
                             estadoTorneo.rondas[ronda].pendientes === 0 && 
                             estadoTorneo.rondas[ronda].finalizados > 0 && 
                             ronda !== 'final' && ronda !== 'consolacion' && (
                              <IonButton 
                                size="small" 
                                fill="outline" 
                                onClick={() => handleAvanzarRonda(ronda)}
                              >
                                <IonIcon icon={arrowForwardOutline} slot="start" />
                                Avanzar
                              </IonButton>
                            )}
                            
                            {ronda === 'principal' && estadoTorneo && estadoTorneo.rondas && 
                             estadoTorneo.rondas[ronda] && estadoTorneo.rondas[ronda].finalizados > 0 && (
                              <IonButton 
                                size="small" 
                                fill="outline" 
                                color="secondary"
                                onClick={() => handleCrearConsolacion(ronda)}
                              >
                                <IonIcon icon={gitBranchOutline} slot="start" />
                                Consolación
                              </IonButton>
                            )}
                          </div>
                        )}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="partidos-ronda">
                        {partidosRonda.map((partido: any, index: number) => (
                          <div key={partido.id} className="bracket-match">
                            <div className="match-teams">
                              <div className={`team ${partido.resultado && partido.resultado.includes(partido.equipo1?.id) ? 'winner' : ''}`}>
                                <span>{partido.equipo1 ? `Pareja ${partido.equipo1.id}` : 'TBD'}</span>
                              </div>
                              <div className="vs-bracket">VS</div>
                              <div className={`team ${partido.resultado && partido.resultado.includes(partido.equipo2?.id) ? 'winner' : ''}`}>
                                <span>{partido.equipo2 ? `Pareja ${partido.equipo2.id}` : 'TBD'}</span>
                              </div>
                            </div>
                            
                            <div className="match-info">
                              <IonChip color={getPartidoEstadoColor(partido.estado)}>
                                {partido.estado}
                              </IonChip>
                              
                              {partido.estado === 'finalizado' && partido.notas && (
                                <small className="resultado-sets">{partido.notas}</small>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'fixture' && (
          <div className="fixture-tab">
            {partidos.length === 0 ? (
              <IonCard className="empty-state">
                <IonCardContent>
                  <IonIcon icon={playOutline} />
                  <h2>No hay cuadro generado</h2>
                  <p>El cuadro se generará automáticamente cuando haya suficientes parejas inscritas.</p>
                </IonCardContent>
              </IonCard>
            ) : (
              <div className="partidos-list">
                {partidos.map((partido) => (
                  <IonCard key={partido.id} className="partido-card">
                    <IonCardContent>
                      <div className="partido-header">
                        <h3>Partido #{partido.id}</h3>
                        <IonChip color={getPartidoEstadoColor(partido.estado)}>
                          {partido.estado}
                        </IonChip>
                      </div>
                      
                      <div className="partido-equipos">
                        <div className="equipo">
                          <span>Pareja {partido.id_equipo1}</span>
                        </div>
                        <span className="vs">VS</span>
                        <div className="equipo">
                          <span>Pareja {partido.id_equipo2}</span>
                        </div>
                      </div>

                      {partido.ronda && (
                        <div className="partido-info">
                          <IonChip color="tertiary">{partido.ronda}</IonChip>
                        </div>
                      )}
                      
                      {partido.resultado && (
                        <div className="resultado">
                          <strong>Resultado registrado</strong>
                        </div>
                      )}

                      {canManage && partido.estado === 'programado' && (
                        <div className="partido-actions">
                          <IonButton 
                            fill="clear" 
                            size="small"
                            onClick={() => {
                              setSelectedPartido(partido);
                              setIsResultModalOpen(true);
                            }}
                          >
                            <IonIcon icon={createOutline} slot="start" />
                            Registrar Resultado
                          </IonButton>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para inscribir pareja */}
      <IonModal className="modal-inscripcion" isOpen={isInscriptionModalOpen} onDidDismiss={() => setIsInscriptionModalOpen(false)}>
        <IonHeader className="modal-header-profesional">
          <IonToolbar className="modal-header-profesional">
            <IonTitle>
              <h2>
                <IonIcon icon={addOutline} className="modal-inscripcion-icon" />
                Inscribir Pareja
              </h2>
            </IonTitle>
            <IonButtons slot="end">
              <IonButton 
                fill="clear" 
                onClick={() => setIsInscriptionModalOpen(false)}
              >
                ×
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content-profesional">
          {/* Información del proceso */}
          <div className="inscripcion-form-section">
            <h3 className="inscripcion-section-title">
              <IonIcon icon={informationCircleOutline} />
              Información
            </h3>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem', lineHeight: '1.5', margin: '0' }}>
              Selecciona dos jugadores para formar una pareja y elige la categoría correspondiente para inscribirlos en el torneo.
            </p>
          </div>

          {/* Selección de jugadores */}
          <div className="inscripcion-form-section">
            <h3 className="inscripcion-section-title">
              <IonIcon icon={peopleOutline} />
              Selección de Jugadores
            </h3>
            
            <IonItem>
              <IonLabel position="stacked">Jugador 1 *</IonLabel>
              <IonSelect
                value={inscriptionData.jugador1_id}
                onIonChange={(e) => setInscriptionData({ ...inscriptionData, jugador1_id: e.detail.value })}
                placeholder="Selecciona el primer jugador"
              >
                {usuarios.map((usuario) => (
                  <IonSelectOption key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Jugador 2 *</IonLabel>
              <IonSelect
                value={inscriptionData.jugador2_id}
                onIonChange={(e) => setInscriptionData({ ...inscriptionData, jugador2_id: e.detail.value })}
                placeholder="Selecciona el segundo jugador"
              >
                {usuarios.filter(u => u.id.toString() !== inscriptionData.jugador1_id).map((usuario) => (
                  <IonSelectOption key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Categoría *</IonLabel>
              <IonSelect
                value={inscriptionData.categoria}
                onIonChange={(e) => setInscriptionData({ ...inscriptionData, categoria: e.detail.value })}
                placeholder="Selecciona la categoría"
              >
                <IonSelectOption value="masculina">Masculina</IonSelectOption>
                <IonSelectOption value="femenina">Femenina</IonSelectOption>
                <IonSelectOption value="mixta">Mixta</IonSelectOption>
                <IonSelectOption value="veteranos">Veteranos</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

          {/* Acciones */}
          <div className="modal-footer-profesional">
            <IonButton 
              fill="outline" 
              className="inscripcion-cancel-btn"
              onClick={() => setIsInscriptionModalOpen(false)}
            >
              <IonIcon slot="start" icon={closeOutline} />
              Cancelar
            </IonButton>
            <IonButton
              className="inscripcion-submit-btn"
              onClick={handleInscribirPareja}
            >
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              Inscribir Pareja
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      {/* Modal para registrar resultado de torneo */}
      <IonModal className="modal-resultado" isOpen={isResultModalOpen} onDidDismiss={() => setIsResultModalOpen(false)}>
        <IonHeader className="modal-header-profesional">
          <IonToolbar className="modal-header-profesional">
            <IonTitle>
              <h2>
                <IonIcon icon={createOutline} className="modal-resultado-icon" />
                Registrar Resultado
              </h2>
            </IonTitle>
            <IonButtons slot="end">
              <IonButton 
                fill="clear" 
                onClick={() => setIsResultModalOpen(false)}
              >
                ×
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content-profesional">
          {selectedPartido && (
            <>
              {/* Información del partido */}
              <div className="resultado-form-section">
                <h3 className="resultado-section-title">
                  <IonIcon icon={informationCircleOutline} />
                  Información del Partido
                </h3>
                <div className="partido-info">
                  <h4>Partido #{selectedPartido.id}</h4>
                  <p>Pareja {selectedPartido.id_equipo1} vs Pareja {selectedPartido.id_equipo2}</p>
                  {selectedPartido.ronda && <IonChip color="tertiary">{selectedPartido.ronda}</IonChip>}
                </div>
              </div>

              {/* Registro de resultado */}
              <div className="resultado-form-section">
                <h3 className="resultado-section-title">
                  <IonIcon icon={trophyOutline} />
                  Resultado del Partido
                </h3>
                
                <IonItem>
                  <IonLabel position="stacked">Resultado (sets) *</IonLabel>
                  <IonInput
                    value={resultData.resultado}
                    onIonInput={(e: any) => setResultData({ ...resultData, resultado: e.detail.value! })}
                    placeholder="Ej: 6-4, 6-2"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Ganador *</IonLabel>
                  <IonSelect
                    value={resultData.ganador}
                    onIonChange={(e) => setResultData({ ...resultData, ganador: e.detail.value })}
                    placeholder="Selecciona el ganador"
                  >
                    <IonSelectOption value={selectedPartido.id_equipo1}>
                      Pareja {selectedPartido.id_equipo1}
                    </IonSelectOption>
                    <IonSelectOption value={selectedPartido.id_equipo2}>
                      Pareja {selectedPartido.id_equipo2}
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>

                <div className="resultado-info-note">
                  <IonIcon icon={flashOutline} />
                  <small>Este resultado actualizará automáticamente el bracket del torneo</small>
                </div>
              </div>

              {/* Acciones */}
              <div className="modal-footer-profesional">
                <IonButton 
                  fill="outline" 
                  className="resultado-cancel-btn"
                  onClick={() => setIsResultModalOpen(false)}
                >
                  <IonIcon slot="start" icon={closeOutline} />
                  Cancelar
                </IonButton>
                <IonButton
                  className="resultado-submit-btn"
                  onClick={handleRegistrarResultadoTorneo}
                >
                  <IonIcon slot="start" icon={checkmarkCircleOutline} />
                  Registrar Resultado
                </IonButton>
              </div>
            </>
          )}
        </IonContent>
      </IonModal>

      {/* Alert para generar fixture */}
      <IonAlert
        isOpen={showGenerateFixtureAlert}
        onDidDismiss={() => setShowGenerateFixtureAlert(false)}
        header="Generar Cuadro"
        message={`¿Estás seguro de generar el cuadro para este torneo? Se crearán los partidos para las ${parejas.length} parejas inscritas.`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Generar',
            handler: handleGenerateFixture
          }
        ]}
      />

      {/* Toast para mensajes */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
      </div>
    </div>
  );
};

export default TorneoDetalle;