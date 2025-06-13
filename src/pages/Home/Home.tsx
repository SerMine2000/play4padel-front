import React from 'react';
import { IonLoading } from '@ionic/react';
import { useAuth } from '../../context/AuthContext';
import DashboardUsuario from './DashboardUsuario';
import DashboardClub from './DashboardClub';
import DashboardAdministrador from './DashboardAdministrador';

/**
 * Página principal de la aplicación (Home/Dashboard).
 * Actúa como enrutador que renderiza diferentes dashboards según el rol del usuario autenticado.
 * Implementa el patrón de renderizado condicional basado en roles.
 */
const Home: React.FC = () => {
  const { user } = useAuth();
  
  // Mostramos loading mientras se carga la información del usuario
  if (!user) {
    return <IonLoading isOpen={true} message="Cargando dashboard..." />;
  }

  // Renderizamos el dashboard correspondiente según el rol del usuario
  switch(user.role.toUpperCase()) {
    case 'ADMIN':
      // Dashboard para administradores del sistema
      return <DashboardAdministrador />;
    case 'CLUB':
      // Dashboard para administradores de club
      return <DashboardClub />;
    case 'USUARIO':
    case 'SOCIO':
      // Dashboard para usuarios normales y socios de club
      return <DashboardUsuario />;
    default:
      // Dashboard por defecto para roles no reconocidos
      return <DashboardUsuario />;
  }
};

export default Home;