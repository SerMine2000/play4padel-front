import React from 'react';
import FormularioRegister from './FormularioRegister';
import './Register.css';

// Colores del logo Play4Padel
const primaryPurple = '#2D0A31'; // Púrpura oscuro del fondo del logo
const brightGreen = '#00FF66'; // Verde brillante de la "P" en el logo

// Estilos inline para asegurar que se apliquen - ahora con colores de padel
const gradientBg = {
  background: primaryPurple,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem'
};

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

const logoStyle = {
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  backgroundColor: 'rgba(45, 10, 49, 0.7)'
};

const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={gradientBg}>
      <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-xl overflow-hidden" style={glassCard}>
        <div style={{ padding: '1.5rem' }}>
          {/* Logo centered */}
          <div className="flex justify-center mb-4" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="text-white px-4 py-2 rounded-lg" style={logoStyle}>
              Play<span style={{ color: brightGreen }}>4</span>Padel
            </div>
          </div>
          
          <FormularioRegister />
        </div>
      </div>
    </div>
  );
};

export default Register;