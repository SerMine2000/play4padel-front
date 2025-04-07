import { 
  IonPage, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonLoading,
  IonText,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { refreshOutline, closeOutline } from 'ionicons/icons';
import axios from 'axios';

// Usar la implementación más robusta de MarcadorView
import MarcadorView from '../pages/MarcadorView';
import './css/MarcadorView.css';

/**
 * Página de visualización del marcador en pantalla completa.
 * Esta página está optimizada para ser mostrada en una pantalla secundaria
 * o en modo kiosko para que los jugadores y espectadores puedan ver el marcador.
 */
const MarcadorPantalla: React.FC = () => {
  // Estado del marcador con valores iniciales seguros
  const [estado, setEstado] = useState<any>({
    puntos: { A: 0, B: 0 },
    juegos: { A: 0, B: 0 },
    sets: [{ A: 0, B: 0 }],
    tie_break: false,
    terminado: false
  });
  
  // Estados de UI
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  /**
   * Obtiene el estado actual del marcador desde el servidor
   */
  const fetchEstado = async () => {
    try {
      setCargando(true);
      setError(null);
      console.log('Solicitando datos del marcador para pantalla...');
      
      // Esta URL debe coincidir con la configuración del proxy en vite.config.ts
      const url = '/marcador';
      console.log('URL de la solicitud:', url);
      
      const res = await axios.get(url);
      console.log('Datos recibidos para pantalla:', res.data);
      
      if (res.data) {
        // Asegurar que el estado tiene la estructura esperada
        const estadoSeguro = {
          puntos: res.data.puntos || { A: 0, B: 0 },
          juegos: res.data.juegos || { A: 0, B: 0 },
          sets: res.data.sets && res.data.sets.length > 0 ? 
                res.data.sets : [{ A: 0, B: 0 }],
          tie_break: Boolean(res.data.tie_break),
          terminado: Boolean(res.data.terminado)
        };
        
        setEstado(estadoSeguro);
        setLastUpdate(new Date());
      } else {
        setError('No se recibieron datos del servidor');
      }
    } catch (err: any) {
      console.error('Error al obtener el marcador:', err);
      console.error('Detalles del error:', err.response || err.message);
      setError(`Error al obtener datos del marcador: ${err.message || 'Error desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Función para refrescar manualmente el marcador
   */
  const refreshMarcador = () => {
    fetchEstado();
  };

  /**
   * Función para cerrar la ventana (útil cuando se abre en ventana popup)
   */
  const closeWindow = () => {
    window.close();
  };

  // Efecto para cargar el marcador al iniciar y cada 2 segundos
  useEffect(() => {
    fetchEstado();
    const interval = setInterval(fetchEstado, 2000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para configurar el comportamiento de pantalla completa
  useEffect(() => {
    // Configurar pantalla completa para mejor visualización
    document.documentElement.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#121212';
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Marcador - Pista 1</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={refreshMarcador}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={closeWindow}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="marcador-pantalla-container" fullscreen>
        <div className="marcador-pantalla" style={{
          backgroundColor: '#121212',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {/* Mostrar indicador de carga si está cargando y no hay datos */}
          {cargando && !estado ? (
            <div className="cargando">
              <IonSpinner name="circles" color="light"/>
              <IonText color="light" style={{ marginTop: '1rem' }}>
                <p>Cargando marcador...</p>
              </IonText>
            </div>
          ) : error ? (
            <div className="error-mensaje" style={{ color: 'white', borderColor: '#eb445a' }}>
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
              <IonButton 
                size="small" 
                fill="clear" 
                color="light" 
                onClick={refreshMarcador}
              >
                <IonIcon slot="start" icon={refreshOutline} />
                Reintentar
              </IonButton>
            </div>
          ) : (
            <MarcadorView estado={estado} estilo="completo" />
          )}
          
          {/* Información de última actualización */}
          {estado && (
            <div className="ultima-actualizacion">
              <IonText color="medium">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </IonText>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MarcadorPantalla;