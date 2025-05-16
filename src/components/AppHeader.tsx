import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonAvatar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [imageError, setImageError] = useState(false);

  const getInitial = () => {
    if (!user || !user.nombre) return 'U';
    return user.nombre.charAt(0).toUpperCase();
  };

  const handleProfileClick = () => {
    history.replace('/profile');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <IonHeader className="app-header">
      <IonToolbar>
        <IonButtons slot="end">
          <IonButton 
            onClick={handleProfileClick}
            className="profile-button"
            fill="clear"
            aria-label="Perfil"
          >
            <IonAvatar className="profile-avatar">
              {user?.avatar_url && !imageError ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.nombre || 'Usuario'}
                  onError={handleImageError}
                  className="profile-avatar-img"
                />
              ) : (
                <span className="avatar-initial">{getInitial()}</span>
              )}
            </IonAvatar>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
