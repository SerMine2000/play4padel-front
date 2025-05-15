import React from 'react';
import { IonMenuButton, IonText, IonTitle, IonToolbar } from '@ionic/react';
import './EncabezadoDashboard.css';

interface Props {
  titulo: string;
}

const EncabezadoDashboard: React.FC<Props> = ({ titulo }) => {
  return (
    <IonToolbar>
      {/* Botón menú solo en móvil/tablet */}
      <IonMenuButton slot="start" className="mobile-only" />
      <IonTitle>Dashboard</IonTitle>
      <div className="encabezado-dashboard">
        <IonText color="primary">
          <h1 className="titulo-dashboard">{titulo}</h1>
        </IonText>
      </div>
    </IonToolbar>
  );
};

export default EncabezadoDashboard;
