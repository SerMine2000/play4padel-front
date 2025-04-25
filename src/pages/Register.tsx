// src/pages/Register.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonItem, IonLabel, IonButton, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonText, IonLoading, IonRouterLink, IonGrid, IonRow, IonCol, IonToast, IonBackButton, IonButtons, IonIcon, IonSelect,
  IonSelectOption, IonTextarea, useIonViewWillLeave} from '@ionic/react';

import {personOutline, mailOutline, lockClosedOutline, phonePortraitOutline, businessOutline, locationOutline, timeOutline, 
  readerOutline, moonOutline, sunnyOutline} from 'ionicons/icons';

import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { API_URL, TIPOS_CUENTA } from '../utils/constants';
import { RegisterRequest } from '../interfaces';
import '../theme/variables.css';
import './css/Register.css';

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<string>(TIPOS_CUENTA.USUARIO);

  const [nombreClub, setNombreClub] = useState('');
  const [direccionClub, setDireccionClub] = useState('');
  const [descripcionClub, setDescripcionClub] = useState('');
  const [horarioApertura, setHorarioApertura] = useState('08:00');
  const [horarioCierre, setHorarioCierre] = useState('22:00');

  const [formError, setFormError] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const formRef = useRef<HTMLFormElement>(null);
  const { register } = useAuth();
  const history = useHistory();
  
  
  const [modoOscuro, setModoOscuro] = useState<boolean>(
    document.documentElement.classList.contains('ion-palette-dark')
  );

  const { theme } = useTheme();

  const toggleModo = () => {
    const root = document.documentElement;
    root.classList.toggle('ion-palette-dark');
    setModoOscuro(root.classList.contains('ion-palette-dark'));
  };

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
        apellidos: tipoUsuario === TIPOS_CUENTA.CLUB ? 'Club' : apellidos,
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

      // Reset campos
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


  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('ion-palette-dark');
      html.classList.remove('ion-palette-light');
    } else {
      html.classList.add('ion-palette-light');
      html.classList.remove('ion-palette-dark');
    }
  }, [theme]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={'primary'}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
            <IonButton onClick={toggleModo}>
              <IonIcon slot="icon-only" icon={modoOscuro ? sunnyOutline : moonOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle color="primary">Crear cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="contenedor-registro">
        <IonGrid>
          <IonRow className="fila-centro-horizontal">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard className="tarjeta-registro">
                <IonCardHeader className="cabecera-tarjeta-registro">
                  <IonCardTitle><h2>Únete a Play4Padel</h2></IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form ref={formRef} onSubmit={handleRegister} className="formulario-registro">

                  <IonItem lines="none">
                    <IonLabel>Tipo de cuenta *</IonLabel>
                  </IonItem>

                  <div className="botones-toggle-cuenta">
                    <IonButton fill={tipoUsuario === TIPOS_CUENTA.USUARIO ? 'solid' : 'outline'}
                      color="primary" onClick={() => setTipoUsuario(TIPOS_CUENTA.USUARIO)}>
                      Usuario
                    </IonButton>
                    <IonButton fill={tipoUsuario === TIPOS_CUENTA.CLUB ? 'solid' : 'outline'}
                      color="primary" onClick={() => setTipoUsuario(TIPOS_CUENTA.CLUB)}>
                      Club
                    </IonButton>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'var(--ion-text-color)', opacity: 0.1, margin: '10px 12px', marginBottom: '60px'}}/>

                    <IonItem lines="full">
                      <IonIcon className="posicionIcono" icon={personOutline} slot="start" color="medium" />
                      <IonLabel position="floating">
                        {tipoUsuario === TIPOS_CUENTA.CLUB ? 'Nombre de usuario de club *' : 'Nombre *'}
                      </IonLabel>
                      <IonInput value={nombre} onIonChange={e => setNombre(e.detail.value?.toString() || '')} required/>
                    </IonItem>

                    {tipoUsuario !== TIPOS_CUENTA.CLUB && (
                      <IonItem lines="full">
                        <IonIcon className="posicionIcono" icon={personOutline} slot="start" color="medium" />
                        <IonLabel position="floating">Apellidos *</IonLabel>
                        <IonInput value={apellidos} onIonChange={e => setApellidos(e.detail.value?.toString() || '')} required/>
                      </IonItem>
                    )}

                    <IonItem lines="full">
                      <IonIcon className="posicionIcono" icon={mailOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Email *</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onIonChange={e => setEmail(e.detail.value?.toString() || '')}
                        required
                      />
                    </IonItem>

                    <IonItem lines="full">
                      <IonIcon className="posicionIcono" icon={phonePortraitOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Teléfono</IonLabel>
                      <IonInput
                        type="tel"
                        value={telefono}
                        onIonChange={e => setTelefono(e.detail.value?.toString() || '')}
                      />
                    </IonItem>

                    <IonItem lines="full">
                      <IonIcon className="posicionIcono" icon={lockClosedOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Contraseña *</IonLabel>
                      <IonInput
                        type="password"
                        value={password}
                        onIonChange={e => setPassword(e.detail.value?.toString() || '')}
                        required
                      />
                    </IonItem>

                    <IonItem lines="full">
                      <IonIcon className="posicionIcono" icon={lockClosedOutline} slot="start" color="medium" />
                      <IonLabel position="floating">Confirmar Contraseña *</IonLabel>
                      <IonInput
                        type="password"
                        value={confirmPassword}
                        onIonChange={e => setConfirmPassword(e.detail.value?.toString() || '')}
                        required
                      />
                    </IonItem>

                    {tipoUsuario === TIPOS_CUENTA.CLUB && (
                      <>
                        <IonItem lines="full">
                          <IonIcon className="posicionIcono" icon={businessOutline} slot="start" color="medium" />
                          <IonLabel position="floating">Nombre del Club *</IonLabel>
                          <IonInput
                            value={nombreClub}
                            onIonChange={e => setNombreClub(e.detail.value?.toString() || '')}
                            required
                          />
                        </IonItem>

                        <IonItem lines="full">
                          <IonIcon className="posicionIcono" icon={locationOutline} slot="start" color="medium" />
                          <IonLabel position="floating">Dirección *</IonLabel>
                          <IonInput
                            value={direccionClub}
                            onIonChange={e => setDireccionClub(e.detail.value?.toString() || '')}
                            required
                          />
                        </IonItem>

                        <IonItem lines="full">
                          <IonIcon className="posicionIcono" icon={readerOutline} slot="start" color="medium" />
                          <IonLabel position="floating">Descripción</IonLabel>
                          <IonTextarea
                            value={descripcionClub}
                            onIonChange={e => setDescripcionClub(e.detail.value?.toString() || '')}
                            autoGrow={true}
                            rows={3}
                          />
                        </IonItem>

                        <IonItem lines="full">
                          <IonIcon className="posicionIcono" icon={timeOutline} slot="start" color="medium" />
                          <IonLabel position="floating">Horario Apertura *</IonLabel>
                          <IonInput
                            type="time"
                            value={horarioApertura}
                            onIonChange={e => setHorarioApertura(e.detail.value?.toString() || '')}
                            required
                          />
                        </IonItem>

                        <IonItem lines="full">
                          <IonIcon className="posicionIcono" icon={timeOutline} slot="start" color="medium" />
                          <IonLabel position="floating">Horario Cierre *</IonLabel>
                          <IonInput
                            type="time"
                            value={horarioCierre}
                            onIonChange={e => setHorarioCierre(e.detail.value?.toString() || '')}
                            required
                          />
                        </IonItem>
                      </>
                    )}

                    {formError && (
                      <IonText color="danger"><p>{formError}</p></IonText>
                    )}

                    <IonButton expand="block" type="submit" color="primary" className="boton-registro" disabled={isSubmitting}>
                      {tipoUsuario === TIPOS_CUENTA.CLUB ? 'Registrar Club' : 'Crear Cuenta'}
                    </IonButton>
                  </form>

                  <div className="pie-registro">
                    <p>¿Ya tienes cuenta? <IonRouterLink href="/login">Inicia sesión</IonRouterLink></p>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={showLoading} message="Registrando..." spinner="circles" />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={
            tipoUsuario === TIPOS_CUENTA.CLUB
              ? 'Club registrado correctamente. Redirigiendo al login...'
              : 'Usuario registrado correctamente. Redirigiendo al login...'
          }
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;