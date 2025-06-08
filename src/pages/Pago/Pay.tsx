import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  arrowBackOutline, 
  receiptOutline, 
  cardOutline,
  shieldCheckmarkOutline,
  timeOutline,
  calendarOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { 
  useStripe, 
  useElements, 
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import './Pagos.css';

const Pay: React.FC = () => {

  interface DatosReserva {
    reserva_id: number;
    id_pista: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    precio: number;
  }

  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, message: '', color: 'success' as 'success' | 'danger' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar tema actual para CardElements
  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDarkMode(htmlElement.classList.contains('ion-palette-dark'));
    };
    
    checkTheme();
    
    // Observar cambios en el tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const showToast = (message: string, color: 'success' | 'danger') => {
    setToast({ show: true, message, color });
  };

  // ✅ VALIDAR QUE TENEMOS LOS DATOS NECESARIOS
  if (!location.state) {
    console.error('No hay datos de reserva. Redirigiendo a inicio...');
    setTimeout(() => navigate('/home'), 1000);
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ion-text-color)' }}>
            No hay datos de reserva. Redirigiendo...
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { reserva_id, id_pista, fecha, hora_inicio, hora_fin, precio } = (location.state as DatosReserva);

  // ✅ VALIDAR CAMPOS CRÍTICOS
  if (!reserva_id || !precio) {
    console.error('Faltan datos críticos:', { reserva_id, precio });
    setTimeout(() => navigate('/home'), 1000);
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ion-text-color)' }}>
            Error: faltan datos de la reserva. Redirigiendo...
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular duración de la reserva
  const calcularDuracion = () => {
    const inicio = new Date(`2000-01-01 ${hora_inicio}`);
    const fin = new Date(`2000-01-01 ${hora_fin}`);
    const diferencia = fin.getTime() - inicio.getTime();
    const horas = diferencia / (1000 * 60 * 60);
    return horas === 1 ? '1 hora' : `${horas} horas`;
  };

  const procesarPago = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      showToast('El usuario no está autenticado.', 'danger');
      return;
    }

    if (!stripe || !elements) {
      showToast('Stripe no está listo.', 'danger');
      return;
    }

    // ✅ VALIDAR QUE LOS ELEMENTOS DE LA TARJETA ESTÉN DISPONIBLES
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      showToast('El formulario de tarjeta no está listo. Recarga la página e inténtalo de nuevo.', 'danger');
      return;
    }

    // ✅ VALIDAR DATOS CRÍTICOS ANTES DE PROCESAR
    if (!reserva_id || !precio) {
      showToast('Faltan datos de la reserva. Regresa y vuelve a intentar.', 'danger');
      console.error('Datos faltantes:', { reserva_id, precio });
      return;
    }

    console.log('🔄 Iniciando proceso de pago...', { amount: precio, reserva_id });

    setIsLoading(true);
    try {
      // ✅ PASO 1: Crear PaymentIntent en el backend
      const response = await apiService.post('/crear-pago', {
        amount: precio,          
        reserva_id: reserva_id   
      });

      console.log('✅ PaymentIntent creado:', response);

      const clientSecret = response.clientSecret;

      // ✅ PASO 2: Confirmar el pago con Stripe usando CardNumberElement
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: user.nombre || user.email || 'Cliente'
          }
        }
      });      
      
      if (result.error) {
        console.error('❌ Error en el pago:', result.error);
        showToast(`Error en el pago: ${result.error.message}`, 'danger');
      } else if (result.paymentIntent.status === 'succeeded') {
        console.log('✅ Pago exitoso, confirmando reserva...');
        
        // ✅ PASO 3: CONFIRMAR LA RESERVA EN EL BACKEND SOLO SI EL PAGO FUE EXITOSO
        try {
          const confirmarResponse = await apiService.put(`/confirmar-reserva/${reserva_id}`, {
            payment_intent_id: result.paymentIntent.id,
            estado: 'confirmada'
          });
          
          console.log('✅ Reserva confirmada exitosamente:', confirmarResponse);
          showToast('¡Pago realizado y reserva confirmada correctamente!', 'success');
          
          // Redirigir a home después del éxito
          setTimeout(() => navigate('/home'), 2500);
          
        } catch (confirmarError) {
          console.error('❌ Error al confirmar la reserva:', confirmarError);
          showToast('Pago exitoso, pero error al confirmar la reserva. Contacta con soporte.', 'danger');
        }
        
      } else {
        console.error('❌ Estado de pago inesperado:', result.paymentIntent.status);
        showToast('Estado de pago inesperado. Verifica tu tarjeta e inténtalo de nuevo.', 'danger');
      }
    } catch (error) {
      console.error('❌ Error crítico al procesar el pago:', error);
      showToast('Ha ocurrido un error al procesar el pago. Inténtalo de nuevo.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración dinámica para elementos de tarjeta basada en el tema
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDarkMode ? '#f0f0f0' : '#000000',
        backgroundColor: 'transparent',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': { 
          color: isDarkMode ? '#888888' : '#666666'
        },
        iconColor: isDarkMode ? '#f0f0f0' : '#000000',
      },
      invalid: { 
        color: '#ff4d4d',
        iconColor: '#ff4d4d'
      },
      complete: {
        color: isDarkMode ? '#f0f0f0' : '#000000', // Quitar color rosa, usar color normal
        iconColor: isDarkMode ? '#00FF66' : '#6129f0'
      }
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="pagos-container">
          <div className="pagos-content-wrapper">
            
            {/* Header */}
            <div className="pagos-header">
              <IonIcon
                icon={arrowBackOutline}
                className="back-button"
                onClick={() => navigate(-1)}
              />
              <div className="pagos-header-content">
                <h1 className="pagos-title">Finalizar reserva</h1>
                <p className="pagos-description">
                  Revisa los detalles y completa tu pago de forma segura
                </p>
              </div>
            </div>

            {/* Layout principal - 2 columnas en desktop, 1 en móvil */}
            <div className="payment-layout">
              
              {/* COLUMNA IZQUIERDA: Resumen de la reserva */}
              <div className="reserva-summary">
                <h2 className="summary-title">
                  <IonIcon icon={receiptOutline} />
                  Resumen de tu reserva
                </h2>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="summary-label">
                      <IonIcon icon={calendarOutline} />
                      Fecha
                    </span>
                    <span className="summary-value">{formatearFecha(fecha)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      <IonIcon icon={timeOutline} />
                      Horario
                    </span>
                    <span className="summary-value">{hora_inicio} - {hora_fin}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Duración</span>
                    <span className="summary-value">{calcularDuracion()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Pista</span>
                    <span className="summary-value">Pista #{id_pista}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Total a pagar</span>
                    <span className="summary-value summary-total">{precio.toFixed(2)}€</span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="summary-info">
                  <h3 className="summary-info-title">
                    <IonIcon icon={informationCircleOutline} />
                    Información importante
                  </h3>
                  <p className="summary-info-text">
                    • Tu reserva será confirmada inmediatamente tras el pago<br/>
                    • Recibirás una confirmación por email<br/>
                    • Podrás gestionar tu reserva desde tu panel de usuario<br/>
                    • Política de cancelación: 24 horas antes sin coste
                  </p>
                </div>
              </div>

              {/* COLUMNA DERECHA: Formulario de pago */}
              <div className="payment-form">
                <h2 className="payment-form-title">
                  <IonIcon icon={cardOutline} />
                  Datos de pago
                </h2>
                
                <form onSubmit={procesarPago}>
                  <div className="card-details-grid">
                    <div className="form-group">
                      <label className="form-label">Número de tarjeta</label>
                      <CardNumberElement options={cardElementOptions} />
                    </div>

                    <div className="card-row">
                      <div className="form-group">
                        <label className="form-label">Fecha de vencimiento</label>
                        <CardExpiryElement options={cardElementOptions} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Código de seguridad</label>
                        <CardCvcElement options={cardElementOptions} />
                      </div>
                    </div>
                  </div>

                  <button className="payment-btn" disabled={isLoading} type="submit">
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        <IonIcon icon={checkmarkCircleOutline} className="payment-icon-small" />
                        Pagar {precio.toFixed(2)}€
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Información de seguridad - ocupa todo el ancho */}
            <div className="security-info">
              <p className="security-text">
                <IonIcon icon={shieldCheckmarkOutline} className="security-icon" />
                Tu pago está protegido por cifrado SSL de 256 bits y procesado por Stripe. 
                No almacenamos los datos de tu tarjeta en nuestros servidores.
              </p>
            </div>

          </div>
        </div>
  
        {/* SOLO UN TOAST - ELIMINADO IonLoading duplicado */}
        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast({ ...toast, show: false })}
          message={toast.message}
          duration={3000}
          color={toast.color}
        />
      </IonContent>
    </IonPage>
  );
};

export default Pay;