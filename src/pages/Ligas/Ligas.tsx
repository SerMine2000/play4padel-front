import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonToast,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonFab,
  IonFabButton,
  IonAlert,
  IonToggle,
  IonBadge
} from '@ionic/react';
import {
  addOutline,
  ribbonOutline,
  calendarOutline,
  peopleOutline,
  locationOutline,
  timeOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  trophyOutline,
  cashOutline,
  playOutline,
  statsChartOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Liga, ClubData } from '../../interfaces';
import ApiService from '../../services/api.service';
import './Ligas.css';

const Ligas: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLiga, setSelectedLiga] = useState<Liga | null>(null);
  const [editingLiga, setEditingLiga] = useState<Liga | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [ligaToDelete, setLigaToDelete] = useState<Liga | null>(null);
  const [clubes, setClubes] = useState<ClubData[]>([]);

  // Formulario para crear/editar liga
  const [formData, setFormData] = useState({
    nombre: '',
    id_club: '',
    fecha_inicio: '',
    fecha_fin: '',
    categoria: '',
    nivel: '',
    precio_inscripcion: '',
    estado: 'inscripciones_abiertas',
    max_parejas: '',
    descripcion: '',
    reglas: '',
    premio: '',
    imagen_url: '',
    puntos_victoria: '3',
    puntos_empate: '1',
    puntos_derrota: '0',
    permite_empate: true
  });

  const userRole = (user?.role || '').toUpperCase();
  const canManage = ['ADMIN', 'CLUB'].includes(userRole);

  useEffect(() => {
    loadLigas();
    if (canManage) {
      loadClubes();
    }
  }, []);

  const loadLigas = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/ligas');
      if (response && Array.isArray(response)) {
        setLigas(response);
      }
    } catch (error) {
      console.error('Error al cargar ligas:', error);
      setToastMessage('Error al cargar las ligas');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadClubes = async () => {
    try {
      const response = await ApiService.get('/clubs');
      if (response && Array.isArray(response)) {
        setClubes(response);
      }
    } catch (error) {
      console.error('Error al cargar clubes:', error);
    }
  };

  const handleCreateLiga = async () => {
    try {
      if (!formData.nombre || !formData.id_club || !formData.fecha_inicio || !formData.fecha_fin || !formData.categoria || !formData.nivel) {
        setToastMessage('Por favor completa todos los campos obligatorios');
        setShowToast(true);
        return;
      }

      const ligaData = {
        ...formData,
        id_club: parseInt(formData.id_club),
        precio_inscripcion: parseFloat(formData.precio_inscripcion) || 0,
        max_parejas: formData.max_parejas ? parseInt(formData.max_parejas) : undefined,
        puntos_victoria: parseInt(formData.puntos_victoria),
        puntos_empate: parseInt(formData.puntos_empate),
        puntos_derrota: parseInt(formData.puntos_derrota)
      };

      const response = await ApiService.post('/ligas', ligaData);
      
      if (response) {
        setToastMessage('Liga creada exitosamente');
        setShowToast(true);
        setIsCreateModalOpen(false);
        resetForm();
        loadLigas();
      }
    } catch (error) {
      console.error('Error al crear liga:', error);
      setToastMessage('Error al crear la liga');
      setShowToast(true);
    }
  };

  const handleDeleteLiga = async () => {
    try {
      if (ligaToDelete) {
        const response = await ApiService.delete(`/ligas/${ligaToDelete.id}`);
        if (response) {
          setToastMessage('Liga eliminada exitosamente');
          setShowToast(true);
          setShowDeleteAlert(false);
          setLigaToDelete(null);
          loadLigas();
        }
      }
    } catch (error) {
      console.error('Error al eliminar liga:', error);
      setToastMessage('Error al eliminar la liga');
      setShowToast(true);
    }
  };

  const handleEditLiga = (liga: Liga) => {
    setEditingLiga(liga);
    setFormData({
      nombre: liga.nombre || '',
      id_club: liga.id_club?.toString() || '',
      fecha_inicio: liga.fecha_inicio || '',
      fecha_fin: liga.fecha_fin || '',
      categoria: liga.categoria || '',
      nivel: liga.nivel || '',
      precio_inscripcion: liga.precio_inscripcion?.toString() || '',
      estado: liga.estado || 'inscripciones_abiertas',
      max_parejas: liga.max_parejas?.toString() || '',
      descripcion: liga.descripcion || '',
      reglas: liga.reglas || '',
      premio: typeof liga.premio === 'string' ? liga.premio : '',
      imagen_url: liga.imagen_url || '',
      puntos_victoria: '3',
      puntos_empate: '1',
      puntos_derrota: '0',
      permite_empate: true
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLiga = async () => {
    try {
      if (!editingLiga) return;
      
      if (!formData.nombre || !formData.id_club || !formData.fecha_inicio || !formData.fecha_fin || !formData.categoria || !formData.nivel) {
        setToastMessage('Por favor completa todos los campos obligatorios');
        setShowToast(true);
        return;
      }

      const ligaData = {
        ...formData,
        id_club: parseInt(formData.id_club),
        precio_inscripcion: parseFloat(formData.precio_inscripcion) || 0,
        max_parejas: formData.max_parejas ? parseInt(formData.max_parejas) : undefined,
      };

      const response = await ApiService.put(`/ligas/${editingLiga.id}`, ligaData);
      
      if (response) {
        setToastMessage('Liga actualizada exitosamente');
        setShowToast(true);
        setIsEditModalOpen(false);
        setEditingLiga(null);
        resetForm();
        loadLigas();
      }
    } catch (error) {
      console.error('Error al actualizar liga:', error);
      setToastMessage('Error al actualizar la liga');
      setShowToast(true);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      id_club: '',
      fecha_inicio: '',
      fecha_fin: '',
      categoria: '',
      nivel: '',
      precio_inscripcion: '',
      estado: 'inscripciones_abiertas',
      max_parejas: '',
      descripcion: '',
      reglas: '',
      premio: '',
      imagen_url: '',
      puntos_victoria: '3',
      puntos_empate: '1',
      puntos_derrota: '0',
      permite_empate: true
    });
    setSelectedLiga(null);
  };

  // Función para formatear el premio
  const formatPremio = (premio: any) => {
    if (!premio) return '';
    
    if (typeof premio === 'string') {
      return premio;
    }
    
    if (typeof premio === 'object') {
      // Si es un objeto, convertirlo a string descriptivo
      const premios = [];
      if (premio.primer_puesto) {
        premios.push(`1º: ${premio.primer_puesto}`);
      }
      if (premio.segundo_puesto) {
        premios.push(`2º: ${premio.segundo_puesto}`);
      }
      if (premio.tercer_puesto) {
        premios.push(`3º: ${premio.tercer_puesto}`);
      }
      return premios.join(' | ') || 'Premio disponible';
    }
    
    return String(premio);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'inscripciones_abiertas':
        return 'success';
      case 'en_curso':
        return 'warning';
      case 'finalizada':
        return 'medium';
      case 'suspendida':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'inscripciones_abiertas':
        return 'Inscripciones Abiertas';
      case 'en_curso':
        return 'En Curso';
      case 'finalizada':
        return 'Finalizada';
      case 'suspendida':
        return 'Suspendida';
      default:
        return estado;
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'principiante':
        return 'success';
      case 'intermedio':
        return 'warning';
      case 'avanzado':
        return 'danger';
      case 'profesional':
        return 'dark';
      default:
        return 'medium';
    }
  };

  return (
    <div className={`ligas-container ${theme}`}>
      <IonLoading isOpen={loading} message="Cargando ligas..." />
      
      <div className="page-header">
        <h1>Ligas</h1>
        <p>Participa en ligas regulares de pádel</p>
      </div>

      {/* FAB flotante fijo */}
      {canManage && (
        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ligas-fab">
          <IonFabButton onClick={() => setIsCreateModalOpen(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}

      <IonGrid>
        <IonRow>
          {ligas.length === 0 ? (
            <IonCol size="12">
              <IonCard className="empty-state">
                <IonCardContent className="text-center">
                  <IonIcon icon={ribbonOutline} className="empty-icon" />
                  <h2>No hay ligas disponibles</h2>
                  <p>Las ligas aparecerán aquí cuando estén disponibles.</p>
                  {canManage && (
                    <IonButton fill="clear" onClick={() => setIsCreateModalOpen(true)}>
                      <IonIcon icon={addOutline} slot="start" />
                      Crear primera liga
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          ) : (
            ligas.map((liga) => (
              <IonCol size="12" sizeMd="6" sizeLg="6" key={liga.id}>
                <IonCard className="liga-card-compact">
                  <IonCardHeader>
                    <div className="card-header-content">
                      <IonCardTitle>{liga.nombre}</IonCardTitle>
                      <IonChip color={getEstadoColor(liga.estado)}>
                        {getEstadoText(liga.estado)}
                      </IonChip>
                    </div>
                  </IonCardHeader>

                  <IonCardContent>
                    <div className="liga-info-compact">
                      <div className="info-row-compact">
                        <IonIcon icon={calendarOutline} />
                        <span>{formatDate(liga.fecha_inicio)} - {formatDate(liga.fecha_fin)}</span>
                      </div>
                      
                      <div className="info-grid">
                        <div className="info-item">
                          <IonIcon icon={ribbonOutline} />
                          <span>{liga.categoria}</span>
                        </div>
                        
                        <div className="info-item">
                          <IonIcon icon={statsChartOutline} />
                          <IonChip color={getNivelColor(liga.nivel)} style={{paddingLeft: 6, paddingRight: 6, minHeight: 22, fontSize: '0.85em', height: 'auto', lineHeight: 1.1 }}>
                            {liga.nivel}
                          </IonChip>
                        </div>

                        <div className="info-item">
                          <IonIcon icon={peopleOutline} />
                          <span>Máx. {liga.max_parejas}</span>
                        </div>

                        {liga.precio_inscripcion > 0 && (
                          <div className="info-item">
                            <IonIcon icon={cashOutline} />
                            <span className="precio">€{liga.precio_inscripcion}</span>
                          </div>
                        )}
                      </div>

                      {liga.premio && (
                        <div className="premio-compact">
                          <IonIcon icon={trophyOutline} />
                          <span>{formatPremio(liga.premio)}</span>
                        </div>
                      )}

                      {liga.descripcion && (
                        <p className="descripcion-compact">{liga.descripcion}</p>
                      )}
                    </div>

                    <div className="card-actions-compact">
                      <IonButton fill="clear" size="small" routerLink={`/ligas/${liga.id}`}>
                        <IonIcon icon={eyeOutline} slot="start" />
                        Ver detalles
                      </IonButton>
                      
                      {canManage && (
                        <>
                          <IonButton 
                            fill="clear" 
                            size="small" 
                            color="medium"
                            onClick={() => handleEditLiga(liga)}
                          >
                            <IonIcon icon={createOutline} slot="start" />
                            Editar
                          </IonButton>
                          <IonButton 
                            fill="clear" 
                            size="small" 
                            color="danger"
                            onClick={() => {
                              setLigaToDelete(liga);
                              setShowDeleteAlert(true);
                            }}
                          >
                            <IonIcon icon={trashOutline} slot="start" />
                            Eliminar
                          </IonButton>
                        </>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))
          )}
        </IonRow>
      </IonGrid>

      {/* Modal para crear liga */}
      <IonModal isOpen={isCreateModalOpen} onDidDismiss={() => setIsCreateModalOpen(false)}>
        <div className="modal-header">
          <h2>Crear Nueva Liga</h2>
          <IonButton fill="clear" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </IonButton>
        </div>

        <div className="modal-content">
          <IonItem>
            <IonLabel position="stacked">Nombre de la Liga *</IonLabel>
            <IonInput
              value={formData.nombre}
              onIonInput={(e) => setFormData({ ...formData, nombre: e.detail.value! })}
              placeholder="Ej: Liga de Primavera 2024"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Club *</IonLabel>
            <IonSelect
              value={formData.id_club}
              onIonChange={(e) => setFormData({ ...formData, id_club: e.detail.value })}
              placeholder="Selecciona un club"
            >
              {clubes.map((club) => (
                <IonSelectOption key={club.id} value={club.id}>
                  {club.nombre}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Fecha de Inicio *</IonLabel>
            <IonDatetime
              value={formData.fecha_inicio}
              onIonChange={(e) => setFormData({ ...formData, fecha_inicio: e.detail.value as string })}
              presentation="date"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Fecha de Fin *</IonLabel>
            <IonDatetime
              value={formData.fecha_fin}
              onIonChange={(e) => setFormData({ ...formData, fecha_fin: e.detail.value as string })}
              presentation="date"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Categoría *</IonLabel>
            <IonSelect
              value={formData.categoria}
              onIonChange={(e) => setFormData({ ...formData, categoria: e.detail.value })}
              placeholder="Selecciona la categoría"
            >
              <IonSelectOption value="masculina">Masculina</IonSelectOption>
              <IonSelectOption value="femenina">Femenina</IonSelectOption>
              <IonSelectOption value="mixta">Mixta</IonSelectOption>
              <IonSelectOption value="veteranos">Veteranos</IonSelectOption>
              <IonSelectOption value="junior">Junior</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Nivel *</IonLabel>
            <IonSelect
              value={formData.nivel}
              onIonChange={(e) => setFormData({ ...formData, nivel: e.detail.value })}
              placeholder="Selecciona el nivel"
            >
              <IonSelectOption value="principiante">Principiante</IonSelectOption>
              <IonSelectOption value="intermedio">Intermedio</IonSelectOption>
              <IonSelectOption value="avanzado">Avanzado</IonSelectOption>
              <IonSelectOption value="profesional">Profesional</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Precio de Inscripción (€) *</IonLabel>
            <IonInput
              type="number"
              value={formData.precio_inscripcion}
              onIonInput={(e) => setFormData({ ...formData, precio_inscripcion: e.detail.value! })}
              placeholder="0.00"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Máximo de Parejas</IonLabel>
            <IonInput
              type="number"
              value={formData.max_parejas}
              onIonInput={(e) => setFormData({ ...formData, max_parejas: e.detail.value! })}
              placeholder="Ej: 12"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Descripción</IonLabel>
            <IonTextarea
              value={formData.descripcion}
              onIonInput={(e) => setFormData({ ...formData, descripcion: e.detail.value! })}
              placeholder="Describe la liga..."
              rows={3}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Premio</IonLabel>
            <IonInput
              value={formData.premio}
              onIonInput={(e) => setFormData({ ...formData, premio: e.detail.value! })}
              placeholder="Ej: Trofeo + 100€"
            />
          </IonItem>

          {/* Sistema de puntuación */}
          <div className="scoring-section">
            <h3>Sistema de Puntuación</h3>
            
            <IonItem>
              <IonLabel position="stacked">Puntos por Victoria</IonLabel>
              <IonInput
                type="number"
                value={formData.puntos_victoria}
                onIonInput={(e) => setFormData({ ...formData, puntos_victoria: e.detail.value! })}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Puntos por Empate</IonLabel>
              <IonInput
                type="number"
                value={formData.puntos_empate}
                onIonInput={(e) => setFormData({ ...formData, puntos_empate: e.detail.value! })}
                disabled={!formData.permite_empate}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Puntos por Derrota</IonLabel>
              <IonInput
                type="number"
                value={formData.puntos_derrota}
                onIonInput={(e) => setFormData({ ...formData, puntos_derrota: e.detail.value! })}
              />
            </IonItem>

            <IonItem>
              <IonLabel>Permitir Empates</IonLabel>
              <IonToggle
                checked={formData.permite_empate}
                onIonChange={(e) => setFormData({ ...formData, permite_empate: e.detail.checked })}
              />
            </IonItem>
          </div>
        </div>

        <div className="modal-footer">
          <IonButton expand="block" onClick={handleCreateLiga}>
            Crear Liga
          </IonButton>
        </div>
      </IonModal>

      {/* Modal para editar liga */}
      <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
        <div className="modal-header">
          <h2>Editar Liga</h2>
          <IonButton fill="clear" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </IonButton>
        </div>

        <div className="modal-content">
          <IonItem>
            <IonLabel position="stacked">Nombre de la Liga *</IonLabel>
            <IonInput
              value={formData.nombre}
              onIonInput={(e) => setFormData({ ...formData, nombre: e.detail.value! })}
              placeholder="Ej: Liga de Primavera 2024"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Club *</IonLabel>
            <IonSelect
              value={formData.id_club}
              onIonChange={(e) => setFormData({ ...formData, id_club: e.detail.value })}
              placeholder="Selecciona un club"
            >
              {clubes.map((club) => (
                <IonSelectOption key={club.id} value={club.id}>
                  {club.nombre}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Fecha de Inicio *</IonLabel>
            <IonDatetime
              value={formData.fecha_inicio}
              onIonChange={(e) => setFormData({ ...formData, fecha_inicio: e.detail.value as string })}
              presentation="date"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Fecha de Fin *</IonLabel>
            <IonDatetime
              value={formData.fecha_fin}
              onIonChange={(e) => setFormData({ ...formData, fecha_fin: e.detail.value as string })}
              presentation="date"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Categoría *</IonLabel>
            <IonSelect
              value={formData.categoria}
              onIonChange={(e) => setFormData({ ...formData, categoria: e.detail.value })}
              placeholder="Selecciona una categoría"
            >
              <IonSelectOption value="masculina">Masculina</IonSelectOption>
              <IonSelectOption value="femenina">Femenina</IonSelectOption>
              <IonSelectOption value="mixta">Mixta</IonSelectOption>
              <IonSelectOption value="veteranos">Veteranos</IonSelectOption>
              <IonSelectOption value="junior">Junior</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Nivel *</IonLabel>
            <IonSelect
              value={formData.nivel}
              onIonChange={(e) => setFormData({ ...formData, nivel: e.detail.value })}
              placeholder="Selecciona un nivel"
            >
              <IonSelectOption value="principiante">Principiante</IonSelectOption>
              <IonSelectOption value="intermedio">Intermedio</IonSelectOption>
              <IonSelectOption value="avanzado">Avanzado</IonSelectOption>
              <IonSelectOption value="profesional">Profesional</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Precio de Inscripción</IonLabel>
            <IonInput
              type="number"
              value={formData.precio_inscripcion}
              onIonInput={(e) => setFormData({ ...formData, precio_inscripcion: e.detail.value! })}
              placeholder="0.00"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Estado</IonLabel>
            <IonSelect
              value={formData.estado}
              onIonChange={(e) => setFormData({ ...formData, estado: e.detail.value })}
            >
              <IonSelectOption value="inscripciones_abiertas">Inscripciones Abiertas</IonSelectOption>
              <IonSelectOption value="en_curso">En Curso</IonSelectOption>
              <IonSelectOption value="finalizada">Finalizada</IonSelectOption>
              <IonSelectOption value="suspendida">Suspendida</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Máximo de Parejas</IonLabel>
            <IonInput
              type="number"
              value={formData.max_parejas}
              onIonInput={(e) => setFormData({ ...formData, max_parejas: e.detail.value! })}
              placeholder="Ej: 16"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Descripción</IonLabel>
            <IonTextarea
              value={formData.descripcion}
              onIonInput={(e) => setFormData({ ...formData, descripcion: e.detail.value! })}
              placeholder="Descripción de la liga..."
              rows={3}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Premio</IonLabel>
            <IonTextarea
              value={formData.premio}
              onIonInput={(e) => setFormData({ ...formData, premio: e.detail.value! })}
              placeholder="Descripción del premio..."
              rows={2}
            />
          </IonItem>
        </div>

        <div className="modal-footer">
          <IonButton 
            expand="block" 
            onClick={handleUpdateLiga}
            className="create-button"
          >
            Actualizar Liga
          </IonButton>
        </div>
      </IonModal>

      {/* Alert para confirmar eliminación */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar la liga "${ligaToDelete?.nombre}"?`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: handleDeleteLiga
          }
        ]}
      />

      {/* Toast para mensajes */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </div>
  );
};

export default Ligas;