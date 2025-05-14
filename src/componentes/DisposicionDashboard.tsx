import React from 'react';
import BarraLateral from './BarraLateral';
import './DisposicionDashboard.css';

const DisposicionDashboard: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="disposicion-dashboard">
    <BarraLateral />
    <div className="contenido-dashboard" id="main-content">
      {children}
    </div>
  </div>
);

export default DisposicionDashboard;
