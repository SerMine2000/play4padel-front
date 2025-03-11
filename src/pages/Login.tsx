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
  IonCol
} from '@ionic/react';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';

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
      
      // Redirigir al home
      history.push('/home');
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
        <IonToolbar>
          <IonTitle>Play4Padel - Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">Bienvenido a Play4Padel</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleLogin}>
                    <IonItem>
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput 
                        type="email" 
                        value={email} 
                        onIonChange={e => setEmail(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    <IonItem className="ion-margin-bottom">
                      <IonLabel position="floating">Contraseña</IonLabel>
                      <IonInput 
                        type="password" 
                        value={password} 
                        onIonChange={e => setPassword(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    {formError && (
                      <IonText color="danger" className="ion-padding-start">
                        <p>{formError}</p>
                      </IonText>
                    )}
                    
                    <IonButton 
                      expand="block" 
                      type="submit" 
                      className="ion-margin-top"
                    >
                      Iniciar Sesión
                    </IonButton>
                  </form>
                  
                  <div className="ion-text-center ion-margin-top">
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
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;