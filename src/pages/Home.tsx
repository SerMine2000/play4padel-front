// src/pages/Home.tsx
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
  IonIcon
} from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory, RouteComponentProps } from 'react-router';
import './css/Home.css';

// Especificar que el componente acepta RouteComponentProps
const Home: React.FC<RouteComponentProps> = (props) => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle>Play4Padel - Inicio</IonTitle>
          <IonButton slot="end" onClick={handleLogout} className="logout-button">
            <IonIcon slot="start" icon={logOutOutline}></IonIcon>
            Cerrar Sesión
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="home-container">
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
                      <IonItem lines="none">
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
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;