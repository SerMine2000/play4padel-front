import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonDatetime, IonLoading, IonToast, IonIcon, IonPopover, IonHeader, IonToolbar, IonTitle, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonText } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import DisposicionDashboard from '../componentes/DisposicionDashboard';
import {
  tennisballOutline,
  calendarOutline,
  timeOutline,
  businessOutline,
  cashOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import '../theme/variables.css';
import './css/Reservas.css';

interface FranjaHoraria {
  inicio: string;
  fin: string;
  seleccionada: boolean;
}


interface RangoHorario {
  inicio: string;
  fin: string;
}

const Reservas: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const fechaSelectorRef = useRef<HTMLDivElement>(null);
  
  // Estados para los datos de la reserva
  const [clubes, setClubes] = useState<any[]>([]);
  const [pistas, setPistas] = useState<any[]>([]);
  const [clubSeleccionado, setClubSeleccionado] = useState<number | null>(null);
  const [clubDatos, setClubDatos] = useState<any>(null);
  const [pistaSeleccionada, setPistaSeleccionada] = useState<number | null>(null);
  const [pistaDatos, setPistaDatos] = useState<any>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [horasDisponibles, setHorasDisponibles] = useState<FranjaHoraria[]>([]);
  const [franjasSeleccionadas, setFranjasSeleccionadas] = useState<FranjaHoraria[]>([]);
  const [rangosHorarios, setRangosHorarios] = useState<RangoHorario[]>([]);
  const [precioTotal, setPrecioTotal] = useState<number>(0);
  const [tarifaTotal, setTarifaTotal] = useState<number>(0);
  const [notas, setNotas] = useState<string>('');
  const [isDateTimeOpen, setIsDateTimeOpen] = useState<boolean>(false);
  
  // Estados para UI
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarToast, setMostrarToast] = useState<boolean>(false);
  const [mensajeToast, setMensajeToast] = useState<string>('');
  const [colorToast, setColorToast] = useState<string>('success');
  
  // Cargar clubes al iniciar
  useEffect(() => {
    cargarClubes();
  }, []);
  
  // Función para cargar clubes
  const cargarClubes = async () => {
    try {
      setCargando(true);
      const response = await apiService.get('/clubs');
      console.log("Clubes cargados:", response);
      setClubes(response);
    } catch (error) {
      console.error('Error al cargar clubes:', error);
      mostrarMensaje('Error al cargar los clubes', 'danger');
    } finally {
      setCargando(false);
    }
  };
  
  // Cargar pistas cuando se selecciona un club
  useEffect(() => {
    if (clubSeleccionado) {
      cargarPistas();
      
      // Obtener datos del club seleccionado
      const club = clubes.find(c => c.id === clubSeleccionado);
      setClubDatos(club);
    } else {
      setClubDatos(null);
    }
  }, [clubSeleccionado, clubes]);
  
  // Función para cargar pistas
  const cargarPistas = async () => {
    if (!clubSeleccionado) return;
    
    try {
      setCargando(true);
      const response = await apiService.get(`/clubs/${clubSeleccionado}/pistas`);
      console.log("Pistas cargadas:", response);
      setPistas(response);
    } catch (error) {
      console.error('Error al cargar pistas:', error);
      mostrarMensaje('Error al cargar las pistas', 'danger');
    } finally {
      setCargando(false);
    }
  };
  
  // Cargar datos de la pista seleccionada
  useEffect(() => {
    if (pistaSeleccionada) {
      const pistaInfo = pistas.find(p => p.id === pistaSeleccionada);
      console.log("Pista seleccionada:", pistaInfo);
      setPistaDatos(pistaInfo);
    } else {
      setPistaDatos(null);
    }
  }, [pistaSeleccionada, pistas]);
  
  // Actualizar precio cuando cambian las franjas seleccionadas o la pista
  useEffect(() => {
    calcularPrecioTotal();
  }, [franjasSeleccionadas, pistaDatos]);
  
  // Verificar disponibilidad cuando se selecciona fecha y pista
  useEffect(() => {
    if (pistaSeleccionada && fechaSeleccionada) {
      verificarDisponibilidad();
    }
  }, [pistaSeleccionada, fechaSeleccionada]);
  
  // Actualizar rangos horarios cuando cambian las franjas seleccionadas
  useEffect(() => {
    if (franjasSeleccionadas.length > 0) {
      const rangos = consolidarRangosHorarios(franjasSeleccionadas);
      setRangosHorarios(rangos);
    } else {
      setRangosHorarios([]);
    }
  }, [franjasSeleccionadas]);
  
  // Función para calcular el precio total basado en el número de franjas horarias
  const calcularPrecioTotal = () => {
    if (!pistaDatos || franjasSeleccionadas.length === 0) {
      setPrecioTotal(0);
      setTarifaTotal(0);
      return;
    }
    
    // Obtener el precio base de la pista
    const precioPista = pistaDatos.precio_hora;
    
    // Multiplicar por el número de franjas seleccionadas
    const numFranjas = franjasSeleccionadas.length;
    const precio = precioPista * numFranjas;
    
    console.log(`Calculando precio: ${precioPista}€ × ${numFranjas} franjas = ${precio}€`);
    
    setPrecioTotal(precio);
    setTarifaTotal(precio); // También actualizar la tarifa total
  };
  
  // Función para consolidar franjas horarias en rangos continuos
  const consolidarRangosHorarios = (franjas: FranjaHoraria[]): RangoHorario[] => {
    if (franjas.length === 0) return [];
    
    // Ordenar franjas por hora de inicio
    const franjasOrdenadas = [...franjas].sort((a, b) => a.inicio.localeCompare(b.inicio));
    
    const rangos: RangoHorario[] = [];
    let rangoActual: RangoHorario = {
      inicio: franjasOrdenadas[0].inicio,
      fin: franjasOrdenadas[0].fin
    };
    
    for (let i = 1; i < franjasOrdenadas.length; i++) {
      const franja = franjasOrdenadas[i];
      
      // Si esta franja comienza donde termina la anterior, extender el rango
      if (franja.inicio === rangoActual.fin) {
        rangoActual.fin = franja.fin;
      } else {
        // Si hay un hueco, guardar el rango actual y comenzar uno nuevo
        rangos.push({ ...rangoActual });
        rangoActual = {
          inicio: franja.inicio,
          fin: franja.fin
        };
      }
    }
    
    // Añadir el último rango
    rangos.push(rangoActual);
    
    return rangos;
  };
  
  // Función para verificar disponibilidad
  const verificarDisponibilidad = async () => {
    if (!pistaSeleccionada || !fechaSeleccionada) return;
    
    try {
      setCargando(true);
      const fechaFormateada = formatearFecha(fechaSeleccionada);
      
      // Obtener todas las reservas existentes para esta pista y fecha
      const reservasResponse = await apiService.get(`/reservas?id_pista=${pistaSeleccionada}&fecha=${fechaFormateada}`);
      console.log("Reservas existentes:", reservasResponse);
      const reservasExistentes = Array.isArray(reservasResponse) ? reservasResponse : [];
      
      // Obtener horario del club
      const disponibilidadResponse = await apiService.get(`/pistas/${pistaSeleccionada}/disponibilidad?fecha=${fechaFormateada}`);
      console.log("Disponibilidad:", disponibilidadResponse);
      
      if (disponibilidadResponse.disponible) {
        // Generar todas las franjas horarias fijas de 90 minutos
        const todasLasFranjas = generarFranjasFijas(
          disponibilidadResponse.horario_club.apertura, 
          disponibilidadResponse.horario_club.cierre
        );
        
        // Filtrar franjas ocupadas
        const franjasDisponibles = filtrarFranjasOcupadas(todasLasFranjas, reservasExistentes);
        
        console.log("Franjas disponibles:", franjasDisponibles);
        
        if (franjasDisponibles.length > 0) {
          setHorasDisponibles(franjasDisponibles);
          setFranjasSeleccionadas([]);  // Resetear selección al cambiar disponibilidad
          setRangosHorarios([]);
        } else {
          setHorasDisponibles([]);
          mostrarMensaje('No hay horarios disponibles para esta fecha', 'warning');
        }
      } else {
        setHorasDisponibles([]);
        mostrarMensaje('La pista no está disponible para esta fecha', 'warning');
      }
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      mostrarMensaje('Error al verificar disponibilidad', 'danger');
    } finally {
      setCargando(false);
    }
  };
  
  // Función para generar franjas horarias fijas de 90 minutos
  const generarFranjasFijas = (horaApertura: string, horaCierre: string): FranjaHoraria[] => {
    const franjas: FranjaHoraria[] = [];
    
    // Convertir a objetos Date para facilitar cálculos
    let horaActual = new Date(`2000-01-01T${horaApertura}`);
    const horaFin = new Date(`2000-01-01T${horaCierre}`);
    
    // La duración de cada franja en milisegundos (90 minutos = 5400000 ms)
    const duracionFranja = 90 * 60 * 1000;
    
    // Generar franjas fijas de 90 minutos
    while (horaActual.getTime() + duracionFranja <= horaFin.getTime()) {
      const inicio = horaActual.toISOString().substr(11, 5);
      
      // Avanzar 90 minutos para el fin de esta franja
      const finDate = new Date(horaActual.getTime() + duracionFranja);
      const fin = finDate.toISOString().substr(11, 5);
      
      franjas.push({
        inicio,
        fin,
        seleccionada: false
      });
      
      // La siguiente franja empieza donde termina esta
      horaActual = finDate;
    }
    
    return franjas;
  };
  
  // Función para filtrar franjas ocupadas por reservas existentes
  const filtrarFranjasOcupadas = (franjas: FranjaHoraria[], reservas: any[]): FranjaHoraria[] => {
    if (!reservas || reservas.length === 0) return franjas;
    
    return franjas.filter(franja => {
      // Verificar si esta franja se solapa con alguna reserva existente
      const horaInicioFranja = new Date(`2000-01-01T${franja.inicio}`);
      const horaFinFranja = new Date(`2000-01-01T${franja.fin}`);
      
      for (const reserva of reservas) {
        if (reserva.estado === 'cancelada') continue; // Ignorar reservas canceladas
        
        const horaInicioReserva = new Date(`2000-01-01T${reserva.hora_inicio}`);
        const horaFinReserva = new Date(`2000-01-01T${reserva.hora_fin}`);
        
        // Comprobar si hay solapamiento
        if (
          (horaInicioFranja < horaFinReserva && horaFinFranja > horaInicioReserva) ||
          (horaInicioReserva < horaFinFranja && horaFinReserva > horaInicioFranja)
        ) {
          return false; // Franja ocupada
        }
      }
      
      return true; // Franja disponible
    });
  };
  
  // Función para seleccionar/deseleccionar franjas horarias
  const toggleFranjaHoraria = (franja: FranjaHoraria) => {
    // Copiar el array de franjas disponibles
    const nuevasHorasDisponibles = horasDisponibles.map(f => {
      if (f.inicio === franja.inicio && f.fin === franja.fin) {
        return { ...f, seleccionada: !f.seleccionada };
      }
      return f;
    });
    
    setHorasDisponibles(nuevasHorasDisponibles);
    
    // Actualizar franjas seleccionadas
    const nuevasFranjasSeleccionadas = nuevasHorasDisponibles.filter(f => f.seleccionada);
    setFranjasSeleccionadas(nuevasFranjasSeleccionadas);
  };
  
  // Función para realizar la reserva
  const realizarReserva = async () => {
    if (!user) {
      mostrarMensaje('Debes iniciar sesión para reservar', 'warning');
      return;
    }
  
    if (!pistaDatos || !fechaSeleccionada || franjasSeleccionadas.length === 0) {
      mostrarMensaje('Por favor, completa todos los campos requeridos', 'warning');
      return;
    }
  
    try {
      setCargando(true);
      let ultimaReservaId: number | null = null;
  
      for (const franja of franjasSeleccionadas) {
        const reservaData = {
          id_usuario: user.id,
          id_pista: pistaSeleccionada,
          fecha: formatearFecha(fechaSeleccionada),
          hora_inicio: formatearHoraAPI(franja.inicio),
          hora_fin: formatearHoraAPI(franja.fin),
          precio_total: pistaDatos.precio_hora,
          estado: 'pendiente',
          notas: notas || ''
        };
  
        const respuesta = await apiService.post('/crear-reserva', reservaData);
        console.log("Respuesta crear-reserva:", respuesta);
  
        const idReserva = respuesta?.reserva_id || respuesta?.data?.reserva_id;
  
        if (!idReserva) {
          mostrarMensaje('No se pudo obtener el ID de la reserva creada', 'danger');
          return;
        }
  
        ultimaReservaId = idReserva;
      }
  
      if (ultimaReservaId) {
        history.replace(`/pay?reservaId=${ultimaReservaId}&precio=${pistaDatos.precio_hora}`);
      } else {
        mostrarMensaje('No se pudo crear ninguna reserva', 'danger');
      }
  
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      mostrarMensaje('No se ha podido realizar la reserva.', 'danger');
    } finally {
      setCargando(false);
    }
  };
    
  
  // Función para mostrar mensajes
  const mostrarMensaje = (mensaje: string, color: string = 'success') => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setMostrarToast(true);
  };
  
  // Función para formatear fecha
  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toISOString().split('T')[0];
  };
  
  // Función para formatear fecha para mostrar
  const formatearFechaMostrar = (fecha: string): string => {
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return fecha;
    }
  };
  
  // Función para formatear hora
  const formatearHora = (hora: string): string => {
    return hora.substr(0, 5);
  };
  
  // Función para formatear hora al formato API (HH:MM)
  const formatearHoraAPI = (hora: string): string => {
    return hora.substr(0, 5);
  };

  // Manejar el cambio de fecha
  const handleFechaChange = (e: CustomEvent) => {
    if (e.detail.value) {
      setFechaSeleccionada(e.detail.value as string);
      setIsDateTimeOpen(false);
    }
  };

  // Obtener string de horarios consolidados para mostrar
  const obtenerHorariosConsolidados = (): string => {
    if (rangosHorarios.length === 0) return '';
    
    return rangosHorarios.map(rango => 
      `${formatearHora(rango.inicio)} - ${formatearHora(rango.fin)}`
    ).join(', ');
  };

  // Generar resumen de la reserva
  const generarResumenReserva = () => {
    if (!clubDatos || !pistaDatos || !fechaSeleccionada || franjasSeleccionadas.length === 0) {
      return null;
    }

    const horariosStr = obtenerHorariosConsolidados();

    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Resumen de la Reserva</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol size="1">
                <IonIcon icon={businessOutline} color="primary" />
              </IonCol>
              <IonCol size="11">
                <strong>Club:</strong> {clubDatos.nombre}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="1">
                <IonIcon icon={tennisballOutline} color="primary" />
              </IonCol>
              <IonCol size="11">
                <strong>Pista:</strong> Pista {pistaDatos.numero} - {pistaDatos.tipo}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="1">
                <IonIcon icon={calendarOutline} color="primary" />
              </IonCol>
              <IonCol size="11">
                <strong>Fecha:</strong> {formatearFechaMostrar(fechaSeleccionada)}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="1">
                <IonIcon icon={timeOutline} color="primary" />
              </IonCol>
              <IonCol size="11">
                <strong>Horario:</strong> {horariosStr}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="1">
                <IonIcon icon={cashOutline} color="success" />
              </IonCol>
              <IonCol size="11">
                <strong>Tarifa:</strong> {tarifaTotal}€
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <IonPage>
      <IonContent>
          <IonHeader>
            <IonToolbar color="primary">
              <IonButtons slot="start">
                <IonButton fill="clear" onClick={() => history.replace('/home')}>
                  <IonIcon slot="icon-only" icon={arrowBack} />
                </IonButton>
              </IonButtons>
              <IonTitle>Reserva de Pista</IonTitle>
            </IonToolbar>
          </IonHeader>
          <div className="pagina-reservas">
            <form>
              {/* Selección de Club */}
              <div>
                <label>Selecciona un Club *</label>
                <IonSelect value={clubSeleccionado} placeholder="Selecciona un club" interface="action-sheet"
                  onIonChange={e => {
                    setClubSeleccionado(e.detail.value);
                    setPistaSeleccionada(null);
                    setPistaDatos(null);
                    setHorasDisponibles([]);
                    setFranjasSeleccionadas([]);
                    setRangosHorarios([]);
                  }}>
                  {clubes.map(club => (
                    <IonSelectOption key={club.id} value={club.id}>{club.nombre}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>
              {/* Notas adicionales */}
              <div>
                <label>Notas adicionales</label>
                <IonTextarea value={notas} placeholder="Escribe aquí cualquier información adicional"
                  onIonChange={e => setNotas(e.detail.value || '')} rows={3}></IonTextarea>
              </div>
              {/* Resumen de la reserva */}
              {franjasSeleccionadas.length > 0 && (
                <>
                  {generarResumenReserva()}
                  {/* Precio Total */}
                  <div>
                    <div>
                      <label>Precio Total:</label>
                      <div>{precioTotal.toFixed(2)}€</div>
                    </div>
                  </div>
                </>
              )}
              {/* Botón de reserva */}
              <IonButton expand="block" onClick={realizarReserva}
                disabled={!clubSeleccionado || !pistaSeleccionada || !fechaSeleccionada || franjasSeleccionadas.length === 0}>
                <IonIcon slot="start" icon={tennisballOutline} />
                RESERVAR PISTA
              </IonButton>
            </form>
          </div>
          {/* Loading y Toast */}
          <IonLoading isOpen={cargando} message={"Cargando..."} />
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
export default Reservas;