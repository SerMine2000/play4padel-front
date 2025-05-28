import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/react';
import { checkmarkCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
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
  const showToast = (message: string, color: 'success' | 'danger') => {
    setToast({ show: true, message, color });
  };

  const [isLoading, setIsLoading] = useState(false);

  // ✅ VALIDAR QUE TENEMOS LOS DATOS NECESARIOS
  if (!location.state) {
    console.error('No hay datos de reserva. Redirigiendo a inicio...');
    setTimeout(() => navigate('/home'), 1000);
    return <div>No hay datos de reserva. Redirigiendo...</div>;
  }

  const { reserva_id, id_pista, fecha, hora_inicio, hora_fin, precio } = (location.state as DatosReserva);

  // ✅ VALIDAR CAMPOS CRÍTICOS
  if (!reserva_id || !precio) {
    console.error('Faltan datos críticos:', { reserva_id, precio });
    setTimeout(() => navigate('/home'), 1000);
    return <div>Error: faltan datos de la reserva. Redirigiendo...</div>;
  }

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

    // ✅ VALIDAR QUE EL ELEMENTO DE LA TARJETA ESTÉ DISPONIBLE
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
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

      // ✅ PASO 2: Confirmar el pago con Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // Sin código postal
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
          setTimeout(() => navigate('/home'), 2000);
          
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

  return (
    <IonPage>
      <IonContent>
        <div className="pagos-container">
          <div className="pagos-header">

            {/* Botón de retroceso */}
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '24px', cursor: 'pointer', marginRight: '10px' }} onClick={() => navigate(-1)} />

            <h1 className="pagos-title">Proceso de pago</h1>
            <p className="pagos-description">Realización del pago mediante tarjeta bancaria</p>
          </div>
  
          {/* Formulario de pago */}
          <div className="payment-form">
            <form onSubmit={procesarPago}>
              <div className="form-group">
                <label className="form-label">Importe a pagar</label>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#4CAF50' }}>{precio}€</p>
              </div>

              <div className="form-group">
                <label className="form-label">Datos de la tarjeta</label>
                <div className="form-input">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#ffffff',
                          '::placeholder': { color: '#aaaaaa' }
                        },
                        invalid: { color: '#ff6b6b' }
                      }
                    }}
                  />
                </div>
              </div>

              <button className="payment-btn" disabled={isLoading} type="submit">
                {isLoading ? 'Procesando pago...' : `Pagar ${precio}€`}
                {!isLoading && <IonIcon icon={checkmarkCircleOutline} className="payment-icon-small" />}
              </button>
            </form>

            <div className="payment-info" style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
              <h4>ℹ️ Información del pago</h4>
              <ul style={{ fontSize: '14px', color: '#ccc' }}>
                <li>✅ Pago seguro con Stripe</li>
                <li>✅ La reserva solo se confirmará si el pago es exitoso</li>
                <li>✅ Recibirás confirmación inmediata</li>
                <li>❌ Sin guardar datos de tarjeta</li>
              </ul>
            </div>
          </div>
        </div>
  
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
