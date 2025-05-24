// src/App.tsx
import { IonApp, IonRouterOutlet, useIonRouter } from '@ionic/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Registro/Register';
import Profile from './pages/Perfil/Profile';
import Reservas from './pages/Reservas/Reservas';
import ManageCourts from './pages/ManageCourts/ManageCourts';
import ManageUsers from './pages/ManageUsers/ManageUsers';
import CalendarView from './pages/Calendario/CalendarView';
import MarcadorControl from './pages/Marcador/MarcadorControl';
import MarcadorPantalla from './pages/Marcador/MarcadorPantalla';
import Configuracion from './pages/Configuracion/Configuracion';
import Pay from './pages/Pago/Pay';

import { AuthProvider, useAuth } from './context/AuthContext';
import Estructura from './components/Estructura';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const stripePromise = loadStripe('pk_test_51RBDLF2MsbKNiz9B2Wol9ZvHjbvYvhMjVwkQPOvZmBEeyRGBFPAFgkGAhBOzD4FSq1kMxZgjYJGTm9fFhfJuMdA300Vt5jJ7m4');

// Componente para rutas privadas
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  return isAuthenticated ? element : <Navigate to="/login" />;
};

// Componente para rutas con roles específicos
const RoleRoute = ({
  element,
  roles
}: {
  element: JSX.Element;
  roles: string[];
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user && roles.includes(user.id_rol)) return element;
  return <Navigate to="/home" />;
};

// Componente para manejar el foco al cambiar de ruta
const FocusManager: React.FC = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
    };

    handleRouteChange();
    document.addEventListener('ionRouterOutletActivated', handleRouteChange);

    return () => {
      document.removeEventListener('ionRouterOutletActivated', handleRouteChange);
    };
  }, [ionRouter]);

  return null;
};

// Layout principal para páginas con cabecera y barra lateral
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="main-content">
    <Estructura>
      {children}
    </Estructura>
  </div>
);

// Estilos básicos
const styles = `
  .main-content {
    display: flex;
    height: calc(100vh - 60px);
  }
`;

document.head.appendChild(document.createElement('style')).textContent = styles;

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <IonApp>
      <BrowserRouter>
        <FocusManager />
        <IonRouterOutlet>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />

            {/* Rutas privadas */}
            <Route path="/home" element={<PrivateRoute element={<MainLayout><Home /></MainLayout>} />} />
            <Route path="/calendar" element={<PrivateRoute element={<MainLayout><CalendarView /></MainLayout>} />} />
            <Route path="/profile" element={<PrivateRoute element={<MainLayout><Profile /></MainLayout>} />} />
            <Route path="/configuracion" element={<PrivateRoute element={<MainLayout><Configuracion /></MainLayout>} />} />
            <Route path="/reservas" element={<PrivateRoute element={<MainLayout><Reservas /></MainLayout>} />} />
            <Route path="/manage-courts" element={<PrivateRoute element={<MainLayout><ManageCourts /></MainLayout>} />} />
            <Route path="/manage-users" element={<PrivateRoute element={<MainLayout><ManageUsers /></MainLayout>} />} />
            <Route path="/marcador-control" element={<PrivateRoute element={<MarcadorControl />} />} />
            <Route path="/marcador-pantalla" element={<PrivateRoute element={<MarcadorPantalla />} />} />
            <Route path="/marcador" element={<PrivateRoute element={<Estructura><MarcadorControl /></Estructura>} />} />

            {/* Ruta pública de pago */}
            <Route path="/pay" element={ <Elements stripe={stripePromise}> <Pay /></Elements>}/>

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
          </Routes>
        </IonRouterOutlet>
      </BrowserRouter>
    </IonApp>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </AuthProvider>
);

export default App;