import {
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonIcon, 
  IonBackButton, 
  IonButtons,
  IonLoading,
  IonToast,
  IonText,
  IonSpinner
} from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import { tennisballOutline, refreshOutline, playOutline, addOutline } from 'ionicons/icons';
import axios from 'axios';
import MarcadorView from '../pages/MarcadorView';
import './css/MarcadorView.css';

/**
 * Página de control del marcador.
 * Permite controlar el marcador de un partido, asignando puntos a los equipos,
 * reiniciando el partido y mostrando el marcador en pantalla completa.
 */
const MarcadorControl: React.FC = () => {
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
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<string>('success');
  
  // Referencia a la ventana del marcador
  const marcadorWindowRef = useRef<Window | null>(null);

  /**
   * Obtiene el estado actual del marcador desde el servidor
   */
  const fetchMarcador = async () => {
    try {
      setCargando(true);
      setError(null);
      console.log('Solicitando datos del marcador...');
      
      // Esta URL debe coincidir con la configuración del proxy en vite.config.ts
      const url = '/marcador';
      console.log('URL de la solicitud:', url);
      
      const res = await axios.get(url);
      console.log('Datos recibidos:', res.data);
      
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
        
        // Actualizar la ventana del marcador si está abierta
        if (marcadorWindowRef.current && !marcadorWindowRef.current.closed) {
          marcadorWindowRef.current.postMessage({
            type: 'ACTUALIZAR_MARCADOR',
            data: estadoSeguro
          }, '*');
        }
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
   * Asigna un punto al equipo especificado
   * @param equipo - Equipo al que asignar el punto ('A' o 'B')
   */
  const anotarPunto = async (equipo: 'A' | 'B') => {
    try {
      // Esta URL debe coincidir con la configuración del proxy en vite.config.ts
      const url = '/marcador/punto';
      console.log(`Anotando punto para equipo ${equipo}. URL:`, url);

      const res = await axios.post(url, { equipo });
      console.log('Respuesta al anotar punto:', res.data);
      
      // Actualizar el estado del marcador
      if (res.data) {
        setEstado(res.data);
        
        // Actualizar la ventana del marcador si está abierta
        if (marcadorWindowRef.current && !marcadorWindowRef.current.closed) {
          marcadorWindowRef.current.postMessage({
            type: 'ACTUALIZAR_MARCADOR',
            data: res.data
          }, '*');
        }
      }
      
      mostrarToast(`Punto anotado para el equipo ${equipo}`, 'success');
    } catch (err: any) {
      console.error(`Error al anotar punto para equipo ${equipo}:`, err);
      console.error('Detalles del error:', err.response || err.message);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        mostrarToast(err.response.data.error, 'danger');
      } else {
        setError(`Error al anotar punto para equipo ${equipo}: ${err.message || 'Error desconocido'}`);
        mostrarToast(`Error al anotar punto para equipo ${equipo}`, 'danger');
      }
    }
  };

  /**
   * Reinicia el marcador del partido
   */
  const reiniciar = async () => {
    try {
      // Esta URL debe coincidir con la configuración del proxy en vite.config.ts
      const url = '/marcador/reset';
      console.log('Reiniciando marcador. URL:', url);
      
      const res = await axios.post(url);
      console.log('Respuesta al reiniciar marcador:', res.data);
      
      // Recargar el estado actual
      fetchMarcador();
      
      if (res.data && res.data.message) {
        mostrarToast(res.data.message, 'success');
      } else {
        mostrarToast('Marcador reiniciado correctamente', 'success');
      }
    } catch (err: any) {
      console.error('Error al reiniciar el marcador:', err);
      console.error('Detalles del error:', err.response || err.message);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        mostrarToast(err.response.data.error, 'danger');
      } else {
        setError(`Error al reiniciar el marcador: ${err.message || 'Error desconocido'}`);
        mostrarToast('Error al reiniciar el marcador', 'danger');
      }
    }
  };

  /**
   * Abre una ventana con el marcador en pantalla completa
   */
  const abrirMarcador = () => {
    // Usar la ruta alternativa que sabemos que existe
    const url = `${window.location.origin}/club/marcador`;
    
    // Cerrar la ventana anterior si existe
    if (marcadorWindowRef.current && !marcadorWindowRef.current.closed) {
      marcadorWindowRef.current.close();
    }
    
    // Abrir nueva ventana con opciones de pantalla completa
    marcadorWindowRef.current = window.open(
      url, 
      'marcador', 
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );
    
    // Enviar los datos actuales a la nueva ventana
    if (marcadorWindowRef.current) {
      // Esperar a que la ventana cargue
      setTimeout(() => {
        if (marcadorWindowRef.current) {
          marcadorWindowRef.current.postMessage({
            type: 'ACTUALIZAR_MARCADOR',
            data: estado
          }, '*');
        }
      }, 1000);
    }
  };

  /**
   * Muestra un mensaje toast
   */
  const mostrarToast = (mensaje: string, color: string = 'success') => {
    setToastMessage(mensaje);
    setToastColor(color);
    setShowToast(true);
  };

  // Cerrar la ventana del marcador cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (marcadorWindowRef.current && !marcadorWindowRef.current.closed) {
        marcadorWindowRef.current.close();
      }
    };
  }, []);

  // Efecto para cargar el marcador al iniciar y cada 2 segundos
  useEffect(() => {
    fetchMarcador();
    const interval = setInterval(fetchMarcador, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Gestión de Marcador</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonCard className="marcador-card">
          <IonCardHeader>
            <IonCardTitle>Marcador Pista 1</IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            {/* Siempre muestra algún contenido, incluso durante la carga */}
            {cargando && !estado ? (
              <div className="cargando">
                <IonSpinner name="circles" color="primary"/>
                <IonText color="medium">Cargando marcador...</IonText>
              </div>
            ) : error ? (
              <div className="error-mensaje">
                <IonText color="danger">{error}</IonText>
                <IonButton size="small" onClick={fetchMarcador}>
                  <IonIcon slot="start" icon={refreshOutline} />
                  Reintentar
                </IonButton>
              </div>
            ) : (
              <MarcadorView estado={estado} />
            )}
            
            {/* Controles del marcador */}
            <IonGrid className="ion-padding-top">
              <IonRow>
                <IonCol>
                  <IonButton 
                    expand="block" 
                    color="primary" 
                    size="large"
                    disabled={!estado || estado.terminado} 
                    onClick={() => anotarPunto("A")}
                  >
                    <IonIcon slot="start" icon={addOutline} />
                    Punto Equipo A
                  </IonButton>
                </IonCol>
                <IonCol>
                  <IonButton 
                    expand="block" 
                    color="danger" 
                    size="large"
                    disabled={!estado || estado.terminado}
                    onClick={() => anotarPunto("B")}
                  >
                    <IonIcon slot="start" icon={addOutline} />
                    Punto Equipo B
                  </IonButton>
                </IonCol>
              </IonRow>
              
              <IonRow className="ion-padding-top">
                <IonCol>
                  <IonButton expand="block" color="medium" onClick={reiniciar}>
                    <IonIcon slot="start" icon={refreshOutline} />
                    Reiniciar Partido
                  </IonButton>
                </IonCol>
                <IonCol>
                  <IonButton expand="block" color="success" onClick={abrirMarcador}>
                    <IonIcon slot="start" icon={playOutline} />
                    Mostrar en Pantalla
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        
        {/* Loading y toast para notificaciones */}
        <IonLoading isOpen={cargando && !estado} message="Cargando marcador..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default MarcadorControl;