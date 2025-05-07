import React from 'react';
import { IonContent, IonPage, IonCard } from '@ionic/react';
import EncabezadoDashboard from './EncabezadoDashboard';
import TarjetaDashboard from './TarjetaDashboard';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="contenido-home">
        <EncabezadoDashboard titulo="¡Bienvenido de nuevo!" />
        <div className="tarjetas-resumen-wrapper">
          <div className="tarjetas-resumen centrado">
            <TarjetaDashboard titulo="Partidos Jugados" subtitulo="" valor="24" />
            <TarjetaDashboard titulo="Nivel" subtitulo="" valor="4.2" />
            <TarjetaDashboard titulo="Victorias" subtitulo="" valor="18" />
            <TarjetaDashboard titulo="Torneos" subtitulo="" valor="3" />
          </div>
        </div>
        <div className="reservas-y-pistas">
          <div className="proximas-reservas">
            <h2>Próximas Reservas</h2>
            <IonCard className="reserva-card">
              <div className="info">
                <p>Pista 1</p>
                <p>2025-04-24 - 18:00</p>
              </div>
              <div className="iconos">
                <span className="icono-reserva">J</span>
                <span className="icono-reserva">M</span>
                <span className="icono-reserva">C</span>
                <span className="icono-reserva">A</span>
              </div>
            </IonCard>
            <IonCard className="reserva-card">
              <div className="info">
                <p>Pista 3</p>
                <p>2025-04-26 - 19:30</p>
              </div>
              <div className="iconos">
                <span className="icono-reserva">P</span>
                <span className="icono-reserva">L</span>
                <span className="icono-reserva">M</span>
                <span className="icono-reserva">S</span>
              </div>
            </IonCard>
          </div>
          <div className="estado-pistas">
            <h2>Estado de las Pistas</h2>
            <div className="estado-pista-card">
              <p>Pista 1</p>
              <span className="disponible">Disponible</span>
            </div>
            <div className="estado-pista-card">
              <p>Pista 2</p>
              <span className="ocupada">Ocupada</span>
            </div>
            <div className="estado-pista-card">
              <p>Pista 3</p>
              <span className="disponible">Disponible</span>
            </div>
            <div className="estado-pista-card">
              <p>Pista 4</p>
              <span className="mantenimiento">Mantenimiento</span>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
