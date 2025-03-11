// src/pages/Reservas.tsx
import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonList,
  IonListHeader,
  IonIcon,
  IonBadge,
  IonLoading,
  IonToast,
  IonModal,
  IonButtons,
  IonBackButton,
  IonText,
  IonChip,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { 
  calendarOutline, 
  timeOutline, 
  closeCircleOutline, 
  checkmarkCircleOutline, 
  createOutline, 
  trashOutline, 
  tennisballOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../utils/constants';
import './css/Reservas.css';

// Interfaces para tipado
interface Pista {
  id: number;
  numero: number;
  tipo: string;
  precio_hora: number;
  estado: string;
  id_club: number;
}

interface Club {
  id: number;
  nombre: string;
  direccion: string;
  horario_apertura: string;
  horario_cierre: string;
}

interface FranjaHoraria {
  inicio: string;
  fin: string;
}

interface Disponibilidad {
  pista_id: number;
  numero_pista: number;
  fecha: string;
  disponible: boolean;
  horario_club: {
    apertura: string;
    cierre: string;
  };
  franjas_disponibles: FranjaHoraria[];
}

interface Reserva {
  id: number;
  id_usuario: number;
  id_pista: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  precio_total: number;
  fecha_reserva: string;
  notas: string;
  pista?: {
    numero: number;
    tipo: string;
    precio_hora: number;
  };
}

const Reservas: React.FC = () => {
  // Estados del componente
  const [clubes, setClubes] = useState<Club[]>([]);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [pistaSeleccionada, setPistaSeleccionada] = useState<number | null>(null);
  const [clubSeleccionado, setClubSeleccionado] = useState<number | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState<string>('');
  const [horaFin, setHoraFin] = useState<string>('');
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(null);
  const [misReservas, setMisReservas] = useState<Reserva[]>([]);
  const [cargandoPistas, setCargandoPistas] = useState<boolean>(false);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState<boolean>(false);
  const [cargandoReservas, setCargandoReservas] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [mensajeToast, setMensajeToast] = useState<string>('');
  const [colorToast, setColorToast] = useState<string>('success');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [segmento, setSegmento] = useState<string>('hacer');
  const [isDatetimeOpen, setIsDatetimeOpen] = useState(false);
  
  const { user } = useAuth();
  const history = useHistory();
  
  // Formatear fecha para el backend (YYYY-MM-DD)
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  };

  // Formatear hora para mostrar (HH:MM)
  const formatearHora = (hora: string): string => {
    return hora.substr(0, 5);
  };

  // Cargar clubes al iniciar
  useEffect(() => {
    const cargarClubes = async () => {
      try {
        const data = await apiService.get('/clubs');
        setClubes(data);
      } catch (error) {
        console.error('Error al cargar clubes:', error);
        mostrarToast('Error al cargar los clubes', 'danger');
      }
    };
    
    cargarClubes();
  }, []);

  // Cargar pistas cuando se selecciona un club
  useEffect(() => {
    if (!clubSeleccionado) return;
    
    const cargarPistas = async () => {
      try {
        setCargandoPistas(true);
        // Asumiendo que hay un endpoint para obtener pistas por club
        // Si no existe, habría que crearlo en el backend
        const data = await apiService.get(`/clubs/${clubSeleccionado}/pistas`);
        setPistas(data);
      } catch (error) {
        console.error('Error al cargar pistas:', error);
        mostrarToast('Error al cargar las pistas', 'danger');
      } finally {
        setCargandoPistas(false);
      }
    };
    
    cargarPistas();
  }, [clubSeleccionado]);

  // Cargar mis reservas cuando cambie el usuario
  useEffect(() => {
    if (!user) return;
    
    const cargarMisReservas = async () => {
      try {
        setCargandoReservas(true);
        const data = await apiService.get(`/reservas?id_usuario=${user.id}`);
        setMisReservas(data);
      } catch (error) {
        console.error('Error al cargar reservas:', error);
        mostrarToast('Error al cargar tus reservas', 'danger');
      } finally {
        setCargandoReservas(false);
      }
    };
    
    cargarMisReservas();
  }, [user]);

  // Comprobar disponibilidad cuando se selecciona una pista y fecha
  useEffect(() => {
    if (!pistaSeleccionada || !fechaSeleccionada) return;
    
    const comprobarDisponibilidad = async () => {
      try {
        setCargandoDisponibilidad(true);
        const fechaFormateada = formatearFecha(fechaSeleccionada);
        const data = await apiService.get(
          `/pistas/${pistaSeleccionada}/disponibilidad?fecha=${fechaFormateada}`
        );
        setDisponibilidad(data);
      } catch (error) {
        console.error('Error al comprobar disponibilidad:', error);
        mostrarToast('Error al comprobar disponibilidad', 'danger');
      } finally {
        setCargandoDisponibilidad(false);
      }
    };
    
    comprobarDisponibilidad();
  }, [pistaSeleccionada, fechaSeleccionada]);

  // Función para crear una nueva reserva
  const crearReserva = async () => {
    if (!user || !pistaSeleccionada || !fechaSeleccionada || !horaInicio || !horaFin) {
      mostrarToast('Por favor, completa todos los campos', 'warning');
      return;
    }
    
    try {
      const reservaData = {
        id_usuario: user.id,
        id_pista: pistaSeleccionada,
        fecha: formatearFecha(fechaSeleccionada),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        notas: ''
      };
      
      const response = await apiService.post('/crear-reserva', reservaData);
      
      mostrarToast('Reserva creada correctamente', 'success');
      
      // Actualizar lista de reservas
      const data = await apiService.get(`/reservas?id_usuario=${user.id}`);
      setMisReservas(data);
      
      // Limpiar formulario
      setPistaSeleccionada(null);
      setFechaSeleccionada('');
      setHoraInicio('');
      setHoraFin('');
      setDisponibilidad(null);
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      mostrarToast('Error al crear la reserva', 'danger');
    }
  };

  // Función para cancelar una reserva
  const cancelarReserva = async (reservaId: number) => {
    try {
      await apiService.delete(`/eliminar-reserva/${reservaId}`);
      
      mostrarToast('Reserva cancelada correctamente', 'success');
      
      // Actualizar lista de reservas
      const data = await apiService.get(`/reservas?id_usuario=${user?.id}`);
      setMisReservas(data);
      
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      mostrarToast('Error al cancelar la reserva', 'danger');
    }
  };

  // Función para mostrar toast
  const mostrarToast = (mensaje: string, color: string) => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setShowToast(true);
  };

  // Función para seleccionar franja horaria
  const seleccionarFranja = (franja: FranjaHoraria) => {
    setHoraInicio(franja.inicio);
    setHoraFin(franja.fin);
  };

  // Generar opciones para selección de horas
  const generarOpcionesHoras = () => {
    if (!disponibilidad || !disponibilidad.franjas_disponibles) return null;
    
    return disponibilidad.franjas_disponibles.map((franja, index) => (
      <IonButton 
        key={index}
        fill="outline"
        size="small"
        className="franja-horaria"
        onClick={() => seleccionarFranja(franja)}
      >
        {formatearHora(franja.inicio)} - {formatearHora(franja.fin)}
      </IonButton>
    ));
  };

  // Obtener el nombre del club por ID
  const getNombreClub = (clubId: number): string => {
    const club = clubes.find(c => c.id === clubId);
    return club ? club.nombre : 'Club no encontrado';
  };

  // Obtener el estado formateado de una reserva
  const getEstadoReserva = (estado: string): JSX.Element => {
    let color = 'medium';
    let icon = null;
    
    switch (estado) {
      case 'pendiente':
        color = 'warning';
        icon = timeOutline;
        break;
      case 'confirmada':
        color = 'success';
        icon = checkmarkCircleOutline;
        break;
      case 'cancelada':
        color = 'danger';
        icon = closeCircleOutline;
        break;
      default:
        break;
    }
    
    return (
      <IonChip color={color}>
        {icon && <IonIcon icon={icon} />}
        <IonLabel>{estado.toUpperCase()}</IonLabel>
      </IonChip>
    );
  };

  // Manejar cambio de fecha
  const handleDateChange = (value: string | string[] | null | undefined) => {
    if (value && typeof value === 'string') {
      setFechaSeleccionada(value);
    }
    setIsDatetimeOpen(false);
  };

  // Formatear fecha para mostrar
  const formatearFechaMostrar = (fecha: string): string => {
    if (!fecha) return 'Seleccionar fecha';
    return new Date(fecha).toLocaleDateString();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Reservas de Pistas</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="reservas-container">
        <IonSegment value={segmento} onIonChange={e => setSegmento(e.detail.value as string)}>
          <IonSegmentButton value="hacer">
            <IonLabel>Hacer Reserva</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="mis">
            <IonLabel>Mis Reservas</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        
        {segmento === 'hacer' && (
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8" offsetMd="2">
                <IonCard className="reserva-card">
                  <IonCardHeader>
                    <IonCardTitle>Reservar Pista</IonCardTitle>
                  </IonCardHeader>
                  
                  <IonCardContent>
                    <IonItem>
                      <IonLabel position="floating">Club</IonLabel>
                      <IonSelect 
                        value={clubSeleccionado} 
                        onIonChange={e => setClubSeleccionado(e.detail.value)}
                        placeholder="Selecciona un club"
                      >
                        {clubes.map(club => (
                          <IonSelectOption key={club.id} value={club.id}>
                            {club.nombre}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="floating">Pista</IonLabel>
                      <IonSelect 
                        value={pistaSeleccionada} 
                        onIonChange={e => setPistaSeleccionada(e.detail.value)}
                        placeholder="Selecciona una pista"
                        disabled={!clubSeleccionado || cargandoPistas}
                      >
                        {pistas.map(pista => (
                            <IonSelectOption key={pista.id} value={pista.id}>
                                Pista {pista.numero} - {pista.tipo} - {pista.precio_hora}€/hora
                            </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    
                    <IonItem button onClick={() => setIsDatetimeOpen(true)} disabled={!pistaSeleccionada}>
                      <IonLabel position="floating">Fecha</IonLabel>
                      <IonLabel>{fechaSeleccionada ? formatearFechaMostrar(fechaSeleccionada) : 'Seleccionar fecha'}</IonLabel>
                      <IonIcon slot="end" icon={calendarOutline} />
                    </IonItem>
                    
                    <IonModal isOpen={isDatetimeOpen} onDidDismiss={() => setIsDatetimeOpen(false)}>
                      <IonDatetime
                        value={fechaSeleccionada}
                        presentation="date"
                        onIonChange={e => handleDateChange(e.detail.value)}
                        min={new Date().toISOString()}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()}
                        locale="es-ES"
                        firstDayOfWeek={1}
                        cancelText="Cancelar"
                        doneText="Aceptar"
                      >
                        <IonButtons slot="buttons">
                          <IonButton onClick={() => setIsDatetimeOpen(false)}>Cancelar</IonButton>
                          <IonButton strong={true} onClick={() => handleDateChange(fechaSeleccionada)}>Aceptar</IonButton>
                        </IonButtons>
                      </IonDatetime>
                    </IonModal>
                    
                    {cargandoDisponibilidad && (
                      <div className="loading-container">
                        <IonLabel>Comprobando disponibilidad...</IonLabel>
                      </div>
                    )}
                    
                    {disponibilidad && (
                      <div className="franjas-disponibles">
                        <IonListHeader>
                          <IonLabel>Horarios disponibles</IonLabel>
                        </IonListHeader>
                        
                        {disponibilidad.franjas_disponibles && disponibilidad.franjas_disponibles.length > 0 ? (
                          <div className="franjas-grid">
                            {generarOpcionesHoras()}
                          </div>
                        ) : (
                          <IonText color="danger">
                            <p>No hay horarios disponibles para esta fecha</p>
                          </IonText>
                        )}
                        
                        {horaInicio && horaFin && (
                          <div className="hora-seleccionada">
                            <IonLabel>Horario seleccionado:</IonLabel>
                            <IonChip>
                              <IonLabel>{formatearHora(horaInicio)} - {formatearHora(horaFin)}</IonLabel>
                            </IonChip>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <IonButton 
                      expand="block" 
                      onClick={crearReserva}
                      disabled={!pistaSeleccionada || !fechaSeleccionada || !horaInicio || !horaFin}
                      className="reservar-button"
                    >
                      Reservar Pista
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
        
        {segmento === 'mis' && (
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8" offsetMd="2">
                <IonCard className="mis-reservas-card">
                  <IonCardHeader>
                    <IonCardTitle>Mis Reservas</IonCardTitle>
                  </IonCardHeader>
                  
                  <IonCardContent>
                    {cargandoReservas ? (
                      <div className="loading-container">
                        <IonLabel>Cargando reservas...</IonLabel>
                      </div>
                    ) : (
                      <>
                        {misReservas.length === 0 ? (
                          <div className="sin-reservas">
                            <IonIcon icon={tennisballOutline} size="large" />
                            <IonText>
                              <p>No tienes reservas activas</p>
                            </IonText>
                            <IonButton 
                              fill="outline" 
                              size="small"
                              onClick={() => setSegmento('hacer')}
                            >
                              Hacer una reserva
                            </IonButton>
                          </div>
                        ) : (
                          <IonList>
                            {misReservas.map(reserva => (
                              <IonItem key={reserva.id} lines="full" className="reserva-item">
                                <div className="reserva-info">
                                  <div className="reserva-header">
                                    <h2>Pista {reserva.pista?.numero || 'N/A'}</h2>
                                    {getEstadoReserva(reserva.estado)}
                                  </div>
                                  
                                  <div className="reserva-detalles">
                                    <p>
                                      <IonIcon icon={calendarOutline} />
                                      Fecha: {new Date(reserva.fecha).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <IonIcon icon={timeOutline} />
                                      Hora: {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                                    </p>
                                    <p>
                                      Precio: {reserva.precio_total.toFixed(2)}€
                                    </p>
                                  </div>
                                  
                                  {reserva.estado !== 'cancelada' && (
                                    <div className="reserva-acciones">
                                      <IonButton 
                                        fill="clear" 
                                        color="danger"
                                        size="small"
                                        onClick={() => cancelarReserva(reserva.id)}
                                      >
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                      </IonButton>
                                    </div>
                                  )}
                                </div>
                              </IonItem>
                            ))}
                          </IonList>
                        )}
                      </>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={mensajeToast}
          duration={2000}
          position="bottom"
          color={colorToast}
        />
        
        <IonLoading
          isOpen={cargandoPistas || cargandoDisponibilidad || cargandoReservas}
          message={'Cargando...'}
          spinner="circles"
        />
      </IonContent>
    </IonPage>
  );
};

export default Reservas;