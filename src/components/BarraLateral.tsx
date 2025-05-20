import React from 'react';
import { IonItem, IonIcon, IonLabel, IonList, IonButton } from '@ionic/react';
import { logOutOutline, homeOutline, calendarOutline, tennisballOutline, peopleOutline, 
         stopwatchOutline, statsChartOutline, trophyOutline, settingsOutline, 
         menuOutline, closeOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useLocation, useHistory } from 'react-router-dom';
import './BarraLateral.css';

// Colores del logo Play4Padel
const primaryPurple = '#2D0A31'; // Púrpura oscuro del fondo del logo
const brightGreen = '#00FF66'; // Verde brillante de la "P" en el logo
const pureWhite = '#FFFFFF'; // Blanco del "4" en el logo

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

  if (excludedRoutes.includes(location.pathname)) {
    return null;
  }

  const baseOptions: MenuOptionWithAction[] = [
    {
      label: 'Configuración',
      path: '/configuracion',
      icon: settingsOutline,
      action: async () => { 
        history.replace('/configuracion');
        if (isMobile) onToggle?.(); // Cerrar al navegar en móvil
      }
    },
    { 
      label: 'Cerrar sesión', 
      path: '', 
      icon: logOutOutline, 
      action: async () => { await logout(); }
    }
  ];

  let roleSpecificOptions: MenuOption[] = [];
  if (user?.id_rol === 2) {
    roleSpecificOptions = [
      { label: 'Gestionar Pistas', path: '/manage-courts', icon: tennisballOutline },
      { label: 'Administrar Usuarios', path: '/manage-users', icon: peopleOutline },
      { label: 'Calendario', path: '/calendar', icon: calendarOutline },
      { label: 'Estadísticas', path: '/estadisticas', icon: statsChartOutline },
      { label: 'Torneos', path: '/torneos', icon: trophyOutline },
      { label: 'Ligas', path: '/ligas', icon: trophyOutline }
    ];
  } else if (user?.id_rol === 4 || user?.id_rol === 5) {
    roleSpecificOptions = [
      { label: 'Reservar', path: '/reservas', icon: calendarOutline }
    ];
  }

  // Estilo para los ítems del menú
  const menuItemStyle = {
    '--background': 'transparent',
    '--background-hover': 'rgba(255, 255, 255, 0.1)',
    '--color': pureWhite,
    '--border-color': 'rgba(255, 255, 255, 0.1)',
    marginBottom: '8px',
    borderRadius: '8px',
    fontSize: '16px'
  };

  // Estilo para los iconos del menú
  const menuIconStyle = {
    color: brightGreen,
    fontSize: '20px',
    marginRight: '8px'
  };

  return (
    <>
      {/* Botón de hamburguesa para móviles */}
      {isMobile && (
        <div className="menu-button-container" onClick={onToggle}>
          <div className="menu-button-float">
            <IonIcon icon={menuOutline} className="menu-icon" />
          </div>
        </div>
      )}

      {/* Barra lateral */}
      <div 
        className={isMobile
          ? `barra-lateral mobile ${isOpen ? 'open' : 'closed'}`
          : 'barra-lateral'
        } 
        style={{backgroundColor: primaryPurple, borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}
      >
        {/* Cabecera con logo y botón de cierre */}
        <div className="logo-container">
          {/* Logo */}
          <div className="sidebar-logo" onClick={() => {
            history.replace('/home');
            if (isMobile) onToggle?.();
          }}>
            Play<span style={{ color: brightGreen }}>4</span>Padel
          </div>
          
          {/* Botón de cierre */}
          <div className="sidebar-close-button" onClick={onToggle}>
            <IonIcon icon={closeOutline} className="sidebar-close-icon" />
          </div>
        </div>

        <IonList style={{backgroundColor: 'transparent', padding: '0 10px'}}>
          {[...roleSpecificOptions, ...baseOptions].map((option, index) => {
            const isActive = location.pathname === option.path;
            const activeStyle = isActive ? {
              '--background': 'rgba(0, 255, 102, 0.2)',
              '--color': brightGreen,
              fontWeight: 'bold'
            } : {};
            
            return (
              <IonItem 
                key={index}
                button
                onClick={() => {
                  if (option.action) {
                    option.action();
                  } else if (option.path) {
                    if (history.location.pathname === option.path) {
                      // Fuerza refresco si ya estás en la ruta
                      history.replace('/');
                      setTimeout(() => history.replace(option.path), 0);
                    } else {
                      history.replace(option.path);
                    }
                    // Cerrar el menú en móvil después de navegar
                    if (isMobile) onToggle?.();
                  }
                }}
                detail={false}
                style={{...menuItemStyle, ...activeStyle}}
                className={isActive ? 'item-active' : ''}
              >
                <IonIcon slot="start" icon={option.icon} style={menuIconStyle} />
                <IonLabel>{option.label}</IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </div>
      
      {/* Overlay para móviles */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}
    </>
  );
};

export default BarraLateral;