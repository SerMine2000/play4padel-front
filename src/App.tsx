// src/App.tsx
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
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

/* Dark Mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Rutas públicas */}
          <Route path="/login" component={Login} exact />
          <Route path="/register" component={Register} exact />
          
          {/* Rutas protegidas */}
          <Route 
            path="/home" 
            exact 
            render={() => {
              if (isLoading) return <div>Cargando...</div>;
              return isAuthenticated ? <Home /> : <Redirect to="/login" />;
            }} 
          />
          
          <Route 
            path="/profile" 
            exact 
            render={() => {
              if (isLoading) return <div>Cargando...</div>;
              return isAuthenticated ? <Profile /> : <Redirect to="/login" />;
            }} 
          />
          
          {/* Redirección por defecto */}
          <Route exact path="/">
            <Redirect to="/home" />
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