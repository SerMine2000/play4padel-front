/**
 * MAIN.TSX - PUNTO DE ENTRADA DE LA APLICACIÓN PLAY4PADEL
 * 
 * Este archivo sirve como punto de entrada principal de la aplicación React.
 * Se encarga de configurar Ionic React, gestionar el tema inicial y renderizar
 * el componente raíz de la aplicación.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import '@ionic/react/css/core.css';
import './theme/variables.css';
import './index.css';
import App from './App';

import { setupIonicReact } from '@ionic/react';

/**
 * CONFIGURACIÓN INICIAL DEL TEMA
 * 
 * Recuperamos el tema guardado en localStorage o establecemos 'light' como predeterminado.
 * Esto permite mantener la preferencia del usuario entre sesiones.
 */
const savedTheme = localStorage.getItem('theme') || 'light';

// Aplicamos la clase del tema al body para los estilos CSS personalizados
document.body.classList.add(`theme-${savedTheme}`);

/**
 * CONFIGURACIÓN DE IONIC DARK MODE
 * 
 * Si el tema guardado es 'dark', activamos la paleta oscura de Ionic.
 * En caso contrario, nos aseguramos de que esté desactivada.
 */
if (savedTheme === 'dark') {
  document.documentElement.classList.add('ion-palette-dark');
} else {
  document.documentElement.classList.remove('ion-palette-dark');
}

/**
 * CONFIGURACIÓN DE IONIC REACT
 * 
 * Configuramos Ionic con modo Material Design ('md') para mantener
 * consistencia visual independientemente de la plataforma.
 */
setupIonicReact({
  mode: 'md'
});

/**
 * RENDERIZADO DE LA APLICACIÓN
 * 
 * Obtenemos el contenedor raíz del DOM y creamos la raíz de React.
 * Envolvemos la aplicación en React.StrictMode para detectar problemas
 * potenciales durante el desarrollo.
 */
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);