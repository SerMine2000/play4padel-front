import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import './AppHeader.css';

// Colores del logo Play4Padel para el borde del avatar
const brightGreen = '#00FF66'; // Verde brillante de la "P" en el logo

const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <IonHeader className="ion-no-border app-header">
      <IonToolbar style={{backgroundColor: '#2D0A31'}}>
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