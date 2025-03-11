// src/pages/Home.tsx
import React from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonItem, 
  IonLabel, 
  IonText,
  IonIcon,
  IonButtons,
  IonLoading
} from '@ionic/react';
import { logOutOutline, personCircleOutline, timeOutline, calendarOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import './css/Home.css';

const Home: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const goToProfile = () => {
    history.push('/profile');
  };

  const goToReservas = () => {
    history.push('/reservas');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle>Play4Padel - Inicio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={goToProfile}>
              <IonIcon slot="icon-only" icon={personCircleOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={handleLogout} className="logout-button">
              <IonIcon slot="start" icon={logOutOutline}></IonIcon>
              Cerrar Sesión
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="home-container">
        {isLoading ? (
          <IonLoading isOpen={true} message="Cargando..." />
        ) : (
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8" sizeLg="6">
                <IonCard className="welcome-card">
                  <IonCardHeader className="welcome-card-header">
                    <IonCardTitle>¡Bienvenido a Play4Padel!</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent className="welcome-card-content">
                    {user && (
                      <div className="user-info">
                        <IonItem lines="none" button onClick={goToProfile}>
                          <IonIcon icon={personCircleOutline} slot="start" size="large" color="primary"></IonIcon>
                          <IonLabel>
                            <h2>Hola, {user.nombre} {user.apellidos}</h2>
                            <IonText color="medium">
                              <p>{user.email}</p>
                            </IonText>
                          </IonLabel>
                        </IonItem>
                        
                        <p className="ion-padding-top">
                          Ya has iniciado sesión correctamente en la plataforma. Desde aquí podrás:
                        </p>
                        <ul>
                          <li>Buscar clubes de pádel</li>
                          <li>Reservar pistas</li>
                          <li>Participar en torneos</li>
                          <li>Gestionar tu perfil y preferencias</li>
                        </ul>
                      </div>
                    )}
                    
                    <IonButton expand="block" color="primary" onClick={goToReservas}>
                      <IonIcon slot="start" icon={calendarOutline}></IonIcon>
                      Reservar Pista
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;