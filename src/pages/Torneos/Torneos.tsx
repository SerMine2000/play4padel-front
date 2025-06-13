import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonToast,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonFab,
  IonFabButton,
  IonAlert,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent
} from '@ionic/react';
import {
  addOutline,
  trophyOutline,
  calendarOutline,
  locationOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  peopleOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Torneo, ClubData } from '../../interfaces';
import ApiService from '../../services/api.service';
import './Torneos.css';

const Torneos: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTorneo, setEditingTorneo] = useState<Torneo | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [torneoToDelete, setTorneoToDelete] = useState<Torneo | null>(null);
  const [clubes, setClubes] = useState<ClubData[]>([]);

  // Formulario para crear/editar torneo
  const [formData, setFormData] = useState({
    nombre: '',
    id_club: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo: '',
    descripcion: '',
    precio_inscripcion: '',
    max_parejas: ''
  });

  const userRole = (user?.role || '').toUpperCase();
  const canManage = ['ADMIN', 'CLUB'].includes(userRole);

  useEffect(() => {
    loadTorneos();
    if (canManage) {
      loadClubes();
    }
  }, []);

  const loadTorneos = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/torneos');
      if (response && Array.isArray(response)) {
        setTorneos(response);
      }
    } catch (error) {
      console.error('Error al cargar torneos:', error);
      setToastMessage('Error al cargar los torneos');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadClubes = async () => {
    try {
      const response = await ApiService.get('/clubs');
      if (response && Array.isArray(response)) {
        setClubes(response);
      }
    } catch (error) {
      console.error('Error al cargar clubes:', error);
    }
  };

  const handleCreateTorneo = async () => {
    try {
      if (!formData.nombre || !formData.id_club || !formData.fecha_inicio || !formData.fecha_fin || !formData.tipo) {
        setToastMessage('Por favor completa todos los campos obligatorios');
        setShowToast(true);
        return;
      }

      const torneoData = {
        ...formData,
        id_club: parseInt(formData.id_club),
        precio_inscripcion: formData.precio_inscripcion ? parseFloat(formData.precio_inscripcion) : undefined,
        max_parejas: formData.max_parejas ? parseInt(formData.max_parejas) : undefined
      };

      const response = await ApiService.post('/torneos/crear', torneoData);
      
      if (response) {
        setToastMessage('Torneo creado exitosamente');
        setShowToast(true);
        setIsCreateModalOpen(false);
        resetForm();
        loadTorneos();
      }
    } catch (error) {
      console.error('Error al crear torneo:', error);
      setToastMessage('Error al crear el torneo');
      setShowToast(true);
    }
  };

  const handleEditTorneo = (torneo: Torneo) => {
    setEditingTorneo(torneo);
    setFormData({
      nombre: torneo.nombre || '',
      id_club: torneo.id_club?.toString() || '',
      fecha_inicio: torneo.fecha_inicio || '',
      fecha_fin: torneo.fecha_fin || '',
      tipo: torneo.tipo || '',
      descripcion: torneo.descripcion || '',
      precio_inscripcion: torneo.precio_inscripcion?.toString() || '',
      max_parejas: torneo.max_parejas?.toString() || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTorneo = async () => {
    try {
      if (!editingTorneo) return;
      
      if (!formData.nombre || !formData.id_club || !formData.fecha_inicio || !formData.fecha_fin || !formData.tipo) {
        setToastMessage('Por favor completa todos los campos obligatorios');
        setShowToast(true);
        return;
      }

      const torneoData = {
        ...formData,
        id_club: parseInt(formData.id_club),
        precio_inscripcion: parseFloat(formData.precio_inscripcion) || 0,
        max_parejas: formData.max_parejas ? parseInt(formData.max_parejas) : undefined,
      };

      const response = await ApiService.put(`/torneos/${editingTorneo.id}`, torneoData);
      
      if (response) {
        setToastMessage('Torneo actualizado exitosamente');
        setShowToast(true);
        setIsEditModalOpen(false);
        setEditingTorneo(null);
        resetForm();
        loadTorneos();
      }
    } catch (error) {
      console.error('Error al actualizar torneo:', error);
      setToastMessage('Error al actualizar el torneo');
      setShowToast(true);
    }
  };

  const handleDeleteTorneo = async () => {
    try {
      if (torneoToDelete) {
        const response = await ApiService.delete(`/torneos/${torneoToDelete.id}`);
        if (response) {
          setToastMessage('Torneo eliminado exitosamente');
          setShowToast(true);
          setShowDeleteAlert(false);
          setTorneoToDelete(null);
          loadTorneos();
        }
      }
    } catch (error) {
      console.error('Error al eliminar torneo:', error);
      setToastMessage('Error al eliminar el torneo');
      setShowToast(true);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      id_club: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipo: '',
      descripcion: '',
      precio_inscripcion: '',
      max_parejas: ''
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
      const premios = [];
      if (precio.primer_puesto) {
        premios.push(`1º: ${precio.primer_puesto}`);
      }
      if (precio.segundo_puesto) {
        premios.push(`2º: ${precio.segundo_puesto}`);
      }
      if (precio.tercer_puesto) {
        premios.push(`3º: ${precio.tercer_puesto}`);
      }
      return premios.join(' | ') || 'Premio disponible';
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

  const formatTipo = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'eliminacion_directa':
        return 'Eliminación Directa';
      case 'round_robin':
        return 'Round Robin';
      case 'mixto':
        return 'Mixto';
      default:
        return tipo?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || tipo;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
      case 'inscripciones':
        return 'success';
      case 'en_curso':
        return 'warning';
      case 'finalizado':
        return 'medium';
      default:
        return 'primary';
    }
  };

  return (
    <div className={`torneos-container ${theme}`}>
      <IonLoading isOpen={loading} message="Cargando torneos..." />
      
      <div className="torneos-content">
        <div className="page-header">
          <h1>Torneos</h1>
          <p>Descubre y participa en los mejores torneos de pádel</p>
        </div>

        <div className="torneos-grid">
          {torneos.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={trophyOutline} className="empty-icon" />
              <h2>No hay torneos disponibles</h2>
              <p>Los torneos aparecerán aquí cuando estén disponibles. ¡Mantente atento a las próximas competencias!</p>
              {canManage && (
                <IonButton fill="clear" onClick={() => setIsCreateModalOpen(true)}>
                  <IonIcon icon={addOutline} slot="start" />
                  Crear primer torneo
                </IonButton>
              )}
            </div>
          ) : (
            torneos.map((torneo) => (
              <IonCard className="torneo-card" key={torneo.id}>
                {torneo.imagen_url && (
                  <div className="torneo-image">
                    <img src={torneo.imagen_url} alt={torneo.nombre} />
                  </div>
                )}
                
                <IonCardHeader>
                  <div className="card-header-content">
                    <IonCardTitle>{torneo.nombre}</IonCardTitle>
                    <IonChip color={getEstadoColor(torneo.estado || 'activo')}>
                      {torneo.estado || 'Activo'}
                    </IonChip>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  <div className="torneo-info">
                    {/* Toda la información con el mismo formato */}
                    <div className="torneo-info-grid">
                      <div className="info-row">
                        <IonIcon icon={calendarOutline} />
                        <span>{formatDate(torneo.fecha_inicio)} - {formatDate(torneo.fecha_fin)}</span>
                      </div>
                      
                      <div className="info-row">
                        <IonIcon icon={trophyOutline} />
                        <span>{formatTipo(torneo.tipo)}</span>
                      </div>

                      {torneo.precio_inscripcion && (
                        <div className="info-row">
                          <IonIcon icon={locationOutline} />
                          <span>{formatPrecio(torneo.precio_inscripcion)}</span>
                        </div>
                      )}

                      {torneo.max_parejas && (
                        <div className="info-row">
                          <IonIcon icon={peopleOutline} />
                          <span>Máx. {torneo.max_parejas} parejas</span>
                        </div>
                      )}
                    </div>

                    {torneo.descripcion && (
                      <p className="descripcion">{torneo.descripcion}</p>
                    )}
                  </div>

                  <div className="card-actions">
                    <IonButton fill="clear" size="small" routerLink={`/torneos/${torneo.id}`} className="detalle-button">
                      <IonIcon icon={eyeOutline} slot="start" className="icon-themed" />
                      Ver detalles
                    </IonButton>
                    
                    {canManage && (
                      <>
                        <IonButton 
                          fill="clear" 
                          size="small" 
                          color="medium"
                          onClick={() => handleEditTorneo(torneo)}
                        >
                          <IonIcon icon={createOutline} slot="start" />
                          Editar
                        </IonButton>
                        <IonButton 
                          fill="clear" 
                          size="small" 
                          color="danger"
                          onClick={() => {
                            setTorneoToDelete(torneo);
                            setShowDeleteAlert(true);
                          }}
                        >
                          <IonIcon icon={trashOutline} slot="start" />
                          Eliminar
                        </IonButton>
                      </>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
      </div>

      {/* FAB flotante fijo */}
      {canManage && (
        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="torneos-fab">
          <IonFabButton onClick={() => setIsCreateModalOpen(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}

      {/* Modal para crear torneo - PATRÓN MANAGE-COURTS */}
      <IonModal className="modal-profesional" isOpen={isCreateModalOpen} onDidDismiss={() => setIsCreateModalOpen(false)}>
        <IonHeader className="modal-header-compact">
          <IonToolbar className="modal-toolbar-compact">
            <IonTitle className="modal-title-compact">
              <IonIcon icon={trophyOutline} className="modal-icon-compact" />
              Crear Nuevo Torneo
            </IonTitle>
            <IonButtons slot="end" className="modal-buttons-compact">
              <IonButton fill="clear" onClick={() => setIsCreateModalOpen(false)} className="modal-close-btn-compact">
                ✕
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="modal-content">
          <div className="modal-form-container">
            <IonItem>
              <IonLabel position="stacked">Nombre del Torneo *</IonLabel>
              <IonInput
                value={formData.nombre}
                onIonInput={(e) => setFormData({ ...formData, nombre: e.detail.value! })}
                placeholder="Ej: Torneo de Verano 2024"
              />
            </IonItem>

            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Club *</IonLabel>
                    <IonSelect
                      value={formData.id_club}
                      onIonChange={(e) => setFormData({ ...formData, id_club: e.detail.value })}
                      placeholder="Selecciona un club"
                    >
                      {clubes.map((club) => (
                        <IonSelectOption key={club.id} value={club.id}>
                          {club.nombre}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Tipo de Torneo *</IonLabel>
                    <IonSelect
                      value={formData.tipo}
                      onIonChange={(e) => setFormData({ ...formData, tipo: e.detail.value })}
                      placeholder="Selecciona el tipo"
                    >
                      <IonSelectOption value="eliminacion_directa">Eliminación Directa</IonSelectOption>
                      <IonSelectOption value="round_robin">Round Robin</IonSelectOption>
                      <IonSelectOption value="mixto">Mixto</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Fecha de Inicio *</IonLabel>
                    <IonDatetime
                      value={formData.fecha_inicio}
                      onIonChange={(e) => setFormData({ ...formData, fecha_inicio: e.detail.value as string })}
                      presentation="date"
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Fecha de Fin *</IonLabel>
                    <IonDatetime
                      value={formData.fecha_fin}
                      onIonChange={(e) => setFormData({ ...formData, fecha_fin: e.detail.value as string })}
                      presentation="date"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Precio de Inscripción (€)</IonLabel>
                    <IonInput
                      type="number"
                      value={formData.precio_inscripcion}
                      onIonInput={(e) => setFormData({ ...formData, precio_inscripcion: e.detail.value! })}
                      placeholder="0.00"
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Máximo de Parejas</IonLabel>
                    <IonInput
                      type="number"
                      value={formData.max_parejas}
                      onIonInput={(e) => setFormData({ ...formData, max_parejas: e.detail.value! })}
                      placeholder="Ej: 16"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Descripción</IonLabel>
                    <IonTextarea
                      value={formData.descripcion}
                      onIonInput={(e) => setFormData({ ...formData, descripcion: e.detail.value! })}
                      placeholder="Describe el torneo..."
                      rows={3}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="modal-actions">
              <IonButton 
                fill="clear" 
                color="medium" 
                onClick={() => setIsCreateModalOpen(false)}
                className="action-btn cancel-btn"
              >
                Cancelar
              </IonButton>
              <IonButton 
                color="primary" 
                onClick={handleCreateTorneo}
                className="action-btn save-btn"
              >
                <IonIcon icon={trophyOutline} slot="start" />
                Crear Torneo
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Modal para editar torneo - PATRÓN MANAGE-COURTS */}
      <IonModal className="modal-profesional" isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
        <IonHeader className="modal-header-compact">
          <IonToolbar className="modal-toolbar-compact">
            <IonTitle className="modal-title-compact">
              <IonIcon icon={createOutline} className="modal-icon-compact" />
              Editar Torneo
            </IonTitle>
            <IonButtons slot="end" className="modal-buttons-compact">
              <IonButton fill="clear" onClick={() => setIsEditModalOpen(false)} className="modal-close-btn-compact">
                ✕
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="modal-content">
          <div className="modal-form-container">
            <IonItem>
              <IonLabel position="stacked">Nombre del Torneo *</IonLabel>
              <IonInput
                value={formData.nombre}
                onIonInput={(e) => setFormData({ ...formData, nombre: e.detail.value! })}
                placeholder="Ej: Torneo de Verano 2024"
              />
            </IonItem>

            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Club *</IonLabel>
                    <IonSelect
                      value={formData.id_club}
                      onIonChange={(e) => setFormData({ ...formData, id_club: e.detail.value })}
                      placeholder="Selecciona un club"
                    >
                      {clubes.map((club) => (
                        <IonSelectOption key={club.id} value={club.id}>
                          {club.nombre}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Tipo de Torneo *</IonLabel>
                    <IonSelect
                      value={formData.tipo}
                      onIonChange={(e) => setFormData({ ...formData, tipo: e.detail.value })}
                      placeholder="Selecciona un tipo"
                    >
                      <IonSelectOption value="eliminacion_directa">Eliminación Directa</IonSelectOption>
                      <IonSelectOption value="round_robin">Round Robin</IonSelectOption>
                      <IonSelectOption value="mixto">Mixto</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Fecha de Inicio *</IonLabel>
                    <IonDatetime
                      value={formData.fecha_inicio}
                      onIonChange={(e) => setFormData({ ...formData, fecha_inicio: e.detail.value as string })}
                      presentation="date"
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Fecha de Fin *</IonLabel>
                    <IonDatetime
                      value={formData.fecha_fin}
                      onIonChange={(e) => setFormData({ ...formData, fecha_fin: e.detail.value as string })}
                      presentation="date"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Precio de Inscripción (€)</IonLabel>
                    <IonInput
                      type="number"
                      value={formData.precio_inscripcion}
                      onIonInput={(e) => setFormData({ ...formData, precio_inscripcion: e.detail.value! })}
                      placeholder="0.00"
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Máximo de Parejas</IonLabel>
                    <IonInput
                      type="number"
                      value={formData.max_parejas}
                      onIonInput={(e) => setFormData({ ...formData, max_parejas: e.detail.value! })}
                      placeholder="Ej: 16"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Descripción</IonLabel>
                    <IonTextarea
                      value={formData.descripcion}
                      onIonInput={(e) => setFormData({ ...formData, descripcion: e.detail.value! })}
                      placeholder="Descripción del torneo..."
                      rows={3}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="modal-actions">
              <IonButton 
                fill="clear" 
                color="medium" 
                onClick={() => setIsEditModalOpen(false)}
                className="action-btn cancel-btn"
              >
                Cancelar
              </IonButton>
              <IonButton 
                color="primary" 
                onClick={handleUpdateTorneo}
                className="action-btn save-btn"
              >
                <IonIcon icon={createOutline} slot="start" />
                Actualizar Torneo
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Alert para confirmar eliminación */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar el torneo "${torneoToDelete?.nombre}"?`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: handleDeleteTorneo
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

export default Torneos;