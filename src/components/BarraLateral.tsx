import React from 'react';
import { IonItem, IonIcon, IonLabel, IonList, IonAvatar, IonButton } from '@ionic/react';
import { logOutOutline, homeOutline, calendarOutline, tennisballOutline, peopleOutline, stopwatchOutline, statsChartOutline, trophyOutline, settingsOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useHistory } from 'react-router-dom';
import './BarraLateral.css';

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

const BarraLateral: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const history = useHistory();

  if (excludedRoutes.includes(location.pathname)) {
    return null;
  }

  const baseOptions: MenuOptionWithAction[] = [
    { 
      label: 'Cerrar sesión', 
      path: '', 
      icon: logOutOutline, 
      action: async () => { await logout(); }
    }
  ];

  const roleSpecificOptions: MenuOption[] = user?.id_rol === 2 
    ? [
        { label: 'Gestionar Pistas', path: '/manage-courts', icon: tennisballOutline },
        { label: 'Administrar Usuarios', path: '/manage-users', icon: peopleOutline },
        { label: 'Calendario', path: '/calendar', icon: calendarOutline },
        { label: 'Marcador', path: '/marcador', icon: stopwatchOutline },
        { label: 'Estadísticas', path: '/estadisticas', icon: statsChartOutline },
        { label: 'Torneos', path: '/torneos', icon: trophyOutline },
        { label: 'Ligas', path: '/ligas', icon: trophyOutline }
      ]
    : [
        { label: 'Inicio', path: '/home', icon: homeOutline },
        { label: 'Reservar', path: '/reservas', icon: calendarOutline }
      ];

  return (
    <div className="barra-lateral">
      <button 
        onClick={() => history.replace('/login')}
        style={{
          background: 'none',
          border: 'none',
          padding: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <img 
          src="/favicon.png" 
          alt="Logo Play4Padel" 
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain'
          }} 
        />
      </button>

      <IonList>
        {[...roleSpecificOptions, ...baseOptions].map((option, index) => (
          <IonItem 
            key={index}
            routerLink={option.path}
            onClick={option.action ? option.action : undefined}
            detail={false}
          >
            <IonIcon slot="start" icon={option.icon} />
            <IonLabel>{option.label}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    </div>
  );
};

export default BarraLateral;