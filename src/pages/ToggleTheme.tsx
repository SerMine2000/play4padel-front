import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

const ToggleTheme: React.FC = () => {
  const [modoOscuro, setModoOscuro] = useState(
    document.documentElement.classList.contains('ion-palette-dark')
  );

  // Escuchar cambios en el modo tema al cargar
  useEffect(() => {
    const checkTheme = () => {
      setModoOscuro(document.documentElement.classList.contains('ion-palette-dark'));
    };
    
    // Verificar al montar el componente
    checkTheme();
    
    // Observer para detectar cambios en la clase
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const toggleModo = () => {
    const root = document.documentElement;
    root.classList.toggle('ion-palette-dark');
    setModoOscuro(root.classList.contains('ion-palette-dark'));
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme-preference', 
      root.classList.contains('ion-palette-dark') ? 'dark' : 'light'
    );
  };

  // Cargar preferencia guardada al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme === 'dark' && !document.documentElement.classList.contains('ion-palette-dark')) {
      document.documentElement.classList.add('ion-palette-dark');
      setModoOscuro(true);
    } else if (savedTheme === 'light' && document.documentElement.classList.contains('ion-palette-dark')) {
      document.documentElement.classList.remove('ion-palette-dark');
      setModoOscuro(false);
    }
  }, []);

  return (
    <IonButton 
      onClick={toggleModo} 
      className="toggle-theme-button"
      fill="clear"
      style={{
        '--color': 'var(--texto-panel-navegacion)',
        '--background': 'transparent',
        '--border-radius': '50%',
        '--padding': '8px'
      }}
    >
      <IonIcon 
        slot="icon-only" 
        icon={modoOscuro ? sunnyOutline : moonOutline}
        style={{
          color: 'var(--color-primario)',
          fontSize: '1.5rem'
        }}
      />
    </IonButton>
  );
};

export default ToggleTheme;