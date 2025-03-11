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
  IonToast
} from '@ionic/react';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/constants';

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
        <IonToolbar>
          <IonTitle>Play4Padel - Registro</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">Crear una nueva cuenta</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleRegister}>
                    <IonItem>
                      <IonLabel position="floating">Nombre *</IonLabel>
                      <IonInput 
                        value={nombre} 
                        onIonChange={e => setNombre(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="floating">Apellidos *</IonLabel>
                      <IonInput 
                        value={apellidos} 
                        onIonChange={e => setApellidos(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="floating">Email *</IonLabel>
                      <IonInput 
                        type="email" 
                        value={email} 
                        onIonChange={e => setEmail(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="floating">Teléfono</IonLabel>
                      <IonInput 
                        type="tel" 
                        value={telefono} 
                        onIonChange={e => setTelefono(e.detail.value!)} 
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="floating">Contraseña *</IonLabel>
                      <IonInput 
                        type="password" 
                        value={password} 
                        onIonChange={e => setPassword(e.detail.value!)} 
                        required
                      />
                    </IonItem>
                    
                    <IonItem className="ion-margin-bottom">
                      <IonLabel position="floating">Confirmar Contraseña *</IonLabel>
                      <IonInput 
                        type="password" 
                        value={confirmPassword} 
                        onIonChange={e => setConfirmPassword(e.detail.value!)} 
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
                      Registrarse
                    </IonButton>
                  </form>
                  
                  <div className="ion-text-center ion-margin-top">
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