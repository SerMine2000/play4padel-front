import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManageClubs.css';

// Importar el componente de admin para administradores supremos
import AdminManageClubs from '../Admin/Admin_Clubes/Admin_Clubes';

const ManageClubs: React.FC = () => {
  const { user } = useAuth();

  // Si es administrador supremo, mostrar Admin_Clubes
  if (user && user.role.toUpperCase() === 'ADMIN') {
    return <AdminManageClubs />;
  }

  // Para otros roles (Club, etc.), por ahora mostrar un mensaje
  // En el futuro se pueden agregar funcionalidades específicas para otros roles
  return (
    <div className="manage-clubs-container">
      <div className="manage-clubs-header">
        <h2>Gestión de Clubes</h2>
        <p>Esta funcionalidad está disponible solo para administradores del sistema.</p>
      </div>
    </div>
  );
};

export default ManageClubs;