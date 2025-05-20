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

  // Ocultar cualquier botón de retroceso en el encabezado
  React.useEffect(() => {
    const backButtons = document.querySelectorAll('ion-back-button');
    backButtons.forEach(btn => {
      if (btn.parentElement) {
        btn.parentElement.style.display = 'none';
      }
    });
  }, []);

  return (
    <IonHeader className="ion-no-border" style={{ '--background': 'var(--color-panel)', '--border-style': 'none', 'box-shadow': '0 2px 4px rgba(0,0,0,0.1)' }}>
      <IonToolbar style={{ '--background': 'var(--color-panel)', '--border-style': 'none', '--min-height': '60px' }}>
        {/* Ocultar cualquier botón que aparezca en el slot start */}
        <IonButtons slot="start" style={{ display: 'none' }} />
        <IonButtons slot="end">
          <IonButton
            onClick={handleProfileClick}
            fill="clear"
            aria-label="Perfil"
            className="profile-button"
            style={{
              '--background': 'transparent',
              '--color': 'var(--ion-color-primary)',
              '--padding': '0',
              '--margin': '0',
              '--ripple-color': 'transparent',
              '--width': '64px',
              '--height': '64px',
              '--min-width': '64px',
              '--min-height': '64px',
              '--border-radius': '50%',
              '--box-shadow': 'none',
              '--border': 'none',
              '--border-style': 'none',
              '--border-width': '0'
            }}
          >
            {user?.avatar_url && !imageError ? (
              <img
                src={user.avatar_url}
                alt={user.nombre || 'Usuario'}
                onError={handleImageError}
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-initial">
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
