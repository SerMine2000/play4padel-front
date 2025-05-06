import React from 'react';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonText } from '@ionic/react';
import './TarjetaDashboard.css';

interface Props {
  titulo: string;
  subtitulo: string;
  valor: string;
}

const TarjetaDashboard: React.FC<Props> = ({ titulo, subtitulo, valor }) => {
  return (
    <IonCard className="tarjeta-dashboard">
      <IonCardHeader>
        <IonCardTitle className="titulo-tarjeta">{titulo}</IonCardTitle>
        <IonCardSubtitle className="subtitulo-tarjeta">{subtitulo}</IonCardSubtitle>
      </IonCardHeader>
      <IonText className="valor-tarjeta">{valor}</IonText>
    </IonCard>
  );
};

export default TarjetaDashboard;