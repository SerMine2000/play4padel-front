import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSearchbar,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
  IonList,
  IonAlert,
  IonLoading,
  IonToast,
  IonText,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonAvatar,
  IonBadge,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import {
  businessOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  eyeOutline,
  personOutline,
  locationOutline,
  mailOutline,
  callOutline,
  timeOutline,
  calendarOutline,
  documentsOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/admin/admin.service';
import './ManageClubs.css';

interface SolicitudClub {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
  };
  nombre_club: string;
  descripcion: string;
  direccion: string;
  telefono?: string;
  email?: string;
  horario_apertura: string;
  horario_cierre: string;
  sitio_web?: string;
  redes_sociales?: any;
  imagen_url?: string;
  motivo_solicitud: string;
  experiencia_previa?: string;
  numero_pistas_estimado?: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fecha_solicitud: string;
  fecha_respuesta?: string;
  comentarios_admin?: string;
  motivo_rechazo?: string;
}

const ManageClubs: React.FC = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudClub[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('PENDIENTE');
  
  // Modal states
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudClub | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // Form states
  const [comentariosAdmin, setComentariosAdmin] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  // Toast and alert states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');

  useEffect(() => {
    if (user?.role?.toUpperCase() === 'ADMIN') {
      loadSolicitudes();
    }
  }, [user]);

  useEffect(() => {
    filterSolicitudes();
  }, [solicitudes, searchText, selectedSegment]);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSolicitudesClub();
      setSolicitudes(response.data || []);
    } catch (error: any) {
      showToastMessage('Error al cargar solicitudes', 'danger');
      console.error('Error:', error);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSolicitudes = () => {
    if (!solicitudes || !Array.isArray(solicitudes)) {
      setFilteredSolicitudes([]);
      return;
    }
    
    let filtered = solicitudes.filter(s => s.estado === selectedSegment);
    
    if (searchText) {
      filtered = filtered.filter(s => 
        s.nombre_club.toLowerCase().includes(searchText.toLowerCase()) ||
        s.usuario.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        s.usuario.apellidos.toLowerCase().includes(searchText.toLowerCase()) ||
        s.usuario.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredSolicitudes(filtered);
  };

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleViewDetails = (solicitud: SolicitudClub) => {
    setSelectedSolicitud(solicitud);
    setShowDetailModal(true);
  };

  const handleApprove = (solicitud: SolicitudClub) => {
    setSelectedSolicitud(solicitud);
    setComentariosAdmin('');
    setShowApprovalModal(true);
  };

  const handleReject = (solicitud: SolicitudClub) => {
    setSelectedSolicitud(solicitud);
    setMotivoRechazo('');
    setComentariosAdmin('');
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedSolicitud) return;
    
    setLoading(true);
    try {
      await adminService.aprobarSolicitudClub(selectedSolicitud.id, {
        comentarios: comentariosAdmin
      });
      
      showToastMessage('Solicitud aprobada y club creado correctamente', 'success');
      setShowApprovalModal(false);
      loadSolicitudes();
    } catch (error: any) {
      showToastMessage('Error al aprobar solicitud', 'danger');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedSolicitud || !motivoRechazo.trim()) {
      showToastMessage('Debe proporcionar un motivo de rechazo', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      await adminService.rechazarSolicitudClub(selectedSolicitud.id, {
        motivo_rechazo: motivoRechazo,
        comentarios: comentariosAdmin
      });
      
      showToastMessage('Solicitud rechazada correctamente', 'success');
      setShowRejectionModal(false);
      loadSolicitudes();
    } catch (error: any) {
      showToastMessage('Error al rechazar solicitud', 'danger');
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
      default: return documentsOutline;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="manage-clubs-container">
        <IonText color="danger">
          <h2>Acceso Denegado</h2>
          <p>Esta funcionalidad está disponible solo para administradores del sistema.</p>
        </IonText>
      </div>
    );
  }

  return (
    <div className="manage-clubs-container">
      <div className="manage-clubs-header">
        <h1 className="titulo-pagina-global">Gestionar Clubes</h1>
        <p>Revisa y gestiona las solicitudes para crear nuevos clubes</p>
      </div>

      <IonCard>
        <IonCardContent>
          <IonSegment value={selectedSegment} onIonChange={e => setSelectedSegment(e.detail.value as string)}>
            <IonSegmentButton value="PENDIENTE">
              <IonLabel>Pendientes</IonLabel>
              <IonBadge color="warning">{(solicitudes || []).filter(s => s.estado === 'PENDIENTE').length}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="APROBADA">
              <IonLabel>Aprobadas</IonLabel>
              <IonBadge color="success">{(solicitudes || []).filter(s => s.estado === 'APROBADA').length}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="RECHAZADA">
              <IonLabel>Rechazadas</IonLabel>
              <IonBadge color="danger">{(solicitudes || []).filter(s => s.estado === 'RECHAZADA').length}</IonBadge>
            </IonSegmentButton>
          </IonSegment>

          <IonSearchbar
            value={searchText}
            debounce={300}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Buscar por club, usuario o email..."
            style={{ marginTop: '16px' }}
          />
        </IonCardContent>
      </IonCard>

      <IonRefresher slot="fixed" onIonRefresh={(e) => { loadSolicitudes(); e.detail.complete(); }}>
        <IonRefresherContent />
      </IonRefresher>

      {filteredSolicitudes.length === 0 ? (
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '2rem' }}>
            <IonIcon icon={documentsOutline} style={{ fontSize: '4rem', color: '#ccc' }} />
            <h3>No hay solicitudes {selectedSegment.toLowerCase()}</h3>
            <p>No se encontraron solicitudes que coincidan con los criterios de búsqueda.</p>
          </IonCardContent>
        </IonCard>
      ) : (
        <div className="solicitudes-grid">
          {filteredSolicitudes.map((solicitud) => (
            <IonCard className="solicitud-card" key={solicitud.id}>
              <IonCardHeader>
                <div className="card-header-content">
                  <IonCardTitle>{solicitud.nombre_club}</IonCardTitle>
                  <IonChip color={getEstadoColor(solicitud.estado)}>
                    <IonIcon icon={getEstadoIcon(solicitud.estado)} />
                    <IonLabel>{solicitud.estado}</IonLabel>
                  </IonChip>
                </div>
              </IonCardHeader>

              <IonCardContent>
                <div className="solicitud-info">
                  <div className="solicitud-info-grid">
                    <div className="info-row">
                      <IonIcon icon={personOutline} />
                      <span>{solicitud.usuario.nombre} {solicitud.usuario.apellidos}</span>
                    </div>
                    
                    <div className="info-row">
                      <IonIcon icon={locationOutline} />
                      <span>{solicitud.direccion}</span>
                    </div>
                    
                    <div className="info-row">
                      <IonIcon icon={timeOutline} />
                      <span>{solicitud.horario_apertura} - {solicitud.horario_cierre}</span>
                    </div>
                    
                    <div className="info-row">
                      <IonIcon icon={calendarOutline} />
                      <span>Solicitado: {formatDate(solicitud.fecha_solicitud)}</span>
                    </div>
                  </div>

                  {solicitud.descripcion && (
                    <p className="descripcion">{solicitud.descripcion}</p>
                  )}
                </div>

                <div className="card-actions">
                  <IonButton 
                    fill="clear" 
                    size="small" 
                    onClick={() => handleViewDetails(solicitud)}
                    className="detalle-button"
                  >
                    <IonIcon icon={eyeOutline} slot="start" className="icon-themed" />
                    Ver detalles
                  </IonButton>
                  
                  {solicitud.estado === 'PENDIENTE' && (
                    <>
                      <IonButton 
                        fill="clear" 
                        size="small" 
                        color="success"
                        onClick={() => handleApprove(solicitud)}
                      >
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        Aprobar
                      </IonButton>
                      <IonButton 
                        fill="clear" 
                        size="small" 
                        color="danger"
                        onClick={() => handleReject(solicitud)}
                      >
                        <IonIcon icon={closeCircleOutline} slot="start" />
                        Rechazar
                      </IonButton>
                    </>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      <IonModal isOpen={showDetailModal} onDidDismiss={() => setShowDetailModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Detalles de la Solicitud</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowDetailModal(false)}>Cerrar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedSolicitud && (
            <div style={{ padding: '1rem' }}>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{selectedSolicitud.nombre_club}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel>
                        <h3>Solicitante</h3>
                        <p>{selectedSolicitud.usuario.nombre} {selectedSolicitud.usuario.apellidos}</p>
                        <p>{selectedSolicitud.usuario.email}</p>
                      </IonLabel>
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>
                        <h3>Descripción</h3>
                        <p>{selectedSolicitud.descripcion || 'No proporcionada'}</p>
                      </IonLabel>
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>
                        <h3>Dirección</h3>
                        <p>{selectedSolicitud.direccion}</p>
                      </IonLabel>
                    </IonItem>
                    
                    {selectedSolicitud.telefono && (
                      <IonItem>
                        <IonLabel>
                          <h3>Teléfono</h3>
                          <p>{selectedSolicitud.telefono}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    {selectedSolicitud.email && (
                      <IonItem>
                        <IonLabel>
                          <h3>Email del Club</h3>
                          <p>{selectedSolicitud.email}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    <IonItem>
                      <IonLabel>
                        <h3>Horario</h3>
                        <p>{selectedSolicitud.horario_apertura} - {selectedSolicitud.horario_cierre}</p>
                      </IonLabel>
                    </IonItem>
                    
                    {selectedSolicitud.sitio_web && (
                      <IonItem>
                        <IonLabel>
                          <h3>Sitio Web</h3>
                          <p>{selectedSolicitud.sitio_web}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    <IonItem>
                      <IonLabel>
                        <h3>Motivo de la Solicitud</h3>
                        <p>{selectedSolicitud.motivo_solicitud}</p>
                      </IonLabel>
                    </IonItem>
                    
                    {selectedSolicitud.experiencia_previa && (
                      <IonItem>
                        <IonLabel>
                          <h3>Experiencia Previa</h3>
                          <p>{selectedSolicitud.experiencia_previa}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    {selectedSolicitud.numero_pistas_estimado && (
                      <IonItem>
                        <IonLabel>
                          <h3>Número Estimado de Pistas</h3>
                          <p>{selectedSolicitud.numero_pistas_estimado}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    <IonItem>
                      <IonLabel>
                        <h3>Estado</h3>
                        <IonChip color={getEstadoColor(selectedSolicitud.estado)}>
                          <IonIcon icon={getEstadoIcon(selectedSolicitud.estado)} />
                          <IonLabel>{selectedSolicitud.estado}</IonLabel>
                        </IonChip>
                      </IonLabel>
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>
                        <h3>Fecha de Solicitud</h3>
                        <p>{formatDate(selectedSolicitud.fecha_solicitud)}</p>
                      </IonLabel>
                    </IonItem>
                    
                    {selectedSolicitud.fecha_respuesta && (
                      <IonItem>
                        <IonLabel>
                          <h3>Fecha de Respuesta</h3>
                          <p>{formatDate(selectedSolicitud.fecha_respuesta)}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    {selectedSolicitud.comentarios_admin && (
                      <IonItem>
                        <IonLabel>
                          <h3>Comentarios del Administrador</h3>
                          <p>{selectedSolicitud.comentarios_admin}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    {selectedSolicitud.motivo_rechazo && (
                      <IonItem>
                        <IonLabel>
                          <h3>Motivo de Rechazo</h3>
                          <p>{selectedSolicitud.motivo_rechazo}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* Modal de Aprobación */}
      <IonAlert
        isOpen={showApprovalModal}
        onDidDismiss={() => setShowApprovalModal(false)}
        header="Aprobar Solicitud"
        message={`¿Está seguro de que desea aprobar la solicitud del club "${selectedSolicitud?.nombre_club}"? Esto creará el club y cambiará el rol del usuario a administrador de club.`}
        inputs={[
          {
            name: 'comentarios',
            type: 'textarea',
            placeholder: 'Comentarios opcionales...',
            value: comentariosAdmin,
          }
        ]}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Aprobar',
            handler: (data) => {
              setComentariosAdmin(data.comentarios || '');
              confirmApproval();
            }
          }
        ]}
      />

      {/* Modal de Rechazo */}
      <IonModal isOpen={showRejectionModal} onDidDismiss={() => setShowRejectionModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Rechazar Solicitud</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowRejectionModal(false)}>Cancelar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '1rem' }}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Rechazar: {selectedSolicitud?.nombre_club}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Motivo del Rechazo *</IonLabel>
                  <IonTextarea
                    value={motivoRechazo}
                    onIonInput={(e) => setMotivoRechazo(e.detail.value!)}
                    placeholder="Explique por qué se rechaza esta solicitud..."
                    rows={4}
                    required
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Comentarios Adicionales</IonLabel>
                  <IonTextarea
                    value={comentariosAdmin}
                    onIonInput={(e) => setComentariosAdmin(e.detail.value!)}
                    placeholder="Comentarios opcionales..."
                    rows={3}
                  />
                </IonItem>
                
                <IonButton
                  expand="full"
                  color="danger"
                  style={{ marginTop: '1rem' }}
                  onClick={confirmRejection}
                  disabled={!motivoRechazo.trim()}
                >
                  Rechazar Solicitud
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={loading} message="Procesando..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
      />
    </div>
  );
};

export default ManageClubs;