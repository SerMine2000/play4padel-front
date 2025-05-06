// Home/Home.tsx
import React from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
import './Home.css';
import TarjetaDashboard from './TarjetaDashboard';
import EncabezadoDashboard from './EncabezadoDashboard';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="contenedor-dashboard">
        <EncabezadoDashboard titulo="¡Bienvenido de nuevo!" />

        <IonGrid className="rejilla-dashboard">
          <IonRow>
            <IonCol size="12" size-md="3">
              <TarjetaDashboard titulo="Partidos Jugados" subtitulo="" valor="24" />
            </IonCol>
            <IonCol size="12" size-md="3">
              <TarjetaDashboard titulo="Nivel" subtitulo="" valor="4.2" />
            </IonCol>
            <IonCol size="12" size-md="3">
              <TarjetaDashboard titulo="Victorias" subtitulo="" valor="18" />
            </IonCol>
            <IonCol size="12" size-md="3">
              <TarjetaDashboard titulo="Torneos" subtitulo="" valor="3" />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
