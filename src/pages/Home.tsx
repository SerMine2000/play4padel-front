// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
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
  IonRefresherContent
} from '@ionic/react';
import { 
  logOutOutline, 
  personCircleOutline, 
  calendarOutline,
  businessOutline,
  addCircleOutline,
  tennisballOutline,
  peopleOutline,
  statsChartOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import './css/Home.css';

const Home: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [clubData, setClubData] = useState<any>(null);
  const [isLoadingClub, setIsLoadingClub] = useState<boolean>(false);
  const [pistaCount, setPistaCount] = useState<number>(0);
  const [reservasHoy, setReservasHoy] = useState<number>(0);
  const history = useHistory();
  
  // Determinar si el usuario es un administrador de club
  const isClubAdmin = user && user.id_rol === 1;

  // Función para cargar los datos del club (solo para administradores)
  const loadClubData = async (event?: CustomEvent) => {
    if (!user || !isClubAdmin) return;
    
    try {
      setIsLoadingClub(true);
      
      // 1. Obtener información del club filtrando por el administrador actual
      console.log(`Buscando club con id_administrador: ${user.id}`);
      const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
      
      console.log('Clubes encontrados:', clubsResponse);
      
      if (clubsResponse && Array.isArray(clubsResponse) && clubsResponse.length > 0) {
        // Usar el club asociado a este administrador (no simplemente el primero)
        const club = clubsResponse.find(c => c.id_administrador === user.id) || clubsResponse[0];
        setClubData(club);
        
        console.log('Club cargado:', club);
        
        // 2. Obtener el número de pistas del club
        const pistasResponse = await apiService.get(`/clubs/${club.id}/pistas`);
        if (Array.isArray(pistasResponse)) {
          setPistaCount(pistasResponse.length);
        }
        
        // 3. Obtener reservas para hoy
        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        const reservasResponse = await apiService.get(`/reservas?id_club=${club.id}&fecha=${today}`);
        if (Array.isArray(reservasResponse)) {
          setReservasHoy(reservasResponse.length);
        }
      } else {
        console.log('No se encontraron clubes para este administrador');
        setClubData(null);
      }
    } catch (error) {
      console.error('Error al cargar datos del club:', error);
    } finally {
      setIsLoadingClub(false);
      if (event) event.detail.complete(); // Completar el refresher si existe
    }
  };

  // Cargar datos del club cuando el componente se monta (solo para administradores)
  useEffect(() => {
    if (isClubAdmin) {
      loadClubData();
    }
  }, [user, isClubAdmin]);

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const goToProfile = () => {
    history.push('/profile');
  };

  const goToReservas = () => {
    history.push('/reservas');
  };
  
  const goToManageCourts = () => {
    history.push('/manage-courts');
  };

  // Añadimos la función para ir a la vista de calendario
  const goToCalendar = () => {
    history.push('/calendar');
  };

  // Función para ir a la página de gestión de usuarios
  const goToManageUsers = () => {
    history.push('/manage-users');
  };

  // Vista para administradores de club
  const renderClubAdminView = () => {
    return (
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="12" sizeMd="8" sizeLg="6">
            <IonCard className="welcome-card">
              <IonCardHeader className="welcome-card-header">
                <IonCardTitle>Panel de Administración</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="welcome-card-content">
                {clubData ? (
                  <>
                    <div className="club-info">
                      <IonItem lines="none" className="club-header">
                        <IonIcon icon={businessOutline} slot="start" size="large" color="primary"></IonIcon>
                        <IonLabel>
                          <h2>{clubData.nombre}</h2>
                          <IonText color="medium">
                            <p>{clubData.direccion}</p>
                          </IonText>
                        </IonLabel>
                      </IonItem>
                      
                      <div className="club-stats">
                        <IonRow>
                          <IonCol size="6">
                            <div className="stat-card">
                              <IonIcon icon={tennisballOutline} color="primary"></IonIcon>
                              <h3>{pistaCount}</h3>
                              <p>Pistas</p>
                            </div>
                          </IonCol>
                          <IonCol size="6">
                            <div className="stat-card">
                              <IonIcon icon={calendarOutline} color="success"></IonIcon>
                              <h3>{reservasHoy}</h3>
                              <p>Reservas Hoy</p>
                            </div>
                          </IonCol>
                        </IonRow>
                      </div>
                      
                      <h4 className="section-title">Gestión del Club</h4>
                      <IonList>
                        <IonItem button onClick={goToManageCourts} detail>
                          <IonIcon icon={tennisballOutline} slot="start" color="primary"></IonIcon>
                          <IonLabel>Gestionar Pistas</IonLabel>
                          <IonText slot="end" color="medium">{pistaCount}</IonText>
                        </IonItem>
                        <IonItem button onClick={goToCalendar} detail>
                          <IonIcon icon={calendarOutline} slot="start" color="secondary"></IonIcon>
                          <IonLabel>Reservas y Calendario</IonLabel>
                        </IonItem>
                        <IonItem button onClick={goToManageUsers} detail>
                          <IonIcon icon={peopleOutline} slot="start" color="tertiary"></IonIcon>
                          <IonLabel>Usuarios y Miembros</IonLabel>
                        </IonItem>
                        <IonItem button detail>
                          <IonIcon icon={statsChartOutline} slot="start" color="success"></IonIcon>
                          <IonLabel>Estadísticas</IonLabel>
                        </IonItem>
                      </IonList>
                      
                      <IonButton 
                        expand="block" 
                        color="primary" 
                        className="club-action-button"
                        onClick={goToManageCourts}
                      >
                        <IonIcon slot="start" icon={addCircleOutline}></IonIcon>
                        Añadir Nueva Pista
                      </IonButton>
                    </div>
                  </>
                ) : (
                  <div className="no-club-data">
                    <IonText color="medium">
                      <p>No se ha encontrado información del club.</p>
                    </IonText>
                    <IonButton expand="block" color="primary">
                      <IonIcon slot="start" icon={businessOutline}></IonIcon>
                      Configurar Datos del Club
                    </IonButton>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  };

  // Vista para usuarios normales
  const renderUserView = () => {
    return (
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="12" sizeMd="8" sizeLg="6">
            <IonCard className="welcome-card">
              <IonCardHeader className="welcome-card-header">
                <IonCardTitle>¡Bienvenido a Play4Padel!</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="welcome-card-content">
                {user && (
                  <div className="user-info">
                    {/* Se elimina el button y onClick aquí */}
                    <IonItem lines="none">
                      <IonIcon icon={personCircleOutline} slot="start" size="large" color="primary"></IonIcon>
                      <IonLabel>
                        <h2>Hola, {user.nombre} {user.apellidos}</h2>
                        <IonText color="medium">
                          <p>{user.email}</p>
                        </IonText>
                      </IonLabel>
                    </IonItem>
                    
                    <p className="ion-padding-top">
                      Ya has iniciado sesión correctamente en la plataforma. Desde aquí podrás:
                    </p>
                    <ul>
                      <li>Buscar clubes de pádel</li>
                      <li>Reservar pistas</li>
                      <li>Participar en torneos</li>
                      <li>Gestionar tu perfil y preferencias</li>
                    </ul>
                  </div>
                )}
                
                <IonButton expand="block" color="primary" onClick={goToReservas}>
                  <IonIcon slot="start" icon={calendarOutline}></IonIcon>
                  Reservar Pista
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle>
            {isClubAdmin && clubData ? clubData.nombre : 'Play4Padel - Inicio'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={goToProfile}>
              <IonIcon slot="icon-only" icon={personCircleOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={handleLogout} className="logout-button">
              <IonIcon slot="start" icon={logOutOutline}></IonIcon>
              Cerrar Sesión
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="home-container">
        {isClubAdmin && (
          <IonRefresher slot="fixed" onIonRefresh={loadClubData}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>
        )}
        
        {isLoading || (isClubAdmin && isLoadingClub) ? (
          <IonLoading isOpen={true} message="Cargando..." />
        ) : (
          <>
            {isClubAdmin ? renderClubAdminView() : renderUserView()}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;