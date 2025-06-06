import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import ToggleTheme from '../pages/ToggleTheme';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <IonHeader className="ion-no-border app-header">
      <IonToolbar>
        <IonButtons slot="start">
          <ToggleTheme />
        </IonButtons>
        
        <IonButtons slot="end">
          <IonButton
            fill="clear"
            aria-label="Perfil"
            className="profile-button"
          >
            <Avatar
              idUsuario={user?.id || 0}
              nombre={user?.nombre}
              urlAvatar={user?.avatar_url}
              tamaño={42}
              className="avatar-header"
              onClick={handleProfileClick}
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;