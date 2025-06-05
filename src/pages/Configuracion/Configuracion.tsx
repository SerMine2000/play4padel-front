// src/pages/Configuracion.tsx
import React, { useEffect, useState } from 'react';
import Estructura from '../../components/Estructura';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonToggle, IonButton, IonAlert, IonBackButton, IonButtons, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonChip, IonList } from '@ionic/react';
import { arrowBack, businessOutline, addOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
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
      <IonContent style={{ paddingLeft: 260, maxWidth: 900, margin: '0 auto', boxSizing: 'border-box' }}>
          <div className="configuracion-container">
            <div className="configuracion-panel">
              <h2>Preferencias</h2>
              <IonItem>
                <IonLabel>Cambiar a modo oscuro</IonLabel>
                <IonToggle checked={theme === 'dark'} onIonChange={toggleTheme} />
              </IonItem>

              {/* Sección de Club - Solo para usuarios normales */}
              {shouldShowClubSection() && (
                <>
                  <h2>
                    <IonIcon icon={businessOutline} style={{ marginRight: '0.5rem' }} />
                    Gestión de Club
                  </h2>
                  
                  {misSolicitudes && misSolicitudes.length > 0 ? (
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Mis Solicitudes de Club</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <IonList>
                          {misSolicitudes.map((solicitud) => (
                            <IonItem key={solicitud.id}>
                              <IonIcon icon={getEstadoIcon(solicitud.estado)} slot="start" />
                              <IonLabel>
                                <h3>{solicitud.nombre_club}</h3>
                                <p>Solicitado: {formatDate(solicitud.fecha_solicitud)}</p>
                                {solicitud.fecha_respuesta && (
                                  <p>Respondido: {formatDate(solicitud.fecha_respuesta)}</p>
                                )}
                                {solicitud.motivo_rechazo && (
                                  <p style={{ color: 'var(--ion-color-danger)', fontSize: '0.9rem' }}>
                                    <strong>Motivo:</strong> {solicitud.motivo_rechazo}
                                  </p>
                                )}
                                {solicitud.comentarios_admin && (
                                  <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                                    <strong>Comentarios:</strong> {solicitud.comentarios_admin}
                                  </p>
                                )}
                              </IonLabel>
                              <IonChip color={getEstadoColor(solicitud.estado)} slot="end">
                                {solicitud.estado}
                              </IonChip>
                            </IonItem>
                          ))}
                        </IonList>
                        
                        {!tieneSolicitudPendiente && (
                          <IonButton 
                            expand="block" 
                            fill="outline"
                            onClick={() => navigate('/solicitar-club')}
                            style={{ marginTop: '1rem' }}
                          >
                            <IonIcon icon={addOutline} slot="start" />
                            Nueva Solicitud
                          </IonButton>
                        )}
                      </IonCardContent>
                    </IonCard>
                  ) : (
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>¿Quieres crear un club?</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <IonText>
                          <p>Si tienes un club de pádel o quieres crear uno, puedes solicitar convertirte en administrador de club.</p>
                          <p><strong>Beneficios:</strong></p>
                          <ul style={{ marginLeft: '1rem' }}>
                            <li>Gestiona pistas y reservas</li>
                            <li>Organiza torneos y eventos</li>
                            <li>Administra socios</li>
                            <li>Accede a estadísticas</li>
                          </ul>
                        </IonText>
                        
                        <IonButton 
                          expand="block" 
                          onClick={() => navigate('/solicitar-club')}
                          style={{ marginTop: '1rem' }}
                          disabled={tieneSolicitudPendiente}
                        >
                          <IonIcon icon={addOutline} slot="start" />
                          {tieneSolicitudPendiente ? 'Solicitud Pendiente' : 'Solicitar Crear Club'}
                        </IonButton>
                        
                        {loadingSolicitudes && (
                          <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem' }}>
                            Cargando solicitudes...
                          </IonText>
                        )}
                      </IonCardContent>
                    </IonCard>
                  )}
                </>
              )}

              <h2>Eliminar cuenta</h2>
              <IonButton className="boton-rojo" onClick={() => setShowAlert(true)}>
                Borrar cuenta
              </IonButton>
            </div>

            <IonAlert
              isOpen={showAlert}
              onDidDismiss={() => setShowAlert(false)}
              header="Confirmar eliminación"
              message="¿Estás seguro de que quieres eliminar tu cuenta?"
              buttons={[
                {
                  text: 'Cancelar',
                  role: 'cancel',
                  handler: () => {},
                },
                {
                  text: 'Eliminar',
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
