import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManageClubs.css';
import GestionClubesAdministrador from './GestionClubesAdministrador';

const ManageClubs: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Cargando...</div>;
  }

  switch(user.role.toUpperCase()) {
    case 'ADMIN':
      return <GestionClubesAdministrador />;
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