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
  IonRange,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent
} from '@ionic/react';
import {
  arrowBackOutline,
  addOutline,
  ribbonOutline,
  calendarOutline,
  peopleOutline,
  trophyOutline,
  playOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  podiumOutline,
  statsChartOutline,
  medalOutline,
  cashOutline,
  createOutline,
  informationCircleOutline,
  closeOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Liga, ParejasLiga, Partido, User } from '../../interfaces';
import ApiService from '../../services/api.service';
import './LigaDetalle.css';

const LigaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [liga, setLiga] = useState<Liga | null>(null);
  const [parejas, setParejas] = useState<ParejasLiga[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [clasificacion, setClasificacion] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('info');
  const [isInscriptionModalOpen, setIsInscriptionModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showGeneratePartidosAlert, setShowGeneratePartidosAlert] = useState(false);

  // Formulario de inscripción
  const [inscriptionData, setInscriptionData] = useState({
    id_jugador1: '',
    id_jugador2: '',
    nombre_equipo: ''
  });

  // Formulario de resultado
  const [resultData, setResultData] = useState({
    resultado: '',
    ganador: '',
    empate: false,
    bonus_equipo1: 0,
    bonus_equipo2: 0
  });

  const userRole = (user?.role || '').toUpperCase();
  const canManage = ['ADMIN', 'CLUB'].includes(userRole);

  useEffect(() => {
    if (id) {
      loadLigaData();
    }
  }, [id]);

  const loadLigaData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLiga(),
        loadParejas(),
        loadPartidos(),
        loadClasificacion(),
        loadUsuarios()
      ]);
    } catch (error) {
      console.error('Error al cargar datos de la liga:', error);
      setToastMessage('Error al cargar los datos de la liga');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadLiga = async () => {
    const response = await ApiService.get(`/ligas/${id}`);
    if (response) {
      setLiga(response);
    }
  };

  const loadParejas = async () => {
    const response = await ApiService.get(`/ligas/${id}/parejas`);
    if (response && Array.isArray(response)) {
      setParejas(response);
    }
  };

  const loadPartidos = async () => {
    const response = await ApiService.get(`/ligas/${id}/partidos`);
    if (response && Array.isArray(response)) {
      setPartidos(response);
    }
  };

  const loadClasificacion = async () => {
    const response = await ApiService.get(`/ligas/${id}/clasificacion`);
    if (response && Array.isArray(response)) {
      setClasificacion(response);
    }
  };

  const loadUsuarios = async () => {
    try {
      console.log('🔍 Cargando usuarios con roles para liga...');
      // Usar el endpoint /users que incluye información de roles (requiere autenticación)
      const response = await ApiService.get('/users');
      
      if (response && Array.isArray(response)) {
        setUsuarios(response);
        console.log('✅ Usuarios cargados para liga:', response.length);
        
        // Log de los roles encontrados para debugging
        const rolesEncontrados = response.map(u => u.rol?.nombre).filter(Boolean);
        console.log('🎭 Roles encontrados en liga:', [...new Set(rolesEncontrados)]);
      }
    } catch (error) {
      console.error('❌ Error al cargar usuarios para liga:', error);
      // Fallback al endpoint básico si falla
      try {
        console.log('🔄 Fallback al endpoint básico para liga...');
        const response = await ApiService.get('/users/basic');
        if (response && Array.isArray(response)) {
          setUsuarios(response);
          console.log('⚠️ Usuarios de liga cargados sin información de roles');
        }
      } catch (apiError) {
        console.error('❌ Error con fallback en liga también:', apiError);
      }
    }
  };

  const handleInscribirPareja = async () => {
    try {
      console.log('Datos de inscripción antes de validar:', inscriptionData); // Debug
      
      // Validación más específica
      if (!inscriptionData.nombre_equipo || inscriptionData.nombre_equipo.trim() === '') {
        setToastMessage('Por favor ingresa el nombre del equipo');
        setShowToast(true);
        return;
      }

      if (!inscriptionData.id_jugador1 || inscriptionData.id_jugador1 === '') {
        setToastMessage('Por favor selecciona el primer jugador');
        setShowToast(true);
        return;
      }

      if (!inscriptionData.id_jugador2 || inscriptionData.id_jugador2 === '') {
        setToastMessage('Por favor selecciona el segundo jugador');
        setShowToast(true);
        return;
      }

      if (inscriptionData.id_jugador1.toString() === inscriptionData.id_jugador2.toString()) {
        setToastMessage('Los jugadores deben ser diferentes');
        setShowToast(true);
        return;
      }

      // Validar que la pareja no esté ya inscrita (verificar ambos órdenes de jugadores)
      const jugador1Id = parseInt(inscriptionData.id_jugador1.toString());
      const jugador2Id = parseInt(inscriptionData.id_jugador2.toString());
      
      const parejaExistente = parejas.find(pareja => 
        (pareja.id_jugador1 === jugador1Id && pareja.id_jugador2 === jugador2Id) ||
        (pareja.id_jugador1 === jugador2Id && pareja.id_jugador2 === jugador1Id)
      );

      if (parejaExistente) {
        const nombreJugador1 = getUserName(jugador1Id);
        const nombreJugador2 = getUserName(jugador2Id);
        setToastMessage(`La pareja ${nombreJugador1} y ${nombreJugador2} ya está inscrita en esta liga`);
        setShowToast(true);
        return;
      }

      // Preparar datos para envío
      const dataToSend = {
        id_jugador1: parseInt(inscriptionData.id_jugador1.toString()),
        id_jugador2: parseInt(inscriptionData.id_jugador2.toString()),
        nombre_equipo: inscriptionData.nombre_equipo.trim()
      };

      console.log('Datos a enviar:', dataToSend); // Debug

      const response = await ApiService.post(`/ligas/${id}/inscribir_pareja`, dataToSend);

      if (response) {
        setToastMessage('Pareja inscrita exitosamente');
        setShowToast(true);
        setIsInscriptionModalOpen(false);
        resetInscriptionForm();
        loadParejas();
        loadClasificacion();
      }
    } catch (error) {
      console.error('Error al inscribir pareja:', error);
      setToastMessage('Error al inscribir la pareja. Verifica que los datos sean correctos.');
      setShowToast(true);
    }
  };

  const handleGeneratePartidos = async () => {
    try {
      const response = await ApiService.post(`/ligas/${id}/generar_partidos`, {});
      if (response) {
        setToastMessage('Partidos generados exitosamente');
        setShowToast(true);
        setShowGeneratePartidosAlert(false);
        loadPartidos();
      }
    } catch (error) {
      console.error('Error al generar partidos:', error);
      setToastMessage('Error al generar los partidos');
      setShowToast(true);
    }
  };

  const handleRegistrarResultado = async () => {
    try {
      if (!resultData.resultado) {
        setToastMessage('Por favor ingresa el resultado');
        setShowToast(true);
        return;
      }

      if (!resultData.empate && !resultData.ganador) {
        setToastMessage('Por favor selecciona el ganador o marca como empate');
        setShowToast(true);
        return;
      }

      const response = await ApiService.put(`/ligas/partidos/${selectedPartido?.id}/resultado`, {
        resultado: resultData.resultado,
        ganador: resultData.empate ? null : parseInt(resultData.ganador),
        empate: resultData.empate,
        bonus_equipo1: resultData.bonus_equipo1,
        bonus_equipo2: resultData.bonus_equipo2
      });

      if (response) {
        setToastMessage('Resultado registrado exitosamente');
        setShowToast(true);
        setIsResultModalOpen(false);
        resetResultForm();
        loadPartidos();
        loadClasificacion();
      }
    } catch (error) {
      console.error('Error al registrar resultado:', error);
      setToastMessage('Error al registrar el resultado');
      setShowToast(true);
    }
  };

  const resetInscriptionForm = () => {
    setInscriptionData({
      id_jugador1: '',
      id_jugador2: '',
      nombre_equipo: ''
    });
  };

  const resetResultForm = () => {
    setResultData({
      resultado: '',
      ganador: '',
      empate: false,
      bonus_equipo1: 0,
      bonus_equipo2: 0
    });
    setSelectedPartido(null);
  };

  // Función para formatear el premio
  const formatPremio = (premio: any) => {
    if (!premio) return '';
    
    if (typeof premio === 'string') {
      return premio;
    }
    
    if (typeof premio === 'object') {
      // Si es un objeto, convertirlo a string descriptivo
      const premios = [];
      if (premio.primer_puesto) {
        premios.push(`1º lugar: ${premio.primer_puesto}`);
      }
      if (premio.segundo_puesto) {
        premios.push(`2º lugar: ${premio.segundo_puesto}`);
      }
      if (premio.tercer_puesto) {
        premios.push(`3º lugar: ${premio.tercer_puesto}`);
      }
      return premios.join(' • ') || 'Premio disponible';
    }
    
    return String(premio);
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
    if (!usuario) {
      return `Usuario eliminado (ID: ${userId})`;
    }
    return `${usuario.nombre} ${usuario.apellidos}`;
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

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'inscripciones':
        return 'success';
      case 'en_curso':
        return 'warning';
      case 'finalizada':
        return 'medium';
      case 'suspendida':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'inscripciones':
        return 'Inscripciones Abiertas';
      case 'en_curso':
        return 'En Curso';
      case 'finalizada':
        return 'Finalizada';
      case 'suspendida':
        return 'Suspendida';
      default:
        return estado;
    }
  };

  const getPosicionColor = (posicion: number) => {
    switch (posicion) {
      case 1:
        return 'warning'; // Oro
      case 2:
        return 'medium'; // Plata
      case 3:
        return 'tertiary'; // Bronce
      default:
        return 'light';
    }
  };

  const getPosicionIcon = (posicion: number) => {
    switch (posicion) {
      case 1:
      case 2:
      case 3:
        return medalOutline;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <IonSpinner />
      </div>
    );
  }

  if (!liga) {
    return (
      <div className="liga-not-found">
        <IonIcon icon={closeCircleOutline} />
        <h2>Liga no encontrada</h2>
        <IonButton fill="clear" onClick={() => navigate(-1)}>
          <IonIcon icon={arrowBackOutline} slot="start" />
          Volver
        </IonButton>
      </div>
    );
  }

  return (
    <div className={`liga-detalle-container ${theme}`}>
      <div className="liga-content">
      {/* Header rediseñado */}
      <div className="liga-header">
        <div className="header-top">
          <IonButton fill="clear" onClick={() => navigate(-1)}>
            <IonIcon icon={arrowBackOutline} />
            <IonLabel>Volver</IonLabel>
          </IonButton>
          <div className="title-section">
            <h1>{liga.nombre}</h1>
            <div className="title-chips">
              <IonChip className="status-chip chip-activo">
                <IonIcon icon={ribbonOutline} className="icon-themed" />
                <IonLabel>Liga Activa</IonLabel>
              </IonChip>
              <IonChip className="estado-chip" color={getEstadoColor(liga.estado)}>
                <IonLabel>{getEstadoText(liga.estado)}</IonLabel>
              </IonChip>
            </div>
          </div>
        </div>
        
        <div className="header-bottom">
          
          <div className="liga-status">
            {canManage && (
              <div className="header-actions">
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <IonSegment value={selectedTab} onIonChange={(e) => setSelectedTab(e.detail.value as string)} className="tabs-header">
        <IonSegmentButton value="info">
          <IonLabel>Información</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="clasificacion">
          <IonLabel>Clasificación ({clasificacion.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="partidos">
          <IonLabel>Partidos ({partidos.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="parejas">
          <IonLabel>Parejas ({parejas.length})</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {/* Contenido según tab seleccionado */}
      <div className="tab-content">
        {selectedTab === 'info' && (
          <div className="info-tab">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Información de la Liga</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="info-grid">
                  <div className="info-item">
                    <IonIcon icon={calendarOutline} />
                    <div>
                      <h3>Fechas</h3>
                      <p>{formatDate(liga.fecha_inicio)} - {formatDate(liga.fecha_fin)}</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <IonIcon icon={ribbonOutline} />
                    <div>
                      <h3>Categoría</h3>
                      <p>{liga.categoria}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <IonIcon icon={statsChartOutline} />
                    <div>
                      <h3>Nivel</h3>
                      <p>{liga.nivel}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <IonIcon icon={peopleOutline} />
                    <div>
                      <h3>Parejas</h3>
                      <p>{parejas.length} / {liga.max_parejas}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <IonIcon icon={cashOutline} />
                    <div>
                      <h3>Inscripción</h3>
                      <p>€{liga.precio_inscripcion}</p>
                    </div>
                  </div>

                  {liga.premio && (
                    <div className="info-item">
                      <IonIcon icon={trophyOutline} />
                      <div>
                        <h3>Premio</h3>
                        <p>{formatPremio(liga.premio)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {liga.descripcion && (
                  <div className="descripcion-section">
                    <h3>Descripción</h3>
                    <p>{liga.descripcion}</p>
                  </div>
                )}

                {liga.reglas && (
                  <div className="reglas-section">
                    <h3>Reglas</h3>
                    <p>{liga.reglas}</p>
                  </div>
                )}

                <div className="scoring-section">
                  <div className="scoring-header">
                    <IonIcon icon={statsChartOutline} />
                    <h3>Sistema de Puntuación</h3>
                  </div>
                  <div className="scoring-grid">
                    <div className="scoring-card victory">
                      <div className="scoring-icon">
                        <IonIcon icon={trophyOutline} />
                      </div>
                      <div className="scoring-content">
                        <span className="label">Victoria</span>
                        <span className="value">{liga.puntos_victoria} pts</span>
                      </div>
                    </div>
                    {liga.permite_empate && (
                      <div className="scoring-card draw">
                        <div className="scoring-icon">
                          <IonIcon icon={ribbonOutline} />
                        </div>
                        <div className="scoring-content">
                          <span className="label">Empate</span>
                          <span className="value">{liga.puntos_empate} pts</span>
                        </div>
                      </div>
                    )}
                    <div className="scoring-card defeat">
                      <div className="scoring-icon">
                        <IonIcon icon={closeCircleOutline} />
                      </div>
                      <div className="scoring-content">
                        <span className="label">Derrota</span>
                        <span className="value">{liga.puntos_derrota} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

          </div>
        )}

        {selectedTab === 'clasificacion' && (
          <div className="clasificacion-tab">
            {clasificacion.length === 0 ? (
              <IonCard className="empty-state">
                <IonCardContent>
                  <IonIcon icon={podiumOutline} />
                  <h2>No hay clasificación disponible</h2>
                  <p>La clasificación aparecerá cuando haya resultados registrados.</p>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonCard className="clasificacion-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={podiumOutline} />
                    Clasificación General
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="clasificacion-list">
                    {clasificacion.map((equipo, index) => (
                      <div key={equipo.id} className={`clasificacion-item posicion-${index + 1}`}>
                        <div className="posicion">
                          {getPosicionIcon(index + 1) && (
                            <IonIcon 
                              icon={getPosicionIcon(index + 1)} 
                              color={getPosicionColor(index + 1)}
                            />
                          )}
                          <span className="numero">#{index + 1}</span>
                        </div>
                        
                        <div className="equipo-info">
                          <h3>{equipo.nombre_equipo}</h3>
                          <div className="stats">
                            <span>PJ: {equipo.partidos_jugados}</span>
                            <span>PG: {equipo.partidos_ganados}</span>
                            <span>PP: {equipo.partidos_perdidos}</span>
                          </div>
                        </div>
                        
                        <div className="puntos">
                          <span className="puntos-value">{equipo.puntos}</span>
                          <span className="puntos-label">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </div>
        )}

        {selectedTab === 'partidos' && (
          <div className="partidos-tab">
            {partidos.length === 0 ? (
              <>
                {canManage && parejas.length >= 2 && (
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12">
                        <IonButton 
                          onClick={() => setShowGeneratePartidosAlert(true)}
                          disabled={partidos.length > 0}
                          fill="outline"
                        >
                          <IonIcon icon={playOutline} slot="start" />
                          <IonLabel>Generar Partidos</IonLabel>
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                )}
                <IonCard className="empty-state">
                  <IonCardContent>
                    <IonIcon icon={playOutline} />
                    <h2>No hay partidos generados</h2>
                    <p>Los partidos se generarán automáticamente cuando haya suficientes parejas.</p>
                  </IonCardContent>
                </IonCard>
              </>
            ) : (
              <>
                {canManage && (
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12">
                        <IonButton 
                          onClick={() => setShowGeneratePartidosAlert(true)}
                          disabled={partidos.length > 0}
                          fill="outline"
                        >
                          <IonIcon icon={playOutline} slot="start" />
                          <IonLabel>Partidos Ya Generados</IonLabel>
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                )}
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
                            <span>{partido.nombre_equipo1 || `Equipo ${partido.id_equipo1}`}</span>
                          </div>
                          <span className="vs">VS</span>
                          <div className="equipo">
                            <span>{partido.nombre_equipo2 || `Equipo ${partido.id_equipo2}`}</span>
                          </div>
                        </div>
                        
                        {partido.resultado && (
                          <div className="resultado">
                            <strong>Resultado: {partido.resultado}</strong>
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
              </>
            )}
          </div>
        )}

        {selectedTab === 'parejas' && (
          <div className="parejas-tab">
            {parejas.length === 0 ? (
              <>
                {canManage && (
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12">
                        <IonButton onClick={() => setIsInscriptionModalOpen(true)} className="inscribir-button" fill="outline">
                          <IonIcon icon={addOutline} slot="start" className="icon-themed" />
                          <IonLabel>Inscribir Pareja</IonLabel>
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                )}
                <IonCard className="empty-state">
                  <IonCardContent>
                    <IonIcon icon={peopleOutline} />
                    <h2>No hay parejas inscritas</h2>
                    <p>Las parejas aparecerán aquí cuando se inscriban a la liga.</p>
                  </IonCardContent>
                </IonCard>
              </>
            ) : (
              <IonGrid>
                {canManage && (
                  <IonRow>
                    <IonCol size="12">
                      <IonButton onClick={() => setIsInscriptionModalOpen(true)} className="inscribir-button" fill="outline">
                        <IonIcon icon={addOutline} slot="start" className="icon-themed" />
                        <IonLabel>Inscribir Pareja</IonLabel>
                      </IonButton>
                    </IonCol>
                  </IonRow>
                )}
                <IonRow>
                  {parejas.map((pareja, index) => (
                    <IonCol size="12" sizeMd="6" key={pareja.id}>
                      <IonCard className="pareja-card">
                        <IonCardContent>
                          <div className="pareja-header">
                            <h3>{pareja.nombre_equipo}</h3>
                            <IonBadge color="primary">#{index + 1}</IonBadge>
                          </div>
                          
                          <div className="jugadores">
                            <div className="jugador">
                              <div className="jugador-avatar">
                                {(() => {
                                  const usuario = usuarios.find(u => u.id === pareja.id_jugador1);
                                  const avatarUrl = usuario?.avatar_url;
                                  
                                  if (avatarUrl && avatarUrl.trim() !== '') {
                                    return (
                                      <>
                                        <img 
                                          src={avatarUrl} 
                                          alt={getUserName(pareja.id_jugador1)}
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
                                <div className="jugador-nombre">{getUserName(pareja.id_jugador1)}</div>
                                <div className="jugador-email">{usuarios.find(u => u.id === pareja.id_jugador1)?.email || ''}</div>
                              </div>
                            </div>
                            
                            <div className="jugador">
                              <div className="jugador-avatar">
                                {(() => {
                                  const usuario = usuarios.find(u => u.id === pareja.id_jugador2);
                                  const avatarUrl = usuario?.avatar_url;
                                  
                                  if (avatarUrl && avatarUrl.trim() !== '') {
                                    return (
                                      <>
                                        <img 
                                          src={avatarUrl} 
                                          alt={getUserName(pareja.id_jugador2)}
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
                                <div className="jugador-nombre">{getUserName(pareja.id_jugador2)}</div>
                                <div className="jugador-email">{usuarios.find(u => u.id === pareja.id_jugador2)?.email || ''}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="estadisticas">
                            <div className="stat">
                              <span className="label">Puntos:</span>
                              <span className="value">{pareja.puntos}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Partidos:</span>
                              <span className="value">{pareja.partidos_jugados}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Victorias:</span>
                              <span className="value">{pareja.partidos_ganados}</span>
                            </div>
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
      </div>

      {/* Modal para inscribir pareja */}
      <IonModal 
        className="modal-inscripcion" 
        isOpen={isInscriptionModalOpen} 
        onDidDismiss={() => setIsInscriptionModalOpen(false)}
        style={{
          '--height': 'auto',
          '--max-height': '90vh',
          '--border-radius': '16px'
        }}
      >
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
              Selecciona dos jugadores para formar una pareja, asigna un nombre de equipo y regístralos en la liga.
            </p>
          </div>

          {/* Información del equipo */}
          <div className="inscripcion-form-section">
            <h3 className="inscripcion-section-title">
              <IonIcon icon={ribbonOutline} />
              Información del Equipo
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--texto-principal)' }}>
                Nombre del Equipo *
              </label>
              <IonInput
                value={inscriptionData.nombre_equipo}
                onIonInput={(e) => {
                  const newValue = e.detail.value!;
                  console.log('Nombre equipo cambiado a:', newValue);
                  setInscriptionData({ ...inscriptionData, nombre_equipo: newValue });
                }}
                placeholder="Ej: Los Campeones"
                style={{ 
                  border: '1px solid var(--borde-input)', 
                  borderRadius: '12px', 
                  background: 'var(--fondo-input)',
                  minHeight: '48px',
                  '--padding-start': '16px',
                  '--padding-end': '16px'
                }}
              />
            </div>
          </div>

          {/* Selección de jugadores */}
          <div className="inscripcion-form-section">
            <h3 className="inscripcion-section-title">
              <IonIcon icon={peopleOutline} />
              Selección de Jugadores
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--texto-principal)' }}>
                Jugador 1 *
              </label>
              <IonSelect
                value={inscriptionData.id_jugador1}
                onIonChange={(e) => {
                  const newValue = e.detail.value;
                  console.log('Jugador 1 cambiado a:', newValue);
                  setInscriptionData({ ...inscriptionData, id_jugador1: newValue });
                }}
                placeholder="Selecciona el primer jugador"
                style={{ 
                  border: '1px solid var(--borde-input)', 
                  borderRadius: '12px', 
                  background: 'var(--fondo-input)',
                  minHeight: '48px'
                }}
              >
                {usuarios.filter(usuario => {
                  const rolNombre = usuario.rol?.nombre;
                  const esUsuarioOSocio = rolNombre && ['USUARIO', 'SOCIO'].includes(rolNombre);
                  return esUsuarioOSocio;
                }).map((usuario) => (
                  <IonSelectOption key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--texto-principal)' }}>
                Jugador 2 *
              </label>
              <IonSelect
                value={inscriptionData.id_jugador2}
                onIonChange={(e) => {
                  const newValue = e.detail.value;
                  console.log('Jugador 2 cambiado a:', newValue);
                  setInscriptionData({ ...inscriptionData, id_jugador2: newValue });
                }}
                placeholder="Selecciona el segundo jugador"
                style={{ 
                  border: '1px solid var(--borde-input)', 
                  borderRadius: '12px', 
                  background: 'var(--fondo-input)',
                  minHeight: '48px'
                }}
              >
                {usuarios.filter(u => {
                  const rolNombre = u.rol?.nombre;
                  const esUsuarioOSocio = rolNombre && ['USUARIO', 'SOCIO'].includes(rolNombre);
                  const notSamePlayer = u.id.toString() !== inscriptionData.id_jugador1.toString();
                  return notSamePlayer && esUsuarioOSocio;
                }).map((usuario) => (
                  <IonSelectOption key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
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

      {/* Modal para registrar resultado */}
      <IonModal isOpen={isResultModalOpen} onDidDismiss={() => setIsResultModalOpen(false)}>
        <div className="modal-header">
          <h2>Registrar Resultado</h2>
          <IonButton fill="clear" onClick={() => setIsResultModalOpen(false)}>
            Cancelar
          </IonButton>
        </div>

        <div className="modal-content">
          {selectedPartido && (
            <>
              <div className="partido-info">
                <h3>Partido #{selectedPartido.id}</h3>
                <p>{partidos.find(p => p.id === selectedPartido.id)?.nombre_equipo1 || `Equipo ${selectedPartido.id_equipo1}`} vs {partidos.find(p => p.id === selectedPartido.id)?.nombre_equipo2 || `Equipo ${selectedPartido.id_equipo2}`}</p>
              </div>

              <IonItem>
                <IonLabel position="stacked">Resultado *</IonLabel>
                <IonInput
                  value={resultData.resultado}
                  onIonInput={(e) => setResultData({ ...resultData, resultado: e.detail.value! })}
                  placeholder="Ej: 6-4, 6-2"
                />
              </IonItem>

              <IonItem>
                <IonLabel>Empate</IonLabel>
                <IonButton 
                  fill={resultData.empate ? 'solid' : 'outline'} 
                  size="small"
                  onClick={() => setResultData({ ...resultData, empate: !resultData.empate, ganador: '' })}
                  disabled={!liga?.permite_empate}
                >
                  {resultData.empate ? 'Sí' : 'No'}
                </IonButton>
              </IonItem>

              {!resultData.empate && (
                <IonItem>
                  <IonLabel position="stacked">Ganador</IonLabel>
                  <IonSelect
                    value={resultData.ganador}
                    onIonChange={(e) => setResultData({ ...resultData, ganador: e.detail.value })}
                    placeholder="Selecciona el ganador"
                  >
                    <IonSelectOption value={selectedPartido.id_equipo1}>
                      {partidos.find(p => p.id === selectedPartido.id)?.nombre_equipo1 || `Equipo ${selectedPartido.id_equipo1}`}
                    </IonSelectOption>
                    <IonSelectOption value={selectedPartido.id_equipo2}>
                      {partidos.find(p => p.id === selectedPartido.id)?.nombre_equipo2 || `Equipo ${selectedPartido.id_equipo2}`}
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
              )}

              <div className="bonus-section">
                <h4>Puntos Bonus (Opcional)</h4>
                
                <IonItem>
                  <IonLabel>{partidos.find(p => p.id === selectedPartido.id)?.nombre_equipo1 || `Equipo ${selectedPartido.id_equipo1}`}</IonLabel>
                  <IonRange
                    min={0}
                    max={5}
                    value={resultData.bonus_equipo1}
                    onIonInput={(e) => setResultData({ ...resultData, bonus_equipo1: e.detail.value as number })}
                    pin={true}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>{partidos.find(p => p.id === selectedPartido.id)?.nombre_equipo2 || `Equipo ${selectedPartido.id_equipo2}`}</IonLabel>
                  <IonRange
                    min={0}
                    max={5}
                    value={resultData.bonus_equipo2}
                    onIonInput={(e) => setResultData({ ...resultData, bonus_equipo2: e.detail.value as number })}
                    pin={true}
                  />
                </IonItem>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <IonButton expand="block" onClick={handleRegistrarResultado}>
            <IonIcon icon={checkmarkCircleOutline} slot="start" />
            <IonLabel>Registrar Resultado</IonLabel>
          </IonButton>
        </div>
      </IonModal>

      {/* Alert para generar partidos */}
      <IonAlert
        isOpen={showGeneratePartidosAlert}
        onDidDismiss={() => setShowGeneratePartidosAlert(false)}
        header="Generar Partidos"
        message={`¿Estás seguro de generar todos los partidos para esta liga? Se crearán partidos entre las ${parejas.length} parejas inscritas (sistema round robin).`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Generar',
            handler: handleGeneratePartidos
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

export default LigaDetalle;