import React from 'react';
import { IonText } from '@ionic/react';
import { useAuth } from '../../context/AuthContext';
import './BienvenidaDashboard.css';

const BienvenidaDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="bienvenida-container">
      <IonText color="primary">
        <h1 className="titulo-dashboard">
          ¡Bienvenido de nuevo{user && user.nombre ? `, ${user.nombre}` : ''}!
        </h1>
      </IonText>
      <IonText color="medium">
        <p className="descripcion-dashboard">Aquí tienes un resumen de tu actividad</p>
      </IonText>
    </div>
  );
};

export default BienvenidaDashboard;







