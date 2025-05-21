// Este archivo es una reescritura directa y limpia del actual ManageUsers.tsx
// usando los datos tal como vienen del backend sin transformar roles
// Mantiene toda la funcionalidad original.

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
  IonCheckbox,
  IonBadge
} from '@ionic/react';
import { personAddOutline, personRemoveOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import "../../theme/variables.css";
import "./ManageUsers.css";

const ManageUsers: React.FC = () => {
  const { user } = useAuth();

  const [clubId, setClubId] = useState<number | null>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertAction, setAlertAction] = useState<'add' | 'remove'>('add');
  const [mostrarModalAñadirSocios, setMostrarModalAñadirSocios] = useState(false);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    if (user) loadClubData();
  }, [user]);

  const showToastMessage = (message: string, color: typeof toastColor = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const loadClubData = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/clubs?id_administrador=${user?.id}`);
      if (res && res.length > 0) {
        setClubData(res[0]);
        setClubId(res[0].id);
        await loadUsers();
      } else {
        showToastMessage('No se encontró información del club', 'warning');
      }
    } catch (error) {
      console.error(error);
      showToastMessage('Error al cargar los datos del club', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.get('/users');
      const usersArray = Array.isArray(res) ? res : [];
      setUsers(usersArray);
      
      console.log("Usuarios recibidos:", usersArray);
      usersArray.forEach(u => {
        console.log(`👤 ${u.nombre} ${u.apellidos}`);
        console.log(`📌 id_rol:`, u.id_rol);
        console.log(`🏠 id_club_socio:`, u.id_club_socio);
      });
    } catch (error) {
      console.error(error);
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
  

  const isUserMember = (id: number) =>
    users.some(u =>
      u.id === id &&
      (u.id_rol === 6 || u.id_rol?.id === 6) &&
      (u.id_club_socio === clubId || u.club_socio?.id === clubId)
    );
  
  const isUserAdmin = (id: number) =>
    users.some(u =>
      u.id === id &&
      (u.id_rol === 2 || u.id_rol?.id === 2)
    );
  
  const filteredStaffUsers = users.filter(u =>
    (u.id_rol === 2 || u.id_rol?.id === 2) &&
    u.id === clubData?.id_administrador
  );
  
  const filteredSocios = users.filter(u =>
    (u.id_rol === 6 || u.id_rol?.id === 6) &&
    (u.id_club_socio === clubId || u.club_socio?.id === clubId) &&
    `${u.nombre} ${u.apellidos}`.toLowerCase().includes(searchText.toLowerCase())
  );
  
  

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
      showToastMessage('Usuario añadido como socio correctamente');
      await loadUsers();
    } catch (error) {
      console.error(error);
      showToastMessage('Error al añadir socio', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const removeAsMember = async (userId: number) => {
    if (!clubId) return showToastMessage('No se ha seleccionado un club', 'danger');
    try {
      setLoading(true);
      await apiService.post('/remove-club-member', { user_id: userId, club_id: clubId });
      showToastMessage('Usuario eliminado como socio correctamente');
      await loadUsers();
    } catch (error) {
      console.error(error);
      showToastMessage('Error al eliminar socio', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const renderUserList = (list: any[], emptyText: string) => {
    if (list.length === 0) {
      return (
        <div className="mensaje-vacio">
          <IonText>{emptyText}</IonText>
        </div>
      );
    }

    const getColorParaAvatar = (id: number) => {
      const colors = ['#1abc9c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#e74c3c', '#2ecc71', '#7f8c8d'];
      return colors[id % colors.length];
    };
  
    return (
      <IonList>
        {list.map(user => (
          <IonItem key={user.id}>
            <IonAvatar slot="start" style={{ backgroundColor: getColorParaAvatar(user.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.nombre} />
                : <span>{user.nombre?.charAt(0).toUpperCase() || '?'}</span>}
            </IonAvatar>
            <IonLabel>
              <h2>{user.nombre} {user.apellidos}</h2>
              <p>{user.email}</p>
            </IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonChip color="medium">
                {getRolNombre(user.id_rol)}
              </IonChip>
              {user.id_rol === 6 && (
                <IonButton
                  size="small"
                  color="danger"
                  fill="clear"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setAlertMessage(`¿Deseas eliminar a ${user.nombre} ${user.apellidos} como socio?`);
                    setAlertAction('remove');
                    setShowAlert(true);
                  }}
                >
                  <IonIcon icon={personRemoveOutline} />
                </IonButton>
              )}
            </div>
          </IonItem>
        ))}
      </IonList>
    );
  };
  


  const getRolNombre = (id: number) => {
    switch (id) {
      case 1: return 'ADMINISTRADOR';
      case 2: return 'ADMIN DE CLUB';
      case 3: return 'PROFESOR';
      case 4: return 'EMPLEADO';
      case 5: return 'USUARIO';
      case 6: return 'SOCIO';
      default: return 'DESCONOCIDO';
    }
  };
  

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={e => handleRefresh(e)}>
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

              <IonCard className="courts-card">
                <IonCardHeader>
                  <IonCardTitle>Personal del Club</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {renderUserList(filteredStaffUsers, "No hay personal del club disponible.")}
                </IonCardContent>
              </IonCard>

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
                  {searchText.trim() === "" && filteredSocios.length === 0
                    ? <div className="mensaje-vacio"><IonText>No hay socios en el club</IonText></div>
                    : renderUserList(filteredSocios, "No se encontraron socios.")}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertAction === 'add' ? 'Añadir socio' : 'Eliminar socio'}
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
            {users.length === 0 ? (
              <IonText>Cargando usuarios...</IonText>
            ) : (
              <>
                <p>Selecciona los usuarios que deseas añadir como socios del club.</p>
                <IonList>
                  {
                    users
                      .filter(user =>
                        user.id_rol === 5 &&
                        !isUserMember(user.id) &&
                        !isUserAdmin(user.id)
                    )
                      .sort((a, b) => {
                        const aDisabled = isUserMember(a.id) || isUserAdmin(a.id);
                        const bDisabled = isUserMember(b.id) || isUserAdmin(b.id);
                        return aDisabled === bDisabled ? 0 : aDisabled ? 1 : -1;
                      })
                      .map(user => {
                        const deshabilitado = isUserMember(user.id) || isUserAdmin(user.id);
                        const seleccionado = usuariosSeleccionados.includes(user.id);
                        return (
                          <IonItem key={user.id} disabled={deshabilitado} style={deshabilitado ? { opacity: 0.5 } : {}}>
                            <IonLabel>
                              {user.nombre} {user.apellidos} ({user.email})
                            </IonLabel>
                            <IonCheckbox
                              checked={seleccionado}
                              disabled={deshabilitado}
                              onIonChange={e => {
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
                      })
                  }
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
              </>
            )}
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default ManageUsers;