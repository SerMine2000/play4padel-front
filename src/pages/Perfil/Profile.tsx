// src/pages/Profile.tsx - Versión con compresión de imágenes y cruz mejorada
import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput,
  IonButton, IonLoading, IonToast, IonIcon, IonText, IonGrid, IonRow, IonCol, 
  IonPage, IonTextarea, IonActionSheet, IonAlert, IonBackdrop
} from '@ionic/react';
import { 
  personCircleOutline, saveOutline, createOutline, keyOutline, closeOutline, cameraOutline,
  personOutline, mailOutline, callOutline, informationCircleOutline, checkmarkCircleOutline,
  closeCircleOutline, cloudUploadOutline, linkOutline, imagesOutline, trashOutline, eyeOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../utils/constants';
import Avatar from '../../components/Avatar';
import '../../theme/variables.css';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, setUser, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    bio: '',
    avatar_url: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  
  // Estados para validaciones
  const [formErrors, setFormErrors] = useState({
    email: '',
    telefono: '',
    nombre: '',
    apellidos: ''
  });
  
  // Estados para los nuevos componentes
  const [showAvatarActionSheet, setShowAvatarActionSheet] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [showUrlAlert, setShowUrlAlert] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      console.log("🔍 DATOS RECIBIDOS EN PROFILE COMPONENT:");
      console.log("👤 user completo:", user);
      console.log("📞 user.telefono:", user.telefono);
      console.log("📝 user.bio:", user.bio);
      
      setFormData({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTempAvatarUrl(user.avatar_url || '');
      
      console.log("🔍 FORM DATA ESTABLECIDO:");
      console.log("📞 formData.telefono:", user.telefono || '');
      console.log("📝 formData.bio:", user.bio || '');
    }
  }, [user]);

  // Función de validación de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función de validación de teléfono simplificada
  const validatePhone = (phone: string): boolean => {
    // Si está vacío, es válido (campo opcional)
    if (!phone || phone.trim() === '') return true;
    
    // Extraer solo números
    const numbers = phone.replace(/\D/g, '');
    
    // Debe tener exactamente 9 dígitos
    return numbers.length === 9;
  };

  // Función para limpiar el teléfono (solo números para enviar al backend)
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Función para formatear el teléfono mientras se escribe
  const formatPhoneNumber = (value: string): string => {
    // Extraer solo los números
    const numbers = value.replace(/\D/g, '');
    
    // Limitar a 9 dígitos
    const limitedNumbers = numbers.slice(0, 9);
    
    // Formatear: XXX XX XX XX
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 5) {
      return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3)}`;
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 5)} ${limitedNumbers.slice(5)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 5)} ${limitedNumbers.slice(5, 7)} ${limitedNumbers.slice(7)}`;
    }
  };

  const handleInputChange = (e: CustomEvent, field: string) => {
    let value = e.detail.value;
    
    // Formateo especial para teléfono
    if (field === 'telefono') {
      value = formatPhoneNumber(value);
    }
    
    // Limpiar errores previos
    setFormErrors(prev => ({ ...prev, [field]: '' }));
    
    // Validaciones en tiempo real
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setFormErrors(prev => ({ ...prev, email: 'El email debe contener un @ válido' }));
      }
    }
    
    if (field === 'telefono' && value) {
      // No mostrar error mientras está escribiendo, solo al validar el formulario completo
    }
    
    if ((field === 'nombre' || field === 'apellidos') && value) {
      if (value.trim().length < 2) {
        setFormErrors(prev => ({ ...prev, [field]: `El ${field} debe tener al menos 2 caracteres` }));
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
    setFormErrors({ email: '', telefono: '', nombre: '', apellidos: '' });
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTempAvatarUrl(user.avatar_url || '');
    }
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrorMessage('');
    setFormErrors({ email: '', telefono: '', nombre: '', apellidos: '' });
  };

  // Manejador mejorado para click en avatar
  const manejarClickAvatar = () => {
    if (isEditing) {
      setShowAvatarActionSheet(true);
    } else {
      setShowAvatarPreview(true);
    }
  };

  // Función para comprimir y redimensionar imágenes
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Funciones simplificadas para el cambio de avatar
  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'camera');
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleSelectFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleEnterUrl = () => {
    setUrlInput(tempAvatarUrl || '');
    setShowUrlAlert(true);
  };

  const handleRemoveAvatar = () => {
    setTempAvatarUrl('');
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    setSuccessMessage('Avatar eliminado');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          setIsLoading(true);
          
          // Comprimir la imagen antes de guardarla
          const compressedBase64 = await compressImage(file, 400, 0.8);
          
          setTempAvatarUrl(compressedBase64);
          setFormData(prev => ({ ...prev, avatar_url: compressedBase64 }));
          setSuccessMessage('Imagen procesada correctamente');
        } catch (error) {
          console.error('Error al comprimir imagen:', error);
          setErrorMessage('Error al procesar la imagen');
        } finally {
          setIsLoading(false);
        }
      } else {
        setErrorMessage('Por favor selecciona una imagen válida');
      }
    }
    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUrlSave = () => {
    if (urlInput && validateImageUrl(urlInput)) {
      setTempAvatarUrl(urlInput);
      setFormData(prev => ({ ...prev, avatar_url: urlInput }));
      setSuccessMessage('URL cargada correctamente.');
      setShowUrlAlert(false);
      setUrlInput('');
    } else {
      setErrorMessage('URL no válida (debe empezar por http:// o https://)');
    }
  };

  // Función de validación antes de guardar
  const validateForm = (): boolean => {
    const errors = { email: '', telefono: '', nombre: '', apellidos: '' };
    let isValid = true;

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
      isValid = false;
    } else if (formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son obligatorios';
      isValid = false;
    } else if (formData.apellidos.trim().length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'El email debe tener un formato válido con @';
      isValid = false;
    }

    // Validar teléfono (opcional pero si se llena debe ser válido)
    if (formData.telefono && !validatePhone(formData.telefono)) {
      errors.telefono = 'El teléfono debe tener exactamente 9 dígitos';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validar formulario antes de enviar
    if (!validateForm()) {
      setErrorMessage('Por favor, corrige los errores en el formulario');
      return;
    }
  
    try {
      setIsLoading(true);
      setErrorMessage('');
  
      // Preparar el payload con validación especial para avatar
      let avatarToSend = tempAvatarUrl || '';
      
      // Si es una URL externa, enviarla tal como está
      // Si es base64, asegurarse de que no sea demasiado largo
      if (avatarToSend.startsWith('data:image/')) {
        console.log('Enviando imagen base64 comprimida, tamaño:', Math.round(avatarToSend.length / 1024), 'KB');
        
        // Si la imagen sigue siendo muy grande, comprimirla más
        if (avatarToSend.length > 500000) { // 500KB
          try {
            // Crear una imagen temporal para volver a comprimir
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = 300; // Reducir más el tamaño
                canvas.height = 300;
                ctx?.drawImage(img, 0, 0, 300, 300);
                avatarToSend = canvas.toDataURL('image/jpeg', 0.6); // Más compresión
                console.log('Imagen recomprimida, nuevo tamaño:', Math.round(avatarToSend.length / 1024), 'KB');
                resolve(true);
              };
              img.onerror = reject;
              img.src = avatarToSend;
            });
          } catch (error) {
            console.error('Error al recomprimir:', error);
            setErrorMessage('La imagen es demasiado grande. Prueba con una imagen más pequeña.');
            return;
          }
        }
      }

      // CORECCIÓN PRINCIPAL: Lógica simplificada y correcta para el payload
      const payload = {
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono ? cleanPhoneNumber(formData.telefono) : '', // Limpiar teléfono de caracteres especiales pero enviar valor limpio
        bio: formData.bio.trim(), // Enviar siempre el valor del formulario, aunque esté vacío
        avatar_url: cleanImageUrl(avatarToSend)
      };
  
      console.log("🔍 PAYLOAD ENVIADO AL BACKEND:");
      console.log("📦 payload completo:", payload);
      console.log("📞 payload.telefono:", payload.telefono);
      console.log("📝 payload.bio:", payload.bio);
  
      const res = await apiService.put(`${API_ENDPOINTS.USER}/${user.id}`, payload);
      
      console.log("🔍 RESPUESTA DEL BACKEND:");
      console.log("📦 response:", res);
  
      // Actualizar el contexto del usuario con los datos guardados
      const updatedUser = {
        ...user,
        ...payload,
      };
      
      setUser(updatedUser);

      // Sincronizar formData con los datos guardados
      setFormData(prev => ({
        ...prev,
        ...payload,
        avatar_url: avatarToSend
      }));
  
      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Refrescar los datos del usuario desde el backend para asegurar sincronización
      await refreshUser();
      
      setTimeout(() => setSuccessMessage(''), 3000);
  
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      
      // Mensajes de error más específicos
      if (error.message.includes('500')) {
        setErrorMessage('Error del servidor. La imagen podría ser demasiado grande. Prueba con una imagen más pequeña.');
      } else if (error.message.includes('413') || error.message.includes('Payload')) {
        setErrorMessage('La imagen es demasiado grande. Prueba con una imagen más pequeña.');
      } else {
        setErrorMessage(error.message || 'Error al actualizar el perfil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await apiService.put(API_ENDPOINTS.UPDATE_PASSWORD, {
        user_id: user.id,
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      setSuccessMessage('Contraseña actualizada correctamente');
      setIsChangingPassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      setErrorMessage(error.message || 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const validateImageUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const cleanImageUrl = (url: string) => {
    const match = url.match(/[?&]u=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : url;
  };

  // Función auxiliar para mostrar valores en modo vista
  const getDisplayValue = (value: string | undefined, fieldName: string) => {
    if (!value || value.trim() === '') {
      return 'No especificado';
    }
    return value;
  };

  // Datos para mostrar en modo vista
  const profileFields = [
    { key: 'nombre', label: 'Nombre', icon: personOutline, value: getDisplayValue(user?.nombre, 'nombre') },
    { key: 'apellidos', label: 'Apellidos', icon: personOutline, value: getDisplayValue(user?.apellidos, 'apellidos') },
    { key: 'email', label: 'Email', icon: mailOutline, value: getDisplayValue(user?.email, 'email') },
    { key: 'telefono', label: 'Teléfono', icon: callOutline, value: getDisplayValue(user?.telefono, 'teléfono') },
    { key: 'bio', label: 'Biografía', icon: informationCircleOutline, value: getDisplayValue(user?.bio, 'biografía') },
  ];

  // Opciones del ActionSheet para cambiar avatar
  const avatarActionSheetButtons = [
    {
      text: 'Tomar Foto',
      icon: cameraOutline,
      handler: () => {
        handleTakePhoto();
      }
    },
    {
      text: 'Seleccionar de Galería',
      icon: imagesOutline,
      handler: () => {
        handleSelectFromGallery();
      }
    },
    {
      text: 'Introducir URL',
      icon: linkOutline,
      handler: () => {
        handleEnterUrl();
      }
    },
    {
      text: 'Eliminar Avatar',
      icon: trashOutline,
      role: 'destructive',
      handler: () => {
        handleRemoveAvatar();
      }
    },
    {
      text: 'Cancelar',
      icon: closeOutline,
      role: 'cancel'
    }
  ];

  return (
    <IonPage>
      <IonContent className="profile-page-content">
        <div className="profile-container">
          {/* Header del perfil */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <div className="avatar-wrapper">
                  <Avatar
                    idUsuario={user?.id || 0}
                    nombre={user?.nombre}
                    urlAvatar={tempAvatarUrl}
                    tamaño={120}
                    className="profile-avatar"
                    onClick={manejarClickAvatar}
                  />
                  {isEditing && (
                    <div className="avatar-overlay" onClick={manejarClickAvatar}>
                      <IonIcon icon={cameraOutline} />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <p className="avatar-edit-hint">Haz clic para cambiar avatar</p>
                )}
              </div>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">
                {user?.nombre && user?.apellidos ? 
                  `${user.nombre} ${user.apellidos}` : 
                  user?.nombre || user?.apellidos || 'Sin nombre'
                }
              </h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className="user-role-badge">{user?.role || 'Usuario'}</span>
              </div>
            </div>
          </div>

          {/* Información personal */}
          <IonCard className="profile-info-card">
            <IonCardHeader>
              <IonCardTitle className="card-title">
                <IonIcon icon={personOutline} />
                Información Personal
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {(!isEditing && !isChangingPassword) && (
                <div className="info-display-mode">
                  {profileFields.map((field) => (
                    <div key={field.key} className="info-row">
                      <div className="info-label">
                        <IonIcon icon={field.icon} />
                        <span>{field.label}</span>
                      </div>
                      <div className="info-value">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <div className="edit-mode">
                  <div className="edit-fields">
                    {profileFields.map((field) => (
                      <div key={field.key} className="edit-field-group">
                        <label className="field-label">
                          <IonIcon icon={field.icon} />
                          {field.label} {field.key === 'nombre' || field.key === 'apellidos' || field.key === 'email' ? '*' : ''}
                        </label>
                        {field.key === 'bio' ? (
                          <IonTextarea
                            className={`field-input ${formErrors[field.key as keyof typeof formErrors] ? 'error' : ''}`}
                            value={formData[field.key as keyof typeof formData]}
                            onIonInput={(e) => handleInputChange(e, field.key)}
                            placeholder={`Escribe algo sobre ti...`}
                            rows={4}
                          />
                        ) : (
                          <IonInput
                            className={`field-input ${formErrors[field.key as keyof typeof formErrors] ? 'error' : ''}`}
                            value={formData[field.key as keyof typeof formData]}
                            onIonInput={(e) => handleInputChange(e, field.key)}
                            placeholder={
                              field.key === 'telefono' 
                                ? '123 45 67 89' 
                                : field.key === 'email'
                                ? 'tu@email.com'
                                : `Introduce tu ${field.label.toLowerCase()}`
                            }
                            type={field.key === 'email' ? 'email' : field.key === 'telefono' ? 'tel' : 'text'}
                          />
                        )}
                        {formErrors[field.key as keyof typeof formErrors] && (
                          <div className="error-message">
                            {formErrors[field.key as keyof typeof formErrors]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isChangingPassword && (
                <div className="password-mode">
                  <div className="edit-fields">
                    <div className="edit-field-group">
                      <label className="field-label">
                        <IonIcon icon={keyOutline} />
                        Contraseña actual *
                      </label>
                      <IonInput
                        className="field-input"
                        type="password"
                        value={formData.currentPassword}
                        onIonInput={(e) => handleInputChange(e, 'currentPassword')}
                        placeholder="Introduce tu contraseña actual"
                      />
                    </div>
                    
                    <div className="edit-field-group">
                      <label className="field-label">
                        <IonIcon icon={keyOutline} />
                        Nueva contraseña *
                      </label>
                      <IonInput
                        className="field-input"
                        type="password"
                        value={formData.newPassword}
                        onIonInput={(e) => handleInputChange(e, 'newPassword')}
                        placeholder="Introduce nueva contraseña (mín. 6 caracteres)"
                      />
                    </div>
                    
                    <div className="edit-field-group">
                      <label className="field-label">
                        <IonIcon icon={checkmarkCircleOutline} />
                        Confirmar contraseña *
                      </label>
                      <IonInput
                        className="field-input"
                        type="password"
                        value={formData.confirmPassword}
                        onIonInput={(e) => handleInputChange(e, 'confirmPassword')}
                        placeholder="Confirma la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Botones de acción */}
          <div className="action-buttons">
            {(!isEditing && !isChangingPassword) && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="primary-button"
                      onClick={handleEditProfile}
                    >
                      <IonIcon icon={createOutline} slot="start" />
                      Editar Perfil
                    </IonButton>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="secondary-button"
                      onClick={handleChangePassword}
                    >
                      <IonIcon icon={keyOutline} slot="start" />
                      Cambiar Contraseña
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {isEditing && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="success-button"
                      onClick={handleUpdateProfile}
                    >
                      <IonIcon icon={saveOutline} slot="start" />
                      Guardar Cambios
                    </IonButton>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="cancel-button"
                      onClick={handleCancel}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Cancelar
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {isChangingPassword && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="success-button"
                      onClick={handleUpdatePassword}
                    >
                      <IonIcon icon={saveOutline} slot="start" />
                      Actualizar Contraseña
                    </IonButton>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      className="cancel-button"
                      onClick={handleCancel}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Cancelar
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </div>
        </div>

        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* ActionSheet para cambiar avatar */}
        <IonActionSheet
          isOpen={showAvatarActionSheet}
          onDidDismiss={() => setShowAvatarActionSheet(false)}
          cssClass="avatar-action-sheet"
          buttons={avatarActionSheetButtons}
          header="Cambiar Avatar"
        />

        {/* Vista previa mejorada con overlay y backdrop */}
        {showAvatarPreview && (
          <div className="avatar-preview-overlay" onClick={() => setShowAvatarPreview(false)}>
            <IonBackdrop 
              visible={showAvatarPreview} 
              tappable={true}
              onIonBackdropTap={() => setShowAvatarPreview(false)}
            />
            <div className="avatar-preview-modal" onClick={(e) => e.stopPropagation()}>
              {/* Botón de cierre mejorado sin fondo feo */}
              <div className="preview-close-button" onClick={() => setShowAvatarPreview(false)}>
                <IonIcon icon={closeOutline} />
              </div>
              
              <div className="avatar-preview-content">
                {tempAvatarUrl ? (
                  <img
                    src={tempAvatarUrl}
                    alt="Avatar ampliado"
                    className="preview-image-large"
                  />
                ) : (
                  <div className="preview-avatar-large">
                    <Avatar
                      idUsuario={user?.id || 0}
                      nombre={user?.nombre}
                      urlAvatar=""
                      tamaño={250}
                      className="generated-preview-large"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alert para introducir URL */}
        <IonAlert
          isOpen={showUrlAlert}
          onDidDismiss={() => setShowUrlAlert(false)}
          cssClass="url-input-alert"
          header="Introducir URL de imagen"
          message="Pega aquí la URL de tu imagen"
          inputs={[
            {
              name: 'imageUrl',
              type: 'url',
              placeholder: 'https://ejemplo.com/imagen.jpg',
              value: urlInput
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                setUrlInput('');
              }
            },
            {
              text: 'Guardar',
              handler: (data) => {
                setUrlInput(data.imageUrl || '');
                if (data.imageUrl && validateImageUrl(data.imageUrl)) {
                  setTempAvatarUrl(data.imageUrl);
                  setFormData(prev => ({ ...prev, avatar_url: data.imageUrl }));
                  setSuccessMessage('URL cargada correctamente');
                  return true;
                } else {
                  setErrorMessage('URL no válida (debe empezar por http:// o https://)');
                  return false;
                }
              }
            }
          ]}
        />

        <IonLoading isOpen={isLoading} message="Procesando..." />
        
        <IonToast
          isOpen={!!successMessage}
          onDidDismiss={() => setSuccessMessage('')}
          message={successMessage}
          duration={3000}
          color="success"
          position="bottom"
        />
        
        <IonToast
          isOpen={!!errorMessage}
          onDidDismiss={() => setErrorMessage('')}
          message={errorMessage}
          duration={3000}
          color="danger"
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;