// src/App.tsx
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Reservas from './pages/Reservas';
import ManageCourts from './pages/ManageCourts';
import { AuthProvider, useAuth } from './context/AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

// Componente envoltorio para rutas autenticadas
const PrivateRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return <div>Cargando...</div>;
        }
        
        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
};

// Componente para rutas que requieren rol específico
const RoleRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
  roles: number[];
  exact?: boolean;
}> = ({ component: Component, roles, ...rest }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
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
        
        // Verificar si el usuario tiene uno de los roles permitidos
        if (user && roles.includes(user.id_rol)) {
          return <Component {...props} />;
        }
        
        // Redirigir al home si no tiene el rol adecuado
        return <Redirect to="/home" />;
      }}
    />
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Rutas públicas */}
          <Route path="/login" exact>
            {isAuthenticated ? <Redirect to="/home" /> : <Login />}
          </Route>
          
          <Route path="/register" exact>
            {isAuthenticated ? <Redirect to="/home" /> : <Register />}
          </Route>
          
          {/* Rutas privadas - para todos los usuarios autenticados */}
          <PrivateRoute path="/home" exact component={Home} />
          <PrivateRoute path="/profile" exact component={Profile} />
          <PrivateRoute path="/reservas" exact component={Reservas} />
          
          {/* Rutas que requieren rol específico - solo administradores (id_rol = 1) */}
          <RoleRoute 
            path="/manage-courts" 
            exact 
            component={ManageCourts} 
            roles={[1]} 
          />
          
          {/* Redirección por defecto */}
          <Route exact path="/">
            {isAuthenticated ? <Redirect to="/home" /> : <Redirect to="/login" />}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;