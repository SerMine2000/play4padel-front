// src/pages/Login.tsx
import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonLoading,
  IonRouterLink,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
} from '@ionic/react';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import './css/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  
  const { login } = useAuth();
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }
    
    try {
      setShowLoading(true);
      setFormError('');
      
      // Llamar a la función login del contexto
      await login({ email, password });
      
      // Redirigir al home - usar replace en lugar de push para evitar la duplicación
      history.replace('/home');
    } catch (error: any) {
      console.error('Error en login:', error);
      setFormError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Play4Padel - Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="login-container">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard className="login-card">
                <IonCardHeader className="login-card-header">
                  <IonCardTitle className="ion-text-center">
                    <h2>Bienvenido a Play4Padel</h2>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="login-card-content">
                  <form className="login-form" onSubmit={handleLogin}>
                    <IonItem lines="full">
                      <IonIcon icon={mailOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput 
                        type="email" 
                        value={email} 
                        onIonChange={e => setEmail(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Contraseña</IonLabel>
                      <IonInput 
                        type="password" 
                        value={password} 
                        onIonChange={e => setPassword(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    {formError && (
                      <div className="error-message">
                        <IonText color="danger">
                          <p>{formError}</p>
                        </IonText>
                      </div>
                    )}
                    
                    <IonButton 
                      expand="block" 
                      type="submit" 
                      className="login-button"
                    >
                      Iniciar Sesión
                    </IonButton>
                  </form>
                  
                  <div className="login-footer">
                    <p>
                      ¿No tienes cuenta? 
                      <IonRouterLink href="/register" className="ion-padding-start">
                        Regístrate
                      </IonRouterLink>
                    </p>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        
        <IonLoading
          isOpen={showLoading}
          message={'Iniciando sesión...'}
          spinner="circles"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;