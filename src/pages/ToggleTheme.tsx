import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import './ToggleTheme.css';

const ToggleTheme: React.FC = () => {
  const [modoOscuro, setModoOscuro] = useState(document.documentElement.classList.contains('ion-palette-dark'));

  const toggleModo = () => {
    const root = document.documentElement;
    root.classList.toggle('ion-palette-dark');
    setModoOscuro(root.classList.contains('ion-palette-dark'));
  };

  return (
    <IonButton onClick={toggleModo} className="toggle-theme-button">
      <IonIcon slot="icon-only" icon={modoOscuro ? sunnyOutline : moonOutline} />
    </IonButton>
  );
};

export default ToggleTheme;
