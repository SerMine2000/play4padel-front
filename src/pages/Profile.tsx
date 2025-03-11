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
  IonCol
} from '@ionic/react';
import { personCircleOutline, saveOutline, refreshOutline, mailOutline, callOutline, keyOutline } from 'ionicons/icons';
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
    }
  }, [user]);
  
  const handleInputChange = (e: CustomEvent) => {
    const { name, value } = e.detail;
    setFormData({
      ...formData,
      [name]: value
    });
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
    }
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrorMessage('');
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
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      let errorMsg = 'Error al actualizar la contraseña';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
              <IonAvatar className="profile-avatar">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.nombre} />
                ) : (
                  <IonIcon icon={personCircleOutline} size="large" />
                )}
              </IonAvatar>
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
                          name="nombre"
                          value={formData.nombre}
                          onIonChange={handleInputChange}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Apellidos</IonLabel>
                        <IonInput
                          name="apellidos"
                          value={formData.apellidos}
                          onIonChange={handleInputChange}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Email</IonLabel>
                        <IonInput
                          name="email"
                          type="email"
                          value={formData.email}
                          onIonChange={handleInputChange}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Teléfono</IonLabel>
                        <IonInput
                          name="telefono"
                          type="tel"
                          value={formData.telefono}
                          onIonChange={handleInputChange}
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Biografía</IonLabel>
                        <IonInput
                          name="bio"
                          value={formData.bio}
                          onIonChange={handleInputChange}
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
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onIonChange={handleInputChange}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Nueva Contraseña</IonLabel>
                        <IonInput
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onIonChange={handleInputChange}
                          required
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Confirmar Contraseña</IonLabel>
                        <IonInput
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onIonChange={handleInputChange}
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