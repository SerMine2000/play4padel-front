// src/pages/Register.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  useIonViewWillLeave
} from '@ionic/react';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  phonePortraitOutline,
  businessOutline,
  locationOutline,
  timeOutline,
  calendarOutline,
  reader,
  readerOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { API_URL, TIPOS_CUENTA } from '../utils/constants';
import { RegisterRequest } from '../interfaces';
import './css/Register.css';

const Register: React.FC = () => {
  // Estados básicos para todos los usuarios
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Estados para el tipo de cuenta y datos del club
  const [tipoUsuario, setTipoUsuario] = useState<string>(TIPOS_CUENTA.USUARIO);
  const [nombreClub, setNombreClub] = useState('');
  const [direccionClub, setDireccionClub] = useState('');
  const [descripcionClub, setDescripcionClub] = useState('');
  const [horarioApertura, setHorarioApertura] = useState('08:00');
  const [horarioCierre, setHorarioCierre] = useState('22:00');
  
  // Estados de UI
  const [formError, setFormError] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Referencias
  const formRef = useRef<HTMLFormElement>(null);
  
  const { register } = useAuth();
  const history = useHistory();
  
  // Limpiar el foco antes de abandonar la vista
  useIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!nombre || !email || !password || !confirmPassword) {
      setFormError('Todos los campos son obligatorios');
      return;
    }
  
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }
  
    if (
      tipoUsuario === TIPOS_CUENTA.CLUB &&
      (!nombreClub || !direccionClub || !horarioApertura || !horarioCierre || !descripcionClub)
    ) {
      setFormError('Por favor, completa todos los datos del club');
      return;
    }
  
    try {
      setShowLoading(true);
      setFormError('');
  
      const registroData: RegisterRequest = {
        nombre,
        apellidos: tipoUsuario === TIPOS_CUENTA.CLUB ? "Club" : apellidos,
        email,
        password,
        id_rol: tipoUsuario === TIPOS_CUENTA.CLUB ? 1 : 4,
        telefono
      };
  
      if (tipoUsuario === TIPOS_CUENTA.CLUB) {
        registroData.club_data = {
          nombre: nombreClub,
          direccion: direccionClub,
          horario_apertura: horarioApertura,
          horario_cierre: horarioCierre,
          descripcion: descripcionClub,
          telefono,
          email
        };
      }
  
      await register({ ...registroData, tipo_cuenta: tipoUsuario });
  
      setShowToast(true);
  
      // Limpiar campos
      setNombre('');
      setApellidos('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTelefono('');
      setNombreClub('');
      setDireccionClub('');
      setDescripcionClub('');
      setHorarioApertura('08:00');
      setHorarioCierre('22:00');
  
      setTimeout(() => {
        history.replace('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error en registro:', error);
      setFormError(error.message || 'Error al registrar usuario. Inténtalo de nuevo.');
    } finally {
      setShowLoading(false);
    }
  };
  
  
  // Manejador para la tecla Enter en los inputs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
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
                  
                  <form ref={formRef} className="register-form" onSubmit={handleRegister}>
                    {/* Selector de tipo de cuenta */}
                    <IonItem lines="full">
                      <IonIcon icon={businessOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Tipo de cuenta *</IonLabel>
                      <IonSelect 
                        value={tipoUsuario} 
                        onIonChange={e => setTipoUsuario(e.detail.value)}
                        placeholder="Seleccione tipo de cuenta"
                      >
                        <IonSelectOption value={TIPOS_CUENTA.USUARIO}>Usuario</IonSelectOption>
                        <IonSelectOption value={TIPOS_CUENTA.CLUB}>Club</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    
                    {/* Campos comunes para ambos tipos de cuenta */}
                    <IonItem lines="full">
                      <IonIcon icon={personOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">
                        {tipoUsuario === TIPOS_CUENTA.CLUB ? 'Nombre de usuario de club *' : 'Nombre *'}
                      </IonLabel>
                      <IonInput 
                        name="nombre"
                        value={nombre} 
                        onIonChange={e => setNombre(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </IonItem>
                    
                    {/* Solo mostrar campo de apellidos para usuarios normales */}
                    {tipoUsuario !== TIPOS_CUENTA.CLUB && (
                      <IonItem lines="full">
                        <IonIcon icon={personOutline} slot="start" color="medium"></IonIcon>
                        <IonLabel position="floating">Apellidos *</IonLabel>
                        <IonInput 
                          name="apellidos"
                          value={apellidos} 
                          onIonChange={e => setApellidos(e.detail.value?.toString() || '')} 
                          onKeyDown={handleKeyDown}
                          required
                        />
                      </IonItem>
                    )}
                    
                    <IonItem lines="full">
                      <IonIcon icon={mailOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">
                        {tipoUsuario === TIPOS_CUENTA.CLUB ? 'Correo del club *' : 'Email *'}
                      </IonLabel>
                      <IonInput 
                        name="email"
                        type="email" 
                        value={email} 
                        onIonChange={e => setEmail(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={phonePortraitOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">
                        {tipoUsuario === TIPOS_CUENTA.CLUB ? 'Teléfono de Contacto' : 'Teléfono'}
                      </IonLabel>
                      <IonInput 
                        name="telefono"
                        type="tel" 
                        value={telefono} 
                        onIonChange={e => setTelefono(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Contraseña *</IonLabel>
                      <IonInput 
                        name="password"
                        type="password" 
                        value={password} 
                        onIonChange={e => setPassword(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </IonItem>
                    
                    <IonItem lines="full">
                      <IonIcon icon={lockClosedOutline} slot="start" color="medium"></IonIcon>
                      <IonLabel position="floating">Confirmar Contraseña *</IonLabel>
                      <IonInput 
                        name="confirmPassword"
                        type="password" 
                        value={confirmPassword} 
                        onIonChange={e => setConfirmPassword(e.detail.value?.toString() || '')} 
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </IonItem>
                    
                    {/* Campos específicos para club */}
                    {tipoUsuario === TIPOS_CUENTA.CLUB && (
                      <>
                        <div className="club-section">
                          <h4 className="section-title">Información del Club</h4>
                          
                          <IonItem lines="full">
                            <IonIcon icon={businessOutline} slot="start" color="medium"></IonIcon>
                            <IonLabel position="floating">Nombre del Club *</IonLabel>
                            <IonInput 
                              name="nombreClub"
                              value={nombreClub} 
                              onIonChange={e => setNombreClub(e.detail.value?.toString() || '')} 
                              onKeyDown={handleKeyDown}
                              required
                            />
                          </IonItem>
                          
                          <IonItem lines="full">
                            <IonIcon icon={locationOutline} slot="start" color="medium"></IonIcon>
                            <IonLabel position="floating">Dirección *</IonLabel>
                            <IonInput 
                              name="direccionClub"
                              value={direccionClub} 
                              onIonChange={e => setDireccionClub(e.detail.value?.toString() || '')} 
                              onKeyDown={handleKeyDown}
                              required
                            />
                          </IonItem>
                          
                          <IonItem lines="full">
                            <IonIcon icon={readerOutline} slot="start" color="medium"></IonIcon>
                            <IonLabel position="floating">Descripción</IonLabel>
                            <IonTextarea
                              name="descripcionClub"
                              value={descripcionClub}
                              onIonChange={e => setDescripcionClub(e.detail.value?.toString() || '')}
                              onKeyDown={handleTextareaKeyDown}
                              autoGrow={true}
                              rows={3}
                            />
                          </IonItem>
                          
                          <IonItem lines="full">
                            <IonIcon icon={timeOutline} slot="start" color="medium"></IonIcon>
                            <IonLabel position="floating">Horario Apertura *</IonLabel>
                            <IonInput 
                              name="horarioApertura"
                              type="time" 
                              value={horarioApertura} 
                              onIonChange={e => setHorarioApertura(e.detail.value?.toString() || '')} 
                              onKeyDown={handleKeyDown}
                              required
                            />
                          </IonItem>
                          
                          <IonItem lines="full">
                            <IonIcon icon={timeOutline} slot="start" color="medium"></IonIcon>
                            <IonLabel position="floating">Horario Cierre *</IonLabel>
                            <IonInput 
                              name="horarioCierre"
                              type="time" 
                              value={horarioCierre} 
                              onIonChange={e => setHorarioCierre(e.detail.value?.toString() || '')} 
                              onKeyDown={handleKeyDown}
                              required
                            />
                          </IonItem>
                        </div>
                      </>
                    )}
                    
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
                      disabled={isSubmitting}
                    >
                      {tipoUsuario === TIPOS_CUENTA.CLUB ? 'Registrar Club' : 'Crear Cuenta'}
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
          message={tipoUsuario === TIPOS_CUENTA.CLUB ? 'Registrando club...' : 'Registrando usuario...'}
          spinner="circles"
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={tipoUsuario === TIPOS_CUENTA.CLUB 
            ? "Club registrado correctamente. Redirigiendo al login..." 
            : "Usuario registrado correctamente. Redirigiendo al login..."}
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;