import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardUsuario from './DashboardUsuario';
import DashboardClub from './DashboardClub';
import DashboardAdministrador from './DashboardAdministrador';

const Home: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Cargando...</div>;
  }

  switch(user.role.toUpperCase()) {
    case 'ADMIN':
      return <DashboardAdministrador />;
    case 'CLUB':
      return <DashboardClub />;
    case 'USUARIO':
    case 'SOCIO':
      return <DashboardUsuario />;
    default:
      return <DashboardUsuario />;
  }
};

export default Home;