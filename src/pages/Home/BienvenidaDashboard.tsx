import React from 'react';
import { IonText } from '@ionic/react';
import { useAuth } from '../../context/AuthContext';
import './BienvenidaDashboard.css';

const BienvenidaDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="bienvenida-container">
      <h1 className="titulo-dashboard">
        ¡Bienvenido{user && user.nombre ? `, ${user.nombre}` : ''}!
      </h1>
      <p className="descripcion-dashboard">Aquí tienes un resumen de tu actividad</p>
    </div>
  );
};

export default BienvenidaDashboard;







