/**
 * APP.TSX - COMPONENTE RAÍZ DE LA APLICACIÓN PLAY4PADEL
 * 
 * Este archivo contiene la configuración principal del routing, autenticación y layout
 * de la aplicación. Define todas las rutas públicas y privadas, así como los componentes
 * de protección de rutas basados en roles de usuario.
 */

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

// Páginas del Administrador (gestión de solicitudes de clubes)
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

/**
 * CONFIGURACIÓN DE STRIPE
 * 
 * Inicializamos Stripe con la clave pública para procesar pagos.
 * Esta clave es de prueba y debe ser reemplazada en producción.
 */
const stripePromise = loadStripe('pk_test_51RBDLF2MsbKNiz9B2Wol9ZvHjbvYvhMjVwkQPOvZmBEeyRGBFPAFgkGAhBOzD4FSq1kMxZgjYJGTm9fFhfJuMdA300Vt5jJ7m4');

/**
 * COMPONENTE PARA RUTAS PRIVADAS
 * 
 * Este componente protege las rutas que requieren autenticación.
 * Verifica si el usuario está autenticado y redirige al login si no lo está.
 */
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostramos un loading mientras se verifica la autenticación
  if (isLoading) return <IonLoading isOpen={true} message="Autenticando..." />;
  
  // Renderizamos el componente si está autenticado, sino redirigimos al login
  return isAuthenticated ? element : <Navigate to="/login" />;
};

/**
 * COMPONENTE PARA RUTAS CON ROLES ESPECÍFICOS
 * 
 * Este componente protege las rutas que requieren roles específicos de usuario.
 * Verifica tanto la autenticación como los permisos de rol.
 */
const RoleRoute = ({
  element,
  roles
}: {
  element: JSX.Element;
  roles: string[];
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostramos loading mientras se verifican los permisos
  if (isLoading) return <IonLoading isOpen={true} message="Verificando permisos..." />;
  
  // Redirigimos al login si no está autenticado
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Verificamos si el rol del usuario está en la lista de roles permitidos
  if (user && roles.includes(user.role.toUpperCase())) return element;
  
  // Si no tiene permisos, redirigimos al home
  return <Navigate to="/home" />;
};

/**
 * COMPONENTE PARA MANEJAR EL FOCO AL CAMBIAR DE RUTA
 * 
 * Este componente gestiona el foco de los elementos cuando se cambia de ruta,
 * mejorando la accesibilidad y evitando problemas de navegación con teclado.
 */
const FocusManager: React.FC = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
    // Función que quita el foco del elemento activo al cambiar de ruta
    const handleRouteChange = () => {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
    };

    // Ejecutamos al montar el componente
    handleRouteChange();
    
    // Escuchamos los cambios de ruta de Ionic
    document.addEventListener('ionRouterOutletActivated', handleRouteChange);

    // Limpiamos el event listener al desmontar
    return () => {
      document.removeEventListener('ionRouterOutletActivated', handleRouteChange);
    };
  }, [ionRouter]);

  return null;
};

/**
 * LAYOUT PRINCIPAL PARA PÁGINAS CON CABECERA Y BARRA LATERAL
 * 
 * Este componente envuelve las páginas principales de la aplicación
 * con la estructura común (header, sidebar, contenido principal).
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="main-content">
    <Estructura>
      {children}
    </Estructura>
  </div>
);

/**
 * ESTILOS BÁSICOS PARA EL LAYOUT
 * 
 * Definimos estilos básicos para el contenedor principal.
 * Estos estilos se inyectan directamente en el head del documento.
 */
const styles = `
  .main-content {
    display: flex;
    height: calc(100vh - 60px);
  }
`;

// Inyectamos los estilos en el head del documento
document.head.appendChild(document.createElement('style')).textContent = styles;

/**
 * COMPONENTE PRINCIPAL DE CONTENIDO DE LA APLICACIÓN
 * 
 * Este componente contiene toda la lógica de routing y navegación.
 * Define las rutas públicas, privadas y con restricción de roles.
 */
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  /**
   * FUNCIÓN PARA DETERMINAR LA RUTA POR DEFECTO
   * 
   * Determina a qué ruta redirigir al usuario según su estado de autenticación.
   * Todos los usuarios autenticados van a /home, que internamente decide qué mostrar.
   */
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return '/home';
  };

  return (
    <IonApp>
      <BrowserRouter>
        <FocusManager />
        <IonRouterOutlet>
          <Routes>
            {/* RUTAS PÚBLICAS - Accesibles sin autenticación */}
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />} 
            />

            {/* RUTAS PRIVADAS GENERALES - Requieren autenticación */}
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

            {/* RUTA DE SOLICITUDES DE CLUB - Solo para administradores */}
            <Route 
              path="/solicitudes-club" 
              element={<RoleRoute roles={['ADMIN']} element={<MainLayout><ManageClubs /></MainLayout>} />} 
            />

            {/* RUTAS DE TORNEOS - Gestión de torneos y competiciones */}
            <Route path="/torneos" element={<PrivateRoute element={<MainLayout><Torneos /></MainLayout>} />} />
            <Route path="/torneos/:id" element={<PrivateRoute element={<MainLayout><TorneoDetalle /></MainLayout>} />} />

            {/* RUTAS DE LIGAS - Gestión de ligas y clasificaciones */}
            <Route path="/ligas" element={<PrivateRoute element={<MainLayout><Ligas /></MainLayout>} />} />
            <Route path="/ligas/:id" element={<PrivateRoute element={<MainLayout><LigaDetalle /></MainLayout>} />} />

            {/* RUTA PÚBLICA DE PAGO - Integración con Stripe */}
            <Route path="/pay" element={ <Elements stripe={stripePromise}> <Pay /></Elements>}/>

            {/* REDIRECCIÓN POR DEFECTO */}
            <Route path="/" element={<Navigate to={getDefaultRoute()} />} />

            {/* REDIRECCIONES PARA COMPATIBILIDAD HACIA ATRÁS */}
            <Route path="/admin/dashboard" element={<Navigate to="/home" />} />
            <Route path="/admin/manage-clubs" element={<Navigate to="/manage-clubs" />} />
            <Route path="/admin/manage-all-users" element={<Navigate to="/manage-users" />} />
            <Route path="/admin/solicitudes-club" element={<Navigate to="/solicitudes-club" />} />
          </Routes>
        </IonRouterOutlet>
      </BrowserRouter>
    </IonApp>
  );
};

/**
 * COMPONENTE RAÍZ DE LA APLICACIÓN
 * 
 * Envuelve toda la aplicación con los proveedores de contexto necesarios:
 * - AuthProvider: Gestiona el estado de autenticación global
 * - ThemeProvider: Gestiona el tema (claro/oscuro) de la aplicación
 */
const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </AuthProvider>
);

export default App;