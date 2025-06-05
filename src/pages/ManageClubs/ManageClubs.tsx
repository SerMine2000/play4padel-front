import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManageClubs.css';

const ManageClubs: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Cargando...</div>;
  }

  switch(user.role.toUpperCase()) {
    case 'ADMIN':
      return (
        <div className="manage-clubs-container">
          <div className="manage-clubs-header">
            <h2>Gestión de Clubes - Administrador</h2>
            <p>Panel de administración de clubes disponible próximamente.</p>
          </div>
        </div>
      );
    case 'CLUB':
    case 'PROFESOR':
    case 'EMPLEADO':
    case 'USUARIO':
    case 'SOCIO':
    default:
      return (
        <div className="manage-clubs-container">
          <div className="manage-clubs-header">
            <h2>Gestión de Clubes</h2>
            <p>Esta funcionalidad está disponible solo para administradores del sistema.</p>
          </div>
        </div>
      );
  }
};

export default ManageClubs;