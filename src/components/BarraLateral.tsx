import React, { useState } from 'react';
import { IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/react';
import { homeOutline, barChartOutline, calendarOutline, peopleOutline, menuOutline } from 'ionicons/icons';
import './BarraLateral.css';

const BarraLateral: React.FC = () => {
  const [colapsado, setColapsado] = useState(false);

  const toggleColapsado = () => {
    setColapsado(!colapsado);
  };

  return (
    <div className={`barra-lateral ${colapsado ? 'colapsado' : ''}`}>
      <IonButton onClick={toggleColapsado} className="boton-toggle">
        <IonIcon icon={menuOutline} />
      </IonButton>

      <IonContent>
        <IonList>
          <IonItem routerLink="/inicio" routerDirection="forward">
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel className="label">Inicio</IonLabel>
          </IonItem>
          <IonItem routerLink="/estadisticas">
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel className="label">Estadísticas</IonLabel>
          </IonItem>
          <IonItem routerLink="/calendario">
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel className="label">Calendario</IonLabel>
          </IonItem>
          <IonItem routerLink="/usuarios">
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel className="label">Usuarios</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </div>
  );
};

export default BarraLateral;
