// src/pages/Profile.tsx - Rediseño profesional
import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput,
  IonButton, IonLoading, IonToast, IonIcon, IonAvatar, IonText, IonGrid, IonRow, IonCol, IonAlert, IonModal,
  IonPage, IonTextarea, IonToggle, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/react';
import { personCircleOutline, saveOutline, createOutline, keyOutline, closeOutline, cameraOutline,
  personOutline, mailOutline, callOutline, informationCircleOutline, checkmarkCircleOutline,
  closeCircleOutline, cloudUploadOutline, linkOutline, imagesOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../utils/constants';
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
  const [showAvatarAlert, setShowAvatarAlert] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAvatarUploadModal, setShowAvatarUploadModal] = useState(false);
  const [avatarUploadMode, setAvatarUploadMode] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  const handleAvatarUpdate = () => {
    setPreviewUrl(tempAvatarUrl);
    setShowAvatarUploadModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewUrl(result);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMessage('Por favor selecciona una imagen válida');
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Para web, usar input file con capture
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'camera');
        fileInputRef.current.click();
      }
    } catch (error) {
      setErrorMessage('Error al acceder a la cámara');
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
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

  const handleUrlChange = (e: CustomEvent) => {
    const url = e.detail.value;
    setPreviewUrl(url);
  };

  const handleAvatarSave = async () => {
    try {
      let finalUrl = '';
      
      if (avatarUploadMode === 'file' && selectedFile) {
        // Convertir archivo a base64 para almacenar
        finalUrl = await convertFileToBase64(selectedFile);
      } else if (avatarUploadMode === 'url' && previewUrl) {
        if (!validateImageUrl(previewUrl)) {
          setErrorMessage('URL no válida (debe empezar por http:// o https://)');
          return;
        }
        finalUrl = previewUrl;
      } else {
        setErrorMessage('Por favor selecciona una imagen o introduce una URL');
        return;
      }

      setTempAvatarUrl(finalUrl);
      setFormData(prev => ({ ...prev, avatar_url: finalUrl }));
      setShowAvatarUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl('');
      
    } catch (error) {
      setErrorMessage('Error al procesar la imagen');
    }
  };

  const handleAvatarCancel = () => {
    setShowAvatarUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
  
    try {
      setIsLoading(true);
      setErrorMessage('');
  
      const payload = {
        nombre: formData.nombre || user.nombre,
        apellidos: formData.apellidos || user.apellidos,
        email: formData.email || user.email,
        telefono: formData.telefono !== 'No especificado' ? formData.telefono : user.telefono,
        bio: formData.bio !== 'No especificado' ? formData.bio : user.bio,
        avatar_url: cleanImageUrl((formData.avatar_url || user.avatar_url) ?? '')
      };
  
      console.log("Payload preparado para enviar:", payload);
  
      const res = await apiService.put(`${API_ENDPOINTS.USER}/${user.id}`, payload);
  
      setUser({
        ...user,
        ...payload,
      });
  
      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
  
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setErrorMessage(error.message || 'Error al actualizar el perfil');
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

  return (
    <IonPage>
      <IonContent className="profile-page-content">
        <div className="profile-container">
          {/* Header del perfil */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <IonAvatar 
                  className="profile-avatar"
                  onClick={isEditing ? handleAvatarUpdate : () => tempAvatarUrl && setShowAvatarModal(true)}
                >
                  {tempAvatarUrl ? (
                    <img src={tempAvatarUrl} alt="Avatar" />
                  ) : (
                    <IonIcon icon={personCircleOutline} />
                  )}
                  {isEditing && (
                    <div className="avatar-overlay">
                      <IonIcon icon={cameraOutline} />
                    </div>
                  )}
                </IonAvatar>
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
                      fill="outline"
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
                      fill="outline"
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
                      fill="outline"
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

        {/* Modales y alertas */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Modal profesional de cambio de avatar */}
        <IonModal isOpen={showAvatarUploadModal} onDidDismiss={handleAvatarCancel}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Cambiar Avatar</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleAvatarCancel} fill="clear">
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="avatar-upload-modal">
            <div className="avatar-upload-container">
              {/* Preview del avatar */}
              <div className="avatar-preview-section">
                <div className="avatar-preview">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Vista previa" />
                  ) : (
                    <IonIcon icon={personCircleOutline} />
                  )}
                </div>
                <p className="preview-text">Vista previa</p>
              </div>

              {/* Toggle para cambiar modo */}
              <div className="upload-mode-toggle">
                <div className="toggle-container">
                  <div className="toggle-option">
                    <IonIcon icon={linkOutline} />
                    <span>URL</span>
                  </div>
                  <IonToggle
                    checked={avatarUploadMode === 'file'}
                    onIonChange={(e) => {
                      setAvatarUploadMode(e.detail.checked ? 'file' : 'url');
                      setPreviewUrl('');
                      setSelectedFile(null);
                    }}
                  />
                  <div className="toggle-option">
                    <IonIcon icon={imagesOutline} />
                    <span>Archivo</span>
                  </div>
                </div>
              </div>

              {/* Contenido según el modo */}
              {avatarUploadMode === 'url' ? (
                <div className="url-input-section">
                  <IonItem className="url-input-item">
                    <IonLabel position="stacked">
                      <IonIcon icon={linkOutline} />
                      URL de la imagen
                    </IonLabel>
                    <IonInput
                      value={previewUrl}
                      onIonInput={handleUrlChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      type="url"
                    />
                  </IonItem>
                </div>
              ) : (
                <div className="file-upload-section">
                  <div className="upload-options">
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleCameraCapture}
                      className="upload-option-btn"
                    >
                      <IonIcon icon={cameraOutline} slot="start" />
                      Tomar Foto
                    </IonButton>
                    
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleGallerySelect}
                      className="upload-option-btn"
                    >
                      <IonIcon icon={imagesOutline} slot="start" />
                      Seleccionar de Galería
                    </IonButton>
                  </div>
                  
                  {selectedFile && (
                    <div className="file-info">
                      <p className="file-name">
                        <IonIcon icon={checkmarkCircleOutline} color="success" />
                        {selectedFile.name}
                      </p>
                      <p className="file-size">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div className="modal-actions">
                <IonButton
                  expand="block"
                  onClick={handleAvatarSave}
                  className="save-avatar-btn"
                  disabled={!previewUrl && !selectedFile}
                >
                  <IonIcon icon={saveOutline} slot="start" />
                  Guardar Avatar
                </IonButton>
                
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleAvatarCancel}
                  className="cancel-avatar-btn"
                >
                  <IonIcon icon={closeCircleOutline} slot="start" />
                  Cancelar
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonModal isOpen={showAvatarModal} onDidDismiss={() => setShowAvatarModal(false)}>
          <IonContent className="avatar-modal-content">
            <div className="modal-close-button">
              <IonButton fill="clear" onClick={() => setShowAvatarModal(false)}>
                <IonIcon icon={closeOutline} size="large" />
              </IonButton>
            </div>
            <div className="avatar-modal-image">
              <img
                src={tempAvatarUrl}
                alt="Avatar ampliado"
              />
            </div>
          </IonContent>
        </IonModal>

        <IonLoading isOpen={isLoading} message="Actualizando..." />
        
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