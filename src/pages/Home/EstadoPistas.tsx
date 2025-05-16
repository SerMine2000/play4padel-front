import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonList,
  IonItem,
  IonButton,
  IonContent,
  IonToolbar,
  IonTitle,
  IonIcon
} from '@ionic/react';
import { closeSharp, businessSharp } from 'ionicons/icons';
import apiService from '../../services/api.service';
import './Home.css';

export interface Pista {
  nombre: string;
  estado: 'Disponible' | 'Ocupada' | 'Mantenimiento';
}

interface Club {
  id: string;
  nombre: string;
  pistas: Pista[];
}

const EstadoPistas: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [clubSeleccionado, setClubSeleccionado] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const clubs = await apiService.get('/clubs');
        setClubes(clubs);
        const clubGuardado = localStorage.getItem('clubSeleccionado');
        if (clubGuardado) {
          const club = clubs.find((c: Club) => c.id.toString() === clubGuardado);
          if (club) setClubSeleccionado(club);
        }
      } catch (error) {
        setClubes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleOpenModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSelectClub = (club: Club) => {
    setClubSeleccionado(club);
    localStorage.setItem('clubSeleccionado', club.id);
    setShowModal(false);
  };

  const pistas = clubSeleccionado && Array.isArray(clubSeleccionado.pistas)
    ? clubSeleccionado.pistas
    : [];

  return (
    <>
      <IonModal
        isOpen={showModal}
        className="modal-club-ionic"
        onDidDismiss={handleCloseModal}
        backdropDismiss={true}
      >
        <IonContent className="modal-club-content">
          <div className="modal-club-toolbar">
            <IonToolbar>
              <IonTitle className="modal-club-title">Selecciona un club</IonTitle>
              <IonButton
                className="cerrar-modal-btn-ion"
                fill="clear"
                shape="round"
                onClick={handleCloseModal}
                slot="end"
              >
                <IonIcon icon={closeSharp} slot="icon-only" />
              </IonButton>
            </IonToolbar>
          </div>
          <div className="modal-club-list-container">
            {loading ? (
              <div className="modal-club-loading">Cargando clubes...</div>
            ) : (
              <IonList
                className="modal-club-list"
                style={{ maxHeight: clubes.length > 7 ? 320 : 'none' }}
              >
                {clubes.map((club) => (
                  <IonItem key={club.id} lines="none" className="modal-club-item">
                    <IonButton
                      className="club-option-btn-modern"
                      expand="block"
                      fill="solid"
                      onClick={() => handleSelectClub(club)}
                    >
                      <IonIcon
                        icon={businessSharp}
                        style={{ marginRight: 8, fontSize: '1.2em' }}
                      />
                      {club.nombre}
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            )}
          </div>
        </IonContent>
      </IonModal>

      <div className="estado-pistas">
        <div className="estado-pistas-header">
          <div>
            <h2>Estado de las Pistas</h2>
            {clubSeleccionado && (
              <div className="club-nombre-bajo">{clubSeleccionado.nombre}</div>
            )}
          </div>
          <button className="btn-cambiar-club" onClick={handleOpenModal}>
            {clubSeleccionado ? 'Cambiar club' : 'Añadir club'}
          </button>
        </div>

        {pistas.length === 0 ? (
          <div className="sin-pistas-contenedor">
            <div className="sin-pistas">No hay pistas disponibles.</div>
          </div>
        ) : (
          <div className="estado-pistas-grid-real">
            {pistas.map((pista, idx) => (
              <div className="estado-pista-card" key={idx}>
                <p>{pista.nombre}</p>
                <span
                  className={
                    pista.estado === 'Disponible'
                      ? 'disponible'
                      : pista.estado === 'Ocupada'
                      ? 'ocupada'
                      : 'mantenimiento'
                  }
                >
                  {pista.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EstadoPistas;