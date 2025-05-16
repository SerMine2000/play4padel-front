import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import BarraLateral from './BarraLateral';
import AppHeader from './AppHeader';

const Estructura: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <IonPage>
      <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Barra lateral fija a la izquierda */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <BarraLateral />
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Cabecera fija arriba */}
          <div style={{ height: '60px', flexShrink: 0 }}>
            <AppHeader />
          </div>

          {/* Contenido de cada página */}
          <IonContent style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {children}
          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Estructura;
