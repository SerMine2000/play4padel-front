import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();

  const handleProfileClick = () => {
    history.push('/profile');
  };

  return (
    <IonHeader className="main-header">
      <IonToolbar color="primary">
        <IonTitle>Play4Padel</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={handleProfileClick}>
            <IonAvatar className="header-avatar">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User Avatar" />
              ) : (
                <div className="avatar-placeholder">{user?.nombre?.charAt(0) || 'U'}</div>
              )}
            </IonAvatar>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
