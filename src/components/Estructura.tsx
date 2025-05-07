import React, { ReactNode } from 'react';
import { IonPage, IonContent, IonMenu, IonMenuButton } from '@ionic/react';
import './Estructura.css';
import EncabezadoDashboard from '../pages/Home/EncabezadoDashboard';
import BarraLateral from './BarraLateral';

interface EstructuraProps {
  children?: ReactNode;
}

const Estructura: React.FC<EstructuraProps> = ({ children }) => {
  const contentId = "main-content";

  return (
    <IonPage>
      <IonMenu contentId={contentId} side="start" className="barra-lateral">
        <IonContent>
          <BarraLateral />
        </IonContent>
      </IonMenu>

      <div className="contenedor-con-barra">
        <IonContent id={contentId} className="contenedor-dashboard">
          <IonMenuButton slot="start" />
          <EncabezadoDashboard titulo="Dashboard" />
          <div className="contenido-estructura">
            {children}
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default Estructura;
