import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonGrid,
  IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonList,
  IonIcon, IonLoading, IonToast, IonChip, IonButton, IonModal, IonSegment, IonSegmentButton, IonText,
  IonItemDivider, IonSpinner, IonRefresher, IonRefresherContent, IonAlert } from '@ionic/react';
import {arrowBack, calendarOutline, timeOutline, personOutline, cashOutline, tennisballOutline,
  closeCircleOutline, chevronBackOutline, chevronForwardOutline, refreshOutline} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import '../theme/variables.css';
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

interface ReservasPorDia {
  fecha: string;
  fechaFormateada: string;
  reservas: ReservaDetalle[];
}

const CalendarView: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [fechaActual, setFechaActual] = useState<Date>(new Date());
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [reservasDelDia, setReservasDelDia] = useState<ReservaDetalle[]>([]);
  const [reservasDelMes, setReservasDelMes] = useState<ReservasPorDia[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [cargandoLista, setCargandoLista] = useState<boolean>(false);
  const [mostrarToast, setMostrarToast] = useState<boolean>(false);
  const [mensajeToast, setMensajeToast] = useState<string>('');
  const [colorToast, setColorToast] = useState<string>('success');
  const [mostrarDetalleReserva, setMostrarDetalleReserva] = useState<boolean>(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaDetalle | null>(null);
  const [vistaActual, setVistaActual] = useState<'calendario' | 'lista'>('calendario');
  const [fechasConReservas, setFechasConReservas] = useState<{ [key: string]: number }>({});
  const [mensajeError, setMensajeError] = useState<string>('');
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [reservaToCancel, setReservaToCancel] = useState<number | null>(null);

  const contentRef = useRef<HTMLIonContentElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      generarDiasCalendario(fechaActual);
      cargarReservasMes(fechaActual);

      // Establecer el día actual como seleccionado por defecto
      const hoy = new Date();
      setDiaSeleccionado(hoy);
      cargarReservasDia(hoy);
    }
  }, [user]);

  // Efecto adicional para cuando cambia el mes
  useEffect(() => {
    if (user) {
      generarDiasCalendario(fechaActual);
      cargarReservasMes(fechaActual);
    }
  }, [fechaActual]);

  // Efecto para manejar cambios de vista
  useEffect(() => {
    if (vistaActual === 'lista' && user && reservasDelMes.length === 0) {
      // Forzar la carga de los datos para la vista de lista
      cargarReservasMes(fechaActual, true);
    }

    // Hacer scroll al inicio cuando cambia la vista
    if (contentRef.current) {
      contentRef.current.scrollToTop(300);
    }
  }, [vistaActual]);

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

  // Handler para pull-to-refresh
  const handleRefresh = (event: CustomEvent) => {
    setTimeout(() => {
      actualizarReservas();
      event.detail.complete();
    }, 1000);
  };

  // Cargar reservas del mes actual
  const cargarReservasMes = async (fecha: Date, forceReload: boolean = false) => {
    if (!user) return;

    // Obtener ID del club
    let idClub = user.id_club;
    if (!idClub) {
      try {
        const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
        if (Array.isArray(clubsResponse) && clubsResponse.length > 0) {
          idClub = clubsResponse[0].id;
        } else {
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
      // Si estamos en la vista de lista, mostrar el spinner específico
      if (vistaActual === 'lista') {
        setCargandoLista(true);
      } else {
        setCargando(true);
      }

      setMensajeError('');

      // Obtener primer y último día del mes
      const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

      // Formatear fechas para la API
      const fechaInicio = formatearFecha(primerDiaMes);
      const fechaFin = formatearFecha(ultimoDiaMes);

      // Obtener todas las reservas del club
      const response = await apiService.get(`/reservas?id_club=${idClub}`);

      if (Array.isArray(response)) {
        // Contar reservas por fecha (para el calendario)
        const reservasPorFecha: { [key: string]: number } = {};

        // Para la vista de lista, agrupar reservas por día
        const reservasPorDia: { [key: string]: any[] } = {};

        // Filtrar solo las reservas del mes actual
        response.forEach(reserva => {
          const fechaReserva = reserva.fecha;
          try {
            // Convertir la fecha de string a Date para comparación
            const fechaObj = new Date(fechaReserva);
            // Verificar si está en el mes actual
            if (fechaObj.getMonth() === fecha.getMonth() &&
              fechaObj.getFullYear() === fecha.getFullYear()) {

              // Para el calendario
              if (reservasPorFecha[fechaReserva]) {
                reservasPorFecha[fechaReserva]++;
              } else {
                reservasPorFecha[fechaReserva] = 1;
              }

              // Para la vista de lista
              if (!reservasPorDia[fechaReserva]) {
                reservasPorDia[fechaReserva] = [];
              }
              reservasPorDia[fechaReserva].push(reserva);
            }
          } catch (err) {
            console.error(`Error procesando fecha de reserva: ${fechaReserva}`, err);
          }
        });

        setFechasConReservas(reservasPorFecha);

        // Si no hay reservas para el mes, simplemente establecer array vacío
        if (Object.keys(reservasPorDia).length === 0) {
          setReservasDelMes([]);
          return;
        }

        // Procesar cada día para obtener detalles adicionales de reservas
        const procesarReservasPorDia = async () => {
          const reservasPorDiaArray: ReservasPorDia[] = [];

          // Obtener las fechas ordenadas
          const fechasOrdenadas = Object.keys(reservasPorDia).sort();

          for (const fecha of fechasOrdenadas) {
            const reservasDelDia = reservasPorDia[fecha];

            // Procesar cada reserva para añadir detalles
            const reservasDetalladas = await Promise.all(
              reservasDelDia.map(async (reserva) => {
                let nombreUsuario = "Usuario";
                let pistaNumero = null;
                let pistaTipo = null;

                try {
                  // Obtener datos del usuario
                  const usuarioResponse = await apiService.get(`/user/${reserva.id_usuario}`);

                  if (usuarioResponse && usuarioResponse.nombre) {
                    nombreUsuario = `${usuarioResponse.nombre} ${usuarioResponse.apellidos || ''}`;
                  }

                  // Obtener datos de la pista
                  const pistaResponse = await apiService.get(`/pistas/${reserva.id_pista}`);

                  if (pistaResponse && pistaResponse.numero) {
                    pistaNumero = pistaResponse.numero;
                    pistaTipo = pistaResponse.tipo;
                  }
                } catch (error) {
                  console.error('Error al obtener detalles para la reserva:', error);
                }

                return {
                  ...reserva,
                  nombre_usuario: nombreUsuario,
                  pista_numero: pistaNumero,
                  pista_tipo: pistaTipo
                };
              })
            );

            // Ordenar las reservas por hora
            reservasDetalladas.sort((a, b) => {
              if (a.hora_inicio < b.hora_inicio) return -1;
              if (a.hora_inicio > b.hora_inicio) return 1;
              return 0;
            });

            // Construir la fecha formateada
            let fechaFormateada = '';
            try {
              const fechaObj = new Date(fecha);
              fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch (err) {
              console.error(`Error formateando fecha: ${fecha}`, err);
              fechaFormateada = fecha; // Usar la fecha sin formatear en caso de error
            }

            // Añadir al array de días con sus reservas
            reservasPorDiaArray.push({
              fecha,
              fechaFormateada: fechaFormateada,
              reservas: reservasDetalladas
            });
          }

          return reservasPorDiaArray;
        };

        // Procesar y establecer las reservas por día
        const reservasPorDiaArray = await procesarReservasPorDia();

        if (reservasPorDiaArray.length > 0) {
          setReservasDelMes(reservasPorDiaArray);
        } else {
          setMensajeError('No se pudieron procesar las reservas del mes');
        }
      } else {
        setReservasDelMes([]);
        setMensajeError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error al cargar reservas del mes:', error);
      mostrarMensaje('Error al cargar reservas del mes', 'danger');
      setReservasDelMes([]);
      setMensajeError('Error de conexión al cargar reservas');
    } finally {
      setCargando(false);
      setCargandoLista(false);
    }
  };

  // Cargar reservas de un día específico
  const cargarReservasDia = async (fecha: Date) => {
    if (!user) return;

    // Obtener el ID del club manualmente si no está en el objeto user
    let idClub = user.id_club;

    if (!idClub) {
      try {
        // Buscar los clubes asociados al administrador
        const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);

        if (Array.isArray(clubsResponse) && clubsResponse.length > 0) {
          idClub = clubsResponse[0].id;
        } else {
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

      // URL para obtener las reservas
      const url = `/reservas?id_club=${idClub}&fecha=${fechaFormateada}`;

      // Realizar la solicitud a la API
      const response = await apiService.get(url);

      // Verificar si la respuesta es un array
      if (!Array.isArray(response)) {
        setReservasDelDia([]);
        setCargando(false);
        return;
      }

      // Si no hay reservas, actualizar el estado y salir
      if (response.length === 0) {
        setReservasDelDia([]);
        setCargando(false);
        return;
      }

      // Procesar cada reserva para añadir detalles
      const reservasPromesas = response.map(async (reserva) => {
        // Inicializar valores por defecto
        let nombreUsuario = "Usuario";
        let pistaNumero = null;
        let pistaTipo = null;

        try {
          // Obtener datos del usuario
          const usuarioResponse = await apiService.get(`/user/${reserva.id_usuario}`);

          if (usuarioResponse && usuarioResponse.nombre) {
            nombreUsuario = `${usuarioResponse.nombre} ${usuarioResponse.apellidos || ''}`;
          }

          // Obtener datos de la pista
          const pistaResponse = await apiService.get(`/pistas/${reserva.id_pista}`);

          if (pistaResponse && pistaResponse.numero) {
            pistaNumero = pistaResponse.numero;
            pistaTipo = pistaResponse.tipo;
          }
        } catch (error) {
          console.error(`Error al obtener detalles para la reserva:`, error);
        }

        // Crear objeto con detalles completos
        return {
          ...reserva,
          nombre_usuario: nombreUsuario,
          pista_numero: pistaNumero,
          pista_tipo: pistaTipo
        };
      });

      // Esperar a que todas las promesas se resuelvan
      const reservasDetalladas = await Promise.all(reservasPromesas);

      // Ordenar por hora de inicio
      reservasDetalladas.sort((a, b) => {
        if (a.hora_inicio < b.hora_inicio) return -1;
        if (a.hora_inicio > b.hora_inicio) return 1;
        return 0;
      });

      // Actualizar el estado con las reservas procesadas
      setReservasDelDia(reservasDetalladas);

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
    // Establecer el día seleccionado primero
    setDiaSeleccionado(dia.fecha);

    // Luego cargar las reservas para ese día
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

  // Cambiar vista (calendario o lista)
  const cambiarVista = (nuevaVista: 'calendario' | 'lista') => {
    setVistaActual(nuevaVista);

    // Si cambiamos a lista y no hay datos, intentar cargar
    if (nuevaVista === 'lista' && reservasDelMes.length === 0) {
      cargarReservasMes(fechaActual, true);
    }
  };

  // Actualizar reservas (refrescar datos)
  const actualizarReservas = () => {
    if (vistaActual === 'calendario') {
      cargarReservasMes(fechaActual);
      if (diaSeleccionado) {
        cargarReservasDia(diaSeleccionado);
      }
    } else {
      cargarReservasMes(fechaActual, true);
    }
  };

  // Cancelar reserva
  const cancelarReserva = (reservaId: number) => {
    setReservaToCancel(reservaId);
    setShowCancelConfirm(true);
  };

  // Agregar una nueva función para ejecutar la cancelación después de la confirmación
  const confirmCancelReserva = async () => {
    if (!reservaToCancel) return;

    try {
      setCargando(true);

      const response = await apiService.delete(`/eliminar-reserva/${reservaToCancel}`);

      if (response && response.message) {
        mostrarMensaje(response.message, 'success');
      } else {
        mostrarMensaje('Reserva cancelada correctamente', 'success');
      }

      if (diaSeleccionado) {
        cargarReservasDia(diaSeleccionado);
      }
      cargarReservasMes(fechaActual);

      setMostrarDetalleReserva(false);

    } catch (error: any) {
      console.error('Error al cancelar reserva:', error);

      const errorMessage = error.message || 'Error al cancelar la reserva';
      mostrarMensaje(errorMessage, 'danger');
    } finally {
      setCargando(false);
      setShowCancelConfirm(false);
      setReservaToCancel(null);
    }
  };

  const mostrarMensaje = (mensaje: string, color: string = 'success') => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setMostrarToast(true);
  };

  const formatearFecha = (fecha: Date): string => {
    if (!fecha) return '';

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearFechaMostrar = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMesAnio = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearHora = (hora: string): string => {
    return hora.substring(0, 5);
  };


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
    const semanas: DiaCalendario[][] = [];
    for (let i = 0; i < diasCalendario.length; i += 7) {
      semanas.push(diasCalendario.slice(i, i + 7));
    }


    const cambiarEstadoReserva = async (reservaId: number, estadoActual: string) => {
      try {
        setCargando(true);

        // Determinar el nuevo estado (alternar entre "pendiente" y "reservado")
        const nuevoEstado = estadoActual === 'pendiente' ? 'reservado' : 'pendiente';

        // Llamar al endpoint para actualizar el estado
        const response = await apiService.put(`/modificar-reserva/${reservaId}`, {
          estado: nuevoEstado
        });

        // Verificar si la respuesta es exitosa
        if (response && response.message) {
          mostrarMensaje(response.message, 'success');
        } else {
          mostrarMensaje(`Estado cambiado a: ${nuevoEstado}`, 'success');
        }

        // Actualizar la reserva seleccionada con el nuevo estado
        if (reservaSeleccionada) {
          setReservaSeleccionada({
            ...reservaSeleccionada,
            estado: nuevoEstado
          });
        }

        // Actualizar datos
        if (diaSeleccionado) {
          cargarReservasDia(diaSeleccionado);
        }
        cargarReservasMes(fechaActual);

      } catch (error: any) {
        console.error('Error al cambiar estado de reserva:', error);
        const errorMessage = error.message || 'Error al cambiar el estado de la reserva';
        mostrarMensaje(errorMessage, 'danger');
      } finally {
        setCargando(false);
      }
    };

    return (
      <>
        {renderDiasSemana()}

        {semanas.map((semana, semanaIndex) => (
          
          <IonRow className="semana" key={`semana-${semanaIndex}`}>
  {semana.map((dia, diaIndex) => (
    <IonCol
      key={`dia-${semanaIndex}-${diaIndex}`}
      onClick={() => handleClickDia(dia)}>
      <div className={`dia
          ${diaIndex === 0 ? 'primera-columna' : ''}
          ${diaIndex === 6 ? 'ultima-columna' : ''}
          ${!dia.enMesActual ? 'otro-mes' : ''}
          ${dia.tieneReservas ? 'tiene-reservas' : ''}
          ${diaSeleccionado?.toDateString() === dia.fecha.toDateString() ? 'seleccionado' : ''}
          ${formatearFecha(new Date()) === formatearFecha(dia.fecha) ? 'hoy' : ''}`}>
        <div className="numero-dia">{dia.diaMes}</div>
        {dia.tieneReservas && (
          <div className="indicador-reservas">{dia.numReservas}</div>
        )}
      </div>
    </IonCol>
  ))}
</IonRow>


        ))}
      </>
    );
  };

  // Renderizar lista de reservas del día
  const renderListaReservas = () => {
    if (!diaSeleccionado) {
      return (
        <div className="panel-reservas">
          <IonText color="medium">
            <p>Selecciona un día para ver sus reservas</p>
          </IonText>
        </div>
      );
    }

    if (reservasDelDia.length === 0) {
      return (
        <div>
          <IonText color="medium">
            <p>No hay reservas para el {formatearFechaMostrar(diaSeleccionado)}</p>
          </IonText>
        </div>
      );
    }

    return (
      <IonList>
        {reservasDelDia.map((reserva) => (
          <IonItem key={reserva.id} button detail onClick={() => handleClickReserva(reserva)}>
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
        ))}
      </IonList>
    );
  };

  // Renderizar lista de todas las reservas del mes
  const renderListaReservasMes = () => {
    if (cargandoLista) {
      return (
        <div>
          <IonSpinner name="circles" color="light" />
          <p>Cargando reservas...</p>
        </div>
      );
    }

    if (mensajeError) {
      return (
        <div>
          <IonText color="danger">
            <p>{mensajeError}</p>
          </IonText>
          <IonButton onClick={() => cargarReservasMes(fechaActual, true)}>
            <IonIcon slot="start" icon={refreshOutline} />
            Reintentar
          </IonButton>
        </div>
      );
    }

    if (reservasDelMes.length === 0) {
      return (
        <div>
          <IonText color="medium">
            <p>No hay reservas para el mes actual</p>
          </IonText>
          <IonButton size="small" onClick={actualizarReservas}>
            <IonIcon slot="start" icon={refreshOutline} />
            Actualizar
          </IonButton>
        </div>
      );
    }

    return (
      <IonList>
        {reservasDelMes.map((dia) => (
          <React.Fragment key={dia.fecha}>
            <IonItemDivider color="primary" sticky>
              <IonLabel>
                {dia.fechaFormateada}
              </IonLabel>
              <IonChip slot="end" color="light">{dia.reservas.length} reservas</IonChip>
            </IonItemDivider>

            {dia.reservas.map((reserva) => (
              <IonItem key={reserva.id} button detail onClick={() => handleClickReserva(reserva)}>
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
            ))}
          </React.Fragment>
        ))}
      </IonList>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/home')}>
  <IonIcon slot="icon-only" icon={arrowBack} />
</IonButton>
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
        {/* Pull-to-refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Segmento para cambiar entre vista calendario y lista */}
        <IonSegment value={vistaActual} onIonChange={e => cambiarVista(e.detail.value as 'calendario' | 'lista')}>
          <IonSegmentButton value="calendario">
            <IonLabel style={{ background : "transparent" }}>CALENDARIO</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="lista">
            <IonLabel style={{ background : "transparent" }}>LISTA</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {vistaActual === 'calendario' && (
          <div>
            {/* Navegación del calendario */}
            
            <div className="navegacion-calendario">
              <IonButton fill="clear" onClick={irMesAnterior}>
                <IonIcon slot="icon-only" icon={chevronBackOutline} />
              </IonButton>

              <h2 className="titulo-mes">{formatearMesAnio(fechaActual)}</h2>

              <IonButton fill="clear" onClick={irMesSiguiente}>
                <IonIcon slot="icon-only" icon={chevronForwardOutline} />
              </IonButton>

              <IonButton className="boton-hoy" size="small" fill="solid" onClick={irAHoy}>
                Hoy
              </IonButton>
            </div>


            {/* Grid del calendario */}
            <IonGrid className="grid-calendario">
              {renderCalendario()}
            </IonGrid>

            {/* Panel de reservas del día seleccionado */}
            <div>
              {diaSeleccionado && (
                <h3>
                  {formatearFechaMostrar(diaSeleccionado)}
                </h3>
              )}

              {renderListaReservas()}
            </div>
          </div>
        )}

        {/* Vista de lista completa del mes */}
        {vistaActual === 'lista' && (
          <div>
            {renderListaReservasMes()}
          </div>
        )}

        {/* Modal de detalle de reserva */}
        <IonModal className="modal-detalle-reserva" isOpen={mostrarDetalleReserva} onDidDismiss={() => setMostrarDetalleReserva(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonButtons slot="end">
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
                          <IonIcon icon={tennisballOutline} slot="start" color="success" />
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
                        <IonCol size="12">
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
        <IonLoading isOpen={cargando} message="Cargando reservas..." />

        <IonToast
          isOpen={mostrarToast}
          onDidDismiss={() => setMostrarToast(false)}
          message={mensajeToast}
          duration={2000}
          color={colorToast}
        />

        <IonAlert
          isOpen={showCancelConfirm}
          onDidDismiss={() => setShowCancelConfirm(false)}
          header="¿Cancelar reserva?"
          message="Esta acción no se puede deshacer"
          buttons={[
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                setShowCancelConfirm(false);
                setReservaToCancel(null);
              }
            },
            {
              text: 'Sí',
              cssClass: 'danger',
              handler: confirmCancelReserva
            }
          ]}
        />


      </IonContent>
    </IonPage>
  );
};

export default CalendarView;