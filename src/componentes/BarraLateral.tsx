import React from 'react';
import { IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import {
  homeOutline,
  calendarOutline,
  settingsOutline,
  tennisballOutline,
  peopleOutline,
  stopwatchOutline,
  statsChartOutline,
  trophyOutline,
  logOutOutline,
  moonOutline,
  personOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import ToggleTheme from '../pages/ToggleTheme';
import { IonAlert } from '@ionic/react';
import './BarraLateral.css';

const BarraLateral: React.FC = () => {
  const { user, logout } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);

  // Menú para usuario normal
  const opcionesUsuario = [
    { etiqueta: 'Inicio', icono: homeOutline, ruta: '/home' },
    { etiqueta: 'Reservar pista', icono: calendarOutline, ruta: '/reservas' },
    { etiqueta: 'Perfil', icono: personOutline, ruta: '/profile' },
    { etiqueta: 'Ajustes', icono: settingsOutline, ruta: '/configuracion' },
  ];

  // Menú para usuario club
  const opcionesClub = [
    { etiqueta: 'Inicio', icono: homeOutline, ruta: '/home' },
    { etiqueta: 'Gestionar Pistas', icono: tennisballOutline, ruta: '/manage-courts' },
    { etiqueta: 'Calendario de Reservas', icono: calendarOutline, ruta: '/calendar' },
    { etiqueta: 'Administración de Usuarios', icono: peopleOutline, ruta: '/manage-users' },
    { etiqueta: 'Marcador de partidos', icono: stopwatchOutline, ruta: '/marcador-control' },
    { etiqueta: 'Estadísticas', icono: statsChartOutline, ruta: '/estadisticas' },
    { etiqueta: 'Torneos', icono: trophyOutline, ruta: '/torneos' },
    { etiqueta: 'Ligas', icono: trophyOutline, ruta: '/ligas' },
    { etiqueta: 'Perfil', icono: personOutline, ruta: '/profile' },
    { etiqueta: 'Ajustes', icono: settingsOutline, ruta: '/configuracion' },
  ];

  // Decide qué menú mostrar según el rol
  // Admin total (futuro): id_rol === 99
  // Admin club: id_rol === 1
  // Usuario normal: cualquier otro
  let menu = opcionesUsuario;
  if (user?.id_rol === 1) {
    menu = opcionesClub;
  }
  // if (user?.id_rol === 99) {
  //   menu = opcionesAdminTotal; // <-- Añadir este bloque cuando exista el admin total
  // }

  return (
    <div className="barra-lateral">
      <IonList>
        {menu.map(opcion => (
          <IonItem button routerLink={opcion.ruta} key={opcion.ruta} className="ion-item">
            <IonIcon icon={opcion.icono} slot="start" />
            <IonLabel>{opcion.etiqueta}</IonLabel>
          </IonItem>
        ))}

        {/* Botón para cerrar sesión */}
        <IonItem button className="ion-item logout-item" onClick={() => setShowLogoutAlert(true)}>
          <IonIcon icon={logOutOutline} slot="start" />
          <IonLabel className="logout-label">Cerrar sesión</IonLabel>
        </IonItem>
      </IonList>
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header="¿Cerrar sesión?"
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'alert-cancel',
            handler: () => setShowLogoutAlert(false)
          },
          {
            text: 'Cerrar sesión',
            role: 'destructive',
            cssClass: 'alert-logout',
            handler: () => { setShowLogoutAlert(false); logout(); }
          }
        ]}
        cssClass="logout-alert-custom"
      />
      {/* Icono de tema en la esquina inferior izquierda */}
      <div className="sidebar-theme-toggle">
        <ToggleTheme />
      </div>
    </div>
  );
};

export default BarraLateral;
