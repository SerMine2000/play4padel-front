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
  IonItemOption,
  IonInput,
  IonTextarea
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
  filterOutline,
  addOutline,
  saveOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { useAuth } from '../../../context/AuthContext';
import usersService, { User, UserFormData } from '../../../services/admin/user.service';
import clubsService from '../../../services/admin/club.service';
import './Admin_Usuarios.css';

const AdminManageUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertAction, setAlertAction] = useState<'delete' | 'toggle' | 'changeRole'>('delete');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<number>(5);
  
  // Estados para crear/editar usuarios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userForm, setUserForm] = useState<UserFormData>({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    id_rol: 5,
    password: '',
    activo: true
  });

  const roles = [
    { id: 1, name: 'ADMIN', color: 'danger' },
    { id: 2, name: 'CLUB', color: 'warning' },
    { id: 3, name: 'PROFESOR', color: 'secondary' },
    { id: 4, name: 'EMPLEADO', color: 'tertiary' },
    { id: 5, name: 'USUARIO', color: 'primary' },
    { id: 6, name: 'SOCIO', color: 'success' }
  ];

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
      await Promise.all([loadUsers(), loadClubs()]);
    } catch (error) {
      console.error(error);
      showToastMessage('Error al cargar los datos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await usersService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      showToastMessage('Error al cargar usuarios', 'danger');
    }
  };

  const loadClubs = async () => {
    try {
      const clubsData = await clubsService.getAllClubs();
      setClubs(clubsData || []);
    } catch (error) {
      console.error('Error loading clubs:', error);
      // No mostrar error aquí porque los clubes son opcionales
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData();
    } finally {
      event.detail.complete();
    }
  };

  const getRoleName = (id_rol: number) => {
    const role = roles.find(r => r.id === id_rol);
    return role ? role.name : 'DESCONOCIDO';
  };

  const getRoleColor = (id_rol: number) => {
    const role = roles.find(r => r.id === id_rol);
    return role ? role.color : 'medium';
  };

  const getClubName = (id_club_socio?: number) => {
    if (!id_club_socio) return null;
    const club = clubs.find(c => c.id === id_club_socio);
    return club ? club.nombre : 'Club desconocido';
  };

  const handleToggleStatus = async (userToToggle: User) => {
    setSelectedUser(userToToggle);
    setAlertMessage(`¿Está seguro de que desea ${userToToggle.activo ? 'desactivar' : 'activar'} al usuario "${userToToggle.nombre} ${userToToggle.apellidos}"?`);
    setAlertAction('toggle');
    setShowAlert(true);
  };

  const handleChangeRole = (userToChangeRole: User) => {
    setSelectedUser(userToChangeRole);
    setNewRole(userToChangeRole.id_rol);
    setShowRoleModal(true);
  };

  const handleDelete = (userToDelete: User) => {
    setSelectedUser(userToDelete);
    setAlertMessage(`¿Está seguro de que desea eliminar al usuario "${userToDelete.nombre} ${userToDelete.apellidos}"? Esta acción no se puede deshacer.`);
    setAlertAction('delete');
    setShowAlert(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      switch (alertAction) {
        case 'toggle':
          await usersService.updateUser(selectedUser.id, { activo: !selectedUser.activo });
          showToastMessage(
            `Usuario ${selectedUser.activo ? 'desactivado' : 'activado'} exitosamente`,
            'success'
          );
          break;

        case 'delete':
          await usersService.deleteUser(selectedUser.id);
          showToastMessage('Usuario eliminado exitosamente', 'success');
          break;
      }

      await loadUsers();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        error?.message || 'Error al procesar la acción', 
        'danger'
      );
    } finally {
      setLoading(false);
      setShowAlert(false);
      setSelectedUser(null);
    }
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      await usersService.updateUser(selectedUser.id, { id_rol: newRole });
      
      showToastMessage('Rol actualizado exitosamente', 'success');
      setShowRoleModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        error?.message || 'Error al cambiar el rol', 
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      id_rol: 5,
      password: '',
      activo: true
    });
  };

  const handleCreateUser = () => {
    resetUserForm();
    setShowCreateModal(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setUserForm({
      nombre: userToEdit.nombre,
      apellidos: userToEdit.apellidos,
      email: userToEdit.email,
      telefono: userToEdit.telefono || '',
      id_rol: userToEdit.id_rol,
      activo: userToEdit.activo,
      avatar_url: userToEdit.avatar_url || '',
      bio: userToEdit.bio || ''
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.nombre.trim() || !userForm.apellidos.trim() || !userForm.email.trim()) {
      showToastMessage('Por favor complete los campos obligatorios', 'warning');
      return;
    }

    if (showCreateModal && !userForm.password?.trim()) {
      showToastMessage('La contraseña es obligatoria para nuevos usuarios', 'warning');
      return;
    }

    try {
      setLoading(true);

      if (showCreateModal) {
        await usersService.createUser(userForm);
        showToastMessage('Usuario creado exitosamente', 'success');
        setShowCreateModal(false);
      } else if (showEditModal && selectedUser) {
        const updateData = { ...userForm };
        if (!updateData.password?.trim()) {
          delete updateData.password; // No actualizar contraseña si está vacía
        }
        await usersService.updateUser(selectedUser.id, updateData);
        showToastMessage('Usuario actualizado exitosamente', 'success');
        setShowEditModal(false);
        setSelectedUser(null);
      }

      await loadUsers();
      resetUserForm();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        error?.message || 'Error al guardar usuario', 
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    resetUserForm();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.id_rol.toString() === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.activo) ||
      (selectedStatus === 'inactive' && !user.activo);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getColorParaAvatar = (id: number) => {
    const colors = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
    return colors[id % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatLastConnection = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(dateString);
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
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
                      <div className="header-actions">
                        <div className="users-stats">
                          <IonBadge color="primary">{filteredUsers.length} usuarios</IonBadge>
                          <IonBadge color="success">
                            {filteredUsers.filter(u => u.activo).length} activos
                          </IonBadge>
                          <IonBadge color="danger">
                            {filteredUsers.filter(u => !u.activo).length} inactivos
                          </IonBadge>
                        </div>
                        <IonButton 
                          fill="solid" 
                          color="primary" 
                          onClick={handleCreateUser}
                          size="small"
                        >
                          <IonIcon icon={addOutline} slot="start" />
                          Crear Usuario
                        </IonButton>
                      </div>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="filters-section">
                      <IonSearchbar
                        value={searchText}
                        debounce={300}
                        onIonInput={e => setSearchText(e.detail.value!)}
                        placeholder="Buscar usuarios por nombre o email..."
                      />
                      
                      <div className="filters-row">
                        <IonSelect
                          placeholder="Filtrar por rol"
                          value={selectedRole}
                          onIonChange={e => setSelectedRole(e.detail.value)}
                        >
                          <IonSelectOption value="all">Todos los roles</IonSelectOption>
                          {roles.map(role => (
                            <IonSelectOption key={role.id} value={role.id.toString()}>
                              {role.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        
                        <IonSelect
                          placeholder="Filtrar por estado"
                          value={selectedStatus}
                          onIonChange={e => setSelectedStatus(e.detail.value)}
                        >
                          <IonSelectOption value="all">Todos</IonSelectOption>
                          <IonSelectOption value="active">Activos</IonSelectOption>
                          <IonSelectOption value="inactive">Inactivos</IonSelectOption>
                        </IonSelect>
                      </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="mensaje-vacio">
                        <IonText>
                          {searchText || selectedRole !== 'all' || selectedStatus !== 'all' 
                            ? 'No se encontraron usuarios con los filtros aplicados' 
                            : 'No hay usuarios registrados'}
                        </IonText>
                      </div>
                    ) : (
                      <IonList>
                        {filteredUsers.map(userItem => (
                          <IonItem key={userItem.id} lines="full">
                          <IonAvatar slot="start" style={{ 
                            backgroundColor: getColorParaAvatar(userItem.id), 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold', 
                            color: 'white' 
                          }}>
                            {userItem.avatar_url ? 
                              <img src={userItem.avatar_url} alt={userItem.nombre} /> :
                              <span>{userItem.nombre.charAt(0).toUpperCase()}</span>
                            }
                          </IonAvatar>
                        
                          <IonLabel>
                            <div className="user-info">
                              <h2>{userItem.nombre} {userItem.apellidos}</h2>
                              <div className="user-details">
                                <div className="detail-row">
                                  <IonIcon icon={mailOutline} />
                                  <span>{userItem.email}</span>
                                </div>
                                {userItem.telefono && (
                                  <div className="detail-row">
                                    <IonIcon icon={callOutline} />
                                    <span>{userItem.telefono}</span>
                                  </div>
                                )}
                                {userItem.id_club_socio && (
                                  <div className="detail-row">
                                    <IonIcon icon={businessOutline} />
                                    <span>{getClubName(userItem.id_club_socio)}</span>
                                  </div>
                                )}
                                <div className="user-stats">
                                  <span>Registrado: {formatDate(userItem.fecha_registro)}</span>
                                  <span>Última conexión: {formatLastConnection(userItem.ultima_conexion)}</span>
                                </div>
                              </div>
                            </div>
                          </IonLabel>
                        
                          <div className="acciones-usuario" slot="end" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              <IonChip color={getRoleColor(userItem.id_rol)}>
                                {userItem.rol?.nombre || getRoleName(userItem.id_rol)}
                              </IonChip>
                              <IonChip color={userItem.activo ? 'success' : 'danger'}>
                                {userItem.activo ? 'Activo' : 'Inactivo'}
                              </IonChip>
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              <IonButton fill="clear" size="small" onClick={() => handleEditUser(userItem)}>
                                <IonIcon icon={createOutline} slot="start" />
                              </IonButton>
                              <IonButton fill="clear" size="small" onClick={() => handleChangeRole(userItem)}>
                                <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                              </IonButton>
                              <IonButton 
                                fill="clear" 
                                size="small"
                                color={userItem.activo ? 'warning' : 'success'} 
                                onClick={() => handleToggleStatus(userItem)}
                              >
                                <IonIcon icon={userItem.activo ? banOutline : checkmarkCircleOutline} slot="start" />
                              </IonButton>
                              <IonButton fill="clear" size="small" color="danger" onClick={() => handleDelete(userItem)}>
                                <IonIcon icon={trashOutline} slot="start" />
                              </IonButton>
                            </div>
                          </div>
                        </IonItem>
                        
                        ))}
                      </IonList>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Modal para crear usuario */}
        <IonModal isOpen={showCreateModal} onDidDismiss={handleCloseModals}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Crear Nuevo Usuario</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleCloseModals}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonInput
                label="Nombre *"
                labelPlacement="stacked"
                value={userForm.nombre}
                onIonInput={e => setUserForm({...userForm, nombre: e.detail.value!})}
                placeholder="Ingrese el nombre"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Apellidos *"
                labelPlacement="stacked"
                value={userForm.apellidos}
                onIonInput={e => setUserForm({...userForm, apellidos: e.detail.value!})}
                placeholder="Ingrese los apellidos"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Email *"
                labelPlacement="stacked"
                type="email"
                value={userForm.email}
                onIonInput={e => setUserForm({...userForm, email: e.detail.value!})}
                placeholder="Ingrese el email"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Teléfono"
                labelPlacement="stacked"
                value={userForm.telefono}
                onIonInput={e => setUserForm({...userForm, telefono: e.detail.value!})}
                placeholder="Ingrese el teléfono"
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Contraseña *"
                labelPlacement="stacked"
                type="password"
                value={userForm.password}
                onIonInput={e => setUserForm({...userForm, password: e.detail.value!})}
                placeholder="Ingrese la contraseña"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonSelect
                label="Rol"
                labelPlacement="stacked"
                value={userForm.id_rol}
                onIonChange={e => setUserForm({...userForm, id_rol: e.detail.value})}
              >
                {roles.map(role => (
                  <IonSelectOption key={role.id} value={role.id}>
                    {role.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            
            <IonItem>
              <IonInput
                label="URL del Avatar"
                labelPlacement="stacked"
                value={userForm.avatar_url}
                onIonInput={e => setUserForm({...userForm, avatar_url: e.detail.value!})}
                placeholder="URL de la imagen de perfil"
              />
            </IonItem>
            
            <IonItem>
              <IonTextarea
                label="Biografía"
                labelPlacement="stacked"
                value={userForm.bio}
                onIonInput={e => setUserForm({...userForm, bio: e.detail.value!})}
                placeholder="Información adicional del usuario"
                rows={3}
              />
            </IonItem>
            
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <IonButton expand="block" color="primary" onClick={handleSaveUser}>
                <IonIcon icon={saveOutline} slot="start" />
                Crear Usuario
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={handleCloseModals}>
                Cancelar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal para editar usuario */}
        <IonModal isOpen={showEditModal} onDidDismiss={handleCloseModals}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Usuario</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleCloseModals}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonInput
                label="Nombre *"
                labelPlacement="stacked"
                value={userForm.nombre}
                onIonInput={e => setUserForm({...userForm, nombre: e.detail.value!})}
                placeholder="Ingrese el nombre"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Apellidos *"
                labelPlacement="stacked"
                value={userForm.apellidos}
                onIonInput={e => setUserForm({...userForm, apellidos: e.detail.value!})}
                placeholder="Ingrese los apellidos"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Email *"
                labelPlacement="stacked"
                type="email"
                value={userForm.email}
                onIonInput={e => setUserForm({...userForm, email: e.detail.value!})}
                placeholder="Ingrese el email"
                required
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Teléfono"
                labelPlacement="stacked"
                value={userForm.telefono}
                onIonInput={e => setUserForm({...userForm, telefono: e.detail.value!})}
                placeholder="Ingrese el teléfono"
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="Nueva Contraseña"
                labelPlacement="stacked"
                type="password"
                value={userForm.password}
                onIonInput={e => setUserForm({...userForm, password: e.detail.value!})}
                placeholder="Dejar vacío para mantener la actual"
              />
            </IonItem>
            
            <IonItem>
              <IonSelect
                label="Rol"
                labelPlacement="stacked"
                value={userForm.id_rol}
                onIonChange={e => setUserForm({...userForm, id_rol: e.detail.value})}
              >
                {roles.map(role => (
                  <IonSelectOption key={role.id} value={role.id}>
                    {role.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            
            <IonItem>
              <IonInput
                label="URL del Avatar"
                labelPlacement="stacked"
                value={userForm.avatar_url}
                onIonInput={e => setUserForm({...userForm, avatar_url: e.detail.value!})}
                placeholder="URL de la imagen de perfil"
              />
            </IonItem>
            
            <IonItem>
              <IonTextarea
                label="Biografía"
                labelPlacement="stacked"
                value={userForm.bio}
                onIonInput={e => setUserForm({...userForm, bio: e.detail.value!})}
                placeholder="Información adicional del usuario"
                rows={3}
              />
            </IonItem>
            
            <IonItem>
              <IonToggle 
                checked={userForm.activo} 
                onIonChange={e => setUserForm({...userForm, activo: e.detail.checked})}
              >
                Usuario activo
              </IonToggle>
            </IonItem>
            
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <IonButton expand="block" color="primary" onClick={handleSaveUser}>
                <IonIcon icon={saveOutline} slot="start" />
                Actualizar Usuario
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={handleCloseModals}>
                Cancelar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal para cambiar rol */}
        <IonModal isOpen={showRoleModal} onDidDismiss={() => setShowRoleModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Cambiar Rol de Usuario</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowRoleModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedUser && (
              <div>
                <h3>Usuario: {selectedUser.nombre} {selectedUser.apellidos}</h3>
                <p>Rol actual: <IonChip color={getRoleColor(selectedUser.id_rol)}>{selectedUser.rol?.nombre || getRoleName(selectedUser.id_rol)}</IonChip></p>
                
                <IonItem>
                  <IonSelect
                    label="Nuevo rol"
                    labelPlacement="stacked"
                    value={newRole}
                    onIonChange={e => setNewRole(e.detail.value)}
                  >
                    {roles.map(role => (
                      <IonSelectOption key={role.id} value={role.id}>
                        {role.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                
                <div className="modal-actions">
                  <IonButton expand="block" onClick={confirmRoleChange}>
                    Cambiar Rol
                  </IonButton>
                  <IonButton expand="block" fill="clear" onClick={() => setShowRoleModal(false)}>
                    Cancelar
                  </IonButton>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmar Acción"
          message={alertMessage}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Confirmar', handler: confirmAction }
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

export default AdminManageUsers;