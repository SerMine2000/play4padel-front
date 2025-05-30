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
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAlert,
  IonLoading,
  IonToast,
  IonText,
  IonRange,
  IonChip,
  IonItemDivider
} from '@ionic/react';
import {
  settingsOutline,
  saveOutline,
  refreshOutline,
  warningOutline,
  shieldCheckmarkOutline,
  cashOutline,
  mailOutline,
  notificationsOutline,
  timeOutline,
  lockClosedOutline,
  globeOutline
} from 'ionicons/icons';
import { useAuth } from '../../../context/AuthContext';
import apiService from '../../../services/api.service';
import './AdminSystemConfig.css';

interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    defaultLanguage: string;
    timezone: string;
  };
  business: {
    commissionRate: number;
    cancellationPolicy: number; // horas antes
    reservationAdvanceDays: number;
    minReservationDuration: number; // minutos
    maxReservationDuration: number; // minutos
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderHours: number;
    marketingEmails: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number; // minutos
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    twoFactorAuth: boolean;
  };
  features: {
    enableTournaments: boolean;
    enableLeagues: boolean;
    enableSocialFeatures: boolean;
    enablePayments: boolean;
    enableReviews: boolean;
    enableChat: boolean;
  };
}

const AdminSystemConfig: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [pendingChanges, setPendingChanges] = useState(false);

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const showToastMessage = (message: string, color: typeof toastColor = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const loadSystemConfig = async () => {
    try {
      setLoading(true);
      
      // Simulamos datos para demo - en producción vendría del backend
      const mockConfig: SystemConfig = {
        general: {
          siteName: 'Play4Padel',
          siteDescription: 'Plataforma integral para la gestión de pistas de pádel',
          supportEmail: 'soporte@play4padel.com',
          maintenanceMode: false,
          allowRegistrations: true,
          defaultLanguage: 'es',
          timezone: 'Europe/Madrid'
        },
        business: {
          commissionRate: 8.5,
          cancellationPolicy: 24,
          reservationAdvanceDays: 30,
          minReservationDuration: 60,
          maxReservationDuration: 180,
          currency: 'EUR'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          reminderHours: 2,
          marketingEmails: true
        },
        security: {
          passwordMinLength: 8,
          sessionTimeout: 120,
          maxLoginAttempts: 5,
          requireEmailVerification: true,
          twoFactorAuth: false
        },
        features: {
          enableTournaments: true,
          enableLeagues: true,
          enableSocialFeatures: true,
          enablePayments: true,
          enableReviews: true,
          enableChat: false
        }
      };

      setConfig(mockConfig);
    } catch (error) {
      console.error(error);
      showToastMessage('Error al cargar la configuración del sistema', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadSystemConfig();
      setPendingChanges(false);
    } finally {
      event.detail.complete();
    }
  };

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    };
    
    setConfig(newConfig);
    setPendingChanges(true);
  };

  const saveConfiguration = async () => {
    if (!config) return;

    try {
      setSaving(true);
      
      // Validaciones básicas
      if (config.general.siteName.trim() === '') {
        showToastMessage('El nombre del sitio es obligatorio', 'warning');
        return;
      }
      
      if (config.general.supportEmail && !config.general.supportEmail.includes('@')) {
        showToastMessage('El email de soporte no es válido', 'warning');
        return;
      }
      
      if (config.business.commissionRate < 0 || config.business.commissionRate > 50) {
        showToastMessage('La tasa de comisión debe estar entre 0% y 50%', 'warning');
        return;
      }

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToastMessage('Configuración guardada exitosamente', 'success');
      setPendingChanges(false);
    } catch (error) {
      console.error(error);
      showToastMessage('Error al guardar la configuración', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setAlertMessage('¿Está seguro de que desea restaurar la configuración por defecto? Se perderán todos los cambios personalizados.');
    setShowAlert(true);
  };

  const confirmReset = async () => {
    try {
      setLoading(true);
      await loadSystemConfig();
      showToastMessage('Configuración restaurada a valores por defecto', 'success');
      setPendingChanges(false);
    } catch (error) {
      showToastMessage('Error al restaurar la configuración', 'danger');
    } finally {
      setLoading(false);
      setShowAlert(false);
    }
  };

  if (!config) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={loading} message="Cargando configuración..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="admin-config-container">
          <div className="config-header">
            <h1>Configuración del Sistema</h1>
            <p>Configuraciones globales de la plataforma</p>
            {pendingChanges && (
              <IonChip color="warning">
                <IonIcon icon={warningOutline} />
                <IonLabel>Cambios sin guardar</IonLabel>
              </IonChip>
            )}
          </div>

          {/* Botones de acción */}
          <div className="config-actions">
            <IonButton 
              color="primary" 
              onClick={saveConfiguration}
              disabled={!pendingChanges || saving}
            >
              <IonIcon icon={saveOutline} slot="start" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </IonButton>
            <IonButton fill="outline" onClick={resetToDefaults}>
              <IonIcon icon={refreshOutline} slot="start" />
              Restaurar Defaults
            </IonButton>
          </div>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                {/* Configuración General */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={settingsOutline} /> Configuración General
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonInput
                          label="Nombre del Sitio"
                          labelPlacement="stacked"
                          value={config.general.siteName}
                          onIonInput={e => updateConfig('general', 'siteName', e.detail.value!)}
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonTextarea
                          label="Descripción del Sitio"
                          labelPlacement="stacked"
                          value={config.general.siteDescription}
                          onIonInput={e => updateConfig('general', 'siteDescription', e.detail.value!)}
                          rows={3}
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonInput
                          label="Email de Soporte"
                          labelPlacement="stacked"
                          type="email"
                          value={config.general.supportEmail}
                          onIonInput={e => updateConfig('general', 'supportEmail', e.detail.value!)}
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonSelect
                          label="Idioma por Defecto"
                          labelPlacement="stacked"
                          value={config.general.defaultLanguage}
                          onSelectionChange={e => updateConfig('general', 'defaultLanguage', e.detail.value)}
                        >
                          <IonSelectOption value="es">Español</IonSelectOption>
                          <IonSelectOption value="en">English</IonSelectOption>
                          <IonSelectOption value="fr">Français</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      
                      <IonItem>
                        <IonSelect
                          label="Zona Horaria"
                          labelPlacement="stacked"
                          value={config.general.timezone}
                          onSelectionChange={e => updateConfig('general', 'timezone', e.detail.value)}
                        >
                          <IonSelectOption value="Europe/Madrid">Europa/Madrid</IonSelectOption>
                          <IonSelectOption value="Europe/London">Europa/Londres</IonSelectOption>
                          <IonSelectOption value="America/New_York">América/Nueva York</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.general.allowRegistrations}
                          onIonChange={e => updateConfig('general', 'allowRegistrations', e.detail.checked)}
                        />
                        <IonLabel>Permitir Registros</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.general.maintenanceMode}
                          onIonChange={e => updateConfig('general', 'maintenanceMode', e.detail.checked)}
                        />
                        <IonLabel>Modo Mantenimiento</IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {/* Configuración de Seguridad */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={shieldCheckmarkOutline} /> Seguridad
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Longitud Mínima de Contraseña</h3>
                          <p>{config.security.passwordMinLength} caracteres</p>
                        </IonLabel>
                        <IonRange
                          min={6}
                          max={16}
                          step={1}
                          value={config.security.passwordMinLength}
                          onIonChange={e => updateConfig('security', 'passwordMinLength', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h3>Tiempo de Sesión (minutos)</h3>
                          <p>{config.security.sessionTimeout} minutos</p>
                        </IonLabel>
                        <IonRange
                          min={30}
                          max={480}
                          step={30}
                          value={config.security.sessionTimeout}
                          onIonChange={e => updateConfig('security', 'sessionTimeout', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h3>Máx. Intentos de Login</h3>
                          <p>{config.security.maxLoginAttempts} intentos</p>
                        </IonLabel>
                        <IonRange
                          min={3}
                          max={10}
                          step={1}
                          value={config.security.maxLoginAttempts}
                          onIonChange={e => updateConfig('security', 'maxLoginAttempts', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.security.requireEmailVerification}
                          onIonChange={e => updateConfig('security', 'requireEmailVerification', e.detail.checked)}
                        />
                        <IonLabel>Verificación de Email Obligatoria</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.security.twoFactorAuth}
                          onIonChange={e => updateConfig('security', 'twoFactorAuth', e.detail.checked)}
                        />
                        <IonLabel>Autenticación de Dos Factores</IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                {/* Configuración de Negocio */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={cashOutline} /> Configuración de Negocio
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Tasa de Comisión</h3>
                          <p>{config.business.commissionRate}%</p>
                        </IonLabel>
                        <IonRange
                          min={0}
                          max={25}
                          step={0.5}
                          value={config.business.commissionRate}
                          onIonChange={e => updateConfig('business', 'commissionRate', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h3>Política de Cancelación</h3>
                          <p>{config.business.cancellationPolicy} horas antes</p>
                        </IonLabel>
                        <IonRange
                          min={1}
                          max={72}
                          step={1}
                          value={config.business.cancellationPolicy}
                          onIonChange={e => updateConfig('business', 'cancellationPolicy', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h3>Días de Anticipación para Reservas</h3>
                          <p>{config.business.reservationAdvanceDays} días</p>
                        </IonLabel>
                        <IonRange
                          min={1}
                          max={90}
                          step={1}
                          value={config.business.reservationAdvanceDays}
                          onIonChange={e => updateConfig('business', 'reservationAdvanceDays', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonSelect
                          label="Moneda"
                          labelPlacement="stacked"
                          value={config.business.currency}
                          onSelectionChange={e => updateConfig('business', 'currency', e.detail.value)}
                        >
                          <IonSelectOption value="EUR">Euro (€)</IonSelectOption>
                          <IonSelectOption value="USD">Dólar ($)</IonSelectOption>
                          <IonSelectOption value="GBP">Libra (£)</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {/* Configuración de Notificaciones */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={notificationsOutline} /> Notificaciones
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonToggle
                          checked={config.notifications.emailNotifications}
                          onIonChange={e => updateConfig('notifications', 'emailNotifications', e.detail.checked)}
                        />
                        <IonLabel>Notificaciones por Email</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.notifications.smsNotifications}
                          onIonChange={e => updateConfig('notifications', 'smsNotifications', e.detail.checked)}
                        />
                        <IonLabel>Notificaciones por SMS</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.notifications.pushNotifications}
                          onIonChange={e => updateConfig('notifications', 'pushNotifications', e.detail.checked)}
                        />
                        <IonLabel>Notificaciones Push</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h3>Recordatorios (horas antes)</h3>
                          <p>{config.notifications.reminderHours} horas</p>
                        </IonLabel>
                        <IonRange
                          min={1}
                          max={48}
                          step={1}
                          value={config.notifications.reminderHours}
                          onIonChange={e => updateConfig('notifications', 'reminderHours', e.detail.value)}
                          slot="end"
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.notifications.marketingEmails}
                          onIonChange={e => updateConfig('notifications', 'marketingEmails', e.detail.checked)}
                        />
                        <IonLabel>Emails de Marketing</IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {/* Funcionalidades */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={globeOutline} /> Funcionalidades
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonToggle
                          checked={config.features.enableTournaments}
                          onIonChange={e => updateConfig('features', 'enableTournaments', e.detail.checked)}
                        />
                        <IonLabel>Habilitar Torneos</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.features.enableLeagues}
                          onIonChange={e => updateConfig('features', 'enableLeagues', e.detail.checked)}
                        />
                        <IonLabel>Habilitar Ligas</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.features.enableSocialFeatures}
                          onIonChange={e => updateConfig('features', 'enableSocialFeatures', e.detail.checked)}
                        />
                        <IonLabel>Funciones Sociales</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.features.enablePayments}
                          onIonChange={e => updateConfig('features', 'enablePayments', e.detail.checked)}
                        />
                        <IonLabel>Sistema de Pagos</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.features.enableReviews}
                          onIonChange={e => updateConfig('features', 'enableReviews', e.detail.checked)}
                        />
                        <IonLabel>Reseñas y Valoraciones</IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonToggle
                          checked={config.features.enableChat}
                          onIonChange={e => updateConfig('features', 'enableChat', e.detail.checked)}
                        />
                        <IonLabel>Chat en Tiempo Real</IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmar Acción"
          message={alertMessage}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Confirmar', handler: confirmReset }
          ]}
        />

        <IonLoading isOpen={loading || saving} message={saving ? "Guardando..." : "Cargando..."} />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminSystemConfig;