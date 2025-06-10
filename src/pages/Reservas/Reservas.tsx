import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonTextarea, IonDatetime, IonToast, IonIcon } from '@ionic/react';
import { tennisballOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import '../../theme/variables.css';
import './Reservas.css';

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
  const navigate = useNavigate();
  
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
  
  // Estados para UI - SOLO UN ESTADO DE CARGA
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
      // Ordenar pistas por número
      const pistasOrdenadas = response.sort((a: any, b: any) => a.numero - b.numero);
      setPistas(pistasOrdenadas);
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
  
  // Función para calcular el precio total basado en la duración
  const calcularPrecioTotal = () => {
    if (!pistaDatos || franjasSeleccionadas.length === 0) {
      setPrecioTotal(0);
      setTarifaTotal(0);
      return;
    }
    
    // El precio_hora de la pista representa el precio por 1.5 horas (90 minutos)
    // Calculamos proporcionalmente según el número de franjas de 30 minutos
    const precioBase = pistaDatos.precio_hora; // Precio por 90 minutos
    const precioPor30Min = precioBase / 3; // Dividimos entre 3 porque 90 min = 3 * 30 min
    const numeroFranjas = franjasSeleccionadas.length;
    const precioCalculado = precioPor30Min * numeroFranjas;
    
    console.log(`Calculando precio: ${precioBase}€ base ÷ 3 = ${precioPor30Min.toFixed(2)}€ por 30 min`);
    console.log(`${numeroFranjas} franjas × ${precioPor30Min.toFixed(2)}€ = ${precioCalculado.toFixed(2)}€`);
    
    setPrecioTotal(precioCalculado);
    setTarifaTotal(precioCalculado);
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
      const reservasExistentes = Array.isArray(reservasResponse) ? reservasResponse : [];
      
      // Obtener horario del club
      const disponibilidadResponse = await apiService.get(`/pistas/${pistaSeleccionada}/disponibilidad?fecha=${fechaFormateada}`);
      
      if (disponibilidadResponse.disponible) {
        // Generar todas las franjas horarias fijas de 90 minutos
        const todasLasFranjas = generarFranjasFijas(
          disponibilidadResponse.horario_club.apertura, 
          disponibilidadResponse.horario_club.cierre
        );
        
        // Filtrar franjas ocupadas
        const franjasDisponibles = filtrarFranjasOcupadas(todasLasFranjas, reservasExistentes);
        
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
  
  // Función para generar franjas horarias de 30 minutos
  const generarFranjasFijas = (horaApertura: string, horaCierre: string): FranjaHoraria[] => {
    const franjas: FranjaHoraria[] = [];
    
    // Convertir a objetos Date para facilitar cálculos
    let horaActual = new Date(`2000-01-01T${horaApertura}`);
    const horaFin = new Date(`2000-01-01T${horaCierre}`);
    
    // La duración de cada franja en milisegundos (30 minutos = 1800000 ms)
    const duracionFranja = 30 * 60 * 1000;
    
    // Generar franjas de 30 minutos
    while (horaActual.getTime() + duracionFranja <= horaFin.getTime()) {
      const inicio = horaActual.toISOString().substr(11, 5);
      
      // Avanzar 30 minutos para el fin de esta franja
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
  
  // Función para verificar si las franjas seleccionadas son consecutivas
  const sonFranjasConsecutivas = (franjas: FranjaHoraria[]): boolean => {
    if (franjas.length <= 1) return true;
    
    // Ordenar franjas por hora de inicio
    const franjasOrdenadas = [...franjas].sort((a, b) => a.inicio.localeCompare(b.inicio));
    
    // Verificar que cada franja termine donde empieza la siguiente
    for (let i = 0; i < franjasOrdenadas.length - 1; i++) {
      if (franjasOrdenadas[i].fin !== franjasOrdenadas[i + 1].inicio) {
        return false;
      }
    }
    return true;
  };

  // Función para seleccionar/deseleccionar franjas horarias (máximo 3 franjas de 30 min = 1.5h)
  const toggleFranjaHoraria = (franja: FranjaHoraria) => {
    const nuevasHorasDisponibles = [...horasDisponibles];
    const franjaIndex = nuevasHorasDisponibles.findIndex(f => 
      f.inicio === franja.inicio && f.fin === franja.fin
    );
    
    if (franjaIndex === -1) return;
    
    const franjaActual = nuevasHorasDisponibles[franjaIndex];
    
    // Si la franja ya está seleccionada, la deseleccionamos
    if (franjaActual.seleccionada) {
      franjaActual.seleccionada = false;
    } else {
      // Si no está seleccionada, verificamos si podemos añadirla
      const franjasYaSeleccionadas = nuevasHorasDisponibles.filter(f => f.seleccionada);
      
      // Verificar límite máximo (3 franjas = 90 minutos)
      if (franjasYaSeleccionadas.length >= 3) {
        mostrarMensaje('Máximo 1.5 horas de reserva permitidas', 'warning');
        return;
      }
      
      // Crear array temporal con la nueva selección
      const franjasConNueva = [...franjasYaSeleccionadas, franjaActual];
      
      // Verificar que las franjas sean consecutivas
      if (!sonFranjasConsecutivas(franjasConNueva)) {
        mostrarMensaje('Las franjas horarias deben ser consecutivas', 'warning');
        return;
      }
      
      franjaActual.seleccionada = true;
    }
    
    setHorasDisponibles(nuevasHorasDisponibles);
    
    // Actualizar franjas seleccionadas
    const nuevasFranjasSeleccionadas = nuevasHorasDisponibles.filter(f => f.seleccionada);
    setFranjasSeleccionadas(nuevasFranjasSeleccionadas);
  };
  
  // Función para realizar la reserva con múltiples franjas
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
      
      // Ordenar franjas por hora de inicio
      const franjasOrdenadas = [...franjasSeleccionadas].sort((a, b) => a.inicio.localeCompare(b.inicio));
      
      // La hora de inicio es la primera franja y la hora de fin es la última franja
      const horaInicio = franjasOrdenadas[0].inicio;
      const horaFin = franjasOrdenadas[franjasOrdenadas.length - 1].fin;
      
      const reservaData = {
        id_usuario: user.id,
        id_pista: pistaSeleccionada,
        fecha: formatearFecha(fechaSeleccionada),
        hora_inicio: formatearHoraAPI(horaInicio),
        hora_fin: formatearHoraAPI(horaFin),
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

      let precioFinal = precioTotal;
      
      try {
        const reservaCompleta = await apiService.get(`/reservas/${idReserva}`);
        if (reservaCompleta && reservaCompleta.precio_total) {
          precioFinal = reservaCompleta.precio_total;
        }
      } catch (error) {
        console.warn("Error al obtener datos de la reserva, usando precio calculado como fallback:", error);
      }
      
      navigate('/pay', {
        state: {
          reserva_id: idReserva,
          id_pista: pistaSeleccionada,
          fecha: formatearFecha(fechaSeleccionada),
          hora_inicio: formatearHoraAPI(horaInicio),
          hora_fin: formatearHoraAPI(horaFin),
          precio: precioFinal
        }
      });
      
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
    }
  };

  // Obtener string de horarios consolidados para mostrar
  const obtenerHorariosConsolidados = (): string => {
    if (rangosHorarios.length === 0) return '';
    
    return rangosHorarios.map(rango => 
      `${formatearHora(rango.inicio)} - ${formatearHora(rango.fin)}`
    ).join(', ');
  };

  return (
    <IonPage>
      <IonContent>
        <div className="contenedor-reservas-profesional">
          
          {/* ✅ Encabezado alineado a la izquierda con línea morada */}
          <div className="encabezado-pagina">
            <h1 className="titulo-pagina">Reservar Pista</h1>
            <div className="linea-titulo-principal"></div>
            <p className="descripcion-pagina">Encuentra y reserva tu pista ideal en unos simples pasos</p>
          </div>

          <div className="layout-reservas-dos-columnas">
            
            {/* Columna Izquierda: Card Único con todo el flujo */}
            <div className="columna-seleccion-unificada">
              <div className="tarjeta-seleccion-completa">
                
                {/* Encabezado con línea morada */}
                <div className="encabezado-tarjeta-unificado">
                  <h2 className="titulo-tarjeta-unificado">Buscar Disponibilidad</h2>
                  <div className="linea-morada"></div>
                </div>
                
                <div className="contenido-seleccion-completa">
                  
                  {/* Sección 1: Lista de Clubes */}
                  <div className="seccion-selector">
                    <h3 className="subtitulo-seccion">Club</h3>
                    <div className="lista-clubes-scrolleable">
                      {clubes.map(club => (
                        <div 
                          key={club.id}
                          className={`item-club ${clubSeleccionado === club.id ? 'club-seleccionado' : 'club-disponible'}`}
                          onClick={() => {
                            setClubSeleccionado(club.id);
                            setPistaSeleccionada(null);
                            setPistaDatos(null);
                            setHorasDisponibles([]);
                            setFranjasSeleccionadas([]);
                            setRangosHorarios([]);
                          }}
                        >
                          {club.nombre}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección 2: Selector de Pista */}
                  {clubSeleccionado && (
                    <div className="seccion-selector">
                      <h3 className="subtitulo-seccion">Pista</h3>
                      <div className="grid-pistas-compacto">
                        {pistas.map(pista => (
                          <div 
                            key={pista.id}
                            className={`tarjeta-pista-compacta ${pistaSeleccionada === pista.id ? 'pista-seleccionada' : 'pista-disponible'}`}
                            onClick={() => {
                              setPistaSeleccionada(pista.id);
                              setHorasDisponibles([]);
                              setFranjasSeleccionadas([]);
                              setRangosHorarios([]);
                            }}
                          >
                            <div className="info-pista-compacta">
                              <div className="numero-pista">Pista {pista.numero}</div>
                              <div className="tipo-precio">
                                <span className="tipo-pista">{pista.tipo}</span>
                                <span className="precio-pista">{pista.precio_hora}€/h</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección 3: Calendario y Horarios */}
                  {pistaSeleccionada && (
                    <div className="seccion-calendario-horarios">
                      
                      <div className="contenedor-calendario-horarios">
                        {/* Calendario */}
                        <div className="contenedor-calendario">
                          <h4 className="titulo-calendario">Fecha</h4>
                          <IonDatetime
                            presentation="date"
                            min={new Date().toISOString()}
                            max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
                            value={fechaSeleccionada}
                            onIonChange={handleFechaChange}
                            locale="es-ES"
                            firstDayOfWeek={1}
                            className="calendario-compacto"
                            style={{
                              '--ion-datetime-popover-ios-display': 'none',
                              '--ion-datetime-popover-md-display': 'none'
                            } as any}
                          />
                        </div>
                        
                        {/* Horarios disponibles (aparecen al lado cuando se selecciona fecha) */}
                        {fechaSeleccionada && (
                          <div className="contenedor-horarios-lateral">
                            <h4 className="titulo-horarios">Horarios disponibles</h4>
                            <p className="info-horarios">
                              Selecciona franjas de 30 min consecutivas (máx. 1.5h)
                            </p>
                            {horasDisponibles.length === 0 ? (
                              <p className="mensaje-sin-horarios">No hay horarios disponibles para esta fecha</p>
                            ) : (
                              <div className="grid-horarios-lateral">
                                {horasDisponibles.map((franja, index) => (
                                  <button
                                    key={index}
                                    className={`boton-horario-lateral ${franja.seleccionada ? 'horario-seleccionado' : 'horario-disponible'}`}
                                    onClick={() => toggleFranjaHoraria(franja)}
                                  >
                                    {franja.inicio} - {franja.fin}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen de Reserva (mantiene el tamaño actual) */}
            <div className="columna-resumen">
              <div className="tarjeta-resumen">
                <div className="encabezado-tarjeta-unificado">
                  <h2 className="titulo-tarjeta-unificado">Datos de la reserva</h2>
                  <div className="linea-morada"></div>
                </div>
                
                <div className="contenido-resumen-pro">
                  
                  {franjasSeleccionadas.length === 0 ? (
                    <div className="estado-vacio">
                      <p className="texto-vacio">Completa la selección para ver los datos de la reserva</p>
                    </div>
                  ) : (
                    <>
                      {/* Detalles de la reserva */}
                      <div className="detalles-reserva-pro">
                        <div className="item-detalle">
                          <span className="etiqueta-detalle">Club</span>
                          <span className="valor-detalle">{clubDatos?.nombre}</span>
                        </div>
                        <div className="item-detalle">
                          <span className="etiqueta-detalle">Pista</span>
                          <span className="valor-detalle">Pista {pistaDatos?.numero} - {pistaDatos?.tipo}</span>
                        </div>
                        <div className="item-detalle">
                          <span className="etiqueta-detalle">Fecha</span>
                          <span className="valor-detalle">{formatearFechaMostrar(fechaSeleccionada)}</span>
                        </div>
                        <div className="item-detalle">
                          <span className="etiqueta-detalle">Horario</span>
                          <span className="valor-detalle">{obtenerHorariosConsolidados()}</span>
                        </div>
                      </div>

                      {/* Notas */}
                      <div className="seccion-notas">
                        <label className="etiqueta-filtro">Notas adicionales</label>
                        <IonTextarea 
                          value={notas} 
                          placeholder="Añade cualquier información relevante..."
                          onIonChange={e => setNotas(e.detail.value || '')} 
                          rows={3}
                          className="area-notas-pro"
                        />
                      </div>

                      {/* Precio */}
                      <div className="seccion-precio">
                        <div className="linea-precio">
                          <span className="concepto-precio">
                            Subtotal ({franjasSeleccionadas.length * 30} min)
                          </span>
                          <span className="cantidad-precio">{precioTotal.toFixed(2)}€</span>
                        </div>
                        <div className="linea-total">
                          <span className="etiqueta-total">Total</span>
                          <span className="valor-total">{precioTotal.toFixed(2)}€</span>
                        </div>
                      </div>

                      {/* Botón de confirmación */}
                      <IonButton 
                        expand="block" 
                        onClick={realizarReserva}
                        disabled={!clubSeleccionado || !pistaSeleccionada || !fechaSeleccionada || franjasSeleccionadas.length === 0}
                        className="boton-confirmar-pro"
                        fill="solid"
                      >
                        <IonIcon slot="start" icon={tennisballOutline} />
                        Reservar
                      </IonButton>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* SOLO UN COMPONENTE DE CARGA CON ANIMACIÓN */}
        {cargando && (
          <div className="loading-overlay">
            <div className="loading-spinner-animated">
              <div className="spinner"></div>
              <p>Cargando...</p>
            </div>
          </div>
        )}
        
        {/* Toast para mensajes */}
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