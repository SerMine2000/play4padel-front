import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
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
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="end">
          <IonButton
            onClick={handleProfileClick}
            fill="clear"
            aria-label="Perfil"
            className="profile-button"
          >
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
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
