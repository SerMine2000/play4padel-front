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
  IonAlert,
  IonModal
} from '@ionic/react';
import {
  personOutline,
  personCircleOutline,
  saveOutline,
  refreshOutline,
  mailOutline,
  callOutline,
  keyOutline,
  imageOutline,
  closeOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../utils/constants';
import '../theme/variables.css';
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

  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [showAvatarAlert, setShowAvatarAlert] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleAvatarUpdate = () => setShowAvatarAlert(true);

  const applyAvatarUrl = () => {
    setFormData(prev => ({
      ...prev,
      avatar_url: tempAvatarUrl
    }));
    setShowAvatarAlert(false);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setErrorMessage('');
      await apiService.put(`${API_ENDPOINTS.USER}/${user.id}`, {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      });
      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      await refreshUser();
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
    return !url || url.startsWith('http://') || url.startsWith('https://');
  };

  const placeholders: Record<string, string> = {
    nombre: 'Introduce tu nombre',
    apellidos: 'Introduce tus apellidos',
    email: 'Introduce tu email',
    telefono: 'Introduce tu teléfono',
    bio: 'Escribe tu biografía',
  };
  

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color={'primary'}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {authLoading ? (
          <IonLoading isOpen={true} message="Cargando perfil..." />
        ) : user ? (
          <>
            <div className="encabezado-perfil">
              <div className="contenedor-avatar" onClick={
                isEditing ? handleAvatarUpdate : () => tempAvatarUrl && setShowAvatarModal(true)
              }>
                <IonAvatar className="avatar-perfil avatar-sin-borde">
                  <img src={tempAvatarUrl} alt={user.nombre} />
                </IonAvatar>
              </div>

              {isEditing && (
                <IonText className="texto-cambiar-avatar">
                  <p><small>Toca para cambiar avatar</small></p>
                </IonText>
              )}

              <h2>{user.nombre} {user.apellidos}</h2>
              <p>{user.email}</p>
            </div>




            <IonCard>
              {!isEditing && !isChangingPassword && (
                <>
                  <IonCardHeader>
                    <IonCardTitle>Información Personal</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem><IonLabel><h2>Nombre</h2><p>{user.nombre} {user.apellidos}</p></IonLabel></IonItem>
                    <IonItem><IonLabel><h2>Email</h2><p>{user.email}</p></IonLabel></IonItem>
                    <IonItem><IonLabel><h2>Teléfono</h2><p>{user.telefono || 'No disponible'}</p></IonLabel></IonItem>
                    <IonItem lines="none"><IonLabel><h2>Biografía</h2><p>{formData.bio || 'No hay información disponible'}</p></IonLabel></IonItem>
                    <IonGrid>
                      <IonRow>
                        <IonCol><IonButton expand="block" color="primary" onClick={handleEditProfile}>Editar Perfil</IonButton></IonCol>
                        <IonCol><IonButton expand="block" color="secondary" onClick={handleChangePassword}>Cambiar Contraseña</IonButton></IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </>
              )}

              {isEditing && (
                <>
                  <IonCardHeader><IonCardTitle>Editar Perfil</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <form>
                    <div className="camposFormulario">
                      {['nombre', 'apellidos', 'email', 'telefono', 'bio'].map((field, i) => (
                        <div key={i}>
                          <label className="etiqueta-campo">{field[0].toUpperCase() + field.slice(1)}</label>
                          <IonItem lines="none">
                            <IonInput value={(formData as any)[field]} placeholder={placeholders[field]}
                              onIonChange={(e) => handleInputChange(e, field)} style={{ marginTop: '-10px' }}
                              required={field !== 'telefono' && field !== 'bio'}/>
                          </IonItem>
                        </div>
                      ))}
                    </div>

                    <IonGrid>
                      <IonRow>
                        <IonCol>
                          <IonButton expand="block" color="medium" onClick={handleCancel}>
                            Cancelar
                          </IonButton>
                        </IonCol>
                        <IonCol>
                          <IonButton expand="block" color="primary" onClick={handleUpdateProfile}>
                            <IonIcon slot="start" icon={saveOutline} />
                            Guardar Cambios
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
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
                    {[
                      { label: 'Contraseña Actual', field: 'currentPassword' },
                      { label: 'Nueva Contraseña', field: 'newPassword' },
                      { label: 'Confirmar Contraseña', field: 'confirmPassword' }
                    ].map(({ label, field }, i) => (
                      <IonItem key={i}>
                        <IonLabel position="floating">{label}</IonLabel>
                        <IonInput type="password" value={(formData as any)[field]} onIonChange={(e) => handleInputChange(e, field)}
                          style={{ marginTop: '10px' }} required/>
                      </IonItem>
                    ))}
                
                    <IonGrid>
                      <IonRow>
                        <IonCol>
                          <IonButton expand="block" color="medium" onClick={handleCancel}>
                            Cancelar
                          </IonButton>
                        </IonCol>
                        <IonCol>
                          <IonButton expand="block" color="primary" onClick={handleUpdatePassword}>
                            <IonIcon slot="start" icon={saveOutline} />
                            Actualizar Contraseña
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    
                  </IonCardContent>
                </>              
              )}
            </IonCard>

            {successMessage && (
              <IonText color="success"><p>{successMessage}</p></IonText>
            )}
            {errorMessage && (
              <IonText color="danger"><p>{errorMessage}</p></IonText>
            )}

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
                { text: 'Cancelar', role: 'cancel' },
                {
                  text: 'Ver previa',
                  handler: (data) => {
                    if (validateImageUrl(data.avatar_url)) {
                      setTempAvatarUrl(data.avatar_url);
                      return false;
                    } else {
                      setErrorMessage('URL de imagen no válida');
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
                      setErrorMessage('URL de imagen no válida');
                      return false;
                    }
                  }
                }
              ]}
            />

            <IonModal isOpen={showAvatarModal} onDidDismiss={() => setShowAvatarModal(false)}>
              <IonContent fullscreen>
                <div className="ion-padding">
                  <IonButton fill="clear" onClick={() => setShowAvatarModal(false)}>
                    <IonIcon icon={closeOutline} size="large" />
                  </IonButton>
                  <img src={tempAvatarUrl} alt="avatar ampliado" />
                </div>
              </IonContent>
            </IonModal>

            <IonLoading isOpen={isLoading} message="Procesando..." />
          </>
        ) : (
          <IonText color="medium">
            <p>No se pudo cargar la información del usuario.</p>
            <IonButton onClick={() => window.location.reload()}>
              <IonIcon slot="start" icon={refreshOutline} />
              Recargar
            </IonButton>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
