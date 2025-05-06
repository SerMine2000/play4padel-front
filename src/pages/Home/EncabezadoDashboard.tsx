import React from 'react';
import { IonText } from '@ionic/react';
import './EncabezadoDashboard.css';

interface Props {
  titulo: string;
}

const EncabezadoDashboard: React.FC<Props> = ({ titulo }) => {
  return (
    <div className="encabezado-dashboard">
      <IonText color="primary">
        <h1 className="titulo-dashboard">{titulo}</h1>
      </IonText>
      <IonText color="medium">
        <p className="descripcion-dashboard">Aquí tienes un resumen de tu actividad</p>
      </IonText>
    </div>
  );
};

export default EncabezadoDashboard;
