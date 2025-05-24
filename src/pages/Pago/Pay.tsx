import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/react';
import { documentTextOutline, checkmarkCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { useStripe, useElements, CardElement, CardCvcElement, CardNumberElement, CardExpiryElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import './Pagos.css';

const Pay: React.FC = () => {

  interface DatosReserva {
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

  const { id_pista, fecha, hora_inicio, hora_fin, precio } = (location.state as DatosReserva);

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    numeroTarjeta: '',
    fechaExpiracion: '',
    cvv: '',
    codigoPostal: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', color: 'success' });
  const showToast = (message: string, color: 'success' | 'danger') => {
    setToast({ show: true, message, color });
  };
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await apiService.get('/payments/history');
        setPaymentHistory(response);
      } catch (error) {
        console.error('Error al cargar el historial de pagos:', error);
      }
    };

    fetchPaymentHistory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    setIsLoading(true);
    try {
      const response = await apiService.post('/crear-pago', {
        method: 'card',
        amount: precio,
        reserva: {
          id_usuario: user?.id,
          id_pista,
          fecha,
          hora_inicio,
          hora_fin
        }
      });

      const clientSecret = response.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            address: {
              postal_code: formData.codigoPostal
            }
          }
        }
      });      
      if (result.error) {
        showToast(`Error en el pago: ${result.error.message}`, 'danger');
      } else if (result.paymentIntent.status === 'succeeded') {
        showToast('Pago realizado correctamente', 'success');
        setFormData({ numeroTarjeta: '', fechaExpiracion: '', cvv: '', codigoPostal: '' });
        setTimeout(() => navigate('/login'), 2000);
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

                <button className="payment-btn" disabled={isLoading} type="submit">
                  {isLoading ? 'Procesando...' : 'Realizar pago'}
                  {!isLoading && <IonIcon icon={checkmarkCircleOutline} className="payment-icon-small" />}
                </button>
              </form>
            </div>


  
          {/* Historial de pagos */}
          <div className="payment-history">
            <h2 className="section-title">Historial de pagos</h2>
  
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