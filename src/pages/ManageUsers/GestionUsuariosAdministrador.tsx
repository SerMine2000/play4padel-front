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
  IonSearchbar,
  IonItem,
  IonAvatar,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
  IonList,
  IonAlert,
  IonLoading,
  IonToast,
  IonText,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption
} from '@ionic/react';
import {
  personOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  mailOutline,
  callOutline,
  businessOutline,
  shieldCheckmarkOutline,
  banOutline,
  checkmarkCircleOutline,
  filterOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import usersService, { User } from '../../services/admin/user.service';
import clubsService from '../../services/admin/club.service';
import '../Admin/Admin_Usuarios/Admin_Usuarios.css';

const GestionUsuariosAdministrador: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [clubes, setClubes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('all');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('all');
  const [mensajeToast, setMensajeToast] = useState('');
  const [colorToast, setColorToast] = useState<'success' | 'danger' | 'warning'>('success');
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [accionAlerta, setAccionAlerta] = useState<'delete' | 'toggle' | 'changeRole'>('delete');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<User | null>(null);
  const [mostrarModalRol, setMostrarModalRol] = useState(false);
  const [nuevoRol, setNuevoRol] = useState<number>(5);

  const roles = [
    { id: 1, nombre: 'ADMIN', color: 'danger' },
    { id: 2, nombre: 'CLUB', color: 'warning' },
    { id: 3, nombre: 'PROFESOR', color: 'secondary' },
    { id: 4, nombre: 'EMPLEADO', color: 'tertiary' },
    { id: 5, nombre: 'USUARIO', color: 'primary' },
    { id: 6, nombre: 'SOCIO', color: 'success' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarMensajeToast = (mensaje: string, color: typeof colorToast = 'success') => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setMostrarToast(true);
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      await Promise.all([cargarUsuarios(), cargarClubes()]);
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al cargar los datos', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const datosUsuarios = await usersService.getAllUsers();
      setUsuarios(datosUsuarios);
    } catch (error) {
      console.error('Error loading users:', error);
      mostrarMensajeToast('Error al cargar usuarios', 'danger');
    }
  };

  const cargarClubes = async () => {
    try {
      const datosClubes = await clubsService.getAllClubs();
      setClubes(datosClubes || []);
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const manejarActualizacion = async (event: CustomEvent) => {
    try {
      await cargarDatos();
    } finally {
      event.detail.complete();
    }
  };

  const obtenerNombreRol = (idRol: number) => {
    const rol = roles.find(r => r.id === idRol);
    return rol ? rol.nombre : 'DESCONOCIDO';
  };

  const obtenerColorRol = (idRol: number) => {
    const rol = roles.find(r => r.id === idRol);
    return rol ? rol.color : 'medium';
  };

  const obtenerNombreClub = (idClubSocio?: number) => {
    if (!idClubSocio) return null;
    const club = clubes.find(c => c.id === idClubSocio);
    return club ? club.nombre : 'Club desconocido';
  };

  const manejarCambioEstado = async (usuarioParaCambiar: User) => {
    setUsuarioSeleccionado(usuarioParaCambiar);
    setMensajeAlerta(`¿Está seguro de que desea ${usuarioParaCambiar.activo ? 'desactivar' : 'activar'} al usuario "${usuarioParaCambiar.nombre} ${usuarioParaCambiar.apellidos}"?`);
    setAccionAlerta('toggle');
    setMostrarAlerta(true);
  };

  const manejarCambioRol = (usuarioParaCambiarRol: User) => {
    setUsuarioSeleccionado(usuarioParaCambiarRol);
    setNuevoRol(usuarioParaCambiarRol.id_rol);
    setMostrarModalRol(true);
  };

  const manejarEliminar = (usuarioParaEliminar: User) => {
    setUsuarioSeleccionado(usuarioParaEliminar);
    setMensajeAlerta(`¿Está seguro de que desea eliminar al usuario "${usuarioParaEliminar.nombre} ${usuarioParaEliminar.apellidos}"? Esta acción no se puede deshacer.`);
    setAccionAlerta('delete');
    setMostrarAlerta(true);
  };

  const confirmarAccion = async () => {
    if (!usuarioSeleccionado) return;

    try {
      setCargando(true);

      switch (accionAlerta) {
        case 'toggle':
          await usersService.updateUser(usuarioSeleccionado.id, { activo: !usuarioSeleccionado.activo });
          mostrarMensajeToast(
            `Usuario ${usuarioSeleccionado.activo ? 'desactivado' : 'activado'} exitosamente`,
            'success'
          );
          break;

        case 'delete':
          await usersService.deleteUser(usuarioSeleccionado.id);
          mostrarMensajeToast('Usuario eliminado exitosamente', 'success');
          break;
      }

      await cargarUsuarios();
    } catch (error: any) {
      console.error(error);
      mostrarMensajeToast(
        error?.message || 'Error al procesar la acción', 
        'danger'
      );
    } finally {
      setCargando(false);
      setMostrarAlerta(false);
      setUsuarioSeleccionado(null);
    }
  };

  const confirmarCambioRol = async () => {
    if (!usuarioSeleccionado) return;

    try {
      setCargando(true);
      
      await usersService.updateUser(usuarioSeleccionado.id, { id_rol: nuevoRol });
      
      mostrarMensajeToast('Rol actualizado exitosamente', 'success');
      setMostrarModalRol(false);
      setUsuarioSeleccionado(null);
      await cargarUsuarios();
    } catch (error: any) {
      console.error(error);
      mostrarMensajeToast(
        error?.message || 'Error al cambiar el rol', 
        'danger'
      );
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
      usuario.apellidos.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(textoBusqueda.toLowerCase());
    
    const coincideRol = rolSeleccionado === 'all' || usuario.id_rol.toString() === rolSeleccionado;
    const coincideEstado = estadoSeleccionado === 'all' || 
      (estadoSeleccionado === 'active' && usuario.activo) ||
      (estadoSeleccionado === 'inactive' && !usuario.activo);

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const obtenerColorParaAvatar = (id: number) => {
    const colores = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
    return colores[id % colores.length];
  };

  const formatearFecha = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString('es-ES');
  };

  const formatearUltimaConexion = (fechaString?: string) => {
    if (!fechaString) return 'Nunca';
    const ahora = new Date();
    const fecha = new Date(fechaString);
    const diferenciaMs = ahora.getTime() - fecha.getTime();
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
    return formatearFecha(fechaString);
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={manejarActualizacion}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="admin-users-container">
          <div className="users-header">
            <h1>Gestión de Usuarios</h1>
            <p>Administre todos los usuarios del sistema</p>
          </div>

          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <div className="card-header-with-stats">
                      <IonCardTitle>Usuarios del Sistema</IonCardTitle>
                      <div className="users-stats">
                        <IonBadge color="primary">{usuariosFiltrados.length} usuarios</IonBadge>
                        <IonBadge color="success">
                          {usuariosFiltrados.filter(u => u.activo).length} activos
                        </IonBadge>
                        <IonBadge color="danger">
                          {usuariosFiltrados.filter(u => !u.activo).length} inactivos
                        </IonBadge>
                      </div>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="filters-section">
                      <IonSearchbar
                        value={textoBusqueda}
                        debounce={300}
                        onIonInput={e => setTextoBusqueda(e.detail.value!)}
                        placeholder="Buscar usuarios por nombre o email..."
                      />
                      
                      <div className="filters-row">
                        <IonSelect
                          placeholder="Filtrar por rol"
                          value={rolSeleccionado}
                          onIonChange={e => setRolSeleccionado(e.detail.value)}
                        >
                          <IonSelectOption value="all">Todos los roles</IonSelectOption>
                          {roles.map(rol => (
                            <IonSelectOption key={rol.id} value={rol.id.toString()}>
                              {rol.nombre}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        
                        <IonSelect
                          placeholder="Filtrar por estado"
                          value={estadoSeleccionado}
                          onIonChange={e => setEstadoSeleccionado(e.detail.value)}
                        >
                          <IonSelectOption value="all">Todos</IonSelectOption>
                          <IonSelectOption value="active">Activos</IonSelectOption>
                          <IonSelectOption value="inactive">Inactivos</IonSelectOption>
                        </IonSelect>
                      </div>
                    </div>

                    {usuariosFiltrados.length === 0 ? (
                      <div className="mensaje-vacio">
                        <IonText>
                          {textoBusqueda || rolSeleccionado !== 'all' || estadoSeleccionado !== 'all' 
                            ? 'No se encontraron usuarios con los filtros aplicados' 
                            : 'No hay usuarios registrados'}
                        </IonText>
                      </div>
                    ) : (
                      <IonList>
                        {usuariosFiltrados.map(usuarioItem => (
                          <IonItemSliding key={usuarioItem.id}>
                            <IonItem>
                              <IonAvatar slot="start" style={{ 
                                backgroundColor: obtenerColorParaAvatar(usuarioItem.id), 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 'bold', 
                                color: 'white' 
                              }}>
                                {usuarioItem.avatar_url ? 
                                  <img src={usuarioItem.avatar_url} alt={usuarioItem.nombre} /> :
                                  <span>{usuarioItem.nombre.charAt(0).toUpperCase()}</span>
                                }
                              </IonAvatar>

                              <IonLabel>
                                <div className="user-info">
                                  <h2>{usuarioItem.nombre} {usuarioItem.apellidos}</h2>
                                  <div className="user-details">
                                    <div className="detail-row">
                                      <IonIcon icon={mailOutline} />
                                      <span>{usuarioItem.email}</span>
                                    </div>
                                    {usuarioItem.telefono && (
                                      <div className="detail-row">
                                        <IonIcon icon={callOutline} />
                                        <span>{usuarioItem.telefono}</span>
                                      </div>
                                    )}
                                    {usuarioItem.id_club_socio && (
                                      <div className="detail-row">
                                        <IonIcon icon={businessOutline} />
                                        <span>{obtenerNombreClub(usuarioItem.id_club_socio)}</span>
                                      </div>
                                    )}
                                    <div className="user-stats">
                                      <span>Registrado: {formatearFecha(usuarioItem.fecha_registro)}</span>
                                      <span>Última conexión: {formatearUltimaConexion(usuarioItem.ultima_conexion)}</span>
                                    </div>
                                  </div>
                                </div>
                              </IonLabel>

                              <div className="user-badges" slot="end">
                                <IonChip color={obtenerColorRol(usuarioItem.id_rol)}>
                                  {usuarioItem.rol?.nombre || obtenerNombreRol(usuarioItem.id_rol)}
                                </IonChip>
                                <IonChip color={usuarioItem.activo ? 'success' : 'danger'}>
                                  {usuarioItem.activo ? 'Activo' : 'Inactivo'}
                                </IonChip>
                              </div>
                            </IonItem>

                            <IonItemOptions side="end">
                              <IonItemOption color="primary" onClick={() => manejarCambioRol(usuarioItem)}>
                                <IonIcon icon={shieldCheckmarkOutline} />
                                Rol
                              </IonItemOption>
                              <IonItemOption 
                                color={usuarioItem.activo ? 'warning' : 'success'} 
                                onClick={() => manejarCambioEstado(usuarioItem)}
                              >
                                <IonIcon icon={usuarioItem.activo ? banOutline : checkmarkCircleOutline} />
                                {usuarioItem.activo ? 'Desactivar' : 'Activar'}
                              </IonItemOption>
                              <IonItemOption color="danger" onClick={() => manejarEliminar(usuarioItem)}>
                                <IonIcon icon={trashOutline} />
                                Eliminar
                              </IonItemOption>
                            </IonItemOptions>
                          </IonItemSliding>
                        ))}
                      </IonList>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        <IonModal isOpen={mostrarModalRol} onDidDismiss={() => setMostrarModalRol(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Cambiar Rol de Usuario</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setMostrarModalRol(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {usuarioSeleccionado && (
              <div>
                <h3>Usuario: {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellidos}</h3>
                <p>Rol actual: <IonChip color={obtenerColorRol(usuarioSeleccionado.id_rol)}>{usuarioSeleccionado.rol?.nombre || obtenerNombreRol(usuarioSeleccionado.id_rol)}</IonChip></p>
                
                <IonItem>
                  <IonSelect
                    label="Nuevo rol"
                    labelPlacement="stacked"
                    value={nuevoRol}
                    onIonChange={e => setNuevoRol(e.detail.value)}
                  >
                    {roles.map(rol => (
                      <IonSelectOption key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                
                <div className="modal-actions">
                  <IonButton expand="block" onClick={confirmarCambioRol}>
                    Cambiar Rol
                  </IonButton>
                  <IonButton expand="block" fill="clear" onClick={() => setMostrarModalRol(false)}>
                    Cancelar
                  </IonButton>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={mostrarAlerta}
          onDidDismiss={() => setMostrarAlerta(false)}
          header="Confirmar Acción"
          message={mensajeAlerta}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Confirmar', handler: confirmarAccion }
          ]}
        />

        <IonLoading isOpen={cargando} message="Procesando..." />
        
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

export default GestionUsuariosAdministrador;