import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useHistory } from 'react-router';
import "./Register.css";
import { RegisterRequest } from '../../interfaces';

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

const FormularioRegister: React.FC = () => {
  const { register } = useAuth();
  const history = useHistory();

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validaciones
    if (!nombre || !apellidos || !email || !password || !confirmPassword) {
      setFormError('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('El formato del email no es válido');
      return;
    }

    try {
      setIsRegistering(true);
      const registerData: RegisterRequest = {
        nombre,
        apellidos,
        email,
        password,
        id_rol: 4 // Usuario estándar
      };
      
      await register(registerData);
      
      // Redirigir al login solo después de un registro exitoso
      history.replace('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
      setFormError('Error al procesar el registro. Por favor, inténtalo de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-white text-center mb-2" style={{ color: pureWhite, fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.25rem' }}>
        Crear Cuenta
      </h2>
      <p className="text-center mb-6" style={{ color: brightGreen, textAlign: 'center', marginBottom: '1.5rem', fontSize: '1rem' }}>
        Regístrate para empezar a jugar
      </p>
      
      <form onSubmit={handleRegister} className="space-y-4 max-w-3xl mx-auto" style={{ maxWidth: '36rem', margin: '0 auto' }}>
        {/* Nombre */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="nombre" style={labelStyle}>
            Nombre
          </label>
          <div className="relative">
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={inputStyle}
              placeholder="Tu nombre"
            />
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Apellidos */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="apellidos" style={labelStyle}>
            Apellidos
          </label>
          <div className="relative">
            <input
              id="apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
              style={inputStyle}
              placeholder="Tus apellidos"
            />
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Email */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="email" style={labelStyle}>
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
        
        {/* Contraseña */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="password" style={labelStyle}>
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
        
        {/* Confirmar Contraseña */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="confirmPassword" style={labelStyle}>
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
            <div style={iconContainerStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Mensaje de error */}
        {formError && (
          <div style={{ 
            backgroundColor: 'rgba(248, 113, 113, 0.2)', 
            border: '1px solid rgba(248, 113, 113, 0.4)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <p style={{ color: '#fee2e2' }}>{formError}</p>
          </div>
        )}
        
        {/* Botón de registro */}
        <button
          type="submit"
          disabled={isRegistering}
          style={buttonStyle}
        >
          {isRegistering ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" 
                   style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem', height: '1rem', width: '1rem', color: primaryPurple }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </span>
          ) : (
            'Crear Cuenta'
          )}
        </button>
        
        {/* Enlace para iniciar sesión */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          <a href="/login" style={{ color: brightGreen, textDecoration: 'none', transition: 'color 0.3s ease' }}>
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>
      </form>
    </>
  );
};

export default FormularioRegister;