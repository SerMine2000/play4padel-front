// Pay.tsx con integración Stripe completa
import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import "../../theme/variables.css";

const stripePromise = loadStripe('pk_test_51RBDLF2MsbKNiz9B2Wol9ZvHjbvYvhMjVwkQPOvZmBEeyRGBFPAFgkGAhBOzD4FSq1kMxZgjYJGTm9fFhfJuMdA300Vt5jJ7m4');

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CheckoutForm: React.FC<{ reservaId: number; precio: number }> = ({ reservaId, precio }) => {
  const stripe = useStripe();
  const elements = useElements();
  const history = useHistory();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    const crearIntent = async () => {
      try {
        // Usar el backend en la nube definido en API_URL
        const { API_URL } = await import('../../utils/constants');
        const res = await axios.post(`${API_URL}/crear-pago`, {
          amount: precio,
          reserva_id: reservaId,
        });
        setClientSecret(res.data.clientSecret);
      } catch (error) {
        console.error('Error creando PaymentIntent:', error);
        setToast('Error al iniciar el pago');
      } finally {
        setLoading(false);
      }
    };
    crearIntent();
  }, [precio, reservaId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!stripe || !elements || !clientSecret) {
      return;
    }
  
    setLoading(true);
  
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });
      if (result.error) {
        setToast(result.error.message || 'Error al procesar el pago');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        setToast('Pago realizado con éxito');
        setTimeout(() => {
          history.replace('/home');
        }, 1800); // Espera a que el usuario vea el toast
      } else {
        setToast('No se pudo completar el pago');
      }
    } catch (err: any) {
      if (err.message?.includes("Failed to fetch")) {
        console.warn("Stripe tracking blocked por el navegador.");
      } else {
        console.error(err);
        setToast('Error al procesar el pago');
      }
    }
    setLoading(false);
  };


  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        Pagar {precio.toFixed(2)} €
      </button>
      <IonLoading isOpen={loading} message="Procesando pago..." />
      <IonToast isOpen={!!toast} message={toast} duration={2000} color="success" onDidDismiss={() => setToast('')} />
    </form>
  );
};

const Pay: React.FC = () => {
  const query = useQuery();
  const reservaId = Number(query.get('reservaId'));
  const precio = Number(query.get('precio'));

  if (!reservaId || !precio) {
    return (
      <IonPage>
        <IonContent>
          <p>No se ha podido cargar la información de la reserva.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent>
        <Elements stripe={stripePromise}>
          <CheckoutForm reservaId={reservaId} precio={precio} />
        </Elements>
      </IonContent>
    </IonPage>
  );
};

export default Pay;
