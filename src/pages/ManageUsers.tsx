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
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLoading,
  IonToast,
  IonText,
  IonSearchbar,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  IonAlert
} from '@ionic/react';
import { 
  personAddOutline,
  removeCircleOutline,
  createOutline,
  refreshOutline,
  personCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api.service';
import './css/ManageCourts.css'; // Reutilizamos estilos similares

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
  
  // Preparar para añadir usuario como socio
  const prepareAddAsMember = (userId: number) => {
    setSelectedUserId(userId);
    setAlertAction('add');
    setAlertMessage('¿Está seguro de añadir este usuario como socio del club?');
    setShowAlert(true);
  };
  
  // Preparar para eliminar usuario como socio
  const prepareRemoveAsMember = (userId: number) => {
    setSelectedUserId(userId);
    setAlertAction('remove');
    setAlertMessage('¿Está seguro de eliminar a este usuario como socio del club? No perderá su cuenta en la aplicación.');
    setShowAlert(true);
  };
  
  // Confirmar acción
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
      
      const response = await apiService.post('/add-club-member', {
        user_id: userId,
        club_id: clubId
      });
      
      showToastMessage('Usuario añadido como socio correctamente', 'success');
      
      // Recargar lista de usuarios
      await loadUsers();
      
    } catch (error) {
      console.error('Error al añadir socio:', error);
      showToastMessage('Error al añadir usuario como socio', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar usuario como socio del club (NUEVO MÉTODO)
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
      
      // Cambiar rol a usuario normal y eliminar club_socio
      const updateData = {
        id_rol: 4, // Cambiar a rol USUARIO normal
        id_club_socio: null // Quitar asociación al club
      };
      
      // Actualizar usuario
      await apiService.put(`/user/${userId}`, updateData);
      
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
  
  // Verificar si el usuario ya es socio
  const isUserMember = (userId: number): boolean => {
    const userFound = users.find(u => u.id === userId);
    return userFound && userFound.id_rol === 5 && userFound.id_club_socio === clubId;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Gestión de Usuarios</IonTitle>
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
                      {filteredUsers.map((userData) => (
                        <IonItemSliding key={userData.id}>
                          <IonItem>
                            <IonLabel>
                              <h2>{userData.nombre} {userData.apellidos}</h2>
                              <p>{userData.email}</p>
                              {userData.id_club_socio === clubId && (
                                <p><strong>Socio de este club</strong></p>
                              )}
                            </IonLabel>
                            <IonChip 
                              color={getRolColor(userData.id_rol)} 
                              slot="end"
                            >
                              {getRolName(userData.id_rol)}
                            </IonChip>
                          </IonItem>
                          
                          <IonItemOptions side="end">
                            {isUserMember(userData.id) && (
                              <IonItemOption 
                                color="danger" 
                                onClick={() => prepareRemoveAsMember(userData.id)}
                              >
                                <IonIcon slot="icon-only" icon={removeCircleOutline} />
                              </IonItemOption>
                            )}
                          </IonItemOptions>
                          
                          <IonItemOptions side="start">
                            {!isUserMember(userData.id) && (
                              <IonItemOption 
                                color="success" 
                                onClick={() => prepareAddAsMember(userData.id)}
                              >
                                <IonIcon slot="icon-only" icon={personAddOutline} />
                              </IonItemOption>
                            )}
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
        
        {/* Alerta de confirmación */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmar acción"
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