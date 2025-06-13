// src/components/RutaPrivada.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { IonLoading } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

/**
 * Mapa que define qué roles tienen acceso a cada ruta protegida.
 * Utilizado para implementar autorización basada en roles (RBAC).
 */
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

/**
 * Props para el componente RutaPrivada.
 */
interface RutaPrivadaProps {
  children: React.ReactNode;
}

/**
 * Componente de guardia de rutas que implementa autenticación y autorización.
 * Protege rutas privadas verificando que el usuario esté autenticado y tenga el rol adecuado.
 * Redirige automáticamente según el estado de autenticación y autorización.
 */
const RutaPrivada: React.FC<RutaPrivadaProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Obtenemos la ruta actual y los roles permitidos para esa ruta
  const path = location.pathname;
  const rolesPermitidos = rutasProtegidasPorRol[path] || [];
  const autorizado = user && rolesPermitidos.includes(user.id_rol);

  // Mostramos loading mientras se verifica la autenticación
  if (isLoading || !user) {
    return <IonLoading isOpen={true} message="Verificando acceso..." />;
  }

  // Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no autorizado para esta ruta, redirigimos al home
  if (!autorizado) {
    return <Navigate to="/home" replace />;
  }

  // Si todo está correcto, renderizamos el contenido protegido
  return (
    <>
      {children}
    </>
  );
};

export default RutaPrivada;