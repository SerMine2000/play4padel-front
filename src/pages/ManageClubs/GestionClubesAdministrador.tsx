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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonAvatar
} from '@ionic/react';
import {
  businessOutline,
  addOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  personOutline,
  locationOutline,
  mailOutline,
  callOutline,
  timeOutline,
  toggleOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import clubsService, { Club, ClubFormData } from '../../services/admin/club.service';
import usersService, { User } from '../../services/admin/user.service';
import '../Admin/Admin_Clubes/Admin_Clubes.css';

const GestionClubesAdministrador: React.FC = () => {
  const { user } = useAuth();
  const [clubes, setClubes] = useState<Club[]>([]);
  const [administradores, setAdministradores] = useState<User[]>([]);
  const [cargando, setCargando] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [mensajeToast, setMensajeToast] = useState('');
  const [colorToast, setColorToast] = useState<'success' | 'danger' | 'warning'>('success');
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [clubSeleccionado, setClubSeleccionado] = useState<Club | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState<'create' | 'edit' | 'view'>('create');
  const [datosFormulario, setDatosFormulario] = useState<ClubFormData>({
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    horario_apertura: '08:00',
    horario_cierre: '22:00',
    id_administrador: 0,
    sitio_web: '',
    imagen_url: ''
  });

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
      await Promise.all([cargarClubes(), cargarAdministradores()]);
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al cargar los datos', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const cargarClubes = async () => {
    try {
      const datosClubes = await clubsService.getAllClubs();
      setClubes(datosClubes);
    } catch (error) {
      console.error('Error loading clubs:', error);
      mostrarMensajeToast('Error al cargar los clubes', 'danger');
    }
  };

  const cargarAdministradores = async () => {
    try {
      const usuarios = await usersService.getAvailableAdministrators();
      setAdministradores(usuarios);
    } catch (error) {
      console.error('Error loading administrators:', error);
      mostrarMensajeToast('Error al cargar administradores disponibles', 'danger');
    }
  };

  const manejarActualizacion = async (event: CustomEvent) => {
    try {
      await cargarDatos();
    } finally {
      event.detail.complete();
    }
  };

  const abrirModal = (modo: 'create' | 'edit' | 'view', club?: Club) => {
    setModoModal(modo);
    if (club) {
      setClubSeleccionado(club);
      setDatosFormulario({
        nombre: club.nombre,
        descripcion: club.descripcion,
        direccion: club.direccion,
        telefono: club.telefono,
        email: club.email,
        horario_apertura: club.horario_apertura,
        horario_cierre: club.horario_cierre,
        id_administrador: club.id_administrador,
        sitio_web: club.sitio_web || '',
        imagen_url: club.imagen_url || ''
      });
    } else {
      setClubSeleccionado(null);
      setDatosFormulario({
        nombre: '',
        descripcion: '',
        direccion: '',
        telefono: '',
        email: '',
        horario_apertura: '08:00',
        horario_cierre: '22:00',
        id_administrador: 0,
        sitio_web: '',
        imagen_url: ''
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setClubSeleccionado(null);
  };

  const manejarGuardar = async () => {
    try {
      if (!datosFormulario.nombre || !datosFormulario.direccion || !datosFormulario.id_administrador) {
        mostrarMensajeToast('Por favor, complete los campos obligatorios', 'warning');
        return;
      }

      setCargando(true);
      
      if (modoModal === 'create') {
        await clubsService.createClub(datosFormulario);
        mostrarMensajeToast('Club creado exitosamente', 'success');
      } else if (clubSeleccionado) {
        await clubsService.updateClub(clubSeleccionado.id, datosFormulario);
        mostrarMensajeToast('Club actualizado exitosamente', 'success');
      }
      
      await cargarClubes();
      cerrarModal();
    } catch (error: any) {
      console.error(error);
      mostrarMensajeToast(
        error?.message || 'Error al guardar el club', 
        'danger'
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioEstado = async (club: Club) => {
    try {
      setCargando(true);
      
      await clubsService.toggleClubStatus(club.id, !club.activo);
      
      mostrarMensajeToast(
        `Club ${club.activo ? 'desactivado' : 'activado'} exitosamente`,
        'success'
      );
      
      await cargarClubes();
    } catch (error: any) {
      console.error(error);
      mostrarMensajeToast(
        error?.message || 'Error al cambiar el estado del club', 
        'danger'
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (club: Club) => {
    setClubSeleccionado(club);
    setMensajeAlerta(`¿Está seguro de que desea eliminar el club "${club.nombre}"? Esta acción no se puede deshacer.`);
    setMostrarAlerta(true);
  };

  const confirmarEliminar = async () => {
    if (!clubSeleccionado) return;
    
    try {
      setCargando(true);
      
      await clubsService.deleteClub(clubSeleccionado.id);
      mostrarMensajeToast('Club eliminado exitosamente', 'success');
      await cargarClubes();
    } catch (error: any) {
      console.error(error);
      mostrarMensajeToast(
        error?.message || 'Error al eliminar el club', 
        'danger'
      );
    } finally {
      setCargando(false);
      setMostrarAlerta(false);
      setClubSeleccionado(null);
    }
  };

  const clubesFiltrados = clubes.filter(club =>
    club.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
    club.direccion.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
    club.email.toLowerCase().includes(textoBusqueda.toLowerCase())
  );

  const obtenerColorParaAvatar = (id: number) => {
    const colores = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
    return colores[id % colores.length];
  };

  const obtenerNombreAdministrador = (idAdministrador: number) => {
    const admin = administradores.find(admin => admin.id === idAdministrador);
    return admin ? `${admin.nombre} ${admin.apellidos}` : 'No asignado';
  };

  const obtenerEmailAdministrador = (idAdministrador: number) => {
    const admin = administradores.find(admin => admin.id === idAdministrador);
    return admin ? admin.email : '';
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={manejarActualizacion}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="admin-clubs-container">
          <div className="clubs-header">
            <h1>Gestión de Clubes</h1>
            <p>Administre todos los clubes del sistema</p>
          </div>

          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <div className="card-header-actions">
                      <IonCardTitle>Clubes Registrados ({clubes.length})</IonCardTitle>
                      <IonButton
                        color="primary"
                        size="small"
                        onClick={() => abrirModal('create')}
                      >
                        <IonIcon icon={addOutline} slot="start" />
                        Nuevo Club
                      </IonButton>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonSearchbar
                      value={textoBusqueda}
                      debounce={300}
                      onIonInput={e => setTextoBusqueda(e.detail.value!)}
                      placeholder="Buscar clubes por nombre, dirección o email..."
                    />

                    {clubesFiltrados.length === 0 ? (
                      <div className="mensaje-vacio">
                        <IonText>
                          {textoBusqueda ? 'No se encontraron clubes' : 'No hay clubes registrados'}
                        </IonText>
                      </div>
                    ) : (
                      <div className="clubs-grid">
                        {clubesFiltrados.map(club => (
                          <IonCard key={club.id} className="club-card">
                            <IonCardContent>
                              <div className="club-header">
                                <div className="club-avatar">
                                  <IonAvatar style={{ 
                                    backgroundColor: obtenerColorParaAvatar(club.id), 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: 'bold', 
                                    color: 'white' 
                                  }}>
                                    {club.imagen_url ? 
                                      <img src={club.imagen_url} alt={club.nombre} /> :
                                      <span>{club.nombre.charAt(0).toUpperCase()}</span>
                                    }
                                  </IonAvatar>
                                </div>
                                <div className="club-info">
                                  <h3>{club.nombre}</h3>
                                  <p className="club-description">{club.descripcion}</p>
                                  <IonChip color={club.activo ? 'success' : 'danger'}>
                                    {club.activo ? 'Activo' : 'Inactivo'}
                                  </IonChip>
                                </div>
                              </div>

                              <div className="club-details">
                                <div className="detail-item">
                                  <IonIcon icon={locationOutline} />
                                  <span>{club.direccion}</span>
                                </div>
                                <div className="detail-item">
                                  <IonIcon icon={mailOutline} />
                                  <span>{club.email}</span>
                                </div>
                                <div className="detail-item">
                                  <IonIcon icon={callOutline} />
                                  <span>{club.telefono}</span>
                                </div>
                                <div className="detail-item">
                                  <IonIcon icon={timeOutline} />
                                  <span>{club.horario_apertura} - {club.horario_cierre}</span>
                                </div>
                                <div className="detail-item">
                                  <IonIcon icon={personOutline} />
                                  <span>Admin: {obtenerNombreAdministrador(club.id_administrador)}</span>
                                </div>
                              </div>

                              <div className="club-stats">
                                <div className="stat">
                                  <span className="stat-number">{club.total_pistas || 0}</span>
                                  <span className="stat-label">Pistas</span>
                                </div>
                                <div className="stat">
                                  <span className="stat-number">-</span>
                                  <span className="stat-label">Socios</span>
                                </div>
                                <div className="stat">
                                  <span className="stat-number">-</span>
                                  <span className="stat-label">Reservas</span>
                                </div>
                              </div>

                              <div className="club-actions">
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color="primary"
                                  onClick={() => abrirModal('view', club)}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color="primary"
                                  onClick={() => abrirModal('edit', club)}
                                >
                                  <IonIcon icon={createOutline} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color={club.activo ? 'warning' : 'success'}
                                  onClick={() => manejarCambioEstado(club)}
                                >
                                  <IonIcon icon={toggleOutline} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color="danger"
                                  onClick={() => manejarEliminar(club)}
                                >
                                  <IonIcon icon={trashOutline} />
                                </IonButton>
                              </div>
                            </IonCardContent>
                          </IonCard>
                        ))}
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        <IonModal isOpen={mostrarModal} onDidDismiss={cerrarModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {modoModal === 'create' ? 'Crear Club' : 
                 modoModal === 'edit' ? 'Editar Club' : 'Ver Club'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={cerrarModal}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonInput
                  label="Nombre del Club *"
                  labelPlacement="stacked"
                  value={datosFormulario.nombre}
                  onIonInput={e => setDatosFormulario({...datosFormulario, nombre: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonTextarea
                  label="Descripción"
                  labelPlacement="stacked"
                  value={datosFormulario.descripcion}
                  onIonInput={e => setDatosFormulario({...datosFormulario, descripcion: e.detail.value!})}
                  readonly={modoModal === 'view'}
                  rows={3}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Dirección *"
                  labelPlacement="stacked"
                  value={datosFormulario.direccion}
                  onIonInput={e => setDatosFormulario({...datosFormulario, direccion: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Teléfono"
                  labelPlacement="stacked"
                  value={datosFormulario.telefono}
                  onIonInput={e => setDatosFormulario({...datosFormulario, telefono: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Email"
                  labelPlacement="stacked"
                  type="email"
                  value={datosFormulario.email}
                  onIonInput={e => setDatosFormulario({...datosFormulario, email: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Horario Apertura"
                  labelPlacement="stacked"
                  type="time"
                  value={datosFormulario.horario_apertura}
                  onIonInput={e => setDatosFormulario({...datosFormulario, horario_apertura: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Horario Cierre"
                  labelPlacement="stacked"
                  type="time"
                  value={datosFormulario.horario_cierre}
                  onIonInput={e => setDatosFormulario({...datosFormulario, horario_cierre: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonSelect
                  label="Administrador *"
                  labelPlacement="stacked"
                  value={datosFormulario.id_administrador}
                  onIonChange={e => setDatosFormulario({...datosFormulario, id_administrador: e.detail.value})}
                  disabled={modoModal === 'view'}
                >
                  {administradores.map(admin => (
                    <IonSelectOption key={admin.id} value={admin.id}>
                      {admin.nombre} {admin.apellidos} ({admin.email})
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Sitio Web"
                  labelPlacement="stacked"
                  type="url"
                  value={datosFormulario.sitio_web}
                  onIonInput={e => setDatosFormulario({...datosFormulario, sitio_web: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="URL de Imagen"
                  labelPlacement="stacked"
                  type="url"
                  value={datosFormulario.imagen_url}
                  onIonInput={e => setDatosFormulario({...datosFormulario, imagen_url: e.detail.value!})}
                  readonly={modoModal === 'view'}
                />
              </IonItem>
            </IonList>
            
            {modoModal !== 'view' && (
              <div className="modal-actions">
                <IonButton expand="block" onClick={manejarGuardar}>
                  {modoModal === 'create' ? 'Crear Club' : 'Guardar Cambios'}
                </IonButton>
                <IonButton expand="block" fill="clear" onClick={cerrarModal}>
                  Cancelar
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={mostrarAlerta}
          onDidDismiss={() => setMostrarAlerta(false)}
          header="Confirmar Eliminación"
          message={mensajeAlerta}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: confirmarEliminar }
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

export default GestionClubesAdministrador;