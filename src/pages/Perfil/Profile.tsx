// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
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
  IonModal,
  IonPage
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
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
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../utils/constants';
import '../../theme/variables.css';
import './Profile.css';


const Profile: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
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
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Perfil</IonTitle>
          </IonToolbar>
        </IonHeader>

        {user && (
          <div className="profile-container">
            {/* Sección de avatar */}
            <div className="encabezado-perfil">
              <div className="contenedor-avatar">
                <IonAvatar className="avatar-perfil">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" />
                  ) : (
                    <IonIcon icon={personCircleOutline} style={{ fontSize: '100px' }} />
                  )}
                </IonAvatar>
              </div>
              <h2>{user.nombre} {user.apellidos}</h2>
              <p>{user.email}</p>
            </div>

            {/* Información básica */}
            <IonCard className="tarjeta-informacion">
              <IonCardHeader>
                <IonCardTitle>Información Personal</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel>Nombre</IonLabel>
                  <IonText>{user.nombre}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>Apellidos</IonLabel>
                  <IonText>{user.apellidos}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>Email</IonLabel>
                  <IonText>{user.email}</IonText>
                </IonItem>
                {user.telefono && (
                  <IonItem>
                    <IonLabel>Teléfono</IonLabel>
                    <IonText>{user.telefono}</IonText>
                  </IonItem>
                )}
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* Loading y Toast */}
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
