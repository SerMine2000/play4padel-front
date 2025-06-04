// src/pages/Profile.tsx - Versión con compresión de imágenes y cruz mejorada
import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput,
  IonButton, IonLoading, IonToast, IonIcon, IonText, IonGrid, IonRow, IonCol, 
  IonPage, IonTextarea, IonActionSheet, IonAlert, IonBackdrop
} from '@ionic/react';
import { 
  personCircleOutline, saveOutline, createOutline, keyOutline, closeOutline, cameraOutline,
  personOutline, mailOutline, callOutline, informationCircleOutline, checkmarkCircleOutline,
  closeCircleOutline, cloudUploadOutline, linkOutline, imagesOutline, trashOutline, eyeOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../utils/constants';
import Avatar from '../../components/Avatar';
import '../../theme/variables.css';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, setUser, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    bio: '',
    avatar_url: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  
  // Estados para los nuevos componentes
  const [showAvatarActionSheet, setShowAvatarActionSheet] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [showUrlAlert, setShowUrlAlert] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTempAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleInputChange = (e: CustomEvent, field: string) => {
    const value = e.detail.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTempAvatarUrl(user.avatar_url || '');
    }
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrorMessage('');
  };

  // Manejador mejorado para click en avatar
  const manejarClickAvatar = () => {
    if (isEditing) {
      setShowAvatarActionSheet(true);
    } else {
      setShowAvatarPreview(true);
    }
  };

  // Función para comprimir y redimensionar imágenes
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
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

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Funciones simplificadas para el cambio de avatar
  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'camera');
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleSelectFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleEnterUrl = () => {
    setUrlInput(tempAvatarUrl || '');
    setShowUrlAlert(true);
  };

  const handleRemoveAvatar = () => {
    setTempAvatarUrl('');
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    setSuccessMessage('Avatar eliminado');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          setIsLoading(true);
          
          // Comprimir la imagen antes de guardarla
          const compressedBase64 = await compressImage(file, 400, 0.8);
          
          setTempAvatarUrl(compressedBase64);
          setFormData(prev => ({ ...prev, avatar_url: compressedBase64 }));
          setSuccessMessage('Imagen procesada correctamente');
        } catch (error) {
          console.error('Error al comprimir imagen:', error);
          setErrorMessage('Error al procesar la imagen');
        } finally {
          setIsLoading(false);
        }
      } else {
        setErrorMessage('Por favor selecciona una imagen válida');
      }
    }
    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUrlSave = () => {
    if (urlInput && validateImageUrl(urlInput)) {
      setTempAvatarUrl(urlInput);
      setFormData(prev => ({ ...prev, avatar_url: urlInput }));
      setSuccessMessage('URL cargada correctamente.');
      setShowUrlAlert(false);
      setUrlInput('');
    } else {
      setErrorMessage('URL no válida (debe empezar por http:// o https://)');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
  
    try {
      setIsLoading(true);
      setErrorMessage('');
  
      // Preparar el payload con validación especial para avatar
      let avatarToSend = tempAvatarUrl || '';
      
      // Si es una URL externa, enviarla tal como está
      // Si es base64, asegurarse de que no sea demasiado largo
      if (avatarToSend.startsWith('data:image/')) {
        console.log('Enviando imagen base64 comprimida, tamaño:', Math.round(avatarToSend.length / 1024), 'KB');
        
        // Si la imagen sigue siendo muy grande, comprimirla más
        if (avatarToSend.length > 500000) { // 500KB
          try {
            // Crear una imagen temporal para volver a comprimir
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = 300; // Reducir más el tamaño
                canvas.height = 300;
                ctx?.drawImage(img, 0, 0, 300, 300);
                avatarToSend = canvas.toDataURL('image/jpeg', 0.6); // Más compresión
                console.log('Imagen recomprimida, nuevo tamaño:', Math.round(avatarToSend.length / 1024), 'KB');
                resolve(true);
              };
              img.onerror = reject;
              img.src = avatarToSend;
            });
          } catch (error) {
            console.error('Error al recomprimir:', error);
            setErrorMessage('La imagen es demasiado grande. Prueba con una imagen más pequeña.');
            return;
          }
        }
      }

      const payload = {
        nombre: formData.nombre || user.nombre,
        apellidos: formData.apellidos || user.apellidos,
        email: formData.email || user.email,
        telefono: formData.telefono !== 'No especificado' ? formData.telefono : user.telefono,
        bio: formData.bio !== 'No especificado' ? formData.bio : user.bio,
        avatar_url: cleanImageUrl(avatarToSend)
      };
  
      console.log("Payload preparado para enviar, tamaño total:", JSON.stringify(payload).length, "caracteres");
  
      const res = await apiService.put(`${API_ENDPOINTS.USER}/${user.id}`, payload);
  
      setUser({
        ...user,
        ...payload,
      });

      // Sincronizar formData con los datos guardados
      setFormData(prev => ({
        ...prev,
        avatar_url: avatarToSend
      }));
  
      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
  
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      
      // Mensajes de error más específicos
      if (error.message.includes('500')) {
        setErrorMessage('Error del servidor. La imagen podría ser demasiado grande. Prueba con una imagen más pequeña.');
      } else if (error.message.includes('413') || error.message.includes('Payload')) {
        setErrorMessage('La imagen es demasiado grande. Prueba con una imagen más pequeña.');
      } else {
        setErrorMessage(error.message || 'Error al actualizar el perfil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await apiService.put(API_ENDPOINTS.UPDATE_PASSWORD, {
        user_id: user.id,
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      setSuccessMessage('Contraseña actualizada correctamente');
      setIsChangingPassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      setErrorMessage(error.message || 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const validateImageUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const cleanImageUrl = (url: string) => {
    const match = url.match(/[?&]u=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : url;
  };

  // Datos para mostrar en modo vista
  const profileFields = [
    { key: 'nombre', label: 'Nombre', icon: personOutline, value: user?.nombre },
    { key: 'apellidos', label: 'Apellidos', icon: personOutline, value: user?.apellidos },
    { key: 'email', label: 'Email', icon: mailOutline, value: user?.email },
    { key: 'telefono', label: 'Teléfono', icon: callOutline, value: user?.telefono },
    { key: 'bio', label: 'Biografía', icon: informationCircleOutline, value: user?.bio },
  ];

  // Opciones del ActionSheet para cambiar avatar
  const avatarActionSheetButtons = [
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
        handleEnterUrl();
      }
    },
    {
      text: 'Eliminar Avatar',
      icon: trashOutline,
      role: 'destructive',
      handler: () => {
        handleRemoveAvatar();
      }
    },
    {
      text: 'Cancelar',
      icon: closeOutline,
      role: 'cancel'
    }
  ];

  return (
    <IonPage>
      <IonContent className="profile-page-content">
        <div className="profile-container">
          {/* Header del perfil */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <div className="avatar-wrapper">
                  <Avatar
                    idUsuario={user?.id || 0}
                    nombre={user?.nombre}
                    urlAvatar={tempAvatarUrl}
                    tamaño={120}
                    className="profile-avatar"
                    onClick={manejarClickAvatar}
                  />
                  {isEditing && (
                    <div className="avatar-overlay" onClick={manejarClickAvatar}>
                      <IonIcon icon={cameraOutline} />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <p className="avatar-edit-hint">Haz clic para cambiar avatar</p>
                )}
              </div>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">
                {user?.nombre && user?.apellidos ? 
                  `${user.nombre} ${user.apellidos}` : 
                  user?.nombre || user?.apellidos || 'Sin nombre'
                }
              </h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className="user-role-badge">{user?.role || 'Usuario'}</span>
              </div>
            </div>
          </div>

          {/* Información personal */}
          <IonCard className="profile-info-card">
            <IonCardHeader>
              <IonCardTitle className="card-title">
                <IonIcon icon={personOutline} />
                Información Personal
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {(!isEditing && !isChangingPassword) && (
                <div className="info-display-mode">
                  {profileFields.map((field) => (
                    <div key={field.key} className="info-row">
                      <div className="info-label">
                        <IonIcon icon={field.icon} />
                        <span>{field.label}</span>
                      </div>
                      <div className="info-value">
                        {field.value || 'No especificado'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <div className="edit-mode">
                  <div className="edit-fields">
                    {profileFields.map((field) => (
                      <div key={field.key} className="edit-field-group">
                        <label className="field-label">
                          <IonIcon icon={field.icon} />
                          {field.label}
                        </label>
                        {field.key === 'bio' ? (
                          <IonTextarea
                            className="field-input"
                            value={formData[field.key as keyof typeof formData]}
                            onIonInput={(e) => handleInputChange(e, field.key)}
                            placeholder={`Introduce tu ${field.label.toLowerCase()}`}
                            rows={4}
                          />
                        ) : (
                          <IonInput
                            className="field-input"
                            value={formData[field.key as keyof typeof formData]}
                            onIonInput={(e) => handleInputChange(e, field.key)}
                            placeholder={`Introduce tu ${field.label.toLowerCase()}`}
                            type={field.key === 'email' ? 'email' : field.key === 'telefono' ? 'tel' : 'text'}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isChangingPassword && (
                <div className="password-mode">
                  <div className="edit-fields">
                    <div className="edit-field-group">
                      <label className="field-label">
                        <IonIcon icon={keyOutline} />
                        Contraseña actual
                      </label>
                      <IonInput
                        className="field-input"
                        type="password"
                        value={formData.currentPassword}
                        onIonInput={(e) => handleInputChange(e, 'currentPassword')}
                        placeholder="Introduce tu contraseña actual"
                      />
                    </div>
                    
                    <div className="edit-field-group">
                      <label className="field-label">
                        <IonIcon icon={keyOutline} />
                        Nueva contraseña
                      </label>
                      <IonInput
                        className="field-input"
                        type="password"
                        value={formData.newPassword}
                        onIonInput={(e) => handleInputChange(e, 'newPassword')}
                        placeholder="Introduce nueva contraseña"
                      />
                    </div>
                    
                    <div className="edit-field-group">
                      <label className="field-label">
                        <IonIcon icon={checkmarkCircleOutline} />
                        Confirmar contraseña
                      </label>
                      <IonInput
                        className="field-input"
                        type="password"
                        value={formData.confirmPassword}
                        onIonInput={(e) => handleInputChange(e, 'confirmPassword')}
                        placeholder="Confirma la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Botones de acción */}
          <div className="action-buttons">
            {(!isEditing && !isChangingPassword) && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="primary-button"
                      onClick={handleEditProfile}
                    >
                      <IonIcon icon={createOutline} slot="start" />
                      Editar Perfil
                    </IonButton>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="secondary-button"
                      onClick={handleChangePassword}
                    >
                      <IonIcon icon={keyOutline} slot="start" />
                      Cambiar Contraseña
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {isEditing && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="success-button"
                      onClick={handleUpdateProfile}
                    >
                      <IonIcon icon={saveOutline} slot="start" />
                      Guardar Cambios
                    </IonButton>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="cancel-button"
                      onClick={handleCancel}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Cancelar
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {isChangingPassword && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="success-button"
                      onClick={handleUpdatePassword}
                    >
                      <IonIcon icon={saveOutline} slot="start" />
                      Actualizar Contraseña
                    </IonButton>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="cancel-button"
                      onClick={handleCancel}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Cancelar
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </div>
        </div>

        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* ActionSheet para cambiar avatar */}
        <IonActionSheet
          isOpen={showAvatarActionSheet}
          onDidDismiss={() => setShowAvatarActionSheet(false)}
          cssClass="avatar-action-sheet"
          buttons={avatarActionSheetButtons}
          header="Cambiar Avatar"
        />

        {/* Vista previa mejorada con overlay y backdrop */}
        {showAvatarPreview && (
          <div className="avatar-preview-overlay" onClick={() => setShowAvatarPreview(false)}>
            <IonBackdrop 
              visible={showAvatarPreview} 
              tappable={true}
              onIonBackdropTap={() => setShowAvatarPreview(false)}
            />
            <div className="avatar-preview-modal" onClick={(e) => e.stopPropagation()}>
              {/* Botón de cierre mejorado sin fondo feo */}
              <div className="preview-close-button" onClick={() => setShowAvatarPreview(false)}>
                <IonIcon icon={closeOutline} />
              </div>
              
              <div className="avatar-preview-content">
                {tempAvatarUrl ? (
                  <img
                    src={tempAvatarUrl}
                    alt="Avatar ampliado"
                    className="preview-image-large"
                  />
                ) : (
                  <div className="preview-avatar-large">
                    <Avatar
                      idUsuario={user?.id || 0}
                      nombre={user?.nombre}
                      urlAvatar=""
                      tamaño={250}
                      className="generated-preview-large"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alert para introducir URL */}
        <IonAlert
          isOpen={showUrlAlert}
          onDidDismiss={() => setShowUrlAlert(false)}
          cssClass="url-input-alert"
          header="Introducir URL de imagen"
          message="Pega aquí la URL de tu imagen"
          inputs={[
            {
              name: 'imageUrl',
              type: 'url',
              placeholder: 'https://ejemplo.com/imagen.jpg',
              value: urlInput
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                setUrlInput('');
              }
            },
            {
              text: 'Guardar',
              handler: (data) => {
                setUrlInput(data.imageUrl || '');
                if (data.imageUrl && validateImageUrl(data.imageUrl)) {
                  setTempAvatarUrl(data.imageUrl);
                  setFormData(prev => ({ ...prev, avatar_url: data.imageUrl }));
                  setSuccessMessage('URL cargada correctamente');
                  return true;
                } else {
                  setErrorMessage('URL no válida (debe empezar por http:// o https://)');
                  return false;
                }
              }
            }
          ]}
        />

        <IonLoading isOpen={isLoading} message="Procesando..." />
        
        <IonToast
          isOpen={!!successMessage}
          onDidDismiss={() => setSuccessMessage('')}
          message={successMessage}
          duration={3000}
          color="success"
          position="bottom"
        />
        
        <IonToast
          isOpen={!!errorMessage}
          onDidDismiss={() => setErrorMessage('')}
          message={errorMessage}
          duration={3000}
          color="danger"
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;