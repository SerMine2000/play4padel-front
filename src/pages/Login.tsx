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
import './css/Login.css';

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
  
  // Limpiar el foco antes de abandonar la vista
  useIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  // Efecto para manejar el envío del formulario después de que los estados se actualicen
  useEffect(() => {
    const performLogin = async () => {
      if (!isSubmitting) return;
      
      try {
        // Los estados de email y password ya deberían estar actualizados
        // Validación básica
        if (!email || !password) {
          setFormError('Por favor, completa todos los campos');
          setIsSubmitting(false);
          return;
        }
        
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
        setIsSubmitting(false);
      }
    };
    
    performLogin();
  }, [isSubmitting, email, password, login, history]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // En lugar de ejecutar la lógica aquí, sólo marcamos que estamos enviando
    // y dejamos que el useEffect se encargue de la lógica
    setIsSubmitting(true);
    
    // Eliminar el foco de cualquier elemento activo
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  
  // Manejador para teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Forzar la actualización del estado antes de enviar el formulario
      const target = e.currentTarget;
      if (target.name === 'email') {
        setEmail(target.value?.toString() || '');
      } else if (target.name === 'password') {
        setPassword(target.value?.toString() || '');
      }
      
      // Usar setTimeout para asegurar que los estados se actualizan antes de enviar
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
                  <form ref={formRef} className="login-form" onSubmit={handleLogin}>
                    <IonItem lines="full">
                      <IonIcon icon={mailOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput 
                        ref={emailInputRef}
                        name="email"
                        type="email" 
                        value={email} 
                        onIonChange={e => setEmail(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </IonItem>
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Contraseña</IonLabel>
                      <IonInput 
                        ref={passwordInputRef}
                        name="password"
                        type="password" 
                        value={password} 
                        onIonChange={e => setPassword(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
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
                      disabled={isSubmitting}
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