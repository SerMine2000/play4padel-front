import React, { useState } from 'react';
import { IonInput, IonItem, IonLabel, IonButton, IonText, IonLoading, IonRouterLink } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router';
import './css/Register.css';
import { RegisterRequest } from '../interfaces';

const FormularioRegister: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const history = useHistory();

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    try {
      const registerData: RegisterRequest = {
        nombre,
        apellidos,
        email,
        password,
        id_rol: 4 // Usuario estándar
      };
      await register(registerData);
      history.replace('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      handleRegister(e);
    }
  };

  return (
    <form onSubmit={handleRegister} onKeyDown={handleKeyDown} className="formulario-registro">
      <IonItem lines="full">
        <IonLabel position="floating">Nombre</IonLabel>
        <IonInput value={nombre} onIonChange={e => setNombre(e.detail.value!)} required />
      </IonItem>

      <IonItem lines="full">
        <IonLabel position="floating">Apellidos</IonLabel>
        <IonInput value={apellidos} onIonChange={e => setApellidos(e.detail.value!)} required />
      </IonItem>

      <IonItem lines="full">
        <IonLabel position="floating">Email</IonLabel>
        <IonInput type="email" value={email} onIonChange={(e) => setEmail(e.detail.value!)} required />
      </IonItem>

      <IonItem lines="full">
        <IonLabel position="floating">Contraseña</IonLabel>
        <IonInput type="password" value={password} onIonChange={(e) => setPassword(e.detail.value!)} required />
      </IonItem>

      <IonItem lines="full">
        <IonLabel position="floating">Confirmar Contraseña</IonLabel>
        <IonInput type="password" value={confirmPassword} onIonChange={(e) => setConfirmPassword(e.detail.value!)} required />
      </IonItem>

      {formError && <IonText color="danger">{formError}</IonText>}
      {error && <IonText color="danger">{error}</IonText>}

      <IonButton expand="block" type="submit" disabled={isLoading}>
        Registrarse
      </IonButton>

      {isLoading && <IonLoading isOpen={true} message="Registrando..." />}

      <IonRouterLink href="/login">¿Ya tienes cuenta? Inicia sesión</IonRouterLink>
    </form>
  );
};

export default FormularioRegister;
