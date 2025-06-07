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
import Avatar from '../../components/Avatar';
import "../../theme/variables.css";
import "./ManageUsers.css";

const GestionUsuariosClub: React.FC = () => {
  const { user } = useAuth();

  const [idClub, setIdClub] = useState<number | null>(null);
  const [datosClub, setDatosClub] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [textosBusqueda, setTextosBusqueda] = useState('');
  const [mensajeToast, setMensajeToast] = useState('');
  const [colorToast, setColorToast] = useState<'success' | 'danger' | 'warning'>('success');
  const [mostrarToast, setMostrarToast] = useState(false);
  const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState<number | null>(null);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [accionAlerta, setAccionAlerta] = useState<'add' | 'remove'>('add');
  const [mostrarModalAñadirSocios, setMostrarModalAñadirSocios] = useState(false);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    if (user) cargarDatosClub();
  }, [user]);

  const mostrarMensajeToast = (mensaje: string, color: typeof colorToast = 'success') => {
    setMensajeToast(mensaje);
    setColorToast(color);
    setMostrarToast(true);
  };

  const cargarDatosClub = async () => {
    try {
      setCargando(true);
      const res = await apiService.get(`/clubs?id_administrador=${user?.id}`);
      if (res && res.length > 0) {
        setDatosClub(res[0]);
        setIdClub(res[0].id);
        await cargarUsuarios();
      } else {
        console.log('No hay club asignado, pero no se mostrará toast porque no es error.');
      }
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al cargar los datos del club', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await apiService.get('/users');
      const arrayUsuarios = Array.isArray(res) ? res : [];
      setUsuarios(arrayUsuarios);
      
      console.log("Usuarios recibidos:", arrayUsuarios);
      arrayUsuarios.forEach(u => {
        console.log(`👤 ${u.nombre} ${u.apellidos}`);
        console.log(`📌 id_rol:`, u.id_rol);
        console.log(`🏠 id_club_socio:`, u.id_club_socio);
      });
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al cargar usuarios', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const manejarActualizacion = async (event: CustomEvent) => {
    try {
      await cargarUsuarios();
    } finally {
      event.detail.complete();
    }
  };  
  

  const esUsuarioMiembro = (id: number) =>
    usuarios.some(u =>
      u.id === id &&
      (u.id_rol === 6 || u.id_rol?.id === 6) &&
      (u.id_club_socio === idClub || u.club_socio?.id === idClub)
    );
  
  const esUsuarioAdmin = (id: number) =>
    usuarios.some(u =>
      u.id === id &&
      (u.id_rol === 2 || u.id_rol?.id === 2)
    );
  
  const usuariosFiltradosPersonal = usuarios.filter(u =>
    (u.id_rol === 2 || u.id_rol?.id === 2) &&
    u.id === datosClub?.id_administrador
  );
  
  const sociosFiltrados = usuarios.filter(u =>
    (u.id_rol === 6 || u.id_rol?.id === 6) &&
    (u.id_club_socio === idClub || u.club_socio?.id === idClub) &&
    `${u.nombre} ${u.apellidos}`.toLowerCase().includes(textosBusqueda.toLowerCase())
  );
  
  

  const confirmarAccion = async () => {
    if (!idUsuarioSeleccionado || !idClub) return;
    if (accionAlerta === 'add') await añadirComoMiembro(idUsuarioSeleccionado);
    else await eliminarComoMiembro(idUsuarioSeleccionado);
    setMostrarAlerta(false);
  };

  const añadirComoMiembro = async (idUsuario: number) => {
    if (!idClub) return mostrarMensajeToast('No se ha seleccionado un club', 'danger');
    try {
      setCargando(true);
      await apiService.post('/add-club-member', { user_id: idUsuario, club_id: idClub });
      mostrarMensajeToast('Usuario añadido como socio correctamente');
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al añadir socio', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const eliminarComoMiembro = async (idUsuario: number) => {
    if (!idClub) return mostrarMensajeToast('No se ha seleccionado un club', 'danger');
    try {
      setCargando(true);
      await apiService.post('/remove-club-member', { user_id: idUsuario, club_id: idClub });
      mostrarMensajeToast('Usuario eliminado como socio correctamente');
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarMensajeToast('Error al eliminar socio', 'danger');
    } finally {
      setCargando(false);
    }
  };

  const renderizarListaUsuarios = (lista: any[], textoVacio: string) => {
    if (lista.length === 0) {
      return (
        <div className="mensaje-vacio">
          <IonText>{textoVacio}</IonText>
        </div>
      );
    }

    return (
      <IonList>
        {lista.map(usuario => (
          <IonItem key={usuario.id}>
            <div slot="start">
              <Avatar
                idUsuario={usuario.id}
                nombre={usuario.nombre}
                urlAvatar={usuario.avatar_url}
                tamaño={40}
              />
            </div>
            <IonLabel>
              <h2>{usuario.nombre} {usuario.apellidos}</h2>
              <p>{usuario.email}</p>
            </IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonChip color="medium">
                {obtenerNombreRol(usuario.id_rol)}
              </IonChip>
              {usuario.id_rol === 6 && (
                <IonButton
                  size="small"
                  color="danger"
                  fill="clear"
                  onClick={() => {
                    setIdUsuarioSeleccionado(usuario.id);
                    setMensajeAlerta(`¿Deseas eliminar a ${usuario.nombre} ${usuario.apellidos} como socio?`);
                    setAccionAlerta('remove');
                    setMostrarAlerta(true);
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
  


  const obtenerNombreRol = (id: number) => {
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
    <IonPage className="manage-users-page">
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={e => manejarActualizacion(e)}>
          <IonRefresherContent />
        </IonRefresher>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2">
              <IonCard className="info-card">
                <IonCardHeader>
                  <IonCardTitle>
                    {datosClub ? datosClub.nombre : 'Club'}
                    <IonBadge color="success" style={{ float: 'right' }}>
                      Nº Socios: {sociosFiltrados.length}
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
                value={textosBusqueda}
                debounce={300}
                onIonInput={e => setTextosBusqueda(e.detail.value!)}
                placeholder="Buscar socios..."
              />

              <IonCard className="courts-card">
                <IonCardHeader>
                  <IonCardTitle>Personal del Club</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {renderizarListaUsuarios(usuariosFiltradosPersonal, "No hay personal del club disponible.")}
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
                  {textosBusqueda.trim() === "" && sociosFiltrados.length === 0
                    ? <div className="mensaje-vacio"><IonText>No hay socios en el club</IonText></div>
                    : renderizarListaUsuarios(sociosFiltrados, "No se encontraron socios.")}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={mostrarAlerta}
          onDidDismiss={() => setMostrarAlerta(false)}
          header={accionAlerta === 'add' ? 'Añadir socio' : 'Eliminar socio'}
          message={mensajeAlerta}
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setMostrarAlerta(false) },
            { text: 'Confirmar', handler: confirmarAccion }
          ]}
        />

        <IonLoading isOpen={cargando} message="Cargando usuarios..." />

        <IonToast
          isOpen={mostrarToast}
          onDidDismiss={() => setMostrarToast(false)}
          message={mensajeToast}
          duration={2000}
          position="bottom"
          color={colorToast}
        />

        <IonModal isOpen={mostrarModalAñadirSocios} onDidDismiss={() => setMostrarModalAñadirSocios(false)}>
          <IonContent className="ion-padding">
            <h2>Añadir socios</h2>
            {usuarios.length === 0 ? (
              <IonText>Cargando usuarios...</IonText>
            ) : (
              <>
                <p>Selecciona los usuarios que deseas añadir como socios del club.</p>
                <IonList>
                  {
                    usuarios
                      .filter(usuario =>
                        usuario.id_rol === 5 &&
                        !esUsuarioMiembro(usuario.id) &&
                        !esUsuarioAdmin(usuario.id)
                    )
                      .sort((a, b) => {
                        const aDeshabilitado = esUsuarioMiembro(a.id) || esUsuarioAdmin(a.id);
                        const bDeshabilitado = esUsuarioMiembro(b.id) || esUsuarioAdmin(b.id);
                        return aDeshabilitado === bDeshabilitado ? 0 : aDeshabilitado ? 1 : -1;
                      })
                      .map(usuario => {
                        const deshabilitado = esUsuarioMiembro(usuario.id) || esUsuarioAdmin(usuario.id);
                        const seleccionado = usuariosSeleccionados.includes(usuario.id);
                        return (
                          <IonItem key={usuario.id} disabled={deshabilitado} style={deshabilitado ? { opacity: 0.5 } : {}}>
                            <IonLabel>
                              {usuario.nombre} {usuario.apellidos} ({usuario.email})
                            </IonLabel>
                            <IonCheckbox
                              checked={seleccionado}
                              disabled={deshabilitado}
                              onIonChange={e => {
                                const marcado = e.detail.checked;
                                setUsuariosSeleccionados(prev =>
                                  marcado
                                    ? [...prev, usuario.id]
                                    : prev.filter(id => id !== usuario.id)
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
                    await añadirComoMiembro(id);
                  }
                  setUsuariosSeleccionados([]);
                  await cargarUsuarios();
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

export default GestionUsuariosClub;