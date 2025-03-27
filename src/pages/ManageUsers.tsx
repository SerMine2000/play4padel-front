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
  IonButton,
  IonIcon,
  IonList,
  IonLoading,
  IonToast,
  IonText,
  IonSearchbar,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonBadge,
  IonAvatar
} from '@ionic/react';
import { 
  personAddOutline,
  personRemoveOutline,
  refreshOutline,
  personCircleOutline,
  shieldOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import './css/ManageUsers.css';

const ManageUsers: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  
  // Estados
  const [clubId, setClubId] = useState<number | null>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<string>('success');
  const [searchText, setSearchText] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [alertAction, setAlertAction] = useState<'add' | 'remove'>('add');
  
  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const fullName = `${user.nombre} ${user.apellidos}`.toLowerCase();
    return fullName.includes(searchText.toLowerCase()) || 
           user.email.toLowerCase().includes(searchText.toLowerCase());
  });
  
  // Cargar datos del club y usuarios cuando se monta el componente
  useEffect(() => {
    const loadClubData = async () => {
      if (!user || user.id_rol !== 1) {
        // Redirigir si no es administrador
        history.replace('/home');
        return;
      }
      
      try {
        setLoading(true);
        // Buscar club por id_administrador
        const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
        
        if (clubsResponse && clubsResponse.length > 0) {
          const club = clubsResponse[0];
          setClubId(club.id);
          setClubData(club);
          
          // Cargar usuarios
          await loadUsers();
        } else {
          showToastMessage('No se encontró información del club', 'warning');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        showToastMessage('Error al cargar datos del club', 'danger');
      } finally {
        setLoading(false);
      }
    };
    
    loadClubData();
  }, [user, history]);
  
  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersResponse = await apiService.get('/users');
      
      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      showToastMessage('Error al cargar usuarios', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadUsers();
    } finally {
      event.detail.complete();
    }
  };
  
  // Mostrar mensaje de toast
  const showToastMessage = (message: string, color: string = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };
  
  // Verificar si el usuario ya es socio
  const isUserMember = (userId: number): boolean => {
    const userFound = users.find(u => u.id === userId);
    
    if (userFound && userFound.club_socio && userFound.id_rol === 5) {
      return userFound.club_socio.id === clubId;
    }
    
    return Boolean(userFound && userFound.id_rol === 5 && userFound.id_club_socio === clubId);
  };
  
  const isUserAdmin = (userId: number): boolean => {
    const userFound = users.find(u => u.id === userId);
    if (!userFound) return false;
    
    return userFound.id_rol === 1;
  };
  
  const prepareAddAsMember = (userId: number) => {
    // Verificar si el usuario es administrador
    if (isUserAdmin(userId)) {
      showToastMessage('No se puede modificar el rol de un administrador', 'danger');
      return;
    }
    
    if (isUserMember(userId)) {
      showToastMessage('Este usuario ya es socio del club', 'warning');
      return;
    }
  
    setSelectedUserId(userId);
    setAlertAction('add');
    
    const selectedUser = users.find(u => u.id === userId);
    const userName = selectedUser ? `${selectedUser.nombre} ${selectedUser.apellidos}` : 'este usuario';
    
    setAlertMessage(`¿Añadir a ${userName} como socio del club?`);
    setShowAlert(true);
  };
  
  // Preparar para eliminar usuario como socio
  const prepareRemoveAsMember = (userId: number) => {
    // Verificar si el usuario es administrador
    if (isUserAdmin(userId)) {
      showToastMessage('No se puede modificar el rol de un administrador', 'danger');
      return;
    }
    
    // Verificar si el usuario es socio
    if (!isUserMember(userId)) {
      showToastMessage('Este usuario no es socio del club', 'warning');
      return;
    }
    
    setSelectedUserId(userId);
    setAlertAction('remove');
    
    // Buscar información del usuario para el mensaje
    const selectedUser = users.find(u => u.id === userId);
    const userName = selectedUser ? `${selectedUser.nombre} ${selectedUser.apellidos}` : 'este usuario';
    
    setAlertMessage(`¿Está seguro de eliminar a ${userName} como socio del club? No perderá su cuenta en la aplicación.`);
    setShowAlert(true);
  };
  
  const confirmAction = async () => {
    if (!selectedUserId || !clubId) return;
    
    if (alertAction === 'add') {
      await addAsMember(selectedUserId);
    } else {
      await removeAsMember(selectedUserId);
    }
    
    setShowAlert(false);
  };
  
  // Añadir usuario como socio del club
  const addAsMember = async (userId: number) => {
    if (!clubId) {
      showToastMessage('No se ha seleccionado un club', 'danger');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isUserAdmin(userId)) {
        showToastMessage('No se puede modificar el rol de un administrador', 'danger');
        return;
      }
      
      // Verificar si el usuario ya es socio
      if (isUserMember(userId)) {
        showToastMessage('Este usuario ya es socio del club', 'warning');
        setLoading(false);
        return;
      }
      
      const response = await apiService.post('/add-club-member', {
        user_id: userId,
        club_id: clubId
      });
      
      
      // CLAVE: Actualizar manualmente el usuario en el estado local
      // Asegurar que el usuario se convierte en SOCIO (id_rol = 5)
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return { ...u, id_rol: 5, id_club_socio: clubId };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      
      showToastMessage('Usuario añadido como socio correctamente', 'success');
      
      // Recargar lista de usuarios después de una pausa
      setTimeout(async () => {
        await loadUsers();
      }, 1000);
      
    } catch (error) {
      console.error('Error al añadir socio:', error);
      showToastMessage('Error al añadir usuario como socio', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar usuario como socio del club
  const removeAsMember = async (userId: number) => {
    if (!clubId) {
      showToastMessage('No se ha seleccionado un club', 'danger');
      return;
    }
    
    try {
      setLoading(true);
      
      // Buscar al usuario
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        showToastMessage('Usuario no encontrado', 'danger');
        return;
      }
      
      // Verificar nuevamente si el usuario no es socio
      if (!isUserMember(userId)) {
        showToastMessage('Este usuario no es socio del club', 'warning');
        return;
      }
      
      // Intenta usar un endpoint específico para quitar membresía
      try {
        const response = await apiService.post('/remove-club-member', {
          user_id: userId,
          club_id: clubId
        });
      } catch (error) {
        console.error("Error con endpoint específico, intentando actualización directa");
        
        // Si el endpoint específico falla, intentar actualizar directamente
        // Cambiar rol a usuario normal 
        const updateData = {
          id_rol: 4, // Cambiar a rol USUARIO normal
          id_club_socio: null // Quitar asociación al club
        };
        
        const response = await apiService.put(`/user/${userId}`, updateData);
      }
      
      showToastMessage('Usuario eliminado como socio correctamente', 'success');
      
      // Recargar lista de usuarios
      await loadUsers();
      
    } catch (error) {
      console.error('Error al eliminar socio:', error);
      showToastMessage('Error al eliminar usuario como socio', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener rol como texto
  const getRolName = (rolId: number): string => {
    switch (rolId) {
      case 1: return 'ADMIN';
      case 2: return 'PROFESOR';
      case 3: return 'EMPLEADO';
      case 4: return 'USUARIO';
      case 5: return 'SOCIO';
      default: return 'DESCONOCIDO';
    }
  };
  
  // Obtener color según rol
  const getRolColor = (rolId: number): string => {
    switch (rolId) {
      case 1: return 'danger';
      case 2: return 'secondary';
      case 3: return 'tertiary';
      case 4: return 'medium';
      case 5: return 'success';
      default: return 'medium';
    }
  };

  // Función para obtener el número total de socios
  const getTotalMembers = (): number => {
    return users.filter(u => u.id_rol === 5).length;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Gestión de Usuarios</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadUsers}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2">
              <IonCard className="info-card">
                <IonCardHeader>
                  <IonCardTitle>
                    {clubData ? clubData.nombre : 'Club'} 
                    <IonBadge color="success" style={{ float: 'right' }}>
                      {getTotalMembers()} Socios
                    </IonBadge>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    Administre los usuarios de su club. Puede añadir socios, gestionar membresías y administrar usuarios.
                  </p>
                </IonCardContent>
              </IonCard>
              
              <IonSearchbar
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value || '')}
                placeholder="Buscar usuarios..."
              />
              
              <IonCard className="courts-card">
                <IonCardHeader>
                  <IonCardTitle>Usuarios</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="no-courts">
                      <IonIcon icon={personCircleOutline} size="large" />
                      <IonText color="medium">
                        <p>No se encontraron usuarios</p>
                      </IonText>
                      <IonButton 
                        expand="block" 
                        onClick={() => loadUsers()}
                      >
                        <IonIcon slot="start" icon={refreshOutline} />
                        Recargar
                      </IonButton>
                    </div>
                  ) : (
                    <IonList>
                      {filteredUsers.map((userData) => {
                        const userIsMember = isUserMember(userData.id);
                        const userIsAdmin = isUserAdmin(userData.id);
                        
                        return (
                          <IonItem 
                            key={userData.id} 
                            className={`${userIsMember ? 'member-item' : ''} ${userIsAdmin ? 'admin-item' : ''}`}
                          >
                            <IonAvatar slot="start">
                              {userData.avatar_url ? (
                                <img src={userData.avatar_url} alt={userData.nombre} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {userData.nombre.charAt(0)}
                                </div>
                              )}
                            </IonAvatar>
                            
                            <IonLabel>
                              <h2>{userData.nombre} {userData.apellidos}</h2>
                              <p>{userData.email}</p>
                              {userIsMember && (
                                <IonChip color="success" className="member-badge">
                                  <IonIcon icon={personCircleOutline} />
                                  <IonLabel>Socio</IonLabel>
                                </IonChip>
                              )}
                              {userIsAdmin && (
                                <IonChip color="danger" className="admin-badge">
                                  <IonIcon icon={shieldOutline} />
                                  <IonLabel>Administrador</IonLabel>
                                </IonChip>
                              )}
                            </IonLabel>
                            
                            <IonChip 
                              color={getRolColor(userData.id_rol)} 
                              slot="end"
                            >
                              {getRolName(userData.id_rol)}
                            </IonChip>
                            
                            {/* Solo mostrar botones si no es administrador */}
                            {!userIsAdmin && (
                              <>
                                {/* Botón para añadir como socio */}
                                <IonButton 
                                  slot="end" 
                                  fill="clear" 
                                  color="success"
                                  onClick={() => prepareAddAsMember(userData.id)}
                                >
                                  <IonIcon slot="icon-only" icon={personAddOutline} />
                                </IonButton>
                                
                                {/* Botón para quitar como socio */}
                                <IonButton 
                                  slot="end" 
                                  fill="clear" 
                                  color="danger"
                                  onClick={() => prepareRemoveAsMember(userData.id)}
                                >
                                  <IonIcon slot="icon-only" icon={personRemoveOutline} />
                                </IonButton>
                              </>
                            )}
                          </IonItem>
                        );
                      })}
                    </IonList>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        
        {/* Alerta de confirmación */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertAction === 'add' ? "Añadir socio" : "Eliminar socio"}
          message={alertMessage}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Confirmar',
              handler: confirmAction
            }
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

export default ManageUsers;