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
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonProgressBar
} from '@ionic/react';
import {
  statsChartOutline,
  trendingUpOutline,
  trendingDownOutline,
  cashOutline,
  peopleOutline,
  businessOutline,
  calendarOutline,
  downloadOutline,
  timeOutline,
  locationOutline,
  barChartOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import './AdminSystemReports.css';

interface SystemMetrics {
  userGrowth: {
    thisMonth: number;
    lastMonth: number;
    percentage: number;
  };
  reservationTrends: {
    thisMonth: number;
    lastMonth: number;
    percentage: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    percentage: number;
    total: number;
  };
  clubPerformance: {
    topClubs: Array<{
      id: number;
      name: string;
      reservations: number;
      revenue: number;
      growth: number;
    }>;
  };
  userActivity: {
    activeUsers: number;
    newUsers: number;
    retention: number;
  };
  geographicData: Array<{
    region: string;
    users: number;
    clubs: number;
    revenue: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    reservations: number;
  }>;
}

const AdminSystemReports: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'reservations' | 'revenue'>('users');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadSystemMetrics();
  }, [selectedPeriod]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const loadSystemMetrics = async () => {
    try {
      setLoading(true);
      
      // Simulamos datos para demo - en producción vendría del backend
      const mockMetrics: SystemMetrics = {
        userGrowth: {
          thisMonth: 1250,
          lastMonth: 1087,
          percentage: 15.0
        },
        reservationTrends: {
          thisMonth: 2843,
          lastMonth: 2301,
          percentage: 23.5
        },
        revenue: {
          thisMonth: 48750,
          lastMonth: 41200,
          percentage: 18.3,
          total: 562800
        },
        clubPerformance: {
          topClubs: [
            { id: 1, name: 'Club Elite Padel', reservations: 892, revenue: 15670, growth: 25.3 },
            { id: 2, name: 'Sports Center Pro', reservations: 756, revenue: 13240, growth: 18.7 },
            { id: 3, name: 'Padel Champions', reservations: 634, revenue: 11150, growth: 12.4 },
            { id: 4, name: 'Urban Padel Club', reservations: 578, revenue: 10890, growth: 8.9 },
            { id: 5, name: 'Royal Padel Center', reservations: 423, revenue: 8950, growth: -2.1 }
          ]
        },
        userActivity: {
          activeUsers: 892,
          newUsers: 163,
          retention: 78.5
        },
        geographicData: [
          { region: 'Madrid', users: 423, clubs: 12, revenue: 125400 },
          { region: 'Barcelona', users: 389, clubs: 10, revenue: 115600 },
          { region: 'Valencia', users: 267, clubs: 8, revenue: 87300 },
          { region: 'Sevilla', users: 198, clubs: 6, revenue: 65200 },
          { region: 'Bilbao', users: 156, clubs: 5, revenue: 52400 },
          { region: 'Otras', users: 317, clubs: 14, revenue: 116900 }
        ],
        hourlyActivity: [
          { hour: '08:00', reservations: 45 },
          { hour: '09:00', reservations: 78 },
          { hour: '10:00', reservations: 112 },
          { hour: '11:00', reservations: 134 },
          { hour: '12:00', reservations: 89 },
          { hour: '16:00', reservations: 156 },
          { hour: '17:00', reservations: 189 },
          { hour: '18:00', reservations: 234 },
          { hour: '19:00', reservations: 267 },
          { hour: '20:00', reservations: 198 },
          { hour: '21:00', reservations: 145 }
        ]
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error(error);
      showToastMessage('Error al cargar las métricas del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadSystemMetrics();
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

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getPercentageColor = (value: number) => {
    return value >= 0 ? 'success' : 'danger';
  };

  const exportReport = () => {
    showToastMessage('Reporte exportado exitosamente');
  };

  if (!metrics) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={loading} message="Cargando reportes..." />
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

        <div className="admin-reports-container">
          <div className="reports-header">
            <h1>Reportes del Sistema</h1>
            <p>Análisis completo de la plataforma Play4Padel</p>
          </div>

          {/* Controles de período */}
          <IonCard>
            <IonCardContent>
              <div className="period-controls">
                <IonSegment value={selectedPeriod} onIonChange={e => setSelectedPeriod(e.detail.value as any)}>
                  <IonSegmentButton value="week">
                    <IonLabel>Semana</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="month">
                    <IonLabel>Mes</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="quarter">
                    <IonLabel>Trimestre</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="year">
                    <IonLabel>Año</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
                
                <IonButton fill="outline" onClick={exportReport}>
                  <IonIcon icon={downloadOutline} slot="start" />
                  Exportar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Métricas principales */}
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6" sizeLg="4">
                <IonCard className="metric-card">
                  <IonCardContent>
                    <div className="metric-header">
                      <IonIcon icon={peopleOutline} color="primary" />
                      <span className="metric-title">Crecimiento de Usuarios</span>
                    </div>
                    <div className="metric-value">
                      <h2>{metrics.userGrowth.thisMonth}</h2>
                      <IonChip color={getPercentageColor(metrics.userGrowth.percentage)} size="small">
                        <IonIcon icon={metrics.userGrowth.percentage >= 0 ? trendingUpOutline : trendingDownOutline} />
                        {formatPercentage(metrics.userGrowth.percentage)}
                      </IonChip>
                    </div>
                    <p className="metric-comparison">
                      vs {metrics.userGrowth.lastMonth} el mes anterior
                    </p>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6" sizeLg="4">
                <IonCard className="metric-card">
                  <IonCardContent>
                    <div className="metric-header">
                      <IonIcon icon={calendarOutline} color="secondary" />
                      <span className="metric-title">Reservas Totales</span>
                    </div>
                    <div className="metric-value">
                      <h2>{metrics.reservationTrends.thisMonth}</h2>
                      <IonChip color={getPercentageColor(metrics.reservationTrends.percentage)} size="small">
                        <IonIcon icon={metrics.reservationTrends.percentage >= 0 ? trendingUpOutline : trendingDownOutline} />
                        {formatPercentage(metrics.reservationTrends.percentage)}
                      </IonChip>
                    </div>
                    <p className="metric-comparison">
                      vs {metrics.reservationTrends.lastMonth} el mes anterior
                    </p>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6" sizeLg="4">
                <IonCard className="metric-card">
                  <IonCardContent>
                    <div className="metric-header">
                      <IonIcon icon={cashOutline} color="success" />
                      <span className="metric-title">Ingresos</span>
                    </div>
                    <div className="metric-value">
                      <h2>{formatCurrency(metrics.revenue.thisMonth)}</h2>
                      <IonChip color={getPercentageColor(metrics.revenue.percentage)} size="small">
                        <IonIcon icon={metrics.revenue.percentage >= 0 ? trendingUpOutline : trendingDownOutline} />
                        {formatPercentage(metrics.revenue.percentage)}
                      </IonChip>
                    </div>
                    <p className="metric-comparison">
                      vs {formatCurrency(metrics.revenue.lastMonth)} el mes anterior
                    </p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Actividad de usuarios */}
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Actividad de Usuarios</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="activity-metrics">
                      <div className="activity-item">
                        <div className="activity-label">
                          <IonIcon icon={peopleOutline} />
                          <span>Usuarios Activos</span>
                        </div>
                        <div className="activity-value">{metrics.userActivity.activeUsers}</div>
                      </div>
                      
                      <div className="activity-item">
                        <div className="activity-label">
                          <IonIcon icon={trendingUpOutline} />
                          <span>Usuarios Nuevos</span>
                        </div>
                        <div className="activity-value">{metrics.userActivity.newUsers}</div>
                      </div>
                      
                      <div className="activity-item">
                        <div className="activity-label">
                          <IonIcon icon={statsChartOutline} />
                          <span>Retención</span>
                        </div>
                        <div className="activity-value">{metrics.userActivity.retention}%</div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Actividad por Horario</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="hourly-chart">
                      {metrics.hourlyActivity.map((data, index) => {
                        const maxReservations = Math.max(...metrics.hourlyActivity.map(h => h.reservations));
                        const percentage = (data.reservations / maxReservations) * 100;
                        
                        return (
                          <div key={index} className="hour-bar">
                            <span className="hour-label">{data.hour}</span>
                            <div className="bar-container">
                              <IonProgressBar value={percentage / 100} color="primary" />
                              <span className="bar-value">{data.reservations}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Rendimiento de clubes */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Top Clubes por Rendimiento</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {metrics.clubPerformance.topClubs.map((club, index) => (
                  <IonItem key={club.id}>
                    <div className="club-rank" slot="start">
                      #{index + 1}
                    </div>
                    <IonLabel>
                      <h3>{club.name}</h3>
                      <div className="club-metrics">
                        <span>{club.reservations} reservas</span>
                        <span>{formatCurrency(club.revenue)} ingresos</span>
                      </div>
                    </IonLabel>
                    <IonChip 
                      color={getPercentageColor(club.growth)} 
                      size="small" 
                      slot="end"
                    >
                      <IonIcon icon={club.growth >= 0 ? trendingUpOutline : trendingDownOutline} />
                      {formatPercentage(club.growth)}
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Datos geográficos */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Distribución Geográfica</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="geographic-grid">
                {metrics.geographicData.map((region, index) => (
                  <div key={index} className="region-card">
                    <div className="region-header">
                      <IonIcon icon={locationOutline} />
                      <h4>{region.region}</h4>
                    </div>
                    <div className="region-stats">
                      <div className="region-stat">
                        <span className="stat-value">{region.users}</span>
                        <span className="stat-label">Usuarios</span>
                      </div>
                      <div className="region-stat">
                        <span className="stat-value">{region.clubs}</span>
                        <span className="stat-label">Clubes</span>
                      </div>
                      <div className="region-stat">
                        <span className="stat-value">{formatCurrency(region.revenue)}</span>
                        <span className="stat-label">Ingresos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={loading} message="Cargando datos..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminSystemReports;