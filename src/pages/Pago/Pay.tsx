import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { cardOutline, timeOutline, documentTextOutline, checkmarkCircleOutline } from 'ionicons/icons';
import './Pagos.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api.service';

const Pay: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    concept: ''
  });

  useEffect(() => {
    // Cargar historial de pagos
    const fetchPaymentHistory = async () => {
      try {
        // Comentado hasta que exista la API real
        // const response = await apiService.get('/payments/history');
        // setPaymentHistory(response);
        
        // Datos de muestra
        setPaymentHistory([
          { id: 1, date: '15/05/2025', amount: '25,00 €', concept: 'Reserva Pista 3', status: 'success' },
          { id: 2, date: '02/05/2025', amount: '25,00 €', concept: 'Reserva Pista 1', status: 'success' },
          { id: 3, date: '28/04/2025', amount: '50,00 €', concept: 'Torneo Mayo', status: 'pending' },
        ]);
      } catch (error) {
        console.error('Error al cargar el historial de pagos:', error);
      }
    };

    fetchPaymentHistory();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      alert('Por favor, seleccione un método de pago');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulación de procesamiento de pago
      // En producción, aquí se integraría con el backend
      
      // Comentado hasta que exista la API real
      // const response = await apiService.post('/payments/process', {
      //   method: selectedMethod,
      //   amount: formData.amount,
      //   concept: formData.concept
      // });
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Pago procesado correctamente');
      setFormData({ amount: '', concept: '' });
      
      // Recargar historial de pagos
      // fetchPaymentHistory();
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <IonPage>
      <IonContent>
        <div className="pagos-container">
          <div className="pagos-header">
            <h1 className="pagos-title">Pagos</h1>
            <p className="pagos-description">Gestiona tus pagos y revisa tu historial de transacciones</p>
          </div>

          {/* Métodos de pago */}
          <div className="payment-methods">
            <div 
              className={`payment-method-card ${selectedMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <IonIcon icon={cardOutline} className="payment-icon" />
              <span className="payment-method-name">Tarjeta de crédito</span>
            </div>
            
            <div 
              className={`payment-method-card ${selectedMethod === 'transfer' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('transfer')}
            >
              <IonIcon icon={timeOutline} className="payment-icon" />
              <span className="payment-method-name">Transferencia bancaria</span>
            </div>
            
            <div 
              className={`payment-method-card ${selectedMethod === 'paypal' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('paypal')}
            >
              <span className="payment-icon">P</span>
              <span className="payment-method-name">PayPal</span>
            </div>
          </div>

          {/* Formulario de pago */}
          {selectedMethod && (
            <div className="payment-form">
              <h2 className="section-title">Completar pago</h2>
              
              <form onSubmit={handlePaymentSubmit}>
                {selectedMethod === 'card' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Número de tarjeta</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Fecha de expiración</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="MM/AA"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {selectedMethod === 'transfer' && (
                  <div className="form-group">
                    <p>Realiza una transferencia a la siguiente cuenta bancaria:</p>
                    <p><strong>IBAN:</strong> ES91 2100 0418 4502 0005 1332</p>
                    <p><strong>Beneficiario:</strong> Play4Padel S.L.</p>
                    <p><strong>Concepto:</strong> {user?.id || '[Tu número de usuario]'}</p>
                  </div>
                )}
                
                {selectedMethod === 'paypal' && (
                  <div className="form-group">
                    <p>Serás redirigido a PayPal para completar el pago.</p>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Importe</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="25,00 €"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Concepto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Reserva de pista"
                    name="concept"
                    value={formData.concept}
                    onChange={handleInputChange}
                  />
                </div>
                
                <button className="payment-btn" disabled={isLoading} type="submit">
                  {isLoading ? 'Procesando...' : 'Realizar pago'}
                  {!isLoading && <IonIcon icon={checkmarkCircleOutline} className="payment-icon-small" />}
                </button>
              </form>
            </div>
          )}

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
      </IonContent>
    </IonPage>
  );
};

export default Pay;