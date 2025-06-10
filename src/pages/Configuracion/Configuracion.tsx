// src/pages/Configuracion/Configuracion.tsx
import React, { useEffect, useState } from 'react';
import {
  IonPage, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonToggle, 
  IonButton, 
  IonAlert, 
  IonIcon, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonText, 
  IonChip, 
  IonList,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import {
  businessOutline, 
  addOutline, 
  timeOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline,
  settingsOutline,
  trashOutline,
  moonOutline,
  sunnyOutline
} from 'ionicons/icons';
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import solicitudesService, { MiSolicitudClub } from '../../services/solicitudes.service';
import '../../theme/variables.css';
import "./Configuracion.css";

const Configuracion: React.FC = () => {

  const { theme, toggleTheme } = useTheme();
  const { deleteAccount, user } = useAuth();
  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [misSolicitudes, setMisSolicitudes] = useState<MiSolicitudClub[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [tieneSolicitudPendiente, setTieneSolicitudPendiente] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('ion-palette-dark');
    } else {
      html.classList.remove('ion-palette-dark');
    }
  }, [theme]);

  useEffect(() => {
    // Solo cargar solicitudes si es usuario regular (no admin ni club)
    if (user && ['USUARIO', 'SOCIO'].includes(user.role?.toUpperCase())) {
      loadMisSolicitudes();
    }
  }, [user]);

  const loadMisSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const response = await solicitudesService.misSolicitudesClub();
      const solicitudes = response.data || [];
      setMisSolicitudes(solicitudes);
      
      // Verificar si tiene solicitud pendiente
      const pendiente = solicitudes.some(s => s.estado === 'PENDIENTE');
      setTieneSolicitudPendiente(pendiente);
    } catch (error: any) {
      console.error('Error al cargar solicitudes:', error);
      setMisSolicitudes([]);
      setTieneSolicitudPendiente(false);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleDelete = async () => {
    await deleteAccount();
    navigate('/login');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'APROBADA': return 'success';
      case 'RECHAZADA': return 'danger';
      default: return 'medium';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return timeOutline;
      case 'APROBADA': return checkmarkCircleOutline;
      case 'RECHAZADA': return closeCircleOutline;
      default: return businessOutline;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shouldShowClubSection = () => {
    return user && ['USUARIO', 'SOCIO'].includes(user.role?.toUpperCase());
  };

  return (
    <IonPage>
      <IonContent>
        <IonLoading isOpen={loadingSolicitudes} message="Cargando solicitudes..." />
        
        <div className="configuracion-container">
          <div className="configuracion-content">
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="8" offsetMd="2">
                  {/* Header con título */}
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle style={{ fontWeight: 'bold' }}>
                        Configuración
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>Personaliza tu experiencia en Play4Padel y gestiona las opciones de tu cuenta.</p>
                    </IonCardContent>
                  </IonCard>
                  {/* Sección de Preferencias */}
                  <IonCard className="configuracion-section">
                    <IonCardHeader className="section-header">
                      <div className="section-header-content">
                        <IonIcon icon={settingsOutline} className="section-icon" />
                        <IonCardTitle>Preferencias</IonCardTitle>
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonItem className="config-item">
                        <IonIcon icon={theme === 'dark' ? moonOutline : sunnyOutline} slot="start" className="item-icon" />
                        <IonLabel>
                          <h3>Modo oscuro</h3>
                          <p>Cambia la apariencia de la aplicación</p>
                        </IonLabel>
                        <IonToggle 
                          checked={theme === 'dark'} 
                          onIonChange={toggleTheme}
                          slot="end"
                        />
                      </IonItem>
                    </IonCardContent>
                  </IonCard>

                  {/* Sección de Gestión de Club - Solo para usuarios normales */}
                  {shouldShowClubSection() && (
                    <IonCard className="configuracion-section">
                      <IonCardHeader className="section-header">
                        <div className="section-header-content">
                          <IonIcon icon={businessOutline} className="section-icon" />
                          <IonCardTitle>Gestión de Club</IonCardTitle>
                        </div>
                      </IonCardHeader>
                      <IonCardContent>
                        {misSolicitudes && misSolicitudes.length > 0 ? (
                          <>
                            <div className="subsection-title">
                              <h3>Mis Solicitudes de Club</h3>
                            </div>
                            <div className="solicitudes-list">
                              {misSolicitudes.map((solicitud) => (
                                <div key={solicitud.id} className="solicitud-card">
                                  <div className="solicitud-header">
                                    <div className="solicitud-info">
                                      <IonIcon icon={getEstadoIcon(solicitud.estado)} className="solicitud-icon" />
                                      <div className="solicitud-details">
                                        <h4>{solicitud.nombre_club}</h4>
                                        <p className="solicitud-date">Solicitado: {formatDate(solicitud.fecha_solicitud)}</p>
                                        {solicitud.fecha_respuesta && (
                                          <p className="solicitud-date">Respondido: {formatDate(solicitud.fecha_respuesta)}</p>
                                        )}
                                      </div>
                                    </div>
                                    <IonChip color={getEstadoColor(solicitud.estado)} className="estado-chip">
                                      {solicitud.estado}
                                    </IonChip>
                                  </div>
                                  
                                  {solicitud.motivo_rechazo && (
                                    <div className="solicitud-mensaje rechazo">
                                      <strong>Motivo del rechazo:</strong> {solicitud.motivo_rechazo}
                                    </div>
                                  )}
                                  
                                  {solicitud.comentarios_admin && (
                                    <div className="solicitud-mensaje comentarios">
                                      <strong>Comentarios:</strong> {solicitud.comentarios_admin}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {!tieneSolicitudPendiente && (
                              <IonButton 
                                expand="block" 
                                fill="outline"
                                onClick={() => navigate('/solicitar-club')}
                                className="nuevo-club-btn"
                              >
                                <IonIcon icon={addOutline} slot="start" />
                                Nueva Solicitud
                              </IonButton>
                            )}
                          </>
                        ) : (
                          <div className="club-info">
                            <div className="club-benefits">
                              <h3>¿Quieres crear un club?</h3>
                              <p>Si tienes un club de pádel o quieres crear uno, puedes solicitar convertirte en administrador de club.</p>
                              
                              <div className="benefits-list">
                                <h4>Beneficios:</h4>
                                <div className="benefit-item">
                                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                                  <span>Gestiona pistas y reservas</span>
                                </div>
                                <div className="benefit-item">
                                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                                  <span>Organiza torneos y eventos</span>
                                </div>
                                <div className="benefit-item">
                                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                                  <span>Administra socios</span>
                                </div>
                                <div className="benefit-item">
                                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                                  <span>Accede a estadísticas</span>
                                </div>
                              </div>
                            </div>
                            
                            <IonButton 
                              expand="block" 
                              onClick={() => navigate('/solicitar-club')}
                              disabled={tieneSolicitudPendiente}
                              className="solicitar-club-btn"
                            >
                              <IonIcon icon={addOutline} slot="start" />
                              {tieneSolicitudPendiente ? 'Solicitud Pendiente' : 'Solicitar Crear Club'}
                            </IonButton>
                          </div>
                        )}
                      </IonCardContent>
                    </IonCard>
                  )}

                  {/* Sección de Cuenta */}
                  <IonCard className="configuracion-section danger-section">
                    <IonCardHeader className="section-header">
                      <div className="section-header-content">
                        <IonIcon icon={trashOutline} className="section-icon danger" />
                        <IonCardTitle className="danger-title">Eliminar Cuenta</IonCardTitle>
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="danger-content">
                        <p className="danger-warning">
                          Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
                          Esta acción no se puede deshacer.
                        </p>
                        <IonButton 
                          color="danger"
                          fill="solid"
                          expand="block"
                          onClick={() => setShowAlert(true)}
                          className="delete-account-btn"
                        >
                          <IonIcon icon={trashOutline} slot="start" />
                          Eliminar Cuenta
                        </IonButton>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>

          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Confirmar eliminación"
            message="¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
            buttons={[
              {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {},
              },
              {
                text: 'Eliminar',
                role: 'destructive',
                handler: handleDelete,
              },
            ]}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Configuracion;