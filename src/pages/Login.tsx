// src/pages/Login.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  IonIcon,
  useIonViewWillLeave
} from '@ionic/react';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import '../theme/variables.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLIonInputElement>(null);
  const passwordInputRef = useRef<HTMLIonInputElement>(null);
  
  const { login } = useAuth();
  const history = useHistory();
  
  useIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  useEffect(() => {
    const performLogin = async () => {
      if (!isSubmitting) return;
  
      try {
        if (!email || !password) {
          setFormError('Por favor, completa todos los campos');
          setIsSubmitting(false);
          return;
        }
  
        setShowLoading(true);
        setFormError('');
  
        await login({ email, password });
        history.replace('/home');
      } catch (error: any) {
        console.error('Error en login:', error);
        setFormError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      } finally {
        setShowLoading(false);
        setIsSubmitting(false);
      }
    };
  
    performLogin();
  }, [isSubmitting, email, password, login, history]);
  

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.currentTarget;
      if (target.name === 'email') {
        setEmail(target.value?.toString() || '');
      } else if (target.name === 'password') {
        setPassword(target.value?.toString() || '');
      }

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }, 0);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={'primary'}>
          <IonTitle>Play4Padel - Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="login-container">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">
                    <h2>Bienvenido a Play4Padel</h2>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form ref={formRef} onSubmit={handleLogin}>
                    <IonItem lines="full">
                      <IonIcon icon={mailOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput ref={emailInputRef} name="email" type="email" value={email} onIonChange={e => setEmail(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown} style={{ marginTop: '10px' }} required/>
                    </IonItem>
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Contraseña</IonLabel>
                      <IonInput ref={passwordInputRef} name="password" type="password" value={password} onIonChange={e => setPassword(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown} style={{ marginTop: '10px' }} required/>
                    </IonItem>
                    
                    {formError && (
                      <IonText color="danger">
                        <p>{formError}</p>
                      </IonText>
                    )}
                    
                    <IonButton expand="block" color="primary" type="submit" disabled={isSubmitting} style={{ marginTop: '20px' }}>Iniciar Sesión</IonButton>
                  </form>
                  
                  <div className="ion-margin-top">
                    <p>
                      ¿No tienes cuenta?{' '}
                      <IonRouterLink href="/register">
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
          message="Iniciando sesión..."
          spinner="circles"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
