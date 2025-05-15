import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import FormularioRegister from './FormularioRegister';
import './Register.css';

const Register: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="register-container">
        <FormularioRegister />
      </IonContent>
    </IonPage>
  );
};

export default Register;