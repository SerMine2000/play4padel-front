import React from 'react';
import { createRoot } from 'react-dom/client';
import '@ionic/react/css/core.css';
import './theme/variables.css';
import './index.css';
import App from './App';

import { setupIonicReact } from '@ionic/react';


const savedTheme = localStorage.getItem('theme') || 'light';

document.body.classList.add(`theme-${savedTheme}`);

if (savedTheme === 'dark') {
  document.documentElement.classList.add('ion-palette-dark');
} else {
  document.documentElement.classList.remove('ion-palette-dark');
}

setupIonicReact({
  mode: 'md'
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);