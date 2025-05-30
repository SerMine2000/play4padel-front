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
import { useAuth } from '../../../context/AuthContext';
import clubsService, { Club, ClubFormData } from '../../../services/admin/club.service';
import usersService, { User } from '../../../services/admin/user.service';
import './AdminManageClubs.css';

const AdminManageClubs: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [administrators, setAdministrators] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formData, setFormData] = useState<ClubFormData>({
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
    loadData();
  }, []);

  const showToastMessage = (message: string, color: typeof toastColor = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadClubs(), loadAdministradores()]);
    } catch (error) {
      console.error(error);
      showToastMessage('Error al cargar los datos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadClubs = async () => {
    try {
      const clubsData = await clubsService.getAllClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
      showToastMessage('Error al cargar los clubes', 'danger');
    }
  };

  const loadAdministradores = async () => {
    try {
      const users = await usersService.getAvailableAdministrators();
      setAdministrators(users);
    } catch (error) {
      console.error('Error loading administrators:', error);
      showToastMessage('Error al cargar administradores disponibles', 'danger');
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData();
    } finally {
      event.detail.complete();
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', club?: Club) => {
    setModalMode(mode);
    if (club) {
      setSelectedClub(club);
      setFormData({
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
      setSelectedClub(null);
      setFormData({
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClub(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.nombre || !formData.direccion || !formData.id_administrador) {
        showToastMessage('Por favor, complete los campos obligatorios', 'warning');
        return;
      }

      setLoading(true);
      
      if (modalMode === 'create') {
        // Crear nuevo club
        await clubsService.createClub(formData);
        showToastMessage('Club creado exitosamente', 'success');
      } else if (selectedClub) {
        // Editar club existente
        await clubsService.updateClub(selectedClub.id, formData);
        showToastMessage('Club actualizado exitosamente', 'success');
      }
      
      await loadClubs();
      closeModal();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        error?.message || 'Error al guardar el club', 
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (club: Club) => {
    try {
      setLoading(true);
      
      await clubsService.toggleClubStatus(club.id, !club.activo);
      
      showToastMessage(
        `Club ${club.activo ? 'desactivado' : 'activado'} exitosamente`,
        'success'
      );
      
      await loadClubs();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        error?.message || 'Error al cambiar el estado del club', 
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (club: Club) => {
    setSelectedClub(club);
    setAlertMessage(`¿Está seguro de que desea eliminar el club "${club.nombre}"? Esta acción no se puede deshacer.`);
    setShowAlert(true);
  };

  const confirmDelete = async () => {
    if (!selectedClub) return;
    
    try {
      setLoading(true);
      
      await clubsService.deleteClub(selectedClub.id);
      showToastMessage('Club eliminado exitosamente', 'success');
      await loadClubs();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        error?.message || 'Error al eliminar el club', 
        'danger'
      );
    } finally {
      setLoading(false);
      setShowAlert(false);
      setSelectedClub(null);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    club.direccion.toLowerCase().includes(searchText.toLowerCase()) ||
    club.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const getColorParaAvatar = (id: number) => {
    const colors = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
    return colors[id % colors.length];
  };

  const getAdministratorName = (id_administrador: number) => {
    const admin = administrators.find(admin => admin.id === id_administrador);
    return admin ? `${admin.nombre} ${admin.apellidos}` : 'No asignado';
  };

  const getAdministratorEmail = (id_administrador: number) => {
    const admin = administrators.find(admin => admin.id === id_administrador);
    return admin ? admin.email : '';
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
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
                      <IonCardTitle>Clubes Registrados ({clubs.length})</IonCardTitle>
                      <IonButton
                        color="primary"
                        size="small"
                        onClick={() => openModal('create')}
                      >
                        <IonIcon icon={addOutline} slot="start" />
                        Nuevo Club
                      </IonButton>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonSearchbar
                      value={searchText}
                      debounce={300}
                      onIonInput={e => setSearchText(e.detail.value!)}
                      placeholder="Buscar clubes por nombre, dirección o email..."
                    />

                    {filteredClubs.length === 0 ? (
                      <div className="mensaje-vacio">
                        <IonText>
                          {searchText ? 'No se encontraron clubes' : 'No hay clubes registrados'}
                        </IonText>
                      </div>
                    ) : (
                      <div className="clubs-grid">
                        {filteredClubs.map(club => (
                          <IonCard key={club.id} className="club-card">
                            <IonCardContent>
                              <div className="club-header">
                                <div className="club-avatar">
                                  <IonAvatar style={{ 
                                    backgroundColor: getColorParaAvatar(club.id), 
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
                                  <IonChip color={club.activo ? 'success' : 'danger'} size="small">
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
                                  <span>Admin: {getAdministratorName(club.id_administrador)}</span>
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
                                  onClick={() => openModal('view', club)}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color="primary"
                                  onClick={() => openModal('edit', club)}
                                >
                                  <IonIcon icon={createOutline} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color={club.activo ? 'warning' : 'success'}
                                  onClick={() => handleToggleStatus(club)}
                                >
                                  <IonIcon icon={toggleOutline} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  fill="clear"
                                  color="danger"
                                  onClick={() => handleDelete(club)}
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

        {/* Modal para crear/editar/ver club */}
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {modalMode === 'create' ? 'Crear Club' : 
                 modalMode === 'edit' ? 'Editar Club' : 'Ver Club'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonInput
                  label="Nombre del Club *"
                  labelPlacement="stacked"
                  value={formData.nombre}
                  onIonInput={e => setFormData({...formData, nombre: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonTextarea
                  label="Descripción"
                  labelPlacement="stacked"
                  value={formData.descripcion}
                  onIonInput={e => setFormData({...formData, descripcion: e.detail.value!})}
                  readonly={modalMode === 'view'}
                  rows={3}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Dirección *"
                  labelPlacement="stacked"
                  value={formData.direccion}
                  onIonInput={e => setFormData({...formData, direccion: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Teléfono"
                  labelPlacement="stacked"
                  value={formData.telefono}
                  onIonInput={e => setFormData({...formData, telefono: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Email"
                  labelPlacement="stacked"
                  type="email"
                  value={formData.email}
                  onIonInput={e => setFormData({...formData, email: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Horario Apertura"
                  labelPlacement="stacked"
                  type="time"
                  value={formData.horario_apertura}
                  onIonInput={e => setFormData({...formData, horario_apertura: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="Horario Cierre"
                  labelPlacement="stacked"
                  type="time"
                  value={formData.horario_cierre}
                  onIonInput={e => setFormData({...formData, horario_cierre: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonSelect
                  label="Administrador *"
                  labelPlacement="stacked"
                  value={formData.id_administrador}
                  onSelectionChange={e => setFormData({...formData, id_administrador: e.detail.value})}
                  disabled={modalMode === 'view'}
                >
                  {administrators.map(admin => (
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
                  value={formData.sitio_web}
                  onIonInput={e => setFormData({...formData, sitio_web: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
              
              <IonItem>
                <IonInput
                  label="URL de Imagen"
                  labelPlacement="stacked"
                  type="url"
                  value={formData.imagen_url}
                  onIonInput={e => setFormData({...formData, imagen_url: e.detail.value!})}
                  readonly={modalMode === 'view'}
                />
              </IonItem>
            </IonList>
            
            {modalMode !== 'view' && (
              <div className="modal-actions">
                <IonButton expand="block" onClick={handleSave}>
                  {modalMode === 'create' ? 'Crear Club' : 'Guardar Cambios'}
                </IonButton>
                <IonButton expand="block" fill="clear" onClick={closeModal}>
                  Cancelar
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmar Eliminación"
          message={alertMessage}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: confirmDelete }
          ]}
        />

        <IonLoading isOpen={loading} message="Procesando..." />
        
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

export default AdminManageClubs;
