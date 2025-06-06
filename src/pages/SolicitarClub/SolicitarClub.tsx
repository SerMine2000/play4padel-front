import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonLoading,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonChip,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonText,
  IonNote
} from '@ionic/react';
import {
  businessOutline,
  sendOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  locationOutline,
  callOutline,
  mailOutline,
  globeOutline,
  informationCircleOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import solicitudesService, { SolicitudClubData, MiSolicitudClub } from '../../services/solicitudes.service';
import './SolicitarClub.css';

const SolicitarClub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estado del formulario
  const [formData, setFormData] = useState<SolicitudClubData>({
    nombre_club: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    horario_apertura: '08:00',
    horario_cierre: '22:00',
    sitio_web: '',
    motivo_solicitud: '',
    experiencia_previa: '',
    numero_pistas_estimado: undefined
  });

  // Estado de las solicitudes existentes
  const [misSolicitudes, setMisSolicitudes] = useState<MiSolicitudClub[]>([]);
  const [tieneSolicitudPendiente, setTieneSolicitudPendiente] = useState(false);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  useEffect(() => {
    loadMisSolicitudes();
  }, []);

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
      showToastMessage('Error al cargar solicitudes', 'danger');
      setMisSolicitudes([]); // Asegurar que siempre sea un array
      setTieneSolicitudPendiente(false);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleInputChange = (field: keyof SolicitudClubData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar inputs numéricos (solo números)
  const handleNumericInputChange = (field: keyof SolicitudClubData, value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const validateForm = (): boolean => {
    const required = ['nombre_club', 'direccion', 'horario_apertura', 'horario_cierre', 'motivo_solicitud'];
    
    for (const field of required) {
      if (!formData[field as keyof SolicitudClubData]) {
        showToastMessage(`El campo ${field.replace('_', ' ')} es requerido`, 'warning');
        return false;
      }
    }

    // Validar horarios
    if (formData.horario_apertura >= formData.horario_cierre) {
      showToastMessage('El horario de apertura debe ser anterior al de cierre', 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await solicitudesService.solicitarClub(formData);
      showToastMessage('Solicitud enviada correctamente. Será revisada por el equipo de administración.', 'success');
      
      // Limpiar formulario
      setFormData({
        nombre_club: '',
        descripcion: '',
        direccion: '',
        telefono: '',
        email: '',
        horario_apertura: '08:00',
        horario_cierre: '22:00',
        sitio_web: '',
        motivo_solicitud: '',
        experiencia_previa: '',
        numero_pistas_estimado: undefined
      });
      
      // Recargar solicitudes
      loadMisSolicitudes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al enviar solicitud';
      showToastMessage(message, 'danger');
    } finally {
      setLoading(false);
      setShowConfirmAlert(false);
    }
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
      default: return informationCircleOutline;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <IonPage>
      <IonContent>
        <div className="solicitar-club-container">
          {/* Header con botón de retroceso */}
          <div className="solicitar-club-header">
            <IonIcon
              icon={arrowBackOutline}
              className="back-button"
              onClick={() => navigate(-1)}
            />
            <div className="solicitar-club-header-content">
              <h1 className="solicitar-club-title">Solicitar Crear Club</h1>
              <p className="solicitar-club-description">
                Envía tu solicitud para convertirte en administrador de un nuevo club de pádel
              </p>
            </div>
          </div>

          {/* Mis Solicitudes */}
          {misSolicitudes && misSolicitudes.length > 0 && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Mis Solicitudes</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {loadingSolicitudes ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <IonText>Cargando solicitudes...</IonText>
                  </div>
                ) : (
                  <IonList>
                    {misSolicitudes.map((solicitud) => (
                      <IonItem key={solicitud.id}>
                        <IonIcon icon={getEstadoIcon(solicitud.estado)} slot="start" />
                        <IonLabel>
                          <h3>{solicitud.nombre_club}</h3>
                          <p>Solicitud: {formatDate(solicitud.fecha_solicitud)}</p>
                          {solicitud.fecha_respuesta && (
                            <p>Respuesta: {formatDate(solicitud.fecha_respuesta)}</p>
                          )}
                          {solicitud.motivo_rechazo && (
                            <IonNote color="danger">
                              <strong>Motivo de rechazo:</strong> {solicitud.motivo_rechazo}
                            </IonNote>
                          )}
                          {solicitud.comentarios_admin && (
                            <IonNote color="medium">
                              <strong>Comentarios:</strong> {solicitud.comentarios_admin}
                            </IonNote>
                          )}
                        </IonLabel>
                        <IonChip color={getEstadoColor(solicitud.estado)} slot="end">
                          {solicitud.estado}
                        </IonChip>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* Formulario de Solicitud */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Nueva Solicitud</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {tieneSolicitudPendiente ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <IonIcon icon={timeOutline} style={{ fontSize: '3rem', color: 'var(--ion-color-warning)' }} />
                  <h3>Solicitud Pendiente</h3>
                  <p>Ya tienes una solicitud pendiente de revisión. No puedes enviar otra hasta que se procese la actual.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setShowConfirmAlert(true); }}>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Nombre del Club *</IonLabel>
                          <IonInput
                            value={formData.nombre_club}
                            onIonInput={(e) => handleInputChange('nombre_club', e.detail.value!)}
                            placeholder="Ej: Club Pádel Madrid Centro"
                            required
                          />
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Teléfono</IonLabel>
                          <IonInput
                            value={formData.telefono}
                            onIonInput={(e) => handleNumericInputChange('telefono', e.detail.value!)}
                            placeholder="912345678"
                            inputmode="numeric"
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Dirección *</IonLabel>
                          <IonInput
                            value={formData.direccion}
                            onIonInput={(e) => handleInputChange('direccion', e.detail.value!)}
                            placeholder="Calle Principal 123, Madrid"
                            required
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Email del Club</IonLabel>
                          <IonInput
                            value={formData.email}
                            onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                            placeholder="info@miclub.com"
                            type="email"
                          />
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Sitio Web</IonLabel>
                          <IonInput
                            value={formData.sitio_web}
                            onIonInput={(e) => handleInputChange('sitio_web', e.detail.value!)}
                            placeholder="https://miclub.com"
                            type="url"
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Horario Apertura *</IonLabel>
                          <IonInput
                            value={formData.horario_apertura}
                            onIonInput={(e) => handleInputChange('horario_apertura', e.detail.value!)}
                            type="time"
                            required
                          />
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Horario Cierre *</IonLabel>
                          <IonInput
                            value={formData.horario_cierre}
                            onIonInput={(e) => handleInputChange('horario_cierre', e.detail.value!)}
                            type="time"
                            required
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Número Estimado de Pistas</IonLabel>
                          <IonSelect
                            value={formData.numero_pistas_estimado}
                            onIonChange={(e) => handleInputChange('numero_pistas_estimado', e.detail.value)}
                            placeholder="Selecciona"
                          >
                            <IonSelectOption value={1}>1 pista</IonSelectOption>
                            <IonSelectOption value={2}>2 pistas</IonSelectOption>
                            <IonSelectOption value={3}>3 pistas</IonSelectOption>
                            <IonSelectOption value={4}>4 pistas</IonSelectOption>
                            <IonSelectOption value={5}>5 pistas</IonSelectOption>
                            <IonSelectOption value={6}>6 o más pistas</IonSelectOption>
                          </IonSelect>
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Descripción del Club</IonLabel>
                          <IonTextarea
                            value={formData.descripcion}
                            onIonInput={(e) => handleInputChange('descripcion', e.detail.value!)}
                            placeholder="Describe tu club, instalaciones, servicios..."
                            rows={3}
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Motivo de la Solicitud *</IonLabel>
                          <IonTextarea
                            value={formData.motivo_solicitud}
                            onIonInput={(e) => handleInputChange('motivo_solicitud', e.detail.value!)}
                            placeholder="Explica por qué quieres crear este club y cómo contribuirá a la comunidad del pádel..."
                            rows={4}
                            required
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12">
                        <IonItem className="form-field">
                          <IonLabel position="stacked" className="field-label">Experiencia Previa</IonLabel>
                          <IonTextarea
                            value={formData.experiencia_previa}
                            onIonInput={(e) => handleInputChange('experiencia_previa', e.detail.value!)}
                            placeholder="Describe tu experiencia en gestión de clubes deportivos, eventos, etc..."
                            rows={3}
                          />
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="12">
                        <IonButton
                          expand="full"
                          type="submit"
                          disabled={loading || !formData.nombre_club || !formData.direccion || !formData.motivo_solicitud}
                        >
                          <IonIcon icon={sendOutline} slot="start" />
                          Enviar Solicitud
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </form>
              )}
            </IonCardContent>
          </IonCard>

          {/* Información sobre el proceso */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Información del Proceso</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonIcon icon={informationCircleOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h3>Revisión</h3>
                    <p>Tu solicitud será revisada por nuestro equipo de administración</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem>
                  <IonIcon icon={timeOutline} slot="start" color="warning" />
                  <IonLabel>
                    <h3>Tiempo de Respuesta</h3>
                    <p>El proceso de revisión puede tomar entre 3-7 días laborables</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem>
                  <IonIcon icon={checkmarkCircleOutline} slot="start" color="success" />
                  <IonLabel>
                    <h3>Aprobación</h3>
                    <p>Si es aprobada, tu rol cambiará a administrador de club y podrás gestionar tu club</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Alert de confirmación */}
          <IonAlert
            isOpen={showConfirmAlert}
            onDidDismiss={() => setShowConfirmAlert(false)}
            header="Confirmar Solicitud"
            message="¿Estás seguro de que deseas enviar esta solicitud? Una vez enviada, no podrás modificarla hasta que sea procesada."
            buttons={[
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Enviar',
                handler: handleSubmit
              }
            ]}
          />

          <IonLoading isOpen={loading} message="Enviando solicitud..." />
          
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={4000}
            color={toastColor}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SolicitarClub;