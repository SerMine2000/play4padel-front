// src/pages/ManageCourts.tsx
import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonToggle, IonButton, IonIcon, IonList, IonItemSliding,
  IonItemOptions, IonItemOption, IonLoading, IonToast, IonText, IonModal, IonChip, IonFab, IonFabButton, IonAlert } from '@ionic/react';
import { addCircleOutline, createOutline, buildOutline, trashOutline, closeCircleOutline, checkmarkCircleOutline, tennisballOutline, swapHorizontalOutline, arrowBack } from 'ionicons/icons';
import { useAuth } from "../../context/AuthContext";
import { useHistory } from 'react-router-dom';
import apiService from "../../services/api.service";
import '../../theme/variables.css';
import './ManageCourts.css';

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
    tipo: '',
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
      tipo: '',
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
      if (!formData.numero || !formData.precio_hora || !['Cristal', 'Muro'].includes(formData.tipo)) {
        showToastMessage('Debe seleccionar un tipo de pista válido: Cristal o Muro', 'warning');
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
  const changeCourtStatus = async (
    pistaId: number,
    newStatus: string,
    event?: React.MouseEvent
  ) => {
    try {
      setLoading(true);
  
      await apiService.put(`/pistas/${pistaId}`, { estado: newStatus });
      showToastMessage(`Estado de la pista actualizado a ${newStatus}`);
  
      // Actualizar el estado localmente (sin recargar toda la lista)
      setPistas((prev) =>
        prev.map((p) => (p.id === pistaId ? { ...p, estado: newStatus } : p))
      );
  
      // Cerrar sliding después de pulsar
      const sliding = (event?.target as HTMLElement)?.closest('ion-item-sliding') as HTMLIonItemSlidingElement;
      if (sliding) await sliding.close();
  
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
            <IonButton fill="clear" onClick={() => history.replace('/home')}>
  <IonIcon slot="icon-only" icon={arrowBack} />
</IonButton>
          </IonButtons>
          <IonTitle>Gestión de Pistas</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="contenedor-gestion-pistas">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontWeight: 'bold' }}>
                    {clubData ? clubData.nombre : 'Club'}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    Gestione las pistas de su club. Puede crear, editar y cambiar el estado de las pistas.
                  </p>
                </IonCardContent>
              </IonCard>
              
              <IonCard>
                <IonCardHeader>
                    <IonCardTitle style={{ fontWeight: 'bold' }}>Pistas</IonCardTitle>
                  <div className="indicador-deslizamiento">
                    <IonIcon icon={ swapHorizontalOutline } className="icono-deslizar" />
                    <span className="texto-deslizar">Desliza una pista para cambiar de estado o editar</span>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  {pistas.length === 0 ? (
                    <div className="sin-pistas">
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
                      {[...pistas]
                        .sort((a, b) => a.numero - b.numero)
                        .map((pista) => (
                        <IonItemSliding key={pista.id}>
                          <IonItem>
                            <div className="contenido-pista">
                              <div>
                                <h2 style={{ fontWeight: 'bold' }}>Pista {pista.numero}</h2>
                                <p style={{ marginLeft: '10px' }}>{pista.tipo} - {pista.precio_hora}€/1h 30min</p>
                                <p style={{ marginLeft: '10px' }}>
                                  {pista.iluminacion ? 'Cuenta con iluminación' : 'Sin iluminación'} - {pista.techada ? 'Indoor' : 'Outdoor'}
                                </p>
                              </div>

                              {pista.imagen_url && (
                                <img
                                className="imagen-pista"
                                src={pista.imagen_url}
                                alt={`Imagen de pista ${pista.numero}`}
                                onClick={() => setImagenSeleccionada(pista.imagen_url ?? null)}
                              />
                              )}
                            </div>

                            <IonChip color={getStatusColor(pista.estado)} slot="end">
                              {pista.estado}
                            </IonChip>
                          </IonItem>

                          {/* OPCIONES A LA IZQUIERDA */}
                          <IonItemOptions side="start">
                            {pista.estado !== 'disponible' && (
                              <IonItemOption color="success" onClick={(e) => changeCourtStatus(pista.id, 'disponible', e)}>
                                <div>
                                  <IonIcon icon={checkmarkCircleOutline} />
                                  <span>Abrir</span>
                                </div>
                              </IonItemOption>
                            )}

                            {pista.estado !== 'mantenimiento' && (
                              <IonItemOption color="warning" onClick={(e) => changeCourtStatus(pista.id, 'mantenimiento', e)}>
                                <div>
                                  <IonIcon icon={buildOutline} />
                                  <span>Mantenimiento</span>
                                </div>
                              </IonItemOption>
                            )}

                            {pista.estado !== 'cerrada' && (
                              <IonItemOption color="danger" onClick={(e) => changeCourtStatus(pista.id, 'cerrada', e)}>
                                <div>
                                  <IonIcon icon={closeCircleOutline} />
                                  <span>Cerrada</span>
                                </div>
                              </IonItemOption>
                            )}
                          </IonItemOptions>



                          {/* OPCIONES A LA DERECHA */}
                          <IonItemOptions side="end">
                          <IonItemOption
                            color="primary"
                            onClick={(e) => {
                              openEditModal(pista);
                              const sliding = (e.target as HTMLElement)?.closest('ion-item-sliding') as HTMLIonItemSlidingElement;
                              if (sliding) sliding.close();
                            }}>
                            <div>
                              <IonIcon icon={createOutline} />
                              <span>Editar</span>
                            </div>
                          </IonItemOption>
                            <IonItemOption color="danger" onClick={() => prepareDeleteCourt(pista.id)}>
                              <div>
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
                    <IonContent >
                    <div className="envoltorio-imagen-modal">
                      <button className="icono-cerrar" onClick={() => setImagenSeleccionada(null)}>
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
        <IonModal className="formulario-modal-pista" isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary" style={{ borderRadius: '7px' }}>
              <IonTitle >
                {editingPista ? 'Editar Pista' : 'Nueva Pista'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  Cancelar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent >
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                <IonItem>
                    <IonLabel className="transparentar-fondos" slot="start">Número de Pista</IonLabel>
                  <IonInput className="transparentar-fondos" type="number" min="1" 
                    value={formData.numero} onIonChange={(e) => handleInputChange(e, 'numero')} required/>
                </IonItem>
                  
                  <IonItem lines="none">
                    <IonLabel className="transparentar-fondos">Tipo de Pista</IonLabel>
                    <div className="centrar-botones">
                      <IonButton fill={formData.tipo === 'Cristal' ? 'solid' : 'outline'}
                        onClick={() => setFormData({ ...formData, tipo: 'Cristal' })}
                        color="primary">
                        Cristal
                      </IonButton>
                      <IonButton fill={formData.tipo === 'Muro' ? 'solid' : 'outline'}
                        onClick={() => setFormData({ ...formData, tipo: 'Muro' })}
                        color="primary">
                        Muro
                      </IonButton>
                    </div>
                  </IonItem>
                  
                  <IonItem>
                  <IonLabel className="transparentar-fondos" slot="start">Precio (1h 30min)</IonLabel>
                    <IonInput className="transparentar-fondos" type="number" 
                      value={formData.precio_hora} onIonChange={(e) => handleInputChange(e, 'precio_hora')} required/>
                  </IonItem>
                  
                  <IonItem lines="full">
                    <IonLabel className="transparentar-fondos">Cuenta con Iluminación</IonLabel>
                    <IonToggle checked={formData.iluminacion} onIonChange={(e) => handleToggleChange(e, 'iluminacion')}/>
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel className="transparentar-fondos">Pista Cubierta</IonLabel>
                    <IonToggle checked={formData.techada} onIonChange={(e) => handleToggleChange(e, 'techada')}/>
                  </IonItem>
                  
                  <IonItem>
                  <IonLabel className="transparentar-fondos" slot="start">URL de Imagen</IonLabel>
                    <IonInput className="transparentar-fondos" type="text" value={formData.imagen_url} 
                      onIonChange={(e) => handleInputChange(e, 'imagen_url')}/>
                  </IonItem>
                  
                  <div>
                    <IonButton color='primary' expand="block" className="boton-guardar-modal" onClick={saveCourt}>{editingPista ? 'Actualizar Pista' : 'Crear Pista'}</IonButton>
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