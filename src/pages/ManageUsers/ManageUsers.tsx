import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GestionUsuariosClub from './GestionUsuariosClub';

const ManageUsers: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Cargando...</div>;
  }

  switch(user.role.toUpperCase()) {
    case 'ADMIN':
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Gestión de Usuarios - Administrador</h2>
          <p>Panel de administración de usuarios disponible próximamente.</p>
        </div>
      );
    case 'CLUB':
    case 'PROFESOR':
    case 'EMPLEADO':
      return <GestionUsuariosClub />;
    case 'USUARIO':
    case 'SOCIO':
    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Gestión de Usuarios</h2>
          <p>Esta funcionalidad no está disponible para su rol de usuario.</p>
        </div>
      );
  }
};

export default ManageUsers;