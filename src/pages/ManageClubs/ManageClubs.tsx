import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import {
  businessOutline,
  addOutline,
  settingsOutline,
  documentTextOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ManageClubs.css';

const ManageClubs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return <div>Cargando...</div>;
  }

  switch(user.role.toUpperCase()) {
    case 'ADMIN':
      return (
        <div className="manage-clubs-container">
          <div className="manage-clubs-header">
            <h2>Gestión de Clubes - Administrador</h2>
            <p>Panel de administración de clubes del sistema</p>
          </div>
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Opciones de Administración</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem button onClick={() => navigate('/admin/solicitudes-club')}>
                  <IonIcon icon={documentTextOutline} slot="start" />
                  <IonLabel>
                    <h3>Solicitudes de Club</h3>
                    <p>Revisar y gestionar solicitudes para crear nuevos clubes</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem button disabled>
                  <IonIcon icon={settingsOutline} slot="start" />
                  <IonLabel>
                    <h3>Configuración de Clubes</h3>
                    <p>Gestionar configuración general de clubes (próximamente)</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>
      );
      
    case 'CLUB':
      return (
        <div className="manage-clubs-container">
          <div className="manage-clubs-header">
            <h2>Mi Club</h2>
            <p>Gestiona tu club de pádel</p>
          </div>
          
          <IonCard>
            <IonCardContent>
              <IonText>
                <p>Como administrador de club, puedes gestionar las pistas, reservas y configuración de tu club.</p>
                <p>Funcionalidad disponible próximamente.</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
      );
      
    case 'PROFESOR':
    case 'EMPLEADO':
    case 'USUARIO':
    case 'SOCIO':
    default:
      return (
        <div className="manage-clubs-container">
          <div className="manage-clubs-header">
            <h2>Solicitar Club</h2>
            <p>¿Quieres convertirte en administrador de un club de pádel?</p>
          </div>
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={businessOutline} style={{ marginRight: '0.5rem' }} />
                Crear tu Club
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>Si tienes un club de pádel o quieres crear uno, puedes solicitar convertirte en administrador de club en nuestra plataforma.</p>
                
                <h4>Beneficios de ser administrador de club:</h4>
                <ul>
                  <li>Gestiona las pistas de tu club</li>
                  <li>Controla las reservas y horarios</li>
                  <li>Organiza torneos y eventos</li>
                  <li>Administra socios y usuarios</li>
                  <li>Accede a estadísticas y reportes</li>
                </ul>
              </IonText>
              
              <IonButton 
                expand="block" 
                onClick={() => navigate('/solicitar-club')}
                style={{ marginTop: '1rem' }}
              >
                <IonIcon icon={addOutline} slot="start" />
                Solicitar Crear Club
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      );
  }
};

export default ManageClubs;