import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
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
  IonAvatar,
  IonBadge,
  IonCol,
  IonGrid,
  IonRow,
  IonCheckbox,
  IonModal
} from '@ionic/react';
import {
  personAddOutline,
  personRemoveOutline,
  refreshOutline,
  personOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import "../../theme/variables.css";
import "./ManageUsers.css";

const ManageUsers: React.FC = () => {
  const { user } = useAuth();

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
  const [mostrarModalAñadirSocios, setMostrarModalAñadirSocios] = useState(false);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
  const [alertAction, setAlertAction] = useState<'add' | 'remove'>('add');

  useEffect(() => {
    if (user) {
      loadClubData();
    }
  }, [user]);


  const showToastMessage = (message: string, color: string = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const isUserMember = (userId: number): boolean => {
    const userFound = users.find(u => u.id === userId);
    if (userFound && userFound.id_rol === 'SOCIO') {
      return userFound.id_club_socio === clubId;
    }
    return false;
  };
  

  const isUserAdmin = (userId: number): boolean => {
    const userFound = users.find(u => u.id === userId);
    return userFound?.id_rol === 'CLUB';
  };

  const getTotalMembers = (): number => {
    return users.filter(u => isUserMember(u.id)).length;
  };

  const loadClubData = async () => {
    try {
      setLoading(true);
      if (!user) {
        showToastMessage('Usuario no autenticado', 'error');
        return;
      }
      const clubsResponse = await apiService.get(`/clubs?id_administrador=${user.id}`);
      if (clubsResponse && clubsResponse.length > 0) {
        const club = clubsResponse[0];
        setClubId(club.id);
        setClubData(club);
        await loadUsers();
      } else {
        showToastMessage('No se encontró información del club', 'warning');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToastMessage('Error al cargar los datos del club', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersResponse = await apiService.get('/users');
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      showToastMessage('Error al cargar usuarios', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadUsers();
    } finally {
      event.detail.complete();
    }
  };

  const prepareAddAsMember = (userId: number) => {
    if (isUserAdmin(userId)) return showToastMessage('No se puede modificar el rol de un administrador', 'danger');
    if (isUserMember(userId)) return showToastMessage('Este usuario ya es socio del club', 'warning');
    setSelectedUserId(userId);
    setAlertAction('add');
    const selectedUser = users.find(u => u.id === userId);
    setAlertMessage(`¿Añadir a ${selectedUser?.nombre} ${selectedUser?.apellidos} como socio del club?`);
    setShowAlert(true);
  };

  const prepareRemoveAsMember = (userId: number) => {
    if (isUserAdmin(userId)) return showToastMessage('No se puede modificar el rol de un administrador', 'danger');
    if (!isUserMember(userId)) return showToastMessage('Este usuario no es socio del club', 'warning');
    setSelectedUserId(userId);
    setAlertAction('remove');
    const selectedUser = users.find(u => u.id === userId);
    setAlertMessage(`¿Eliminar a ${selectedUser?.nombre} ${selectedUser?.apellidos} como socio del club?`);
    setShowAlert(true);
  };

  const confirmAction = async () => {
    if (!selectedUserId || !clubId) return;
    if (alertAction === 'add') await addAsMember(selectedUserId);
    else await removeAsMember(selectedUserId);
    setShowAlert(false);
  };

  const addAsMember = async (userId: number) => {
    if (!clubId) return showToastMessage('No se ha seleccionado un club', 'danger');
    try {
      setLoading(true);
      await apiService.post('/add-club-member', { user_id: userId, club_id: clubId });
      showToastMessage('Usuario añadido como socio correctamente', 'success');
    } catch (error) {
      console.error('Error al añadir socio:', error);
      showToastMessage('Error al añadir usuario como socio', 'danger');
    } finally {
      setLoading(false);
    }
  };
  

  const removeAsMember = async (userId: number) => {
    if (!clubId) return showToastMessage('No se ha seleccionado un club', 'danger');
    try {
      setLoading(true);
      await apiService.post('/remove-club-member', { user_id: userId, club_id: clubId });
      await loadUsers();
      showToastMessage('Usuario eliminado como socio correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar socio:', error);
      showToastMessage('Error al eliminar usuario como socio', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaffUsers = users.filter(user =>
    user.id_rol === 'CLUB'
  );

  const filteredSocios = users.filter(user =>
    user.id_rol === 'SOCIO' &&
    `${user.nombre} ${user.apellidos}`.toLowerCase().startsWith(searchText.toLowerCase())
  );

  const renderUserList = (userList: any[], emptyMessage: string) => {
    if (userList.length === 0) {
      return (
        <div className="mensaje-vacio">
          <IonText>{emptyMessage}</IonText>
        </div>
      );
    }

    return (
      <IonList>
        {userList.map((userData) => (
          <IonItem key={userData.id}>
            <IonAvatar slot="start">
              <img src={userData.avatar_url || ''} alt={userData.nombre} />
            </IonAvatar>
            <IonLabel>
              <h2>{userData.nombre} {userData.apellidos}</h2>
              <p>{userData.email}</p>
            </IonLabel>
            <IonChip color="medium" slot="end">
              {userData.id_rol}
            </IonChip>
          </IonItem>
        ))}
      </IonList>
    );
  };
  
  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2">
              <IonCard className="info-card">
                <IonCardHeader>
                  <IonCardTitle>
                    {clubData ? clubData.nombre : 'Club'}
                    <IonBadge color="success" style={{ float: 'right' }}>
                      Nº Socios: {filteredSocios.length}
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
                debounce={300}
                onIonInput={e => setSearchText(e.detail.value!)}
                placeholder="Buscar socios..."
              />

              {/* Card Personal del Club */}
              <IonCard className="courts-card">
                <IonCardHeader>
                  <IonCardTitle>Personal del Club</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {renderUserList(filteredStaffUsers, "No hay personal del club disponible.")}
                </IonCardContent>
              </IonCard>

              {/* Card Socios */}
              <IonCard className="courts-card">
              <IonCardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <IonCardTitle>Socios</IonCardTitle>
                  <IonButton size="small" color="primary" onClick={() => setMostrarModalAñadirSocios(true)}>
                    <IonIcon icon={personAddOutline} slot="start" />
                    Añadir socios
                  </IonButton>
                </div>
              </IonCardHeader>
                <IonCardContent>
                  {searchText.trim() === "" && filteredSocios.length === 0 ? (
                    <div className="mensaje-vacio">
                      <IonText>No hay socios en el club</IonText>
                    </div>
                  ) : (
                    renderUserList(filteredSocios, "No se encontraron socios.")
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertAction === 'add' ? "Añadir socio" : "Eliminar socio"}
          message={alertMessage}
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setShowAlert(false) },
            { text: 'Confirmar', handler: confirmAction }
          ]}
        />

        <IonLoading isOpen={loading} message="Cargando usuarios..." />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color={toastColor}
        />

        <IonModal isOpen={mostrarModalAñadirSocios} onDidDismiss={() => setMostrarModalAñadirSocios(false)}>
          <IonContent className="ion-padding">
            <h2>Añadir socios</h2>
            <p>Selecciona los usuarios que deseas añadir como socios del club.</p>
            <IonList>
              {users
                // Ordena para que los usuarios habilitados aparezcan antes
                .sort((a, b) => {
                  const aDisabled = isUserMember(a.id) || isUserAdmin(a.id);
                  const bDisabled = isUserMember(b.id) || isUserAdmin(b.id);
                  return aDisabled === bDisabled ? 0 : aDisabled ? 1 : -1;
                })
                // Filtra los usuarios que tienen el rol 4 (USUARIO) y no están ya en el club
                .map(user => {
                  const esSocio = isUserMember(user.id);
                  const esAdmin = isUserAdmin(user.id);
                  const deshabilitado = esSocio || esAdmin;
                  const seleccionado = usuariosSeleccionados.includes(user.id);

                  return (
                    <IonItem key={user.id} disabled={deshabilitado} style={deshabilitado ? { opacity: 0.5 } : {}}>
                      <IonLabel>
                        {user.nombre} {user.apellidos} ({user.email})
                      </IonLabel>
                      <IonCheckbox
                        checked={seleccionado}
                        disabled={deshabilitado}
                        onIonChange={(e) => {
                          const checked = e.detail.checked;
                          setUsuariosSeleccionados(prev =>
                            checked
                              ? [...prev, user.id]
                              : prev.filter(id => id !== user.id)
                          );
                        }}
                        slot="end"
                      />
                    </IonItem>
                  );
                })}
            </IonList>
            <IonButton expand="block" onClick={async () => {
              for (const id of usuariosSeleccionados) {
                await addAsMember(id);
              }
              setUsuariosSeleccionados([]);
              await loadUsers();
              setMostrarModalAñadirSocios(false);
            }}>
              Añadir seleccionados
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => {
              setUsuariosSeleccionados([]);
              setMostrarModalAñadirSocios(false);
            }}>
              Cancelar
            </IonButton>
          </IonContent>
        </IonModal>


      </IonContent>
    </IonPage>
  );
};

export default ManageUsers;