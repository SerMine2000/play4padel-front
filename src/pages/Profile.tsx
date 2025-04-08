// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBackButton,
  IonButtons,
  IonLoading,
  IonToast,
  IonIcon,
  IonAvatar,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert
} from '@ionic/react';
import { personOutline, saveOutline, refreshOutline, mailOutline, callOutline, keyOutline, imageOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../utils/constants';
import './css/Profile.css';

const Profile: React.FC = () => {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const history = useHistory();
  
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

  // Nuevo estado para la URL de avatar temporal
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [showAvatarAlert, setShowAvatarAlert] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
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
      
      // También establecer la URL temporal de avatar
      setTempAvatarUrl(user.avatar_url || '');
    }
  }, [user]);
  
  const handleInputChange = (e: CustomEvent, fieldName: string) => {
    const value = e.detail.value;
    setFormData(prevState => ({
      ...prevState,
      [fieldName]: value
    }));
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
    // Restaurar datos originales
    if (user) {
      setFormData({
        ...formData,
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
      
      // Restaurar URL temporal de avatar
      setTempAvatarUrl(user.avatar_url || '');
    }
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrorMessage('');
  };

  // Función para manejar la actualización del avatar
  const handleAvatarUpdate = () => {
    setShowAvatarAlert(true);
  };

  // Función para aplicar URL de avatar temporal
  const applyAvatarUrl = () => {
    setFormData(prevState => ({
      ...prevState,
      avatar_url: tempAvatarUrl
    }));
    setShowAvatarAlert(false);
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Preparar datos para actualizar
      const updateData = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        bio: formData.bio,
        avatar_url: formData.avatar_url
      };
      
      // Llamar a la API para actualizar el perfil
      await apiService.put(`${API_ENDPOINTS.USER}/${user.id}`, updateData);
      
      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Recargar los datos del usuario
      await refreshUser();
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setErrorMessage(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePassword = async () => {
    if (!user) return;
    
    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Preparar datos para actualizar la contraseña
      const passwordData = {
        user_id: user.id,
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      };
      
      // Llamar a la API para actualizar la contraseña
      await apiService.put(API_ENDPOINTS.UPDATE_PASSWORD, passwordData);
      
      setSuccessMessage('Contraseña actualizada correctamente');
      setIsChangingPassword(false);
      
      // Limpiar campos de contraseña
      setFormData(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      
      let errorMsg = 'Error al actualizar la contraseña';
      if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para validar URL de imagen
  const validateImageUrl = (url: string) => {
    // URL vacía es permitida
    if (!url) return true;
    
    // Validación básica: debe iniciar con http:// o https://
    return url.startsWith('http://') || url.startsWith('https://');
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="profile-container">
        {authLoading ? (
          <IonLoading isOpen={true} message="Cargando perfil..." />
        ) : user ? (
          <>
            <div className="profile-header">
              <IonAvatar className="profile-avatar" onClick={isEditing ? handleAvatarUpdate : undefined}>
                {tempAvatarUrl ? (
                  <img src={tempAvatarUrl} alt={user.nombre} />
                ) : (
                  <IonIcon icon={personOutline} size="large" />
                )}
              </IonAvatar>
              {isEditing && (
                <IonText color="light" className="edit-avatar-text">
                  <p><small>Toca para cambiar avatar</small></p>
                </IonText>
              )}
              <h2 className="profile-name">{user.nombre} {user.apellidos}</h2>
              <p>{user.email}</p>
            </div>
            
            <IonCard className="profile-card">
              {!isEditing && !isChangingPassword && (
                <>
                  <IonCardHeader>
                    <IonCardTitle>Información Personal</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem>
                      <IonLabel>
                        <h2>Nombre</h2>
                        <p>{user.nombre} {user.apellidos}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h2>Email</h2>
                        <p>{user.email}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h2>Teléfono</h2>
                        <p>{user.telefono || 'No disponible'}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>
                        <h2>Biografía</h2>
                        <p>{formData.bio || 'No hay información disponible'}</p>
                      </IonLabel>
                    </IonItem>
                    
                    <IonGrid>
                      <IonRow>
                        <IonCol>
                          <IonButton expand="block" onClick={handleEditProfile}>
                            Editar Perfil
                          </IonButton>
                        </IonCol>
                        <IonCol>
                          <IonButton expand="block" color="secondary" onClick={handleChangePassword}>
                            Cambiar Contraseña
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </>
              )}
              
              {isEditing && (
                <>
                  <IonCardHeader>
                    <IonCardTitle>Editar Perfil</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <form className="profile-form">
                      <IonItem>
                        <IonLabel position="floating">Nombre</IonLabel>
                        <IonInput
                          value={formData.nombre}
                          onIonChange={(e) => handleInputChange(e, 'nombre')}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Apellidos</IonLabel>
                        <IonInput
                          value={formData.apellidos}
                          onIonChange={(e) => handleInputChange(e, 'apellidos')}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Email</IonLabel>
                        <IonInput
                          type="email"
                          value={formData.email}
                          onIonChange={(e) => handleInputChange(e, 'email')}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Teléfono</IonLabel>
                        <IonInput
                          type="tel"
                          value={formData.telefono}
                          onIonChange={(e) => handleInputChange(e, 'telefono')}
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Biografía</IonLabel>
                        <IonInput
                          value={formData.bio}
                          onIonChange={(e) => handleInputChange(e, 'bio')}
                        />
                      </IonItem>
                      
                      <div className="form-buttons">
                        <IonButton color="medium" onClick={handleCancel}>
                          Cancelar
                        </IonButton>
                        <IonButton onClick={handleUpdateProfile}>
                          <IonIcon slot="start" icon={saveOutline} />
                          Guardar Cambios
                        </IonButton>
                      </div>
                    </form>
                  </IonCardContent>
                </>
              )}
              
              {isChangingPassword && (
                <>
                  <IonCardHeader>
                    <IonCardTitle>Cambiar Contraseña</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <form className="profile-form">
                      <IonItem>
                        <IonLabel position="floating">Contraseña Actual</IonLabel>
                        <IonInput
                          type="password"
                          value={formData.currentPassword}
                          onIonChange={(e) => handleInputChange(e, 'currentPassword')}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Nueva Contraseña</IonLabel>
                        <IonInput
                          type="password"
                          value={formData.newPassword}
                          onIonChange={(e) => handleInputChange(e, 'newPassword')}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Confirmar Contraseña</IonLabel>
                        <IonInput
                          type="password"
                          value={formData.confirmPassword}
                          onIonChange={(e) => handleInputChange(e, 'confirmPassword')}
                          required
                        />
                      </IonItem>
                      
                      <div className="form-buttons">
                        <IonButton color="medium" onClick={handleCancel}>
                          Cancelar
                        </IonButton>
                        <IonButton onClick={handleUpdatePassword}>
                          <IonIcon slot="start" icon={saveOutline} />
                          Actualizar Contraseña
                        </IonButton>
                      </div>
                    </form>
                  </IonCardContent>
                </>
              )}
            </IonCard>
            
            {successMessage && (
              <div className="success-message">
                <IonText color="success">
                  {successMessage}
                </IonText>
              </div>
            )}
            
            {errorMessage && (
              <div className="error-message">
                <IonText color="danger">
                  {errorMessage}
                </IonText>
              </div>
            )}

            {/* Alerta para cambiar avatar */}
            <IonAlert
              isOpen={showAvatarAlert}
              onDidDismiss={() => setShowAvatarAlert(false)}
              header="Cambiar avatar"
              subHeader="Introduce la URL de la imagen"
              inputs={[
                {
                  name: 'avatar_url',
                  type: 'url',
                  placeholder: 'https://ejemplo.com/imagen.jpg',
                  value: tempAvatarUrl
                }
              ]}
              buttons={[
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Ver previa',
                  handler: (data) => {
                    if (validateImageUrl(data.avatar_url)) {
                      setTempAvatarUrl(data.avatar_url);
                      return false; // Mantener el diálogo abierto
                    } else {
                      setErrorMessage('URL de imagen no válida. Debe comenzar con http:// o https://');
                      return false;
                    }
                  }
                },
                {
                  text: 'Guardar',
                  handler: (data) => {
                    if (validateImageUrl(data.avatar_url)) {
                      setTempAvatarUrl(data.avatar_url);
                      applyAvatarUrl();
                      return true;
                    } else {
                      setErrorMessage('URL de imagen no válida. Debe comenzar con http:// o https://');
                      return false;
                    }
                  }
                }
              ]}
            />
          </>
        ) : (
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>No se pudo cargar la información del usuario.</p>
            </IonText>
            <IonButton onClick={() => window.location.reload()}>
              <IonIcon slot="start" icon={refreshOutline} />
              Recargar
            </IonButton>
          </div>
        )}
        
        <IonLoading isOpen={isLoading} message="Procesando..." />
      </IonContent>
    </IonPage>
  );
};

export default Profile;