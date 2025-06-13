import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';

/**
 * Formulario de autenticación para la aplicación Play4Padel.
 * Maneja el login de usuarios mediante email y contraseña.
 * Incluye validación, manejo de errores y estados de carga.
 */

// Paleta de colores de la identidad corporativa Play4Padel
const primaryPurple = '#2D0A31'; // Púrpura oscuro principal
const brightGreen = '#00FF66'; // Verde brillante característico
const pureWhite = '#FFFFFF'; // Blanco para texto y elementos

/**
 * Estilos para los campos de entrada del formulario.
 * Utiliza un diseño semitransparente con iconos integrados.
 */
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

/**
 * Estilos para las etiquetas de los campos del formulario.
 * Utilizan tipografía blanca con peso medio.
 */
const labelStyle = { 
  color: pureWhite, 
  marginBottom: '0.25rem',
  marginTop: '0.5rem',
  fontSize: '1rem',
  fontWeight: '500',
  display: 'block'
};

/**
 * Estilos para el botón de envío del formulario.
 * Utiliza el verde característico con texto púrpura para contraste.
 */
const buttonStyle = { 
  width: '100%',
  padding: '0.75rem 0',
  fontSize: '1rem',
  backgroundColor: brightGreen,
  color: primaryPurple,
  fontWeight: '600',
  borderRadius: '0.5rem',
  transition: 'all 0.3s ease',
  border: 'none',
  cursor: 'pointer',
  marginTop: '1rem',
  marginBottom: '1rem',
  height: '48px'
};

/**
 * Estilos para los contenedores de iconos dentro de los inputs.
 * Posiciona los iconos en verde brillante dentro de los campos.
 */
const iconContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.8rem',
  top: '38%',
  transform: 'translateY(-50%)',
  color: brightGreen,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '1.25rem',
  width: '1.25rem'
};

/**
 * Componente principal del formulario de login.
 * Gestiona el estado del formulario, validación y proceso de autenticación.
 */
const FormularioLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /**
   * Maneja el envío del formulario de login.
   * Valida los campos, intenta autenticar al usuario y redirige al home si es exitoso.
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validación básica de campos requeridos
    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }
    
    setLoginLoading(true);
    try {
      // Intenta autenticar al usuario
      await login(email, password);
      setFormError('');
      // Redirige al dashboard principal si el login es exitoso
      navigate('/home');
    } catch (err) {
      // Maneja errores de autenticación
      const mensaje = err instanceof Error ? err.message : 'Credenciales incorrectas';
      setFormError(mensaje);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      {/* Encabezado del formulario */}
      <h2 className="text-3xl font-bold text-white text-center mb-2" style={{ color: pureWhite, fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.25rem' }}>
        Iniciar Sesión
      </h2>
      <p className="text-center mb-6" style={{ color: brightGreen, textAlign: 'center', marginBottom: '1.5rem', fontSize: '1rem' }}>
        Accede a tu cuenta para continuar
      </p>
      
      {/* Formulario principal de autenticación */}
      <form onSubmit={handleLogin} className="space-y-4 max-w-3xl mx-auto" style={{ maxWidth: '36rem', margin: '0 auto' }}>
        {/* Campo de email con icono integrado */}
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
            {/* Icono de email dentro del campo */}
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Campo de contraseña con icono integrado */}
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
            {/* Icono de candado dentro del campo */}
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Mensaje de error con animación de pulso */}
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
        
        {/* Botón de envío con estado de carga */}
        <button
          type="submit"
          disabled={loginLoading}
          style={buttonStyle}
        >
          {loginLoading ? (
            <span className="flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Spinner de carga */}
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
        
        {/* Enlaces adicionales */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0"
             style={{ 
               display: 'flex', 
               marginTop: '0.75rem',
               justifyContent: 'space-between',
               gap: '0.75rem',
               fontSize: '0.875rem'
             }}>
          {/* Enlace para crear nueva cuenta */}
          <a href="/register" className="hover:text-white transition-colors hover:underline"
             style={{ color: brightGreen, textDecoration: 'none', transition: 'color 0.3s ease' }}>
            Crear una cuenta
          </a>
        </div>
      </form>
    </>
  );
};

export default FormularioLogin;