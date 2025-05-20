import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useHistory } from 'react-router';

// Colores del logo Play4Padel
const primaryPurple = '#2D0A31'; // Púrpura oscuro del fondo del logo
const brightGreen = '#00FF66'; // Verde brillante de la "P" en el logo
const pureWhite = '#FFFFFF'; // Blanco del "4" en el logo

// Estilos inline con colores del logo Play4Padel - TAMAÑOS REDUCIDOS
const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: pureWhite,
  padding: '0.75rem',
  paddingLeft: '2.5rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  outline: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  marginBottom: '0.75rem',
  height: '48px'
};

const labelStyle = { 
  color: pureWhite, 
  marginBottom: '0.25rem',
  marginTop: '0.5rem',
  fontSize: '1rem',
  fontWeight: '500',
  display: 'block'
};

const buttonStyle = { 
  width: '100%',
  padding: '0.75rem 0',
  fontSize: '1rem',
  backgroundColor: brightGreen,
  color: primaryPurple, // Texto oscuro sobre fondo verde
  fontWeight: '600',
  borderRadius: '0.5rem',
  transition: 'all 0.3s ease',
  border: 'none',
  cursor: 'pointer',
  marginTop: '1rem',
  marginBottom: '1rem',
  height: '48px'
};

// Estilos específicos para iconos - SUBIDOS MUCHO MÁS
const iconContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.8rem',
  top: '38%', // Subido mucho más (antes era 45%)
  transform: 'translateY(-50%)',
  color: brightGreen, // Íconos en verde brillante
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '1.25rem',
  width: '1.25rem'
};

const FormularioLogin: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }
    setLoginLoading(true);
    try {
      await login(email, password);
      setFormError('');
      history.replace('/home');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Credenciales incorrectas';
      setFormError(mensaje);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-white text-center mb-2" style={{ color: pureWhite, fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.25rem' }}>
        Iniciar Sesión
      </h2>
      <p className="text-center mb-6" style={{ color: brightGreen, textAlign: 'center', marginBottom: '1.5rem', fontSize: '1rem' }}>
        Accede a tu cuenta para continuar
      </p>
      
      <form onSubmit={handleLogin} className="space-y-4 max-w-3xl mx-auto" style={{ maxWidth: '36rem', margin: '0 auto' }}>
        {/* Input de email con mayor longitud horizontal */}
        <div className="group" style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="email" className="block mb-2 text-lg" style={labelStyle}>
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="correo@ejemplo.com"
            />
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Input de contraseña con mayor longitud horizontal */}
        <div className="group" style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="password" className="block mb-2 text-lg" style={labelStyle}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Mensaje de error con animación */}
        {formError && (
          <div className="bg-red-400 bg-opacity-20 border border-red-400 border-opacity-40 rounded-lg p-4 animate-pulse my-4"
               style={{ 
                 backgroundColor: 'rgba(248, 113, 113, 0.2)', 
                 border: '1px solid rgba(248, 113, 113, 0.4)',
                 borderRadius: '0.5rem',
                 padding: '0.75rem',
                 animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                 marginTop: '0.75rem',
                 marginBottom: '0.75rem',
                 fontSize: '0.875rem'
               }}>
            <p className="text-red-100 text-base" style={{ color: '#fee2e2' }}>{formError}</p>
          </div>
        )}
        
        {/* Botón de inicio de sesión con animación hover */}
        <button
          type="submit"
          disabled={loginLoading}
          style={buttonStyle}
        >
          {loginLoading ? (
            <span className="flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" 
                   style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem', height: '1rem', width: '1rem', color: primaryPurple }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
        
        {/* Enlaces con mejor espaciado y animación */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0"
             style={{ 
               display: 'flex', 
               marginTop: '0.75rem',
               justifyContent: 'space-between',
               gap: '0.75rem',
               fontSize: '0.875rem'
             }}>
          <a href="/register" className="hover:text-white transition-colors hover:underline"
             style={{ color: brightGreen, textDecoration: 'none', transition: 'color 0.3s ease' }}>
            Crear una cuenta
          </a>
          <a href="#" className="hover:text-white transition-colors hover:underline"
             style={{ color: brightGreen, textDecoration: 'none', transition: 'color 0.3s ease' }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </>
  );
};

export default FormularioLogin;