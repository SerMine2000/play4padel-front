// src/components/RutaPrivada.tsx
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
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
  path: string;
  exact?: boolean;
  component?: React.ComponentType<any>;
  children?: React.ReactNode;
}

const RutaPrivada: React.FC<RutaPrivadaProps> = ({ path, exact, component: Component, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Route
      path={path}
      exact={exact}
      render={(props) => {
        // Mostrar un loader si la app aún está cargando o el usuario no está definido
        if (isLoading || !user || !user.id_rol) {
          return <div>Cargando...</div>;
        }

        // Redirigir si no está autenticado
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        // Verificar si el rol tiene permiso para esta ruta
        const rolesPermitidos = rutasProtegidasPorRol[path] || [];
        const autorizado = rolesPermitidos.includes(user.id_rol);

        if (!autorizado) {
          return <Redirect to="/home" />;
        }

        // Renderizar componente o children si todo está correcto
        return Component ? <Component {...props} /> : children;
      }}
    />
  );
};

export default RutaPrivada;
