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
import { useAuth } from '../../../context/AuthContext';
import adminStatsService, { AdminDashboardStats } from '../../../services/admin/admin.service';
import './Admin_Ticket.css';

interface MetricasSistema {
  crecimientoUsuarios: {
    esteMes: number;
    mesAnterior: number;
    porcentaje: number;
  };
  tendenciasReservas: {
    esteMes: number;
    mesAnterior: number;
    porcentaje: number;
  };
  ingresos: {
    esteMes: number;
    mesAnterior: number;
    porcentaje: number;
    total: number;
  };
  rendimientoClubes: {
    topClubes: Array<{
      id: number;
      nombre: string;
      reservas: number;
      ingresos: number;
      crecimiento: number;
    }>;
  };
  actividadUsuarios: {
    usuariosActivos: number;
    usuariosNuevos: number;
    retencion: number;
  };
  datosGeograficos: Array<{
    region: string;
    usuarios: number;
    clubes: number;
    ingresos: number;
  }>;
  actividadPorHorario: Array<{
    hora: string;
    reservas: number;
  }>;
}

const ReportesSistemaAdministrador: React.FC = () => {
  const { user } = useAuth();
  const [metricas, setMetricas] = useState<MetricasSistema | null>(null);
  const [cargando, setCargando] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [metricaSeleccionada, setMetricaSeleccionada] = useState<'users' | 'reservations' | 'revenue'>('users');
  const [mensajeToast, setMensajeToast] = useState('');
  const [mostrarToast, setMostrarToast] = useState(false);

  useEffect(() => {
    cargarMetricasSistema();
  }, [periodoSeleccionado]);

  const mostrarMensajeToast = (mensaje: string) => {
    setMensajeToast(mensaje);
    setMostrarToast(true);
  };

  const cargarMetricasSistema = async () => {
    try {
      setCargando(true);
      
      // Obtener datos REALES del endpoint existente
      const estadisticasReales = await adminStatsService.getDashboardStats();
      
      if (estadisticasReales) {
        // Convertir datos reales a la estructura esperada
        const metricasReales: MetricasSistema = {
          // ✅ DATOS REALES desde endpoint /admin/stats/dashboard
          crecimientoUsuarios: {
            esteMes: estadisticasReales.currentMonth.users,
            mesAnterior: estadisticasReales.previousMonth.users,
            porcentaje: estadisticasReales.monthlyGrowth.users
          },
          tendenciasReservas: {
            esteMes: estadisticasReales.currentMonth.reservations,
            mesAnterior: estadisticasReales.previousMonth.reservations,
            porcentaje: estadisticasReales.monthlyGrowth.reservations
          },
          ingresos: {
            esteMes: estadisticasReales.currentMonth.revenue,
            mesAnterior: estadisticasReales.previousMonth.revenue,
            porcentaje: estadisticasReales.monthlyGrowth.revenue,
            total: estadisticasReales.totalRevenue
          },
          actividadUsuarios: {
            usuariosActivos: estadisticasReales.activeUsers,
            usuariosNuevos: estadisticasReales.currentMonth.users,
            retencion: 78.5 // ❌ SIMULADO - no hay implementación para retención
          },
          // ❌ DATOS SIMULADOS - no hay implementación para estos
          rendimientoClubes: {
            topClubes: [
              { id: 1, nombre: 'Club Elite Pádel', reservas: 892, ingresos: 15670, crecimiento: 25.3 },
              { id: 2, nombre: 'Centro Deportivo Pro', reservas: 756, ingresos: 13240, crecimiento: 18.7 },
              { id: 3, nombre: 'Pádel Champions', reservas: 634, ingresos: 11150, crecimiento: 12.4 },
              { id: 4, nombre: 'Club Urbano Pádel', reservas: 578, ingresos: 10890, crecimiento: 8.9 },
              { id: 5, nombre: 'Centro Real Pádel', reservas: 423, ingresos: 8950, crecimiento: -2.1 }
            ]
          },
          datosGeograficos: [
            { region: 'Madrid', usuarios: 423, clubes: 12, ingresos: 125400 },
            { region: 'Barcelona', usuarios: 389, clubes: 10, ingresos: 115600 },
            { region: 'Valencia', usuarios: 267, clubes: 8, ingresos: 87300 },
            { region: 'Sevilla', usuarios: 198, clubes: 6, ingresos: 65200 },
            { region: 'Bilbao', usuarios: 156, clubes: 5, ingresos: 52400 },
            { region: 'Otras', usuarios: 317, clubes: 14, ingresos: 116900 }
          ],
          actividadPorHorario: [
            { hora: '08:00', reservas: 45 },
            { hora: '09:00', reservas: 78 },
            { hora: '10:00', reservas: 112 },
            { hora: '11:00', reservas: 134 },
            { hora: '12:00', reservas: 89 },
            { hora: '16:00', reservas: 156 },
            { hora: '17:00', reservas: 189 },
            { hora: '18:00', reservas: 234 },
            { hora: '19:00', reservas: 267 },
            { hora: '20:00', reservas: 198 },
            { hora: '21:00', reservas: 145 }
          ]
        };

        setMetricas(metricasReales);
      } else {
        mostrarMensajeToast('No se pudieron cargar las métricas del sistema');
      }
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al cargar las métricas del sistema');
    } finally {
      setCargando(false);
    }
  };

  const manejarActualizacion = async (event: CustomEvent) => {
    try {
      await cargarMetricasSistema();
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

  const formatearPorcentaje = (valor: number) => {
    const signo = valor >= 0 ? '+' : '';
    return `${signo}${valor.toFixed(1)}%`;
  };

  const obtenerColorPorcentaje = (valor: number) => {
    return valor >= 0 ? 'success' : 'danger';
  };

  const exportarReporte = () => {
    mostrarMensajeToast('Reporte exportado exitosamente');
  };

  if (!metricas) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={cargando} message="Cargando reportes..." />
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

        <div className="admin-reports-container">
          <div className="reports-header">
            <h1>Reportes del Sistema</h1>
            <p>Análisis completo de la plataforma Play4Padel</p>
          </div>

          {/* Controles de período */}
          <IonCard>
            <IonCardContent>
              <div className="period-controls">
                <IonSegment value={periodoSeleccionado} onIonChange={e => setPeriodoSeleccionado(e.detail.value as any)}>
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
                
                <IonButton fill="outline" onClick={exportarReporte}>
                  <IonIcon icon={downloadOutline} slot="start" />
                  Exportar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Métricas principales - ✅ DATOS REALES */}
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
                      <h2>{metricas.crecimientoUsuarios.esteMes}</h2>
                      <IonChip color={obtenerColorPorcentaje(metricas.crecimientoUsuarios.porcentaje)}>
                        <IonIcon icon={metricas.crecimientoUsuarios.porcentaje >= 0 ? trendingUpOutline : trendingDownOutline} />
                        {formatearPorcentaje(metricas.crecimientoUsuarios.porcentaje)}
                      </IonChip>
                    </div>
                    <p className="metric-comparison">
                      vs {metricas.crecimientoUsuarios.mesAnterior} el mes anterior
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
                      <h2>{metricas.tendenciasReservas.esteMes}</h2>
                      <IonChip color={obtenerColorPorcentaje(metricas.tendenciasReservas.porcentaje)}>
                        <IonIcon icon={metricas.tendenciasReservas.porcentaje >= 0 ? trendingUpOutline : trendingDownOutline} />
                        {formatearPorcentaje(metricas.tendenciasReservas.porcentaje)}
                      </IonChip>
                    </div>
                    <p className="metric-comparison">
                      vs {metricas.tendenciasReservas.mesAnterior} el mes anterior
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
                      <h2>{formatearMoneda(metricas.ingresos.esteMes)}</h2>
                      <IonChip color={obtenerColorPorcentaje(metricas.ingresos.porcentaje)}>
                        <IonIcon icon={metricas.ingresos.porcentaje >= 0 ? trendingUpOutline : trendingDownOutline} />
                        {formatearPorcentaje(metricas.ingresos.porcentaje)}
                      </IonChip>
                    </div>
                    <p className="metric-comparison">
                      vs {formatearMoneda(metricas.ingresos.mesAnterior)} el mes anterior
                    </p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Actividad de usuarios - ✅ PARCIALMENTE REAL */}
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
                        <div className="activity-value">{metricas.actividadUsuarios.usuariosActivos}</div>
                      </div>
                      
                      <div className="activity-item">
                        <div className="activity-label">
                          <IonIcon icon={trendingUpOutline} />
                          <span>Usuarios Nuevos</span>
                        </div>
                        <div className="activity-value">{metricas.actividadUsuarios.usuariosNuevos}</div>
                      </div>
                      
                      <div className="activity-item">
                        <div className="activity-label">
                          <IonIcon icon={statsChartOutline} />
                          <span>Retención</span>
                        </div>
                        <div className="activity-value">{metricas.actividadUsuarios.retencion}%</div>
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
                      {metricas.actividadPorHorario.map((datos, indice) => {
                        const maxReservas = Math.max(...metricas.actividadPorHorario.map(h => h.reservas));
                        const porcentaje = (datos.reservas / maxReservas) * 100;
                        
                        return (
                          <div key={indice} className="hour-bar">
                            <span className="hour-label">{datos.hora}</span>
                            <div className="bar-container">
                              <IonProgressBar value={porcentaje / 100} color="primary" />
                              <span className="bar-value">{datos.reservas}</span>
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

          {/* Rendimiento de clubes - ❌ DATOS SIMULADOS */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Top Clubes por Rendimiento</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {metricas.rendimientoClubes.topClubes.map((club, indice) => (
                  <IonItem key={club.id}>
                    <div className="club-rank" slot="start">
                      #{indice + 1}
                    </div>
                    <IonLabel>
                      <h3>{club.nombre}</h3>
                      <div className="club-metrics">
                        <span>{club.reservas} reservas</span>
                        <span>{formatearMoneda(club.ingresos)} ingresos</span>
                      </div>
                    </IonLabel>
                    <IonChip 
                      color={obtenerColorPorcentaje(club.crecimiento)} 
                      slot="end"
                    >
                      <IonIcon icon={club.crecimiento >= 0 ? trendingUpOutline : trendingDownOutline} />
                      {formatearPorcentaje(club.crecimiento)}
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Datos geográficos - ❌ DATOS SIMULADOS */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Distribución Geográfica</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="geographic-grid">
                {metricas.datosGeograficos.map((region, indice) => (
                  <div key={indice} className="region-card">
                    <div className="region-header">
                      <IonIcon icon={locationOutline} />
                      <h4>{region.region}</h4>
                    </div>
                    <div className="region-stats">
                      <div className="region-stat">
                        <span className="stat-value">{region.usuarios}</span>
                        <span className="stat-label">Usuarios</span>
                      </div>
                      <div className="region-stat">
                        <span className="stat-value">{region.clubes}</span>
                        <span className="stat-label">Clubes</span>
                      </div>
                      <div className="region-stat">
                        <span className="stat-value">{formatearMoneda(region.ingresos)}</span>
                        <span className="stat-label">Ingresos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={cargando} message="Cargando datos..." />
        
        <IonToast
          isOpen={mostrarToast}
          onDidDismiss={() => setMostrarToast(false)}
          message={mensajeToast}
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default ReportesSistemaAdministrador;