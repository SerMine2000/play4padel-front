import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonToast,
  IonText,
  IonIcon,
  IonChip,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar
} from '@ionic/react';
import {
  peopleOutline,
  businessOutline,
  calendarOutline,
  cashOutline,
  trendingUpOutline,
  statsChartOutline,
  warningOutline,
  checkmarkCircleOutline,
  trophyOutline,
  medalOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import adminStatsService, { AdminDashboardStats } from '../../services/admin/admin.service';
import '../Admin/AdminDashboard/AdminDashboard.css';

const DashboardAdministrador: React.FC = () => {
  const { user } = useAuth();
  const [estadisticas, setEstadisticas] = useState<AdminDashboardStats | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensajeToast, setMensajeToast] = useState('');
  const [colorToast, setColorToast] = useState<'success' | 'danger' | 'warning'>('success');
  const [mostrarToast, setMostrarToast] = useState(false);

  useEffect(() => {
    cargarEstadisticasAdmin();
  }, []);

  const mostrarMensajeToast = (mensaje: string, color: typeof colorToast = 'success') => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setMostrarToast(true);
  };

  const cargarEstadisticasAdmin = async () => {
    try {
      setCargando(true);
      
      const estadisticasDashboard = await adminStatsService.getDashboardStats();
      
      if (estadisticasDashboard) {
        setEstadisticas(estadisticasDashboard);
      } else {
        mostrarMensajeToast('No se pudieron cargar las estadísticas', 'warning');
      }
      
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al cargar estadísticas del sistema', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const manejarActualizacion = async (event: CustomEvent) => {
    try {
      await cargarEstadisticasAdmin();
    } finally {
      event.detail.complete();
    }
  };

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(cantidad);
  };

  const obtenerColorParaAvatar = (id: number) => {
    const colores = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
    return colores[id % colores.length];
  };

  if (!estadisticas) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={cargando} message="Cargando dashboard..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={manejarActualizacion}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="admin-dashboard-container">
          <div className="dashboard-header">
            <h1>Dashboard Administrativo</h1>
            <p>Panel de control del sistema Play4Padel</p>
          </div>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6" sizeLg="3">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="stats-content">
                      <div className="stats-icon">
                        <IonIcon icon={peopleOutline} color="primary" />
                      </div>
                      <div className="stats-info">
                        <h2>{estadisticas.totalUsers}</h2>
                        <p>Total Usuarios</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6" sizeLg="3">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="stats-content">
                      <div className="stats-icon">
                        <IonIcon icon={businessOutline} color="secondary" />
                      </div>
                      <div className="stats-info">
                        <h2>{estadisticas.totalClubs}</h2>
                        <p>Clubes Registrados</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6" sizeLg="3">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="stats-content">
                      <div className="stats-icon">
                        <IonIcon icon={calendarOutline} color="tertiary" />
                      </div>
                      <div className="stats-info">
                        <h2>{estadisticas.totalReservations}</h2>
                        <p>Total Reservas</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6" sizeLg="3">
                <IonCard className="stats-card">
                  <IonCardContent>
                    <div className="stats-content">
                      <div className="stats-icon">
                        <IonIcon icon={cashOutline} color="success" />
                      </div>
                      <div className="stats-info">
                        <h2>{formatearMoneda(estadisticas.totalRevenue)}</h2>
                        <p>Ingresos Totales</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Estado del Sistema</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="system-status">
                      <div className="status-item">
                        <IonIcon icon={checkmarkCircleOutline} color="success" />
                        <span>Usuarios Activos: {estadisticas.activeUsers}</span>
                      </div>
                      <div className="status-item">
                        <IonIcon name="tennisball-outline" color="warning" />
                        <span>Total Pistas: {estadisticas.totalPistas}</span>
                      </div>
                      <div className="status-item">
                        <IonIcon icon={trophyOutline} color="tertiary" />
                        <span>Ligas Activas: {estadisticas.ligasActivas}</span>
                      </div>
                      <div className="status-item">
                        <IonIcon icon={medalOutline} color="secondary" />
                        <span>Torneos Activos: {estadisticas.torneosActivos}</span>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Acciones Rápidas</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="quick-actions">
                      <IonButton 
                        expand="block" 
                        fill="solid" 
                        className="boton-accion-rapida boton-clubes"
                        routerLink="/manage-clubs"
                      >
                        <IonIcon icon={businessOutline} slot="start" />
                        Gestionar Clubes
                      </IonButton>
                      <IonButton 
                        expand="block" 
                        fill="solid" 
                        className="boton-accion-rapida boton-usuarios"
                        routerLink="/manage-users"
                      >
                        <IonIcon icon={peopleOutline} slot="start" />
                        Gestionar Usuarios
                      </IonButton>
                      <IonButton 
                        expand="block" 
                        fill="solid" 
                        className="boton-accion-rapida boton-reportes"
                        routerLink="/admin/system-reports"
                      >
                        <IonIcon icon={statsChartOutline} slot="start" />
                        Ver Reportes
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Usuarios Recientes</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {estadisticas.recentUsers.map(usuario => (
                        <IonItem key={usuario.id}>
                          <IonAvatar slot="start" style={{ 
                            backgroundColor: obtenerColorParaAvatar(usuario.id), 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold', 
                            color: 'white' 
                          }}>
                            <span>{usuario.nombre.charAt(0).toUpperCase()}</span>
                          </IonAvatar>
                          <IonLabel>
                            <h3>{usuario.nombre} {usuario.apellidos}</h3>
                            <p>{usuario.email}</p>
                            <p>Registrado: {usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString('es-ES') : 'N/A'}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Clubes Recientes</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {estadisticas.recentClubs.map(club => (
                        <IonItem key={club.id}>
                          <IonIcon icon={businessOutline} slot="start" color="primary" />
                          <IonLabel>
                            <h3>{club.nombre}</h3>
                            <p>Registrado: {club.fecha_registro ? new Date(club.fecha_registro).toLocaleDateString('es-ES') : 'N/A'}</p>
                            <IonChip color={club.activo ? 'success' : 'danger'} style={{ fontSize: '0.7rem', height: '20px' }}>
                              {club.activo ? 'Activo' : 'Inactivo'}
                            </IonChip>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        <IonLoading isOpen={cargando} message="Cargando datos..." />
        
        <IonToast
          isOpen={mostrarToast}
          onDidDismiss={() => setMostrarToast(false)}
          message={mensajeToast}
          duration={2000}
          position="bottom"
          color={colorToast}
        />
      </IonContent>
    </IonPage>
  );
};

export default DashboardAdministrador;