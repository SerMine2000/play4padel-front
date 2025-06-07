import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import './CustomModal.css';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  submitColor?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showFooter?: boolean;
  showHeader?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  loading?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Guardar',
  submitColor = 'primary',
  size = 'medium',
  showFooter = true,
  showHeader = true,
  closeOnOverlayClick = true,
  className = '',
  loading = false
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'modal-small';
      case 'large':
        return 'modal-large';
      case 'fullscreen':
        return 'modal-fullscreen';
      default:
        return 'modal-medium';
    }
  };

  return (
    <div className={`custom-modal-overlay ${isOpen ? 'show' : ''}`} onClick={handleOverlayClick}>
      <div className={`custom-modal ${getSizeClass()} ${className} ${loading ? 'modal-loading' : ''}`}>
        {showHeader && (
          <div className="modal-header">
            <h2>{title}</h2>
            <IonButton 
              fill="clear" 
              className="close-button"
              onClick={onClose}
              aria-label="Cerrar modal"
              disabled={loading}
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </div>
        )}

        <div className="modal-content">
          {children}
        </div>

        {showFooter && onSubmit && (
          <div className="modal-footer">
            <div className="modal-actions">
              <IonButton 
                fill="outline" 
                onClick={onClose}
                className="cancel-button"
                disabled={loading}
              >
                Cancelar
              </IonButton>
              <IonButton 
                onClick={onSubmit}
                color={submitColor}
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Guardando...' : submitText}
              </IonButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomModal;