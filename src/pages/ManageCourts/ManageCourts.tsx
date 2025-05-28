// src/pages/ManageCourts.tsx
import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonToggle, IonButton, IonIcon, IonList, IonItemSliding,
  IonItemOptions, IonItemOption, IonLoading, IonToast, IonText, IonModal, IonChip, IonFab, IonFabButton, IonAlert } from '@ionic/react';
import { addCircleOutline, createOutline, buildOutline, trashOutline, closeCircleOutline, checkmarkCircleOutline, tennisballOutline, swapHorizontalOutline, arrowBack } from 'ionicons/icons';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import apiService from "../../services/api.service";
import { Pista } from "../../interfaces";
import '../../theme/variables.css';
import './ManageCourts.css';




const getStatusColor = (estado: string): string => {
  switch (estado.toLowerCase()) {
    case 'activo':
      return 'success';
    case 'inactivo':
      return 'medium';
    case 'mantenimiento':
      return 'warning';
    case 'cerrado':
      return 'danger';
    default:
      return 'primary';
  }
};


const ManageCourts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      if (!user) {
        return;
      }
  
      // Verificar que el usuario tenga rol de CLUB
      if (user.id_rol !== 'CLUB') {
        showToastMessage('No tienes permisos para gestionar pistas', 'danger');
        navigate('/home');
        return;
      }

      try {
        setLoading(true);
        
        let clubResponse;
        
        try {
          // Intentar usar el nuevo endpoint /my-club
          clubResponse = await apiService.get('/my-club');
        } catch (error) {
          // Fallback: usar endpoint existente con filtro por administrador
          const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
          
          if (!Array.isArray(clubsResponse) || clubsResponse.length === 0) {
            throw new Error('No administras ningún club');
          }
          
          // Tomar el primer club (normalmente un usuario solo administra uno)
          clubResponse = clubsResponse[0];
        }
        
        if (!clubResponse || !clubResponse.id) {
          throw new Error('No se pudo obtener el club administrado');
        }
        
        setClubId(clubResponse.id);
        setClubData(clubResponse);
        
        // Cargar las pistas del club
        const pistasResponse = await apiService.get(`/clubs/${clubResponse.id}/pistas`);
        
        setPistas(Array.isArray(pistasResponse) ? pistasResponse : []);
        
      } catch (error) {
        console.error('[ManageCourts] Error al cargar datos del club:', error);
        
        // Manejar diferentes tipos de errores
        if (error instanceof Error) {
          if (error.message.includes('No administras ningún club')) {
            showToastMessage('Tu cuenta no está asociada a ningún club. Contacta al administrador.', 'warning');
          } else if (error.message.includes('401')) {
            showToastMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'danger');
            navigate('/login');
          } else {
            showToastMessage('Error al cargar los datos del club. Inténtalo de nuevo.', 'danger');
          }
        } else {
          showToastMessage('Error de conexión. Verifica tu conexión a internet.', 'danger');
        }
      } finally {
        setLoading(false);
      }
    };
  
    loadClubData();
  }, [user, navigate]);
  
  
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
      showToastMessage('Error: No se ha podido identificar el club. Recarga la página.', 'danger');
      return;
    }

    // Validar datos del formulario
    if (!formData.numero || !formData.precio_hora || !['Cristal', 'Muro'].includes(formData.tipo)) {
      showToastMessage('Completa todos los campos requeridos. Tipo de pista debe ser: Cristal o Muro', 'warning');
      return;
    }
    
    // Validar número de pista
    const numeroInt = parseInt(formData.numero, 10);
    if (isNaN(numeroInt) || numeroInt <= 0) {
      showToastMessage('El número de pista debe ser un número positivo', 'warning');
      return;
    }
    
    // Validar precio
    const precioFloat = parseFloat(formData.precio_hora);
    if (isNaN(precioFloat) || precioFloat <= 0) {
      showToastMessage('El precio debe ser un número positivo', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const pistaData = {
        numero: numeroInt,
        id_club: clubId,
        tipo: formData.tipo,
        estado: 'disponible',
        precio_hora: precioFloat,
        iluminacion: formData.iluminacion,
        techada: formData.techada,
        imagen_url: formData.imagen_url
      };
      
      if (editingPista) {
        // Actualizar pista existente
        await apiService.put(`/pistas/${editingPista.id}`, pistaData);
        showToastMessage('Pista actualizada correctamente');
      } else {
        // Crear nueva pista
        await apiService.post(`/clubs/${clubId}/pistas`, pistaData);
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
      console.error('[ManageCourts] Error al guardar pista:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          showToastMessage('Tu sesión ha expirado. Inicia sesión nuevamente.', 'danger');
        } else if (error.message.includes('403')) {
          showToastMessage('No tienes permisos para realizar esta acción.', 'danger');
        } else if (error.message.includes('400')) {
          showToastMessage('Datos inválidos. Verifica la información ingresada.', 'warning');
        } else {
          showToastMessage('Error al guardar la pista. Inténtalo de nuevo.', 'danger');
        }
      } else {
        showToastMessage('Error de conexión. Verifica tu conexión a internet.', 'danger');
      }
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


  return (
    <IonPage>
      <IonContent className="contenedor-gestion-pistas">
        {/* Mostrar estado de carga inicial */}
        {loading && !clubData && (
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8" offsetMd="2">
                <IonCard>
                  <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                    <IonLoading isOpen={true} message="Cargando datos del club..." />
                    <p style={{ marginTop: '20px' }}>Cargando información del club...</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        {/* Mostrar error si no hay club */}
        {!loading && !clubData && (
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8" offsetMd="2">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle color="danger">❌ Error de Acceso</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>No se pudo cargar la información del club.</p>
                    <p>Posibles causas:</p>
                    <ul>
                      <li>Tu cuenta no está asociada a ningún club</li>
                      <li>No tienes permisos de administrador</li>
                      <li>Error de conexión con el servidor</li>
                    </ul>
                    <IonButton 
                      expand="block" 
                      color="primary" 
                      onClick={() => navigate('/home')}
                      style={{ marginTop: '20px' }}
                    >
                      Volver al Inicio
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        {/* Contenido principal - solo mostrar si hay datos del club */}
        {!loading && clubData && (
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8" offsetMd="2">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontWeight: 'bold' }}>
                      {clubData.nombre}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>
                      Gestione las pistas de su club. Puede crear, editar y cambiar el estado de las pistas.
                    </p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                      <strong>ID del Club:</strong> {clubData.id} | <strong>Pistas:</strong> {pistas.length}
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
        )}
        
        {/* FAB para añadir pista - solo mostrar si hay datos del club */}
        {!loading && clubData && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={openCreateModal}>
              <IonIcon icon={addCircleOutline} />
            </IonFabButton>
          </IonFab>
        )}
        
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