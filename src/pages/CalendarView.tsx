import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonLoading,
  IonToast,
  IonChip,
  IonButton,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonText
} from '@ionic/react';
import { 
  calendarOutline, 
  timeOutline, 
  personOutline, 
  cashOutline, 
  tennisballOutline,
  closeCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  refreshOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api.service';
import './css/CalendarView.css';

interface ReservaDetalle {
  id: number;
  id_usuario: number;
  id_pista: number;
  nombre_usuario: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  precio_total: number;
  estado: string;
  pista_numero?: number;
  pista_tipo?: string;
}

interface DiaCalendario {
  fecha: Date;
  diaMes: number;
  enMesActual: boolean;
  tieneReservas: boolean;
  numReservas: number;
}

const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const [fechaActual, setFechaActual] = useState<Date>(new Date());
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [reservasDelDia, setReservasDelDia] = useState<ReservaDetalle[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarToast, setMostrarToast] = useState<boolean>(false);
  const [mensajeToast, setMensajeToast] = useState<string>('');
  const [colorToast, setColorToast] = useState<string>('success');
  const [mostrarDetalleReserva, setMostrarDetalleReserva] = useState<boolean>(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaDetalle | null>(null);
  const [vistaActual, setVistaActual] = useState<'calendario' | 'lista'>('calendario');
  const [fechasConReservas, setFechasConReservas] = useState<{[key: string]: number}>({});

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      generarDiasCalendario(fechaActual);
      cargarReservasMes(fechaActual);
    }
  }, [user, fechaActual]);

  // Efecto para actualizar días con reservas
  useEffect(() => {
    // Solo actualizar si hay dias en el calendario
    if (diasCalendario.length > 0) {
      const nuevosDias = diasCalendario.map(dia => {
        const fechaStr = formatearFecha(dia.fecha);
        return {
          ...dia,
          tieneReservas: !!fechasConReservas[fechaStr],
          numReservas: fechasConReservas[fechaStr] || 0
        };
      });
      
      setDiasCalendario(nuevosDias);
    }
  }, [fechasConReservas]);

  // Generar días para el calendario
  const generarDiasCalendario = (fecha: Date) => {
    const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    
    const diasArray: DiaCalendario[] = [];
    
    // Calcular primer día de la semana (ajustado para empezar en lunes)
    let primerDiaMostrado = new Date(primerDiaMes);
    const diaSemana = primerDiaMes.getDay();
    primerDiaMostrado.setDate(primerDiaMostrado.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    
    // Generar 42 días (6 semanas) para cubrir todo el mes
    for (let i = 0; i < 42; i++) {
      const fechaDia = new Date(primerDiaMostrado);
      fechaDia.setDate(primerDiaMostrado.getDate() + i);
      
      // Aquí inicializamos todos los días a false para tieneReservas y 0 para numReservas
      // Serán actualizados después cuando se carguen los datos reales
      diasArray.push({
        fecha: fechaDia,
        diaMes: fechaDia.getDate(),
        enMesActual: fechaDia.getMonth() === fecha.getMonth(),
        tieneReservas: false,
        numReservas: 0
      });
    }
    
    setDiasCalendario(diasArray);
  };

  // Cargar reservas del mes actual
  const cargarReservasMes = async (fecha: Date) => {
    if (!user || !user.id_club) return;
    
    try {
      setCargando(true);
      
      // Obtener primer y último día del mes
      const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      
      // Formatear fechas para la API
      const fechaInicio = formatearFecha(primerDiaMes);
      const fechaFin = formatearFecha(ultimoDiaMes);
      
      console.log(`Cargando reservas del mes desde ${fechaInicio} hasta ${fechaFin}`);
      
      // Obtener todas las reservas del club en este rango de fechas
      const response = await apiService.get(`/reservas?id_club=${user.id_club}`);
      
      if (Array.isArray(response)) {
        console.log('Reservas obtenidas:', response);
        
        // Contar reservas por fecha
        const reservasPorFecha: {[key: string]: number} = {};
        
        response.forEach(reserva => {
          const fechaReserva = reserva.fecha;
          // Verificar que la fecha está en el rango del mes actual
          const fechaObj = new Date(fechaReserva + 'T00:00:00');
          if (fechaObj >= primerDiaMes && fechaObj <= ultimoDiaMes) {
            if (reservasPorFecha[fechaReserva]) {
              reservasPorFecha[fechaReserva]++;
            } else {
              reservasPorFecha[fechaReserva] = 1;
            }
          }
        });
        
        console.log('Fechas con reservas:', reservasPorFecha);
        setFechasConReservas(reservasPorFecha);
      }
    } catch (error) {
      console.error('Error al cargar reservas del mes:', error);
      mostrarMensaje('Error al cargar reservas del mes', 'danger');
    } finally {
      setCargando(false);
    }
  };

  // Cargar reservas de un día específico
  const cargarReservasDia = async (fecha: Date) => {
    console.log('===== CARGANDO RESERVAS DEL DÍA =====');
    console.log('Fecha recibida:', fecha);
    
    if (!user) {
      console.log('Error: No hay usuario definido');
      return;
    }
    
    // Obtener el ID del club manualmente si no está en el objeto user
    let idClub = user.id_club;
    
    if (!idClub) {
      console.log('No se encontró id_club en el objeto user, intentando obtenerlo manualmente');
      try {
        // Buscar los clubes asociados al administrador
        const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
        console.log('Respuesta de búsqueda de clubes:', clubsResponse);
        
        if (Array.isArray(clubsResponse) && clubsResponse.length > 0) {
          idClub = clubsResponse[0].id;
          console.log(`ID del club obtenido manualmente: ${idClub}`);
        } else {
          console.log('No se encontraron clubes para este administrador');
          mostrarMensaje('No se encontró un club asignado a tu cuenta', 'warning');
          return;
        }
      } catch (error) {
        console.error('Error al buscar clubes del administrador:', error);
        mostrarMensaje('Error al obtener información del club', 'danger');
        return;
      }
    }
    
    try {
      setCargando(true);
      
      // Formatear la fecha manteniendo la zona horaria local
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const fechaFormateada = `${year}-${month}-${day}`;
      
      console.log(`Fecha original: ${fecha}`);
      console.log(`Fecha formateada para API: ${fechaFormateada}`);
      
      // URL para obtener las reservas
      const url = `/reservas?id_club=${idClub}&fecha=${fechaFormateada}`;
      console.log(`URL de la solicitud: ${url}`);
      
      // Realizar la solicitud a la API
      console.log('Enviando solicitud a la API...');
      const response = await apiService.get(url);
      console.log('Respuesta recibida de la API:', response);
      
      // Verificar si la respuesta es un array
      if (!Array.isArray(response)) {
        console.log('Error: La respuesta no es un array');
        setReservasDelDia([]);
        setCargando(false);
        return;
      }
      
      console.log(`Se encontraron ${response.length} reservas para el día ${fechaFormateada}`);
      
      // Depuración de fechas
      if (response.length > 0) {
        console.log('===== COMPARACIÓN DE FECHAS =====');
        console.log('Fecha solicitada (formateada):', fechaFormateada);
        response.forEach((reserva, index) => {
          console.log(`Reserva ${index + 1} - Fecha: ${reserva.fecha}, Tipo: ${typeof reserva.fecha}`);
          console.log(`Comparación directa: ${reserva.fecha === fechaFormateada}`);
        });
      }
      
      // Si no hay reservas, actualizar el estado y salir
      if (response.length === 0) {
        console.log('No hay reservas para esta fecha');
        setReservasDelDia([]);
        setCargando(false);
        return;
      }
      
      // Procesar cada reserva para añadir detalles
      console.log('Procesando reservas para añadir detalles...');
      
      const reservasPromesas = response.map(async (reserva, index) => {
        console.log(`Procesando reserva ${index + 1}:`, reserva);
        
        // Inicializar valores por defecto
        let nombreUsuario = "Usuario";
        let pistaNumero = null;
        let pistaTipo = null;
        
        try {
          // Obtener datos del usuario
          console.log(`Obteniendo datos del usuario ID: ${reserva.id_usuario}`);
          const usuarioResponse = await apiService.get(`/user/${reserva.id_usuario}`);
          
          if (usuarioResponse && usuarioResponse.nombre) {
            nombreUsuario = `${usuarioResponse.nombre} ${usuarioResponse.apellidos || ''}`;
            console.log(`Nombre de usuario obtenido: ${nombreUsuario}`);
          } else {
            console.log('No se pudo obtener el nombre del usuario');
          }
          
          // Obtener datos de la pista
          console.log(`Obteniendo datos de la pista ID: ${reserva.id_pista}`);
          const pistaResponse = await apiService.get(`/pistas/${reserva.id_pista}`);
          
          if (pistaResponse && pistaResponse.numero) {
            pistaNumero = pistaResponse.numero;
            pistaTipo = pistaResponse.tipo;
            console.log(`Datos de pista obtenidos: Pista ${pistaNumero} - ${pistaTipo}`);
          } else {
            console.log('No se pudo obtener información de la pista');
          }
        } catch (error) {
          console.error(`Error al obtener detalles para la reserva ${index + 1}:`, error);
        }
        
        // Crear objeto con detalles completos
        const reservaDetallada = {
          ...reserva,
          nombre_usuario: nombreUsuario,
          pista_numero: pistaNumero,
          pista_tipo: pistaTipo
        };
        
        console.log(`Reserva ${index + 1} procesada:`, reservaDetallada);
        return reservaDetallada;
      });
      
      // Esperar a que todas las promesas se resuelvan
      console.log('Esperando a que se completen todas las promesas...');
      const reservasDetalladas = await Promise.all(reservasPromesas);
      
      console.log('Todas las reservas procesadas:', reservasDetalladas);
      
      // Ordenar por hora de inicio
      reservasDetalladas.sort((a, b) => {
        if (a.hora_inicio < b.hora_inicio) return -1;
        if (a.hora_inicio > b.hora_inicio) return 1;
        return 0;
      });
      
      console.log('Reservas ordenadas por hora:', reservasDetalladas);
      
      // Actualizar el estado con las reservas procesadas
      console.log('Actualizando estado con setReservasDelDia...');
      setReservasDelDia(reservasDetalladas);
      console.log('Estado actualizado correctamente');
      
    } catch (error) {
      console.error('Error al cargar reservas del día:', error);
      mostrarMensaje('Error al cargar reservas del día', 'danger');
      setReservasDelDia([]);
    } finally {
      setCargando(false);
    }
  };

  // Manejar clic en día del calendario
  const handleClickDia = (dia: DiaCalendario) => {
    console.log('===== SELECCIONANDO DÍA =====');
    console.log('Día seleccionado:', dia);
    
    // Establecer el día seleccionado primero
    setDiaSeleccionado(dia.fecha);
    
    // Luego cargar las reservas para ese día
    console.log('Llamando a cargarReservasDia con fecha:', dia.fecha);
    cargarReservasDia(dia.fecha);
  };

  // Manejar clic en reserva para ver detalles
  const handleClickReserva = (reserva: ReservaDetalle) => {
    setReservaSeleccionada(reserva);
    setMostrarDetalleReserva(true);
  };

  // Navegar al mes anterior
  const irMesAnterior = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    setFechaActual(nuevaFecha);
  };

  // Navegar al mes siguiente
  const irMesSiguiente = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    setFechaActual(nuevaFecha);
  };

  // Navegar a hoy
  const irAHoy = () => {
    const hoy = new Date();
    setFechaActual(hoy);
    setDiaSeleccionado(hoy);
    cargarReservasDia(hoy);
  };

  // Actualizar reservas (refrescar datos)
  const actualizarReservas = () => {
    cargarReservasMes(fechaActual);
    if (diaSeleccionado) {
      cargarReservasDia(diaSeleccionado);
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (reservaId: number) => {
    try {
      setCargando(true);
      
      // Llamada a la API para cancelar reserva
      await apiService.put(`/reservas/${reservaId}/cancelar`, {
        motivo: "Cancelada por el administrador del club"
      });
      
      mostrarMensaje('Reserva cancelada correctamente', 'success');
      
      // Actualizar datos
      if (diaSeleccionado) {
        cargarReservasDia(diaSeleccionado);
      }
      cargarReservasMes(fechaActual);
      
      // Cerrar modal de detalles
      setMostrarDetalleReserva(false);
      
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      mostrarMensaje('Error al cancelar la reserva', 'danger');
    } finally {
      setCargando(false);
    }
  };

  // Mostrar mensaje toast
  const mostrarMensaje = (mensaje: string, color: string = 'success') => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setMostrarToast(true);
  };

  // Formatear fecha a YYYY-MM-DD
  const formatearFecha = (fecha: Date): string => {
    if (!fecha) return '';
    
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formatear fecha para mostrar
  const formatearFechaMostrar = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear mes y año para título
  const formatearMesAnio = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear hora
  const formatearHora = (hora: string): string => {
    return hora.substring(0, 5);
  };

  // Obtener color según estado de reserva
  const getColorEstadoReserva = (estado: string): string => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'success';
      case 'cancelada':
        return 'danger';
      case 'completada':
        return 'primary';
      default:
        return 'medium';
    }
  };

  // Generar cabecera de días de la semana
  const renderDiasSemana = () => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return (
      <IonRow className="dias-semana">
        {dias.map((dia, index) => (
          <IonCol key={index}>{dia}</IonCol>
        ))}
      </IonRow>
    );
  };

  // Generar grid del calendario
  const renderCalendario = () => {
    // Agrupar días en semanas (7 días por semana)
    const semanas: DiaCalendario[][] = [];
    for (let i = 0; i < diasCalendario.length; i += 7) {
      semanas.push(diasCalendario.slice(i, i + 7));
    }
    
    return (
      <>
        {renderDiasSemana()}
        
        {semanas.map((semana, semanaIndex) => (
          <IonRow key={`semana-${semanaIndex}`} className="semana">
            {semana.map((dia, diaIndex) => (
              <IonCol 
                key={`dia-${semanaIndex}-${diaIndex}`} 
                className={`dia ${!dia.enMesActual ? 'otro-mes' : ''} ${dia.tieneReservas ? 'tiene-reservas' : ''} ${diaSeleccionado && diaSeleccionado.getDate() === dia.diaMes && diaSeleccionado.getMonth() === dia.fecha.getMonth() ? 'seleccionado' : ''}`}
                onClick={() => handleClickDia(dia)}
              >
                <div className="numero-dia">{dia.diaMes}</div>
                {dia.tieneReservas && (
                  <div className="indicador-reservas">{dia.numReservas}</div>
                )}
              </IonCol>
            ))}
          </IonRow>
        ))}
      </>
    );
  };
// Renderizar lista de reservas del día
const renderListaReservas = () => {
  console.log('Renderizando lista de reservas. Día seleccionado:', diaSeleccionado);
  console.log('Reservas disponibles:', reservasDelDia);
  
  if (!diaSeleccionado) {
    console.log('No hay día seleccionado');
    return (
      <div className="sin-dia-seleccionado">
        <IonText color="medium">
          <p>Selecciona un día para ver sus reservas</p>
        </IonText>
      </div>
    );
  }
  
  if (reservasDelDia.length === 0) {
    console.log('No hay reservas para este día');
    return (
      <div className="sin-reservas">
        <IonText color="medium">
          <p>No hay reservas para el {formatearFechaMostrar(diaSeleccionado)}</p>
        </IonText>
      </div>
    );
  }
  
  console.log(`Renderizando ${reservasDelDia.length} reservas`);
  
  return (
    <IonList className="lista-reservas">
      {reservasDelDia.map((reserva) => {
        console.log('Renderizando reserva:', reserva);
        return (
          <IonItem 
            key={reserva.id} 
            button 
            detail 
            onClick={() => handleClickReserva(reserva)}
            className={`reserva-item estado-${reserva.estado.toLowerCase()}`}
          >
            <IonIcon slot="start" icon={tennisballOutline} />
            <IonLabel>
              <h2>{reserva.nombre_usuario}</h2>
              <p>
                <IonIcon icon={timeOutline} /> {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
              </p>
              <p>
                <IonIcon icon={cashOutline} /> {reserva.precio_total.toFixed(2)}€
              </p>
            </IonLabel>
            <IonChip slot="end" color={getColorEstadoReserva(reserva.estado)}>
              {reserva.estado}
            </IonChip>
          </IonItem>
        );
      })}
    </IonList>
  );
};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Reservas y Calendario</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={actualizarReservas}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="calendar-view">
        {/* Segmento para cambiar entre vista calendario y lista */}
        <IonSegment value={vistaActual} onIonChange={e => setVistaActual(e.detail.value as 'calendario' | 'lista')}>
          <IonSegmentButton value="calendario">
            <IonLabel>Calendario</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="lista">
            <IonLabel>Lista</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        
        {vistaActual === 'calendario' && (
          <div className="vista-calendario">
            {/* Navegación del calendario */}
            <div className="navegacion-calendario">
              <IonButton fill="clear" onClick={irMesAnterior}>
                <IonIcon slot="icon-only" icon={chevronBackOutline} />
              </IonButton>
              
              <h2 className="titulo-mes">{formatearMesAnio(fechaActual)}</h2>
              
              <IonButton fill="clear" onClick={irMesSiguiente}>
                <IonIcon slot="icon-only" icon={chevronForwardOutline} />
              </IonButton>
              
              <IonButton size="small" fill="solid" onClick={irAHoy} className="boton-hoy">
                Hoy
              </IonButton>
            </div>
            
            {/* Grid del calendario */}
            <IonGrid className="grid-calendario">
              {renderCalendario()}
            </IonGrid>
          </div>
        )}
        
        {/* Panel de reservas del día */}
        <div className={`panel-reservas ${vistaActual === 'lista' ? 'pantalla-completa' : ''}`}>
          {vistaActual === 'lista' && diaSeleccionado && (
            <div className="cabecera-lista">
              <h2>{formatearFechaMostrar(diaSeleccionado)}</h2>
            </div>
          )}
          
          {vistaActual === 'calendario' && diaSeleccionado && (
            <h3 className="fecha-seleccionada">
              {formatearFechaMostrar(diaSeleccionado)}
            </h3>
          )}
          
          {renderListaReservas()}
        </div>
        
        {/* Modal de detalle de reserva */}
        <IonModal isOpen={mostrarDetalleReserva} onDidDismiss={() => setMostrarDetalleReserva(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setMostrarDetalleReserva(false)}>
                  Cerrar
                </IonButton>
              </IonButtons>
              <IonTitle>Detalle de Reserva</IonTitle>
            </IonToolbar>
          </IonHeader>
          
          <IonContent>
            {reservaSeleccionada && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Reserva #{reservaSeleccionada.id}</IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonIcon icon={personOutline} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Cliente</h2>
                            <p>{reservaSeleccionada.nombre_usuario}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonIcon icon={calendarOutline} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Fecha</h2>
                            <p>{new Date(reservaSeleccionada.fecha).toLocaleDateString('es-ES')}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonIcon icon={timeOutline} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Horario</h2>
                            <p>{formatearHora(reservaSeleccionada.hora_inicio)} - {formatearHora(reservaSeleccionada.hora_fin)}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonIcon icon={tennisballOutline} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Pista</h2>
                            <p>
                              {reservaSeleccionada.pista_numero 
                                ? `Pista ${reservaSeleccionada.pista_numero} - ${reservaSeleccionada.pista_tipo}` 
                                : `ID: ${reservaSeleccionada.id_pista}`}
                            </p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonIcon icon={cashOutline} slot="start" color="success" />
                          <IonLabel>
                            <h2>Precio</h2>
                            <p>{reservaSeleccionada.precio_total.toFixed(2)}€</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonLabel>
                            <h2>Estado</h2>
                          </IonLabel>
                          <IonChip color={getColorEstadoReserva(reservaSeleccionada.estado)} slot="end">
                            {reservaSeleccionada.estado}
                          </IonChip>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                    
                    {reservaSeleccionada.estado !== 'cancelada' && (
                      <IonRow>
                        <IonCol size="12" className="ion-padding-top">
                          <IonButton 
                            expand="block" 
                            color="danger"
                            onClick={() => cancelarReserva(reservaSeleccionada.id)}
                          >
                            <IonIcon slot="start" icon={closeCircleOutline} />
                            Cancelar Reserva
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    )}
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            )}
          </IonContent>
        </IonModal>
        
        {/* Loading y Toast */}
        <IonLoading isOpen={cargando} message="Cargando..." />
        
        <IonToast
          isOpen={mostrarToast}
          onDidDismiss={() => setMostrarToast(false)}
          message={mensajeToast}
          duration={2000}
          color={colorToast}
        />
      </IonContent>
    </IonPage>
  );
};

export default CalendarView;