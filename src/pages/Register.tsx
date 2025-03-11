// src/pages/Register.tsx
import React, { useState, useEffect } from 'react';
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
  IonToast,
  IonBackButton,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { personOutline, mailOutline, lockClosedOutline, phonePortraitOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/constants';
import './css/Register.css';

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  
  const [formError, setFormError] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const { register } = useAuth();
  const history = useHistory();

  // Llamada a inicializar la base de datos (opcional)
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await fetch(`${API_URL}/initialize-database`);
        console.log("Base de datos inicializada correctamente");
      } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
      }
    };
    
    initDatabase();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!nombre || !apellidos || !email || !password || !confirmPassword) {
      setFormError('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setShowLoading(true);
      setFormError('');
      
      // Llamar a la función register del contexto con rol de USUARIO (id=4) predeterminado
      await register({
        nombre,
        apellidos,
        email,
        password,
        id_rol: 4, // ID para USUARIO
        telefono
      });
      
      // Mostrar toast de éxito
      setShowToast(true);
      
      // Limpiar formulario
      setNombre('');
      setApellidos('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTelefono('');
      
      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        history.push('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      setFormError(error.message || 'Error al registrar usuario. Inténtalo de nuevo.');
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Crear cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="register-container">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard className="register-card">
                <IonCardHeader className="register-card-header">
                  <IonCardTitle className="ion-text-center">
                    <h2>Únete a Play4Padel</h2>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="register-card-content">
                  <div className="required-info">
                    * Campos obligatorios
                  </div>
                  
                  <form className="register-form" onSubmit={handleRegister}>
                    <IonItem lines="full">
                      <IonIcon icon={personOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Nombre *</IonLabel>
                      <IonInput 
                        value={nombre} 
                        onIonChange={e => setNombre(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={personOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Apellidos *</IonLabel>
                      <IonInput 
                        value={apellidos} 
                        onIonChange={e => setApellidos(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={mailOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Email *</IonLabel>
                      <IonInput 
                        type="email" 
                        value={email} 
                        onIonChange={e => setEmail(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={phonePortraitOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Teléfono</IonLabel>
                      <IonInput 
                        type="tel" 
                        value={telefono} 
                        onIonChange={e => setTelefono(e.detail.value!)} 
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Contraseña *</IonLabel>
                      <IonInput 
                        type="password" 
                        value={password} 
                        onIonChange={e => setPassword(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Confirmar Contraseña *</IonLabel>
                      <IonInput 
                        type="password" 
                        value={confirmPassword} 
                        onIonChange={e => setConfirmPassword(e.detail.value!)} 
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
                      className="register-button"
                    >
                      Crear cuenta
                    </IonButton>
                  </form>
                  
                  <div className="register-footer">
                    <p>
                      ¿Ya tienes cuenta? 
                      <IonRouterLink href="/login" className="ion-padding-start">
                        Inicia sesión
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
          message={'Registrando usuario...'}
          spinner="circles"
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Usuario registrado correctamente. Redirigiendo al login..."
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;