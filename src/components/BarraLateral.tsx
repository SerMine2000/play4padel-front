// src/components/BarraLateral.tsx
import React from 'react';
import { IonItem, IonIcon, IonLabel, IonList, IonButton } from '@ionic/react';
import {
  logOutOutline, homeOutline, calendarOutline, tennisballOutline,
  peopleOutline, stopwatchOutline, statsChartOutline, trophyOutline,
  settingsOutline, menuOutline, closeOutline, businessOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './BarraLateral.css';

const ROLES = {
  ADMIN: 1,
  CLUB: 2,
  PROFESOR: 3,
  EMPLEADO: 4,
  USUARIO: 5,
  SOCIO: 6,
};

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
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // No mostrar la barra lateral en rutas excluidas
  if (excludedRoutes.includes(location.pathname)) return null;
  
  // No mostrar mientras está cargando
  if (isLoading) return null;
  
  // No mostrar si no hay usuario
  if (!user) return null;

  const baseOptions: MenuOptionWithAction[] = [
    {
      label: 'Configuración',
      path: '/configuracion',
      icon: settingsOutline,
      action: async () => {
        navigate('/configuracion');
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

  // Debug logging
  console.log('👤 Usuario actual:', {
    id: user?.id,
    role: user?.role,
    id_rol: user?.id_rol,
    nombre: user?.nombre
  });

  // Determinar opciones del menú basado en el rol
  const userRole = (user.role || '').toUpperCase();
  
  switch (userRole) {
    case 'ADMIN':
      roleSpecificOptions = [
        { label: 'Dashboard', path: '/home', icon: homeOutline },
        { label: 'Gestionar Clubes', path: '/manage-clubs', icon: businessOutline },
        { label: 'Gestionar Usuarios', path: '/manage-users', icon: peopleOutline },
        { label: 'Reportes del Sistema', path: '/admin/system-reports', icon: statsChartOutline },
        { label: 'Configuración Sistema', path: '/admin/system-config', icon: settingsOutline },
        { label: 'Calendario', path: '/calendar', icon: calendarOutline },
        { label: 'Torneos', path: '/torneos', icon: trophyOutline },
        { label: 'Ligas', path: '/ligas', icon: trophyOutline }
      ];
      break;
      
    case 'CLUB':
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Gestionar Pistas', path: '/manage-courts', icon: tennisballOutline },
        { label: 'Administrar Usuarios', path: '/manage-users', icon: peopleOutline },
        { label: 'Calendario', path: '/calendar', icon: calendarOutline },
        { label: 'Marcador', path: '/marcador', icon: stopwatchOutline },
        { label: 'Estadísticas', path: '/estadisticas', icon: statsChartOutline },
        { label: 'Torneos', path: '/torneos', icon: trophyOutline },
        { label: 'Ligas', path: '/ligas', icon: trophyOutline }
      ];
      break;
      
    case 'PROFESOR':
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Mis Clases', path: '/clases', icon: calendarOutline },
        { label: 'Calendario', path: '/calendar', icon: calendarOutline }
      ];
      break;
      
    case 'EMPLEADO':
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Gestionar Pistas', path: '/manage-courts', icon: tennisballOutline },
        { label: 'Calendario', path: '/calendar', icon: calendarOutline },
        { label: 'Marcador', path: '/marcador', icon: stopwatchOutline }
      ];
      break;
      
    case 'USUARIO':
    case 'SOCIO':
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Reservar', path: '/reservas', icon: calendarOutline },
        { label: 'Torneos', path: '/torneos', icon: trophyOutline },
        { label: 'Ligas', path: '/ligas', icon: trophyOutline }
      ];
      break;
      
    default:
      console.warn(`⚠️ Rol no reconocido: ${userRole}`);
      // Opciones por defecto para usuarios
      roleSpecificOptions = [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Reservar', path: '/reservas', icon: calendarOutline },
        { label: 'Torneos', path: '/torneos', icon: trophyOutline },
        { label: 'Ligas', path: '/ligas', icon: trophyOutline }
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
        className={
          isMobile
            ? `barra-lateral mobile ${isOpen ? 'open' : 'closed'}`
            : 'barra-lateral'
        }
      >
        <div className="logo-container">
          <div
            className="sidebar-logo"
            onClick={() => {
              navigate('/home');
              if (isMobile) onToggle?.();
            }}
          >
            Play<span style={{ color: 'var(--color-primario)' }}>4</span>Padel
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
                data-route={option.path}
                data-action={option.action ? 'logout' : undefined}
                onClick={() => {
                  if (option.action) {
                    option.action();
                  } else if (option.path) {
                    // Evitar navegación doble si ya estamos en la ruta
                    if (location.pathname !== option.path) {
                      navigate(option.path);
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