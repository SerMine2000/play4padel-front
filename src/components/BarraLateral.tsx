import React, { useState, useEffect } from 'react';
import { IonList, IonItem, IonIcon, IonLabel, IonMenu, IonContent } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { calendarOutline, peopleOutline, settingsOutline, personOutline, tennisballOutline, statsChartOutline, trophyOutline, stopwatchOutline, menuOutline, logOutOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { menuController } from '@ionic/core';
import './BarraLateral.css';
import ToggleTheme from '../pages/ToggleTheme';

const BarraLateral: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const history = useHistory();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Opciones según el rol exacto
  const clubOptions = [
    { label: 'Gestionar Pistas', icon: tennisballOutline, route: '/club/pistas' },
    { label: 'Calendario de Reservas', icon: calendarOutline, route: '/club/calendario' },
    { label: 'Administración de Usuarios', icon: peopleOutline, route: '/club/usuarios' },
    { label: 'Marcador de partidos', icon: stopwatchOutline, route: '/club/marcador' },
    { label: 'Estadísticas', icon: statsChartOutline, route: '/club/estadisticas' },
    { label: 'Torneos y Ligas', icon: trophyOutline, route: '/club/torneos' },
  ];

  const userOptions = [
    { label: 'Inicio', icon: calendarOutline, route: '/home' },
    { label: 'Reservar pista', icon: calendarOutline, route: '/reservas' },
    { label: 'Perfil', icon: personOutline, route: '/profile' },
    { label: 'Configuración', icon: settingsOutline, route: '/configuracion' },
  ];

  type Option = { label: string; icon: string; route: string };
  let options: Option[] = [];
  if (user) {
    const rol = Number(user.id_rol);
    if (rol === 1 || rol === 2) {
      // 1: ADMIN, 2: CLUB
      options = clubOptions;
    } else if (rol === 4 || rol === 5) {
      // 4: USUARIO, 5: SOCIO
      options = userOptions;
    } else {
      options = userOptions; // fallback para cualquier usuario autenticado
    }
  }

  // Acción de cerrar sesión
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    history.replace('/login');
  }
  // Navegación con replace
  const handleNav = (route: string) => {
    if (location.pathname !== route) {
      history.replace(route);
      // Forzar un refresco del router para limpiar vistas apiladas (Ionic fix)
      setTimeout(() => {
        window.dispatchEvent(new Event('popstate'));
      }, 10);
      if (isMobile) setMenuOpen(false);
    }
  };


  // Detectar modo oscuro del body o preferencia de sistema
  const isDark = document.body.classList.contains('dark') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isMobile) {
    return (
      <>
        <IonMenu side="start" menuId="main-menu" contentId="main-content">
          <IonContent>
            {user ? (
              <IonList>
                {options.map(option => {
                  const isSelected = location.pathname === option.route || location.pathname.startsWith(option.route + '/');
                  return (
                    <IonItem
                      button
                      key={option.route}
                      onClick={() => handleNav(option.route)}
                      className={`ion-item${isSelected ? ' selected' : ''}`}
                    >
                      <IonIcon icon={option.icon} slot="start" />
                      <IonLabel>{option.label}</IonLabel>
                    </IonItem>
                  );
                })}
                {/* Botón cerrar sesión */}
                <IonItem button onClick={handleLogout}>
                  <IonIcon icon={logOutOutline} slot="start" style={{ color: 'darkred' }} />
                  <IonLabel style={{ color: 'darkred', fontWeight: 'bold' }}>Cerrar sesión</IonLabel>
                </IonItem>
              </IonList>
            ) : (
              <div
                style={{
                  padding: '16px',
                  color: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : '#888',
                  background: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#18191a' : '#fff',
                  minHeight: '60px',
                  borderTop: '1px solid #2222'
                }}
              >
                Cargando menú...
              </div>
            )}
            <div className="sidebar-theme-toggle">
              <ToggleTheme />
            </div>
          </IonContent>
        </IonMenu>
        <button
          style={{ position: 'fixed', left: 10, top: 10, zIndex: 1100, background: 'transparent', border: 'none', padding: 8 }}
          onClick={() => menuController.open('main-menu')}
          aria-label="Mostrar menú"
        >
          <IonIcon icon={menuOutline} slot="icon-only" style={{ fontSize: 32 }} />
        </button>
      </>
    );
  }

  // Desktop
  return (
    <div
      className="barra-lateral"
      style={{ minHeight: '100vh', position: 'fixed', left: 0, top: 0 }}
    >
      {user ? (
        <IonList>
          {options.map(option => {
            const isSelected = location.pathname === option.route || location.pathname.startsWith(option.route + '/');
            return (
              <IonItem
                button
                key={option.route}
                onClick={() => handleNav(option.route)}
                className={`ion-item${isSelected ? ' selected' : ''}`}
              >
                <IonIcon icon={option.icon} slot="start" />
                <IonLabel>{option.label}</IonLabel>
              </IonItem>
            );
          })}
          {/* Botón cerrar sesión (desktop) */}
          <IonItem button onClick={handleLogout}>
  <IonIcon icon={logOutOutline} slot="start" style={{ color: 'darkred' }} />
  <IonLabel style={{ color: 'darkred', fontWeight: 'bold' }}>Cerrar sesión</IonLabel>
</IonItem>
        </IonList>
      ) : (
        <div
          style={{
            padding: '16px',
            color: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : '#888',
            background: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#18191a' : '#fff',
            minHeight: '60px',
            borderTop: '1px solid #2222'
          }}
        >
          Cargando menú...
        </div>
      )}
      <div className="sidebar-theme-toggle">
        <ToggleTheme />
      </div>
    </div>
  );
};

export default BarraLateral;
