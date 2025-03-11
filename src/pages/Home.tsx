// src/pages/Home.tsx
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonText } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { useHistory, RouteComponentProps } from 'react-router';
import './Home.css';

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
        <IonToolbar>
          <IonTitle>Play4Padel - Inicio</IonTitle>
          <IonButton slot="end" onClick={handleLogout} fill="clear">
            Cerrar Sesión
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid className="ion-padding">
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>¡Bienvenido a Play4Padel!</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {user && (
                    <div>
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Hola, {user.nombre} {user.apellidos}</h2>
                          <IonText color="medium">
                            <p>{user.email}</p>
                          </IonText>
                        </IonLabel>
                      </IonItem>
                      
                      <p className="ion-padding-top">
                        Ya has iniciado sesión correctamente en la plataforma.
                      </p>
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