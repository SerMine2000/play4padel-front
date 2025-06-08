// src/App.tsx
import { IonApp, IonRouterOutlet, IonLoading, useIonRouter } from '@ionic/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Registro/Register';
import Profile from './pages/Perfil/Profile';
import Reservas from './pages/Reservas/Reservas';
import ManageCourts from './pages/ManageCourts/ManageCourts';
import ManageUsers from './pages/ManageUsers/ManageUsers';
import ManageClubs from './pages/ManageClubs/ManageClubs';
import CalendarView from './pages/Calendario/CalendarView';
import MarcadorControl from './pages/Marcador/MarcadorControl';
import MarcadorPantalla from './pages/Marcador/MarcadorPantalla';
import Configuracion from './pages/Configuracion/Configuracion';
import Pay from './pages/Pago/Pay';

// Páginas del Administrador Supremo (solo para rutas que mantienen el prefijo /admin/)
import AdminSystemReports from './pages/Admin/Admin_Ticket/Admin_Ticket';
import AdminSystemConfig from './pages/Admin/Admin_Config/Admin_Config';
import AdminSolicitudesClub from './pages/Admin/Admin_SolicitudesClub/Admin_SolicitudesClub';
import SolicitarClub from './pages/SolicitarClub/SolicitarClub';

// Páginas de Torneos y Ligas
import Torneos from './pages/Torneos/Torneos';
import TorneoDetalle from './pages/Torneos/TorneoDetalle';
import Ligas from './pages/Ligas/Ligas';
import LigaDetalle from './pages/Ligas/LigaDetalle';

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

  if (isLoading) return <IonLoading isOpen={true} message="Autenticando..." />;
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

  if (isLoading) return <IonLoading isOpen={true} message="Verificando permisos..." />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Verificar por role (string) en lugar de id_rol
  if (user && roles.includes(user.role.toUpperCase())) return element;
  
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
  const { isAuthenticated, user } = useAuth();

  // Función para determinar la ruta por defecto según el rol
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return '/home'; // Ahora todos van a /home, que internamente decide qué mostrar
  };

  return (
    <IonApp>
      <BrowserRouter>
        <FocusManager />
        <IonRouterOutlet>
          <Routes>
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />} 
            />

            {/* Rutas privadas generales - ahora todas usan lógica condicional interna */}
            <Route path="/home" element={<PrivateRoute element={<MainLayout><Home /></MainLayout>} />} />
            <Route path="/manage-users" element={<PrivateRoute element={<MainLayout><ManageUsers /></MainLayout>} />} />
            <Route path="/manage-clubs" element={<PrivateRoute element={<MainLayout><ManageClubs /></MainLayout>} />} />
            <Route path="/calendar" element={<PrivateRoute element={<MainLayout><CalendarView /></MainLayout>} />} />
            <Route path="/profile" element={<PrivateRoute element={<MainLayout><Profile /></MainLayout>} />} />
            <Route path="/configuracion" element={<PrivateRoute element={<MainLayout><Configuracion /></MainLayout>} />} />
            <Route path="/reservas" element={<PrivateRoute element={<MainLayout><Reservas /></MainLayout>} />} />
            <Route path="/manage-courts" element={<PrivateRoute element={<MainLayout><ManageCourts /></MainLayout>} />} />
            <Route path="/marcador-control" element={<PrivateRoute element={<MarcadorControl />} />} />
            <Route path="/marcador-pantalla" element={<PrivateRoute element={<MarcadorPantalla />} />} />
            <Route path="/club/marcador" element={<MarcadorPantalla />} />
            <Route path="/marcador" element={<PrivateRoute element={<Estructura><MarcadorControl /></Estructura>} />} />
            <Route path="/solicitar-club" element={<PrivateRoute element={<MainLayout><SolicitarClub /></MainLayout>} />} />

            {/* Rutas específicas del Administrador Supremo que mantienen el prefijo /admin/ */}
            <Route 
              path="/admin/system-reports" 
              element={<RoleRoute roles={['ADMIN']} element={<MainLayout><AdminSystemReports /></MainLayout>} />} 
            />
            <Route 
              path="/admin/system-config" 
              element={<RoleRoute roles={['ADMIN']} element={<MainLayout><AdminSystemConfig /></MainLayout>} />} 
            />
            <Route 
              path="/admin/solicitudes-club" 
              element={<RoleRoute roles={['ADMIN']} element={<MainLayout><AdminSolicitudesClub /></MainLayout>} />} 
            />

            {/* Rutas de Torneos */}
            <Route path="/torneos" element={<PrivateRoute element={<MainLayout><Torneos /></MainLayout>} />} />
            <Route path="/torneos/:id" element={<PrivateRoute element={<MainLayout><TorneoDetalle /></MainLayout>} />} />

            {/* Rutas de Ligas */}
            <Route path="/ligas" element={<PrivateRoute element={<MainLayout><Ligas /></MainLayout>} />} />
            <Route path="/ligas/:id" element={<PrivateRoute element={<MainLayout><LigaDetalle /></MainLayout>} />} />

            {/* Ruta pública de pago */}
            <Route path="/pay" element={ <Elements stripe={stripePromise}> <Pay /></Elements>}/>

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to={getDefaultRoute()} />} />

            {/* Redirecciones para compatibilidad hacia atrás */}
            <Route path="/admin/dashboard" element={<Navigate to="/home" />} />
            <Route path="/admin/manage-clubs" element={<Navigate to="/manage-clubs" />} />
            <Route path="/admin/manage-all-users" element={<Navigate to="/manage-users" />} />
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