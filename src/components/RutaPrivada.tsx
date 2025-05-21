import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RutaPrivadaProps {
  path: string;
  exact?: boolean;
  component?: React.ComponentType<any>;
  roles?: string[];
  children?: React.ReactNode;
}

const RutaPrivada: React.FC<RutaPrivadaProps> = ({
  component: Component,
  roles,
  children,
  ...rest
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('🔍 [RutaPrivada] isLoading=', isLoading,
    ' | isAuthenticated=', isAuthenticated,
    ' | user.id_rol=', user?.id_rol);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return <div>Cargando...</div>;
        }

        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        if (roles && (!user || !roles.includes(user.id_rol))) {
          return <Redirect to="/home" />;
        }

        if (Component) {
          return <Component {...props} />;
        }

        return <>{children}</>;
      }}
    />
  );
};

export default RutaPrivada;
