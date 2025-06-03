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
  IonList,
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
  IonAvatar
} from '@ionic/react';
import {
  arrowBackOutline,
  addOutline,
  trophyOutline,
  calendarOutline,
  peopleOutline,
  locationOutline,
  timeOutline,
  podiumOutline,
  playOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Torneo, ParejaTorneo, Partido, User } from '../../interfaces';
import ApiService from '../../services/api.service';
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showGenerateFixtureAlert, setShowGenerateFixtureAlert] = useState(false);

  // Formulario de inscripción
  const [inscriptionData, setInscriptionData] = useState({
    jugador1_id: '',
    jugador2_id: '',
    categoria: ''
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
        loadUsuarios()
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
    const response = await ApiService.get('/users/basic');
    if (response && Array.isArray(response)) {
      setUsuarios(response);
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
      const response = await ApiService.post(`/torneos/${id}/generar_fixture`);
      if (response) {
        setToastMessage('Fixture generado exitosamente');
        setShowToast(true);
        setShowGenerateFixtureAlert(false);
        loadPartidos();
      }
    } catch (error) {
      console.error('Error al generar fixture:', error);
      setToastMessage('Error al generar el fixture');
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
      {/* Header */}
      <div className="torneo-header">
        <IonButton fill="clear" onClick={() => navigate(-1)}>
          <IonIcon icon={arrowBackOutline} />
        </IonButton>
        <div className="header-content">
          <h1>{torneo.nombre}</h1>
          <div className="header-info">
            <IonChip color="primary">
              <IonIcon icon={trophyOutline} />
              <IonLabel>{torneo.tipo}</IonLabel>
            </IonChip>
            <IonChip color="success">
              <IonIcon icon={calendarOutline} />
              <IonLabel>{formatDate(torneo.fecha_inicio)}</IonLabel>
            </IonChip>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <IonSegment value={selectedTab} onIonChange={(e) => setSelectedTab(e.detail.value as string)}>
        <IonSegmentButton value="info">
          <IonLabel>Información</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="parejas">
          <IonLabel>Parejas ({parejas.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="fixture">
          <IonLabel>Fixture ({partidos.length})</IonLabel>
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

            {canManage && (
              <div className="admin-actions">
                <IonButton expand="block" fill="outline" onClick={() => setIsInscriptionModalOpen(true)}>
                  <IonIcon icon={addOutline} slot="start" />
                  Inscribir Pareja
                </IonButton>
                
                {parejas.length >= 2 && (
                  <IonButton 
                    expand="block" 
                    onClick={() => setShowGenerateFixtureAlert(true)}
                    disabled={partidos.length > 0}
                  >
                    <IonIcon icon={playOutline} slot="start" />
                    {partidos.length > 0 ? 'Fixture Ya Generado' : 'Generar Fixture'}
                  </IonButton>
                )}
              </div>
            )}
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
                              <IonAvatar>
                                <IonIcon icon={personOutline} />
                              </IonAvatar>
                              <span>{getUserName(pareja.jugador1_id)}</span>
                            </div>
                            
                            <div className="jugador">
                              <IonAvatar>
                                <IonIcon icon={personOutline} />
                              </IonAvatar>
                              <span>{getUserName(pareja.jugador2_id)}</span>
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

        {selectedTab === 'fixture' && (
          <div className="fixture-tab">
            {partidos.length === 0 ? (
              <IonCard className="empty-state">
                <IonCardContent>
                  <IonIcon icon={playOutline} />
                  <h2>No hay fixture generado</h2>
                  <p>El fixture se generará automáticamente cuando haya suficientes parejas inscritas.</p>
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
                          <strong>Resultado: {partido.resultado}</strong>
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
      <IonModal isOpen={isInscriptionModalOpen} onDidDismiss={() => setIsInscriptionModalOpen(false)}>
        <div className="modal-header">
          <h2>Inscribir Pareja</h2>
          <IonButton fill="clear" onClick={() => setIsInscriptionModalOpen(false)}>
            Cancelar
          </IonButton>
        </div>

        <div className="modal-content">
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

        <div className="modal-footer">
          <IonButton expand="block" onClick={handleInscribirPareja}>
            <IonIcon icon={checkmarkCircleOutline} slot="start" />
            Inscribir Pareja
          </IonButton>
        </div>
      </IonModal>

      {/* Alert para generar fixture */}
      <IonAlert
        isOpen={showGenerateFixtureAlert}
        onDidDismiss={() => setShowGenerateFixtureAlert(false)}
        header="Generar Fixture"
        message={`¿Estás seguro de generar el fixture para este torneo? Se crearán los partidos para las ${parejas.length} parejas inscritas.`}
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
  );
};

export default TorneoDetalle;