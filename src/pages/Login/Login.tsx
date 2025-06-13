import React from 'react';
import FormularioLogin from './FormularioLogin';
import './Login.css';

/**
 * Página de Login de la aplicación Play4Padel.
 * Proporciona una interfaz de autenticación con diseño glassmorphism.
 * Incluye el logo de la aplicación y el formulario de login.
 */

// Colores de la identidad visual de Play4Padel
const primaryPurple = '#2D0A31'; // Púrpura oscuro del fondo del logo
const brightGreen = '#00FF66'; // Verde brillante característico de la marca

/**
 * Estilos para el fondo principal de la página de login.
 * Utiliza el color púrpura corporativo y centra el contenido.
 */
const gradientBg = {
  background: primaryPurple,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem'
};

/**
 * Estilos para la tarjeta de login con efecto glassmorphism.
 * Proporciona una superficie semitransparente con desenfoque de fondo.
 */
const glassCard = {
  width: '100%',
  maxWidth: '36rem',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: '0.75rem',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
  padding: '1.5rem'
};

/**
 * Estilos para el logo de Play4Padel en la página de login.
 * Utiliza los colores corporativos y tipografía destacada.
 */
const logoStyle = {
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  backgroundColor: 'rgba(45, 10, 49, 0.7)'
};

/**
 * Componente principal de la página de login.
 * Renderiza una interfaz centrada con el logo de la aplicación y el formulario de autenticación.
 */
const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={gradientBg}>
      {/* Tarjeta principal con efecto glassmorphism */}
      <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-xl overflow-hidden" style={glassCard}>
        <div style={{ padding: '1.5rem' }}>
          {/* Logo centrado de Play4Padel */}
          <div className="flex justify-center mb-4" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="text-white px-4 py-2 rounded-lg" style={logoStyle}>
              Play<span style={{ color: brightGreen }}>4</span>Padel
            </div>
          </div>
          
          {/* Formulario de login */}
          <FormularioLogin />
        </div>
      </div>
    </div>
  );
};

export default Login;