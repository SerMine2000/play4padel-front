import React, { useState } from 'react';
import { IonInput, IonItem, IonLabel, IonButton, IonText, IonLoading, IonRouterLink } from '@ionic/react';
import { useAuth } from "../../context/AuthContext";
import { useHistory } from 'react-router';
import "./Login.css";

const FormularioLogin: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }
    setLoginLoading(true);
    try {
      await login(email, password);
      setFormError('');
      history.replace('/home');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Credenciales incorrectas';
      setFormError(mensaje);
    } finally {
      setLoginLoading(false);
    }
  };

  

  return (
    <form onSubmit={handleLogin} className="formulario-login">
      <IonItem lines="full">
        <IonLabel position="floating">Email</IonLabel>
        <IonInput
          type="email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value!)}
          required
        />
      </IonItem>

      <IonItem lines="full">
        <IonLabel position="floating">Contraseña</IonLabel>
        <IonInput
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
          required
        />
      </IonItem>

      {(formError) && (
        <IonText color="danger">
          <p>{formError}</p>
        </IonText>
      )}

      <IonButton expand="block" type="submit" disabled={loginLoading}>
        Iniciar Sesión
      </IonButton>

      <IonLoading
        isOpen={loginLoading}
        message="Iniciando sesión..."
        onDidDismiss={() => setLoginLoading(false)}
        spinner="crescent"
      />

      <IonRouterLink href="/register">¿No tienes cuenta? Regístrate</IonRouterLink>
    </form>
  );
};

export default FormularioLogin;
