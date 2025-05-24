import React from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const JwtTestComponent: React.FC = () => {
  const { user, token, refreshToken, isAuthenticated, refreshAccessToken } = useAuth();

  const testTokenValidation = async () => {
    try {
      console.log('🧪 Probando validación de token...');
      
      // Verificar que tengamos un token
      if (!token) {
        console.log('❌ No hay token disponible');
        return;
      }

      // Hacer una llamada que requiera autenticación
      const response = await fetch('http://localhost:5000/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token válido:', data);
      } else {
        console.log('❌ Token inválido:', response.status);
      }
    } catch (error) {
      console.error('💥 Error en test de token:', error);
    }
  };

  const testTokenRefresh = async () => {
    try {
      console.log('🔄 Probando refresh de token...');
      await refreshAccessToken();
      console.log('✅ Token refrescado exitosamente');
    } catch (error) {
      console.error('❌ Error al refrescar token:', error);
    }
  };

  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub,
        exp: new Date(payload.exp * 1000).toLocaleString(),
        iat: new Date(payload.iat * 1000).toLocaleString()
      };
    } catch {
      return null;
    }
  };

  const tokenInfo = token ? decodeToken(token) : null;

  if (!isAuthenticated) {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>🔒 JWT Test Component</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="warning">
            Usuario no autenticado. Inicia sesión para probar el sistema JWT.
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>🔓 JWT Test Component</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ marginBottom: '20px' }}>
          <h4>👤 Usuario Autenticado:</h4>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Nombre:</strong> {user?.nombre} {user?.apellidos}</p>
          <p><strong>Rol:</strong> {user?.role}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>🎫 Información del Token:</h4>
          {tokenInfo && (
            <>
              <p><strong>Usuario ID:</strong> {tokenInfo.userId}</p>
              <p><strong>Emitido:</strong> {tokenInfo.iat}</p>
              <p><strong>Expira:</strong> {tokenInfo.exp}</p>
            </>
          )}
          <p><strong>Tiene Access Token:</strong> {token ? '✅ Sí' : '❌ No'}</p>
          <p><strong>Tiene Refresh Token:</strong> {refreshToken ? '✅ Sí' : '❌ No'}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <IonButton onClick={testTokenValidation} color="primary">
            🧪 Probar Token
          </IonButton>
          <IonButton onClick={testTokenRefresh} color="secondary">
            🔄 Refrescar Token
          </IonButton>
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p><strong>Instrucciones:</strong></p>
          <ul>
            <li>🧪 <strong>Probar Token:</strong> Valida que el token actual sea válido</li>
            <li>🔄 <strong>Refrescar Token:</strong> Obtiene un nuevo access_token usando el refresh_token</li>
            <li>📋 Revisa la consola del navegador para ver los logs detallados</li>
          </ul>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default JwtTestComponent;
