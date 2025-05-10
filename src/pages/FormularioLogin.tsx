import React, { useState } from 'react';
import { IonInput, IonItem, IonLabel, IonButton, IonText, IonLoading, IonRouterLink } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router';
import './css/Login.css';

const FormularioLogin: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }

    try {
      await login({ email, password });
      history.replace('/home');
    } catch (error) {
      console.error('Error en el login:', error);
      setFormError('Credenciales incorrectas');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <form onSubmit={(e) => handleLogin(e)} onKeyDown={handleKeyDown} className="formulario-login">
      <IonItem lines="full">
        <IonLabel position="floating">Email</IonLabel>
        <IonInput type="email" value={email} onIonChange={(e) => setEmail(e.detail.value!)} required />
      </IonItem>

      <IonItem lines="full">
        <IonLabel position="floating">Contraseña</IonLabel>
        <IonInput type="password" value={password} onIonChange={(e) => setPassword(e.detail.value!)} required />
      </IonItem>

      {formError && <IonText color="danger">{formError}</IonText>}
      {error && <IonText color="danger">{error}</IonText>}

      <IonButton expand="block" type="submit" disabled={isLoading}>
        Iniciar Sesión
      </IonButton>

      {isLoading && <IonLoading isOpen={true} message="Iniciando sesión..." />}

      <IonRouterLink href="/register">¿No tienes cuenta? Regístrate</IonRouterLink>
    </form>
  );
};

export default FormularioLogin;
