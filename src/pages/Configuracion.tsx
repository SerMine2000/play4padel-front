// src/pages/Configuracion.tsx
import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonToggle, IonButton, IonAlert,
  IonBackButton, IonButtons } from '@ionic/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import '../theme/variables.css';
import './css/Configuracion.css';

const Configuracion: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { deleteAccount } = useAuth();
  const history = useHistory();

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('ion-palette-dark');
    } else {
      html.classList.remove('ion-palette-dark');
    }
  }, [theme]);

  const handleDelete = async () => {
    await deleteAccount();
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Configuración</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="configuracion-container">
        <div className="configuracion-panel">
          <h2>Preferencias</h2>
          <IonItem>
            <IonLabel>Cambiar a modo oscuro</IonLabel>
            <IonToggle checked={theme === 'dark'} onIonChange={toggleTheme} />
          </IonItem>

          <h2>Eliminar cuenta</h2>
          <IonButton className="boton-rojo" onClick={() => setShowAlert(true)}>
            Borrar cuenta
          </IonButton>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmar eliminación"
          message="¿Estás seguro de que quieres eliminar tu cuenta?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', role: 'destructive', handler: handleDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Configuracion;
