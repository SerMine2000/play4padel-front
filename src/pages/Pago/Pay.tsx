import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/react';
import { documentTextOutline, checkmarkCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import './Pagos.css';

const Pay: React.FC = () => {

  interface DatosReserva {
    reserva_id: number;  // ✅ AÑADIR RESERVA_ID
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

  // ✅ VALIDAR QUE TENEMOS LOS DATOS NECESARIOS
  if (!location.state) {
    console.error('No hay datos de reserva. Redirigiendo a reservas...');
    setTimeout(() => navigate('/reservas'), 1000);
    return <div>No hay datos de reserva. Redirigiendo...</div>;
  }

  const { reserva_id, id_pista, fecha, hora_inicio, hora_fin, precio } = (location.state as DatosReserva);

  // ✅ VALIDAR CAMPOS CRÍTICOS
  if (!reserva_id || !precio) {
    console.error('Faltan datos críticos:', { reserva_id, precio });
    setTimeout(() => navigate('/reservas'), 1000);
    return <div>Error: faltan datos de la reserva. Redirigiendo...</div>;
  }

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [historialDisponible, setHistorialDisponible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [codigoPostal, setCodigoPostal] = useState('');
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        if (!user?.id) {
          console.log('No hay usuario logueado, omitiendo carga de historial');
          return;
        }
        
        console.log('Intentando cargar historial de pagos para usuario:', user.id);
        
        // Usar el endpoint del backend
        const response = await apiService.get(`/pagos/usuario/${user.id}`);
        console.log('Historial de pagos cargado:', response);
        setPaymentHistory(response || []);
        
      } catch (error) {
        console.warn('No se pudo cargar el historial de pagos (esto no afecta el pago actual):', error);
        setHistorialDisponible(false);
        
        // Usar datos de muestra solo para mostrar la interfaz
        setPaymentHistory([
          { id: 'demo1', date: '15/05/2025', amount: '25,00 €', concept: 'Reserva Pista 3', status: 'success' },
          { id: 'demo2', date: '02/05/2025', amount: '25,00 €', concept: 'Reserva Pista 1', status: 'success' },
        ]);
        
        // Mostrar una nota informativa sin bloquear la funcionalidad
        console.info('💡 Tip: Para ver tu historial real de pagos, asegúrate de que el backend esté ejecutándose en http://localhost:5000');
      }
    };

    fetchPaymentHistory();
  }, [user]);

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

    console.log('Enviando al backend:', { amount: precio, reserva_id });

    setIsLoading(true);
    try {
      const response = await apiService.post('/crear-pago', {
        amount: precio,          // ✅ FORMATO CORRECTO
        reserva_id: reserva_id   // ✅ FORMATO CORRECTO
      });

      console.log('Respuesta del backend:', response);

      const clientSecret = response.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            address: {
              postal_code: codigoPostal
            }
          }
        }
      });      
      if (result.error) {
        showToast(`Error en el pago: ${result.error.message}`, 'danger');
      } else if (result.paymentIntent.status === 'succeeded') {
        showToast('Pago realizado correctamente', 'success');
        setCodigoPostal(''); // Limpiar código postal
        setTimeout(() => navigate('/reservas'), 2000);
      }
    } catch (error) {
      console.error('Error al procesar el pago, comprueba si tu sesión expiró', error);
      showToast('Ha ocurrido un error al procesar el pago.', 'danger');
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
                  <label className="form-label">Importe</label>
                  <p>{precio} €</p>
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

                <div className="form-group">
                  <label className="form-label">Código Postal (opcional)</label>
                  <input
                    type="text"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    placeholder="12345"
                    className="form-input"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <button className="payment-btn" disabled={isLoading} type="submit">
                  {isLoading ? 'Procesando...' : 'Realizar pago'}
                  {!isLoading && <IonIcon icon={checkmarkCircleOutline} className="payment-icon-small" />}
                </button>
              </form>
            </div>


  
          {/* Historial de pagos */}
          <div className="payment-history">
            <h2 className="section-title">
              Historial de pagos
              {!historialDisponible && (
                <span style={{ fontSize: '0.8em', color: '#ff9500', marginLeft: '10px' }}>
                  (Datos de ejemplo - Servidor no disponible)
                </span>
              )}
            </h2>
  
            {paymentHistory.length > 0 ? (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td data-label="Fecha">{payment.date}</td>
                      <td data-label="Concepto">{payment.concept}</td>
                      <td data-label="Importe">{payment.amount}</td>
                      <td data-label="Estado">
                        <span className={`payment-status status-${payment.status}`}>
                          {payment.status === 'success' ? 'Completado' :
                            payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                        </span>
                      </td>
                      <td data-label="Factura">
                        {payment.status === 'success' && (
                          <span className="payment-action">
                            <IonIcon icon={documentTextOutline} /> Ver
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay pagos registrados.</p>
            )}
          </div>
        </div>
  
        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast({ ...toast, show: false })}
          message={toast.message}
          duration={2000}
          color={toast.color}
        />
      </IonContent>
    </IonPage>
  );
};

export default Pay;