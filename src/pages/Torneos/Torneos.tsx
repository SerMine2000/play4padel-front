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
  IonList,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonToast,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonFab,
  IonFabButton,
  IonAlert
} from '@ionic/react';
import {
  addOutline,
  trophyOutline,
  calendarOutline,
  peopleOutline,
  locationOutline,
  timeOutline,
  eyeOutline,
  createOutline,
  trashOutline
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
  const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null);
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
    setSelectedTorneo(null);
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

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
      case 'inscripciones_abiertas':
        return 'success';
      case 'en_curso':
        return 'warning';
      case 'finalizado':
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

  return (
    <div className={`torneos-container ${theme}`}>
      <div className="page-header">
        <h1>Torneos</h1>
        <p>Gestiona y participa en torneos de pádel</p>
      </div>

      {/* FAB se incluirá al final del contenido para que se mueva con el scroll */}

      <IonGrid>
        <IonRow>
          {torneos.length === 0 ? (
            <IonCol size="12">
              <IonCard className="empty-state">
                <IonCardContent className="text-center">
                  <IonIcon icon={trophyOutline} className="empty-icon" />
                  <h2>No hay torneos disponibles</h2>
                  <p>Los torneos aparecerán aquí cuando estén disponibles.</p>
                  {canManage && (
                    <IonButton fill="clear" onClick={() => setIsCreateModalOpen(true)}>
                      <IonIcon icon={addOutline} slot="start" />
                      Crear primer torneo
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          ) : (
            torneos.map((torneo) => (
              <IonCol size="12" sizeMd="6" sizeLg="6" key={torneo.id}>
                <IonCard className="torneo-card">
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
                      <div className="info-row">
                        <IonIcon icon={calendarOutline} />
                        <span>{formatDate(torneo.fecha_inicio)} - {formatDate(torneo.fecha_fin)}</span>
                      </div>
                      
                      <div className="info-row">
                        <IonIcon icon={trophyOutline} />
                        <span>{torneo.tipo}</span>
                      </div>

                      {torneo.precio_inscripcion && (
                        <div className="info-row">
                          <span className="precio">{formatPrecio(torneo.precio_inscripcion)}</span>
                        </div>
                      )}

                      {torneo.descripcion && (
                        <p className="descripcion">{torneo.descripcion}</p>
                      )}
                    </div>

                    <div className="card-actions">
                      <IonButton fill="clear" size="small" routerLink={`/torneos/${torneo.id}`}>
                        <IonIcon icon={eyeOutline} slot="start" />
                        Ver detalles
                      </IonButton>
                      
                      {canManage && (
                        <>
                          <IonButton fill="clear" size="small" color="medium">
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
              </IonCol>
            ))
          )}
        </IonRow>
      </IonGrid>

      {/* FAB flotante fijo */}
      {canManage && (
        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="torneos-fab">
          <IonFabButton onClick={() => setIsCreateModalOpen(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}

      {/* Modal para crear torneo */}
      <IonModal isOpen={isCreateModalOpen} onDidDismiss={() => setIsCreateModalOpen(false)}>
        <div className="modal-header">
          <h2>Crear Nuevo Torneo</h2>
          <IonButton fill="clear" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </IonButton>
        </div>

        <div className="modal-content">
          <IonItem>
            <IonLabel position="stacked">Nombre del Torneo *</IonLabel>
            <IonInput
              value={formData.nombre}
              onIonInput={(e) => setFormData({ ...formData, nombre: e.detail.value! })}
              placeholder="Ej: Torneo de Verano 2024"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Club *</IonLabel>
            <IonSelect
              value={formData.id_club}
              onSelectionChange={(e) => setFormData({ ...formData, id_club: e.detail.value })}
              placeholder="Selecciona un club"
            >
              {clubes.map((club) => (
                <IonSelectOption key={club.id} value={club.id}>
                  {club.nombre}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Fecha de Inicio *</IonLabel>
            <IonDatetime
              value={formData.fecha_inicio}
              onIonChange={(e) => setFormData({ ...formData, fecha_inicio: e.detail.value as string })}
              presentation="date"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Fecha de Fin *</IonLabel>
            <IonDatetime
              value={formData.fecha_fin}
              onIonChange={(e) => setFormData({ ...formData, fecha_fin: e.detail.value as string })}
              presentation="date"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Tipo de Torneo *</IonLabel>
            <IonSelect
              value={formData.tipo}
              onSelectionChange={(e) => setFormData({ ...formData, tipo: e.detail.value })}
              placeholder="Selecciona el tipo"
            >
              <IonSelectOption value="eliminacion_directa">Eliminación Directa</IonSelectOption>
              <IonSelectOption value="round_robin">Round Robin</IonSelectOption>
              <IonSelectOption value="mixto">Mixto</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Descripción</IonLabel>
            <IonTextarea
              value={formData.descripcion}
              onIonInput={(e) => setFormData({ ...formData, descripcion: e.detail.value! })}
              placeholder="Describe el torneo..."
              rows={3}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Precio de Inscripción (€)</IonLabel>
            <IonInput
              type="number"
              value={formData.precio_inscripcion}
              onIonInput={(e) => setFormData({ ...formData, precio_inscripcion: e.detail.value! })}
              placeholder="0.00"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Máximo de Parejas</IonLabel>
            <IonInput
              type="number"
              value={formData.max_parejas}
              onIonInput={(e) => setFormData({ ...formData, max_parejas: e.detail.value! })}
              placeholder="Ej: 16"
            />
          </IonItem>
        </div>

        <div className="modal-footer">
          <IonButton expand="block" onClick={handleCreateTorneo}>
            Crear Torneo
          </IonButton>
        </div>
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
            handler: () => {
              // Aquí iría la lógica de eliminación
              setToastMessage('Función de eliminación no implementada aún');
              setShowToast(true);
            }
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