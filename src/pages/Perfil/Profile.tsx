// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput,
  IonButton, IonBackButton, IonButtons, IonLoading, IonToast, IonIcon, IonAvatar, IonText, IonGrid, IonRow, IonCol, IonAlert, IonModal,
  IonPage} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { personOutline, personCircleOutline, saveOutline, refreshOutline, mailOutline, callOutline, keyOutline, imageOutline, 
  closeOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../utils/constants';
import '../../theme/variables.css';
import './Profile.css';


const Profile: React.FC = () => {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const history = useHistory();
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
  
      // Verificar datos antes de enviar
      const payload = {
        nombre: formData.nombre || user.nombre,
        apellidos: formData.apellidos || user.apellidos,
        email: formData.email || user.email,
        telefono: formData.telefono !== 'No especificado' ? formData.telefono : user.telefono,
        bio: formData.bio !== 'No especificado' ? formData.bio : user.bio,
        avatar_url: cleanImageUrl((formData.avatar_url || user.avatar_url) ?? '')
      };
  
      console.log("Payload preparado para enviar:", payload);
  
      await apiService.put(`${API_ENDPOINTS.USER}/${user.id}`, payload);
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
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const cleanImageUrl = (url: string) => {
    const match = url.match(/[?&]u=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : url;
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
      <IonContent style={{ paddingLeft: 260, boxSizing: 'border-box' }}>
        {user && (
          <div className="profile-container" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="encabezado-perfil">
              <div className="contenedor-avatar">
              <IonAvatar
                className="avatar-perfil"
                onClick={isEditing ? handleAvatarUpdate : () => tempAvatarUrl && setShowAvatarModal(true)}>
                {tempAvatarUrl ? (
                  <img src={tempAvatarUrl} alt="Avatar" />
                ) : (
                  <IonIcon icon={personCircleOutline} style={{ fontSize: '100px' }} />
                )}

              </IonAvatar>
              {isEditing && (
                <IonText color="medium" className="edit-avatar-text">
                  <small>Haz clic para cambiar avatar</small>
                </IonText>
              )}
              </div>
              <h2>{user.nombre} {user.apellidos}</h2>
              <p>{user.email}</p>
            </div>
  
            <IonCard className="tarjeta-informacion">
              <IonCardHeader>
                <IonCardTitle>Información Personal</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {['nombre', 'apellidos', 'email', 'telefono', 'bio'].map((campo) => (
                  <IonItem key={campo}>
                    <IonLabel position="stacked">{campo.charAt(0).toUpperCase() + campo.slice(1)}</IonLabel>
                    {isEditing ? (
                      <IonInput
                        value={formData[campo as keyof typeof formData]}
                        onIonChange={(e) => handleInputChange(e, campo)}
                      />
                    ) : (
                      <IonText>{user[campo as keyof typeof user] || 'No especificado'}</IonText>
                    )}
                  </IonItem>
                ))}
              </IonCardContent>
            </IonCard>
  
            {!isEditing ? (
              <IonGrid className="botones-acciones">
                <IonRow>
                  <IonCol>
                    <IonButton expand="block" onClick={handleEditProfile} color="primary">
                      Editar perfil
                    </IonButton>
                  </IonCol>
                  <IonCol>
                    <IonButton expand="block" onClick={handleChangePassword} color="medium">
                      Cambiar contraseña
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            ) : (
              <IonGrid className="botones-acciones">
                <IonRow>
                  <IonCol>
                    <IonButton expand="block" onClick={handleUpdateProfile} color="success">
                      Guardar cambios
                    </IonButton>
                  </IonCol>
                  <IonCol>
                    <IonButton expand="block" onClick={handleCancel} color="danger" fill="outline">
                      Cancelar
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}


  
            {isChangingPassword && (
              <IonCard className="tarjeta-informacion">
                <IonCardHeader>
                  <IonCardTitle>Cambiar contraseña</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Contraseña actual</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.currentPassword}
                      onIonChange={(e) => handleInputChange(e, 'currentPassword')}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Nueva contraseña</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.newPassword}
                      onIonChange={(e) => handleInputChange(e, 'newPassword')}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Confirmar contraseña</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.confirmPassword}
                      onIonChange={(e) => handleInputChange(e, 'confirmPassword')}
                    />
                  </IonItem>
                  <IonButton expand="block" onClick={handleUpdatePassword}>
                    Guardar nueva contraseña
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}
          </div>
        )}

        <IonAlert isOpen={showAvatarAlert} onDidDismiss={() => setShowAvatarAlert(false)}
          header="Cambiar avatar" subHeader="Introduce la URL de la imagen" 
          inputs={[
            {
              name: 'avatar_url',
              type: 'url',
              placeholder: 'https://ejemplo.com/avatar.jpg',
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
                  return false;
                } else {
                  setErrorMessage('URL no válida (debe empezar por http:// o https://)');
                  return false;
                }
              }
            },
            {
              text: 'Guardar',
              handler: (data) => {
                if (!validateImageUrl(data.avatar_url)) {
                  setErrorMessage('URL no válida (debe empezar por http:// o https://)');
                  return false;
                }
                setTempAvatarUrl(data.avatar_url);
                applyAvatarUrl();
                return true;
              }
            }
          ]}
        />

        <IonModal isOpen={showAvatarModal} onDidDismiss={() => setShowAvatarModal(false)}>
          <IonContent fullscreen className="ion-padding">
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
              <IonButton fill="clear" onClick={() => setShowAvatarModal(false)}>
                <IonIcon icon={closeOutline} size="large" color="light" />
              </IonButton>
            </div>
            <div style={{
              height: '100%',
              backgroundColor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={tempAvatarUrl}
                alt="Avatar ampliado"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                }}
              />
            </div>
          </IonContent>
        </IonModal>

  
        <IonLoading isOpen={isLoading} message="Cargando..." />
        <IonToast
          isOpen={!!successMessage}
          onDidDismiss={() => setSuccessMessage('')}
          message={successMessage}
          duration={3000}
          color="success"
        />
        <IonToast
          isOpen={!!errorMessage}
          onDidDismiss={() => setErrorMessage('')}
          message={errorMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );  
};

export default Profile;