import React, { ReactNode } from 'react';
import { IonPage, IonContent, IonMenu, IonMenuButton } from '@ionic/react';
import './Estructura.css';
import EncabezadoDashboard from '../pages/Home/EncabezadoDashboard';
import BarraLateral from './BarraLateral';
import { useLocation } from 'react-router-dom';

interface EstructuraProps {
  children?: ReactNode;
}

const Estructura: React.FC<EstructuraProps> = ({ children }) => {
  const location = useLocation();
  const contentId = "main-content";

  return (
    <IonPage>
      <div className="barra-lateral">
        <BarraLateral />
      </div>
      <div className="contenedor-con-barra">
        <IonContent className="contenedor-dashboard">
          <div className="contenido-estructura">
            {children}
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default Estructura;
