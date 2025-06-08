// src/pages/ManageCourts.tsx
import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonInput, IonToggle, IonButton, IonIcon, IonList,
  IonLoading, IonToast, IonText, IonModal, IonChip, IonFab, IonFabButton, IonAlert, IonActionSheet } from '@ionic/react';
import { addCircleOutline, createOutline, buildOutline, trashOutline, closeCircleOutline, checkmarkCircleOutline, tennisballOutline, 
  cameraOutline, imagesOutline, linkOutline, cloudUploadOutline } from 'ionicons/icons';
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
  const [showImageActionSheet, setShowImageActionSheet] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  
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
  
  // Función para comprimir imágenes
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Error loading image'));
      img.src = URL.createObjectURL(file);
    });
  };
  
  // Manejar selección de archivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          setLoading(true);
          const compressedBase64 = await compressImage(file, 800, 0.8);
          setFormData(prev => ({ ...prev, imagen_url: compressedBase64 }));
          showToastMessage('Imagen procesada correctamente');
        } catch (error) {
          console.error('Error compressing image:', error);
          showToastMessage('Error al procesar la imagen', 'danger');
        } finally {
          setLoading(false);
        }
      } else {
        showToastMessage('Por favor selecciona una imagen válida', 'warning');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Tomar foto
  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'camera');
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };
  
  // Seleccionar desde galería
  const handleSelectFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };
  
  // Quitar imagen
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imagen_url: '' }));
    setShowUrlInput(false);
    setUrlInput('');
    showToastMessage('Imagen eliminada');
  };
  
  // Mostrar campo URL
  const handleShowUrlInput = () => {
    setShowUrlInput(true);
  };
  
  // Aplicar URL
  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setFormData(prev => ({ ...prev, imagen_url: urlInput.trim() }));
      setShowUrlInput(false);
      showToastMessage('URL de imagen establecida');
    } else {
      showToastMessage('Por favor ingresa una URL válida', 'warning');
    }
  };
  
  // Cancelar URL
  const handleCancelUrl = () => {
    setShowUrlInput(false);
    setUrlInput('');
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
    newStatus: string
  ) => {
    try {
      setLoading(true);
  
      await apiService.put(`/pistas/${pistaId}`, { estado: newStatus });
      showToastMessage(`Estado de la pista actualizado a ${newStatus}`);
  
      // Actualizar el estado localmente (sin recargar toda la lista)
      setPistas((prev) =>
        prev.map((p) => (p.id === pistaId ? { ...p, estado: newStatus } : p))
      );
  
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
                        <IonItem key={pista.id}>
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

                          <div className="acciones-pista" slot="end">
                            {/* Botones de acción horizontales */}
                            <div className="botones-accion-horizontal">
                              {pista.estado !== 'disponible' && (
                                <IonButton 
                                  fill="clear" 
                                  size="small" 
                                  color="success" 
                                  onClick={() => changeCourtStatus(pista.id, 'disponible')}
                                  className="boton-accion"
                                  data-tooltip="Abrir"
                                >
                                  <IonIcon icon={checkmarkCircleOutline} />
                                </IonButton>
                              )}

                              {pista.estado !== 'mantenimiento' && (
                                <IonButton 
                                  fill="clear" 
                                  size="small" 
                                  color="warning" 
                                  onClick={() => changeCourtStatus(pista.id, 'mantenimiento')}
                                  className="boton-accion"
                                  data-tooltip="Mantenimiento"
                                >
                                  <IonIcon icon={buildOutline} />
                                </IonButton>
                              )}

                              {pista.estado !== 'cerrada' && (
                                <IonButton 
                                  fill="clear" 
                                  size="small" 
                                  color="danger" 
                                  onClick={() => changeCourtStatus(pista.id, 'cerrada')}
                                  className="boton-accion"
                                  data-tooltip="Cerrar"
                                >
                                  <IonIcon icon={closeCircleOutline} />
                                </IonButton>
                              )}

                              <IonButton 
                                fill="clear" 
                                size="small" 
                                color="primary" 
                                onClick={() => openEditModal(pista)}
                                className="boton-accion"
                                data-tooltip="Editar"
                              >
                                <IonIcon icon={createOutline} />
                              </IonButton>

                              <IonButton 
                                fill="clear" 
                                size="small" 
                                color="danger" 
                                onClick={() => prepareDeleteCourt(pista.id)}
                                className="boton-accion"
                                data-tooltip="Eliminar"
                              >
                                <IonIcon icon={trashOutline} />
                              </IonButton>
                            </div>
                            
                            {/* Chip de estado */}
                            <IonChip color={getStatusColor(pista.estado)} className="chip-estado">
                              {pista.estado}
                            </IonChip>
                          </div>
                        </IonItem>
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
        <IonModal className="modal-pista-profesional" isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader className="modal-header-compact">
            <IonToolbar className="modal-toolbar-compact">
              <IonTitle className="modal-title-compact">
                <IonIcon icon={editingPista ? createOutline : addCircleOutline} className="modal-icon-compact" />
                {editingPista ? 'Editar Pista' : 'Nueva Pista'}
              </IonTitle>
              <IonButtons slot="end" className="modal-buttons-compact">
                <IonButton fill="clear" onClick={() => setShowModal(false)} className="modal-close-btn-compact">
                  ✕
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="modal-content">
            <div className="modal-form-container">
              <div className="form-layout">
                {/* Sección de Información Básica */}
                <div className="form-section">
                  <h3 className="section-title">
                    <IonIcon icon={tennisballOutline} />
                    Información Básica
                  </h3>
                
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">Número de Pista *</label>
                    <IonInput 
                      className="field-input"
                      type="number" 
                      min="1" 
                      value={formData.numero} 
                      onIonChange={(e) => handleInputChange(e, 'numero')} 
                      placeholder="Ej: 1"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">Precio por Sesión *</label>
                    <div className="price-input-container">
                      <IonInput 
                        className="field-input price-input"
                        type="number" 
                        value={formData.precio_hora} 
                        onIonChange={(e) => handleInputChange(e, 'precio_hora')} 
                        placeholder="0.00"
                        required
                      />
                      <span className="price-currency">€</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="field-label">Tipo de Pista *</label>
                  <div className="tipo-buttons">
                    <button 
                      type="button"
                      className={`tipo-btn ${formData.tipo === 'Cristal' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, tipo: 'Cristal' })}
                    >
                      <span>Cristal</span>
                    </button>
                    <button 
                      type="button"
                      className={`tipo-btn ${formData.tipo === 'Muro' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, tipo: 'Muro' })}
                    >
                      <span>Muro</span>
                    </button>
                  </div>
                </div>
                </div>
                
                {/* Sección de Características */}
                <div className="form-section">
                  <h3 className="section-title">
                    <IonIcon icon={buildOutline} />
                    Características
                  </h3>
                
                <div className="toggle-grid">
                  <div className="toggle-field">
                    <div className="toggle-info">
                      <span className="toggle-icon">💡</span>
                      <div>
                        <h4>Iluminación</h4>
                        <p>La pista cuenta con iluminación artificial</p>
                      </div>
                    </div>
                    <IonToggle 
                      checked={formData.iluminacion} 
                      onIonChange={(e) => handleToggleChange(e, 'iluminacion')}
                      className="field-toggle"
                    />
                  </div>
                  
                  <div className="toggle-field">
                    <div className="toggle-info">
                      <span className="toggle-icon">🏠</span>
                      <div>
                        <h4>Pista Cubierta</h4>
                        <p>La pista está techada (Indoor)</p>
                      </div>
                    </div>
                    <IonToggle 
                      checked={formData.techada} 
                      onIonChange={(e) => handleToggleChange(e, 'techada')}
                      className="field-toggle"
                    />
                  </div>
                </div>
                </div>
              </div>
              
              {/* Sección de Imagen */}
              <div className="form-section form-section-full">
                <h3 className="section-title">
                  <IonIcon icon={addCircleOutline} />
                  Imagen (Opcional)
                </h3>
                
                <div className="image-upload-section">
                  {/* Campo URL (solo visible cuando showUrlInput es true) */}
                  {showUrlInput && (
                    <div className="url-input-section">
                      <div className="url-input-container">
                        <IonInput
                          className="url-input-field"
                          value={urlInput}
                          onIonInput={(e) => setUrlInput(e.detail.value!)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          type="url"
                          clearInput
                        />
                      </div>
                      <div className="url-buttons">
                        <IonButton 
                          size="small" 
                          color="primary" 
                          onClick={handleApplyUrl}
                          className="url-apply-btn"
                        >
                          Aplicar
                        </IonButton>
                        <IonButton 
                          size="small" 
                          fill="clear" 
                          color="medium" 
                          onClick={handleCancelUrl}
                          className="url-cancel-btn"
                        >
                          Cancelar
                        </IonButton>
                      </div>
                    </div>
                  )}
                  
                  <div className="upload-options">
                    <IonButton 
                      fill="outline" 
                      color="primary" 
                      onClick={() => setShowImageActionSheet(true)}
                      className="upload-btn"
                    >
                      <IonIcon icon={cloudUploadOutline} slot="start" />
                      Seleccionar Imagen
                    </IonButton>
                    
                    {!showUrlInput && (
                      <IonButton 
                        fill="outline" 
                        color="secondary" 
                        onClick={handleShowUrlInput}
                        className="upload-btn"
                      >
                        <IonIcon icon={linkOutline} slot="start" />
                        Introducir URL
                      </IonButton>
                    )}
                    
                    {formData.imagen_url && (
                      <IonButton 
                        fill="clear" 
                        color="danger" 
                        onClick={handleRemoveImage}
                        className="remove-btn"
                      >
                        <IonIcon icon={trashOutline} slot="start" />
                        Quitar
                      </IonButton>
                    )}
                  </div>
                  
                  {formData.imagen_url && (
                    <div className="image-preview">
                      <img 
                        src={formData.imagen_url} 
                        alt="Vista previa" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {!formData.imagen_url && (
                    <div className="no-image-placeholder">
                      <IonIcon icon={imagesOutline} />
                      <p>Sin imagen seleccionada</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botones de Acción */}
              <div className="modal-actions">
                <IonButton 
                  fill="clear" 
                  color="medium" 
                  onClick={() => setShowModal(false)}
                  className="action-btn cancel-btn"
                >
                  Cancelar
                </IonButton>
                <IonButton 
                  color="primary" 
                  onClick={saveCourt}
                  className="action-btn save-btn"
                >
                  <IonIcon icon={editingPista ? createOutline : addCircleOutline} slot="start" />
                  {editingPista ? 'Actualizar Pista' : 'Crear Pista'}
                </IonButton>
              </div>
            </div>
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
        
        {/* Input oculto para archivos */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        
        {/* Action Sheet para selección de imagen */}
        <IonActionSheet
          isOpen={showImageActionSheet}
          onDidDismiss={() => setShowImageActionSheet(false)}
          buttons={[
            {
              text: 'Tomar Foto',
              icon: cameraOutline,
              handler: () => {
                handleTakePhoto();
              }
            },
            {
              text: 'Seleccionar de Galería',
              icon: imagesOutline,
              handler: () => {
                handleSelectFromGallery();
              }
            },
            {
              text: 'Introducir URL',
              icon: linkOutline,
              handler: () => {
                handleShowUrlInput();
              }
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ManageCourts;