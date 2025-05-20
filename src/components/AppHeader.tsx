import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppHeader.css';

// Colores del logo Play4Padel
const primaryPurple = '#2D0A31'; // Púrpura oscuro del fondo del logo
const brightGreen = '#00FF66'; // Verde brillante de la "P" en el logo
const pureWhite = '#FFFFFF'; // Blanco del "4" en el logo

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
    <IonHeader className="ion-no-border app-header">
      <IonToolbar style={{backgroundColor: primaryPurple}}>
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
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: `2px solid ${brightGreen}`
                }}
              />
            ) : (
              <div className="profile-avatar-initial" style={{
                backgroundColor: brightGreen,
                color: primaryPurple,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {getInitial()}
              </div>
            )}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;