import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import BarraLateral from './BarraLateral';
import AppHeader from './AppHeader';
import './Estructura.css';

const Estructura: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // En desktop, siempre mantener abierto el sidebar
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para alternar la visibilidad de la barra lateral
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <IonPage className="app-container">
      <div className="estructura-app">
        {/* Barra lateral */}
        <BarraLateral 
          isMobile={isMobile} 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar} 
        />

        {/* Contenido principal */}
        <div className={`contenido-principal ${!isMobile && sidebarOpen ? 'con-sidebar' : ''}`}>
          {/* Cabecera */}
          <AppHeader />

          {/* Área de contenido */}
          <div className="area-contenido">
            <IonContent className="page-content">
              {children}
            </IonContent>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Estructura;