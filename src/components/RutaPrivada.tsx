// src/components/RutaPrivada.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { IonLoading } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

// Mapa de rutas protegidas con roles permitidos
const rutasProtegidasPorRol: { [ruta: string]: string[] } = {
  '/home': ['CLUB', 'USUARIO', 'SOCIO'],
  '/calendar': ['CLUB'],
  '/manage-courts': ['CLUB'],
  '/manage-users': ['CLUB'],
  '/reservas': ['USUARIO', 'SOCIO'],
  '/profile': ['CLUB', 'USUARIO', 'SOCIO'],
  '/configuracion': ['CLUB', 'USUARIO', 'SOCIO'],
  '/marcador-control': ['CLUB'],
  '/marcador-pantalla': ['CLUB'],
  '/marcador': ['CLUB']
};

interface RutaPrivadaProps {
  children: React.ReactNode;
}

const RutaPrivada: React.FC<RutaPrivadaProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  const path = location.pathname;
  const rolesPermitidos = rutasProtegidasPorRol[path] || [];
  const autorizado = user && rolesPermitidos.includes(user.id_rol);

  if (isLoading || !user) {
    return <IonLoading isOpen={true} message="Verificando acceso..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!autorizado) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      {children}
    </>
  );
};

export default RutaPrivada;