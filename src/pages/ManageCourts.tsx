// src/pages/ManageCourts.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonIcon,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLoading,
  IonToast,
  IonText,
  IonModal,
  IonChip,
  IonFab,
  IonFabButton,
  IonAlert
} from '@ionic/react';
import {
  addCircleOutline,
  createOutline,
  buildOutline,
  trashOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  tennisballOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../utils/constants';
import './css/ManageCourts.css';

// Interfaz para los datos de la pista
interface Pista {
  id: number;
  numero: number;
  id_club: number;
  tipo: string;
  estado: string;
  precio_hora: number;
  iluminacion: boolean;
  techada: boolean;
  imagen_url?: string;
}

const ManageCourts: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  
  // Estados
  const [clubId, setClubId] = useState<number | null>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<string>('success');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPista, setEditingPista] = useState<Pista | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [courtToDelete, setCourtToDelete] = useState<number | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  
  // Form state
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'standard',
    precio_hora: '',
    iluminacion: true,
    techada: false,
    imagen_url: ''
  });
  
  // Cargar datos del club y pistas cuando se monta el componente
  useEffect(() => {
    const loadClubData = async () => {
      if (!user || user.id_rol !== 1) {
        // Redirigir si no es administrador
        history.replace('/home');
        return;
      }
      
      try {
        setLoading(true);
        // Buscar club por id_administrador
        const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
        
        if (clubsResponse && clubsResponse.length > 0) {
          const club = clubsResponse[0];
          setClubId(club.id);
          setClubData(club);
          
          // Cargar pistas del club
          const pistasResponse = await apiService.get(`/clubs/${club.id}/pistas`);
          if (Array.isArray(pistasResponse)) {
            setPistas(pistasResponse);
          } else {
            // Si no hay pistas o el endpoint devuelve un formato diferente
            setPistas([]);
          }
        } else {
          showToastMessage('No se encontró información del club', 'warning');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        showToastMessage('Error al cargar datos del club', 'danger');
      } finally {
        setLoading(false);
      }
    };
    
    loadClubData();
  }, [user, history]);
  
  // Mostrar mensaje de toast
  const showToastMessage = (message: string, color: string = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: CustomEvent, field: string) => {
    const value = e.detail.value;
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Manejar cambios en toggles
  const handleToggleChange = (e: CustomEvent, field: string) => {
    const checked = e.detail.checked;
    setFormData({
      ...formData,
      [field]: checked
    });
  };
  
  // Abrir modal para crear nueva pista
  const openCreateModal = () => {
    setEditingPista(null);
    setFormData({
      numero: '',
      tipo: 'standard',
      precio_hora: '',
      iluminacion: true,
      techada: false,
      imagen_url: ''
    });
    setShowModal(true);
  };
  
  // Abrir modal para editar pista
  const openEditModal = (pista: Pista) => {
    setEditingPista(pista);
    setFormData({
      numero: pista.numero.toString(),
      tipo: pista.tipo,
      precio_hora: pista.precio_hora.toString(),
      iluminacion: pista.iluminacion,
      techada: pista.techada,
      imagen_url: pista.imagen_url || ''
    });
    setShowModal(true);
  };
  
  // Guardar pista (crear o actualizar)
  const saveCourt = async () => {
    if (!clubId) {
      showToastMessage('No se ha seleccionado un club', 'danger');
      return;
    }
    
    try {
      setLoading(true);
      
      // Validar datos
      if (!formData.numero || !formData.precio_hora) {
        showToastMessage('Por favor, complete los campos requeridos', 'warning');
        setLoading(false);
        return;
      }
      
      // Preparar datos para enviar
      const pistaData = {
        numero: parseInt(formData.numero, 10),
        id_club: clubId,
        tipo: formData.tipo,
        estado: 'disponible',
        precio_hora: parseFloat(formData.precio_hora),
        iluminacion: formData.iluminacion,
        techada: formData.techada,
        imagen_url: formData.imagen_url
      };
      
      let response;
      
      if (editingPista) {
        // Actualizar pista existente
        response = await apiService.put(`/pistas/${editingPista.id}`, pistaData);
        showToastMessage('Pista actualizada correctamente');
      } else {
        // Crear nueva pista
        response = await apiService.post(`/clubs/${clubId}/pistas`, pistaData);
        showToastMessage('Pista creada correctamente');
      }
      
      // Actualizar lista de pistas
      const pistasResponse = await apiService.get(`/clubs/${clubId}/pistas`);
      if (Array.isArray(pistasResponse)) {
        setPistas(pistasResponse);
      }
      
      // Cerrar modal
      setShowModal(false);
      
    } catch (error) {
      console.error('Error al guardar pista:', error);
      showToastMessage('Error al guardar la pista', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Cambiar estado de la pista
  const changeCourtStatus = async (pistaId: number, newStatus: string) => {
    try {
      setLoading(true);
      
      await apiService.put(`/pistas/${pistaId}`, { estado: newStatus });
      
      showToastMessage(`Estado de la pista actualizado a ${newStatus}`);
      
      // Actualizar lista de pistas
      const pistasResponse = await apiService.get(`/clubs/${clubId}/pistas`);
      if (Array.isArray(pistasResponse)) {
        setPistas(pistasResponse);
      }
    } catch (error) {
      console.error('Error al cambiar estado de la pista:', error);
      showToastMessage('Error al cambiar el estado de la pista', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar pista
  const prepareDeleteCourt = (pistaId: number) => {
    setCourtToDelete(pistaId);
    setShowDeleteConfirm(true);
  };
  

  const confirmDeleteCourt = async () => {
    if (!courtToDelete) return;
    
    try {
      setLoading(true);
      
      await apiService.delete(`/pistas/${courtToDelete}`);
      
      showToastMessage('Pista eliminada correctamente');
      
      // Actualizar lista de pistas
      setPistas(pistas.filter(pista => pista.id !== courtToDelete));
    } catch (error) {
      console.error('Error al eliminar pista:', error);
      showToastMessage('Error al eliminar la pista', 'danger');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setCourtToDelete(null);
    }
  };
  
  // Obtener color según estado
  const getStatusColor = (estado: string): string => {
    switch (estado) {
      case 'disponible':
        return 'success';
      case 'mantenimiento':
        return 'warning';
      case 'cerrada':
        return 'danger';
      default:
        return 'medium';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Gestión de Pistas</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="manage-courts-container">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2">
              <IonCard className="info-card">
                <IonCardHeader>
                  <IonCardTitle>
                    {clubData ? clubData.nombre : 'Club'}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    Gestione las pistas de su club. Puede crear, editar y cambiar el estado de las pistas.
                  </p>
                </IonCardContent>
              </IonCard>
              
              <IonCard className="courts-card">
                <IonCardHeader>
                  <IonCardTitle>Pistas</IonCardTitle>
                  <div className="slide-indicator">
                    <span className="swipe-icon">↔</span>
                    <span className="swipe-text">Desliza una pista para cambiar de estado o editar</span>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  {pistas.length === 0 ? (
                    <div className="no-courts">
                      <IonIcon icon={tennisballOutline} size="large" />
                      <IonText color="medium">
                        <p>No hay pistas creadas</p>
                      </IonText>
                      <IonButton expand="block" onClick={openCreateModal}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Crear Nueva Pista
                      </IonButton>
                    </div>
                  ) : (
                    <IonList>
                      {pistas.map((pista) => (
                        <IonItemSliding key={pista.id}>
                          <IonItem className="court-item">
                            <div className="court-content">
                              <div className="court-text">
                                <h2>Pista {pista.numero}</h2>
                                <p>{pista.tipo} - {pista.precio_hora}€/1h 30min</p>
                                <p>
                                  {pista.iluminacion ? 'Con iluminación' : 'Sin iluminación'} - {pista.techada ? 'Indoor' : 'Outdoor'}
                                </p>
                              </div>

                              {pista.imagen_url && (
                                <img
                                  src={pista.imagen_url}
                                  alt={`Imagen de pista ${pista.numero}`}
                                  className="court-image"
                                  onClick={() => setImagenSeleccionada(pista.imagen_url ?? null)}
                                  style={{ cursor: 'pointer' }}
                                />
                              )}
                            </div>

                            <IonChip color={getStatusColor(pista.estado)} slot="end">
                              {pista.estado}
                            </IonChip>
                          </IonItem>

                          {/* OPCIONES A LA IZQUIERDA */}
                          <IonItemOptions side="start">
                            {pista.estado !== 'mantenimiento' && (
                              <IonItemOption
                                color="warning"
                                onClick={() => changeCourtStatus(pista.id, 'mantenimiento')}
                                className="equal-width-option"
                              >
                                <div className="option-content" style={{ color: 'black' }}>
                                  <IonIcon icon={buildOutline} style={{ color: 'black', fontSize: '24px' }} />
                                  <span style={{ color: 'black', marginTop: '4px', textTransform: 'capitalize' }}>
                                    Mantenimiento
                                  </span>
                                </div>
                              </IonItemOption>
                            )}

                            {pista.estado !== 'cerrada' && (
                              <IonItemOption
                                color="danger"
                                onClick={() => changeCourtStatus(pista.id, 'cerrada')}
                                className="equal-width-option"
                              >
                                <div className="option-content">
                                  <IonIcon icon={closeCircleOutline} />
                                  <span style={{ marginTop: '4px', textTransform: 'capitalize' }}>
                                    Cerrada
                                  </span>
                                </div>
                              </IonItemOption>
                            )}
                          </IonItemOptions>

                          {/* OPCIONES A LA DERECHA */}
                          <IonItemOptions side="end">
                            <IonItemOption color="primary" onClick={() => openEditModal(pista)}>
                              <div className="option-content">
                                <IonIcon icon={createOutline} />
                                <span>Editar</span>
                              </div>
                            </IonItemOption>
                            <IonItemOption color="danger" onClick={() => prepareDeleteCourt(pista.id)}>
                              <div className="option-content">
                                <IonIcon icon={trashOutline} />
                                <span>Eliminar</span>
                              </div>
                            </IonItemOption>
                          </IonItemOptions>
                        </IonItemSliding>
                      ))}
                    </IonList>
                  )}

                  {/* MODAL PARA IMAGEN AMPLIADA */}
                  <IonModal isOpen={!!imagenSeleccionada} onDidDismiss={() => setImagenSeleccionada(null)}>
                    <IonContent className="ion-padding">
                      <div className="modal-image-wrapper">
                        <button className="close-icon" onClick={() => setImagenSeleccionada(null)}>
                          ✕
                        </button>
                        <img src={imagenSeleccionada!} alt="Vista ampliada" />
                      </div>
                    </IonContent>
                  </IonModal>
                </IonCardContent>
              </IonCard>

            </IonCol>
          </IonRow>
        </IonGrid>
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={openCreateModal}>
            <IonIcon icon={addCircleOutline} />
          </IonFabButton>
        </IonFab>
        
        {/* Modal para añadir o editar pista */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {editingPista ? 'Editar Pista' : 'Nueva Pista'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  Cancelar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                <IonItem>
                  <IonLabel slot="start">Número de Pista</IonLabel>
                  <IonInput
                    type="number"
                    min="1"
                    style={{ textAlign: 'right' }}
                    value={formData.numero}
                    onIonChange={(e) => handleInputChange(e, 'numero')}
                    required
                  />
                </IonItem>
                  
                  <IonItem lines="none">
                    <IonLabel>Tipo de Pista</IonLabel>
                    <div className="button-toggle-container">
                      <IonButton fill={formData.tipo === 'Cristal' ? 'solid' : 'outline'}
                        onClick={() => setFormData({ ...formData, tipo: 'Cristal' })}>
                        Cristal
                      </IonButton>

                      <IonButton fill={formData.tipo === 'Muro' ? 'solid' : 'outline'}
                        onClick={() => setFormData({ ...formData, tipo: 'Muro' })}>
                        Muro
                      </IonButton>
                    </div>
                  </IonItem>
                  
                  <IonItem>
                  <IonLabel slot="start" style={{ minWidth: '140px' }}>Precio (1h 30min)</IonLabel>
                    <IonInput 
                      type="number"
                      value={formData.precio_hora}
                      onIonChange={(e) => handleInputChange(e, 'precio_hora')}
                      required
                      style={{ textAlign: 'right'}}
                    />
                  </IonItem>
                  
                  <IonItem lines="full">
                    <IonLabel className="solo-texto">Con Iluminación</IonLabel>
                    <IonToggle
                      checked={formData.iluminacion}
                      onIonChange={(e) => handleToggleChange(e, 'iluminacion')}
                      className="toggle-switch"
                    />
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel className="solo-texto">Pista Cubierta</IonLabel>
                    <IonToggle
                      checked={formData.techada}
                      onIonChange={(e) => handleToggleChange(e, 'techada')}
                    />
                  </IonItem>
                  
                  <IonItem>
                  <IonLabel slot="start" style={{ minWidth: '140px' }}>URL de Imagen</IonLabel>
                    <IonInput
                      type="text"
                      value={formData.imagen_url}
                      onIonChange={(e) => handleInputChange(e, 'imagen_url')}
                    />
                  </IonItem>
                  
                  <div className="ion-padding">
                    <IonButton
                      expand="block"
                      onClick={saveCourt}
                    >
                      {editingPista ? 'Actualizar Pista' : 'Crear Pista'}
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteConfirm}
          onDidDismiss={() => setShowDeleteConfirm(false)}
          header="¿Eliminar pista?"
          message=" Esta acción no se puede deshacer"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                setShowDeleteConfirm(false);
                setCourtToDelete(null);
              }
            },
            {
              text: 'Eliminar',
              cssClass: 'danger',
              handler: confirmDeleteCourt
            }
          ]}
        />
        
        <IonLoading isOpen={loading} message="Procesando..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default ManageCourts;