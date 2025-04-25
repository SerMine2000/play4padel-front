// src/pages/Home.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonButtons,
  IonLoading,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonAvatar
} from '@ionic/react';
import {
  logOutOutline,
  personCircleOutline,
  calendarOutline,
  businessOutline,
  tennisballOutline,
  peopleOutline,
  statsChartOutline,
  stopwatchOutline,
  settingsOutline,
  personOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import '../theme/variables.css';
import './css/Home.css';

const Home: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [clubData, setClubData] = useState<any>(null);
  const [isLoadingClub, setIsLoadingClub] = useState<boolean>(false);
  const [pistaCount, setPistaCount] = useState<number>(0);
  const [reservasHoy, setReservasHoy] = useState<number>(0);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLIonButtonElement>(null);

  const history = useHistory();

  const isClubAdmin = user && user.id_rol === 1;

  const loadClubData = async (event?: CustomEvent) => {
    if (!user || !isClubAdmin) return;
    try {
      setIsLoadingClub(true);
      const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
      if (clubsResponse && Array.isArray(clubsResponse) && clubsResponse.length > 0) {
        const club = clubsResponse.find(c => c.id_administrador === user.id) || clubsResponse[0];
        setClubData(club);

        const pistasResponse = await apiService.get(`/clubs/${club.id}/pistas`);
        if (Array.isArray(pistasResponse)) setPistaCount(pistasResponse.length);

        const today = new Date().toISOString().split('T')[0];
        const reservasResponse = await apiService.get(`/reservas?id_club=${club.id}&fecha=${today}`);
        if (Array.isArray(reservasResponse)) setReservasHoy(reservasResponse.length);
      } else {
        setClubData(null);
      }
    } catch (error) {
      console.error('Error al cargar datos del club:', error);
    } finally {
      setIsLoadingClub(false);
      if (event) event.detail.complete();
    }
  };

  useEffect(() => {
    if (isClubAdmin) loadClubData();
  }, [user, isClubAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node) && !(event.target as Element).closest('.custom-menu-popup')) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const toggleMenu = () => setShowMenu(!showMenu);
  const closeMenu = () => setShowMenu(false);
  const handleLogout = async () => { await logout(); history.replace('/login'); };
  const goToProfile = () => { history.push('/profile'); setShowMenu(false); };

  const goToReservas = () => history.push('/reservas');
  const goToManageCourts = () => history.push('/manage-courts');
  const goToCalendar = () => history.push('/calendar');
  const goToManageUsers = () => history.push('/manage-users');
  const goToScoreboard = () => history.push('/marcador-control');
  const goToSettings = () => { history.push('/configuracion'); setShowMenu(false); };

  const renderClubAdminView = () => (
    <IonGrid>
      <IonRow className="fila-centro">
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonCard className="tarjeta-bienvenida welcome-card">
            <IonCardHeader className="cabecera-verde">
              <IonCardTitle color="white">Panel de Administración</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="contenido-tarjeta">
              {clubData ? (
                <>
                  <IonItem lines="none" className="info-club">
                    <IonIcon icon={businessOutline} slot="start" size="large" className="icono-empresa" />
                    <IonLabel>
                      <h2>{clubData.nombre}</h2>
                      <IonText><p>{clubData.direccion}</p></IonText>
                    </IonLabel>
                  </IonItem>

                  <IonRow>
                    <IonCol size="6">
                      <div className="tarjeta-estadistica">
                        <IonIcon icon={tennisballOutline} className="icono-pistas" />
                        <h3>{pistaCount}</h3>
                        <p>Pistas</p>
                      </div>
                    </IonCol>
                    <IonCol size="6">
                      <div className="tarjeta-estadistica">
                        <IonIcon icon={calendarOutline} className="icono-calendario" />
                        <h3>{reservasHoy}</h3>
                        <p>Reservas Hoy</p>
                      </div>
                    </IonCol>
                  </IonRow>

                  <h4 className="titulo-seccion" color='primary'>Gestión del Club</h4>

                  <IonList>
                    <IonItem button onClick={goToManageCourts} detail>
                      <IonIcon icon={tennisballOutline} slot="start" className="icono-pistas" />
                      <IonLabel>Gestionar Pistas</IonLabel>
                      <IonText slot="end">{pistaCount}</IonText>
                    </IonItem>
                    <IonItem button onClick={goToCalendar} detail>
                      <IonIcon icon={calendarOutline} slot="start" className="icono-calendario" />
                      <IonLabel>Reservas y Calendario</IonLabel>
                    </IonItem>
                    <IonItem button onClick={goToManageUsers} detail>
                      <IonIcon icon={peopleOutline} slot="start" className="icono-usuarios" />
                      <IonLabel>Usuarios y Miembros</IonLabel>
                    </IonItem>
                    <IonItem button onClick={goToScoreboard} detail>
                      <IonIcon icon={stopwatchOutline} slot="start" className="icono-marcador" />
                      <IonLabel>Marcador de Partidos</IonLabel>
                    </IonItem>
                    <IonItem button detail>
                      <IonIcon icon={statsChartOutline} slot="start" className="icono-estadisticas" />
                      <IonLabel>Estadísticas</IonLabel>
                    </IonItem>
                  </IonList>
                </>
              ) : (
                <>
                  <IonText className="sin-club">
                    <p>No se ha encontrado información del club.</p>
                  </IonText>
                  <IonButton expand="block">
                    <IonIcon slot="start" icon={businessOutline} />
                    Configurar Datos del Club
                  </IonButton>
                </>
              )}
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );

  const renderUserView = () => (
    <IonGrid>
      <IonRow>
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonCard className="tarjeta-bienvenida">
            <IonCardHeader className="cabecera-verde">
              <IonCardTitle>¡Bienvenido a Play4Padel!</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {user && (
                <IonItem lines="none" className="info-club">
                  <IonIcon icon={personCircleOutline} slot="start" size="large" />
                  <IonLabel>
                    <h2>Hola, {user.nombre} {user.apellidos}</h2>
                    <IonText><p>{user.email}</p></IonText>
                  </IonLabel>
                </IonItem>
              )}
              <p>Desde aquí podrás:</p>
              <ul>
                <li>Buscar clubes de pádel</li>
                <li>Reservar pistas</li>
                <li>Participar en torneos</li>
                <li>Gestionar tu perfil y preferencias</li>
              </ul>
              <IonButton expand="block" onClick={goToReservas}>
                <IonIcon slot="start" icon={calendarOutline} />
                Reservar Pista
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Inicio</IonTitle>
          <IonButtons slot="end">
            <IonButton ref={profileMenuRef} onClick={toggleMenu} className="profile-button">
              <IonAvatar>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Perfil" />
                ) : (
                  <IonIcon icon={personCircleOutline} size="large" />
                )}
              </IonAvatar>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {showMenu && (
        <>
          <div className="menu-perfil" onClick={closeMenu}></div>
          <div className="menu-avatar">
            <div className="item-menu-avatar" onClick={goToProfile}>
              <IonIcon icon={personOutline} className="icono-perfil" />
              <span>Perfil</span>
            </div>
            <div className="item-menu-avatar" onClick={goToSettings}>
              <IonIcon icon={settingsOutline} className="icono-ajustes" />
              <span>Configuración</span>
            </div>
            <div className="item-menu-avatar" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} className="icono-logout" />
              <span style={{ color: "#eb445a" }}>Cerrar sesión</span>
            </div>
          </div>
        </>
      )}


      <IonContent className="contenedor-home home-container">
        {isClubAdmin && (
          <IonRefresher slot="fixed" onIonRefresh={loadClubData}>
            <IonRefresherContent />
          </IonRefresher>
        )}
        {isLoading || (isClubAdmin && isLoadingClub) ? (
          <IonLoading isOpen={true} message="Cargando..." />
        ) : (
          <>{isClubAdmin ? renderClubAdminView() : renderUserView()}</>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;