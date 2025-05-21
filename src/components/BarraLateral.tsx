// src/components/BarraLateral.tsx
import React from 'react';
import { IonItem, IonIcon, IonLabel, IonList, IonButton } from '@ionic/react';
import {
  logOutOutline, homeOutline, calendarOutline, tennisballOutline,
  peopleOutline, stopwatchOutline, statsChartOutline, trophyOutline,
  settingsOutline, menuOutline, closeOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useLocation, useHistory } from 'react-router-dom';
import './BarraLateral.css';

const primaryPurple = '#2D0A31'; // Púrpura oscuro del fondo del logo
const brightGreen = '#00FF66'; // Verde brillante de la "P" en el logo
const pureWhite = '#FFFFFF'; // Blanco del "4" en el logo
const darkPurple = '#110514'; // Fondo más oscuro
const mediumPurple = '#3D1A41'; // Color para cards

type MenuOption = {
  label: string;
  path: string;
  icon: string;
  action?: never;
};

type MenuOptionWithAction = {
  label: string;
  path: string;
  icon: string;
  action: () => Promise<void>;
};

const excludedRoutes = ['/login', '/register', '/pay'];

type BarraLateralProps = {
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
};

const BarraLateral: React.FC<BarraLateralProps> = ({
  isMobile = false,
  isOpen = true,
  onToggle
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const history = useHistory();

  // Ocultar barra lateral en rutas excluidas
  if (excludedRoutes.includes(location.pathname)) {
    return null;
  }

  // Prevenir render si aún no se ha definido el rol del usuario
  if (!user || !user.id_rol) {
    return null;
  }

  const baseOptions: MenuOptionWithAction[] = [
    {
      label: 'Configuración',
      path: '/configuracion',
      icon: settingsOutline,
      action: async () => {
        history.replace('/configuracion');
        if (isMobile) onToggle?.();
      }
    },
    {
      label: 'Cerrar sesión',
      path: '',
      icon: logOutOutline,
      action: async () => {
        await logout();
      }
    }
  ];

  let roleSpecificOptions: MenuOption[] = [];

  switch (user.id_rol) {
    case 'CLUB':
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Gestionar Pistas', path: '/manage-courts', icon: tennisballOutline },
        { label: 'Administrar Usuarios', path: '/manage-users', icon: peopleOutline },
        { label: 'Calendario', path: '/calendar', icon: calendarOutline },
        { label: 'Estadísticas', path: '/estadisticas', icon: statsChartOutline },
        { label: 'Torneos', path: '/torneos', icon: trophyOutline },
        { label: 'Ligas', path: '/ligas', icon: trophyOutline }
      ];
      break;
    case 'USUARIO':
    case 'SOCIO':
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Reservar', path: '/reservas', icon: calendarOutline }
      ];
      break;
    default:
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline }
      ];
  }

  return (
    <>
      {isMobile && (
        <div className="menu-button-container" onClick={onToggle}>
          <div className="menu-button-float">
            <IonIcon icon={menuOutline} className="menu-icon" />
          </div>
        </div>
      )}

      <div
        className={isMobile
          ? `barra-lateral mobile ${isOpen ? 'open' : 'closed'}`
          : 'barra-lateral'}
      >
        <div className="logo-container">
          <div className="sidebar-logo" onClick={() => {
            history.replace('/home');
            if (isMobile) onToggle?.();
          }}>
            Play<span style={{ color: brightGreen }}>4</span>Padel
          </div>

          {isMobile && (
            <div className="sidebar-close-button" onClick={onToggle}>
              <IonIcon icon={closeOutline} className="sidebar-close-icon" />
            </div>
          )}
        </div>

        <div className="menu-container">
          {[...roleSpecificOptions, ...baseOptions].map((option, index) => {
            const isActive = location.pathname === option.path;

            return (
              <div
                key={index}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (option.action) {
                    option.action();
                  } else if (option.path) {
                    if (history.location.pathname === option.path) {
                      history.replace('/');
                      setTimeout(() => history.replace(option.path), 0);
                    } else {
                      history.replace(option.path);
                    }
                    if (isMobile) onToggle?.();
                  }
                }}
              >
                <IonIcon icon={option.icon} className="menu-item-icon" />
                <span className="menu-item-text">{option.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}
    </>
  );
};

export default BarraLateral;