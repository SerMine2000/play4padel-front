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
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../../../context/AuthContext';
import adminStatsService, { AdminDashboardStats } from '../../../services/admin/admin.service';
import './AdminDashboard.css';

// Usamos la interface del servicio
// AdminDashboardStats ya está importada

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const showToastMessage = (message: string, color: typeof toastColor = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas reales del backend
      const dashboardStats = await adminStatsService.getDashboardStats();
      
      if (dashboardStats) {
        setStats(dashboardStats);
      } else {
        showToastMessage('No se pudieron cargar las estadísticas', 'warning');
      }
      
    } catch (error) {
      console.error(error);
      showToastMessage('Error al cargar estadísticas del sistema', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadAdminStats();
    } finally {
      event.detail.complete();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getColorParaAvatar = (id: number) => {
    const colors = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
    return colors[id % colors.length];
  };

  if (!stats) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={loading} message="Cargando dashboard..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="admin-dashboard-container">
          <div className="dashboard-header">
            <h1>Dashboard Administrativo</h1>
            <p>Panel de control del sistema Play4Padel</p>
          </div>

          {/* Métricas principales */}
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
                        <h2>{stats.totalUsers}</h2>
                        <p>Total Usuarios</p>
                        <IonChip color="success" size="small">
                          +{stats.monthlyGrowth.users}% este mes
                        </IonChip>
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
                        <h2>{stats.totalClubs}</h2>
                        <p>Clubes Registrados</p>
                        <IonChip color="primary" size="small">
                          {stats.recentClubs.length} nuevos
                        </IonChip>
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
                        <h2>{stats.totalReservations}</h2>
                        <p>Total Reservas</p>
                        <IonChip color="success" size="small">
                          +{stats.monthlyGrowth.reservations}% este mes
                        </IonChip>
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
                        <h2>{formatCurrency(stats.totalRevenue)}</h2>
                        <p>Ingresos Totales</p>
                        <IonChip color="success" size="small">
                          +{stats.monthlyGrowth.revenue}% este mes
                        </IonChip>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Estado del sistema */}
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
                        <span>Usuarios Activos: {stats.activeUsers}</span>
                      </div>
                      <div className="status-item">
                        <IonIcon icon={warningOutline} color="warning" />
                        <span>Reservas Pendientes: {stats.pendingReservations}</span>
                      </div>
                      <div className="status-item">
                        <IonIcon icon={trendingUpOutline} color="primary" />
                        <span>Sistema Operativo: 99.9% Uptime</span>
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
                      <IonButton expand="block" fill="outline" routerLink="/admin/manage-clubs">
                        <IonIcon icon={businessOutline} slot="start" />
                        Gestionar Clubes
                      </IonButton>
                      <IonButton expand="block" fill="outline" routerLink="/admin/manage-all-users">
                        <IonIcon icon={peopleOutline} slot="start" />
                        Gestionar Usuarios
                      </IonButton>
                      <IonButton expand="block" fill="outline" routerLink="/admin/system-reports">
                        <IonIcon icon={statsChartOutline} slot="start" />
                        Ver Reportes
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Actividad reciente */}
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Usuarios Recientes</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {stats.recentUsers.map(user => (
                        <IonItem key={user.id}>
                          <IonAvatar slot="start" style={{ 
                            backgroundColor: getColorParaAvatar(user.id), 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold', 
                            color: 'white' 
                          }}>
                            <span>{user.nombre.charAt(0).toUpperCase()}</span>
                          </IonAvatar>
                          <IonLabel>
                            <h3>{user.nombre} {user.apellidos}</h3>
                            <p>{user.email}</p>
                            <p>Registrado: {user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-ES') : 'N/A'}</p>
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
                      {stats.recentClubs.map(club => (
                        <IonItem key={club.id}>
                          <IonIcon icon={businessOutline} slot="start" color="primary" />
                          <IonLabel>
                            <h3>{club.nombre}</h3>
                            <p>Registrado: {club.fecha_registro ? new Date(club.fecha_registro).toLocaleDateString('es-ES') : 'N/A'}</p>
                            <IonChip color={club.activo ? 'success' : 'danger'} size="small">
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

        <IonLoading isOpen={loading} message="Cargando datos..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;