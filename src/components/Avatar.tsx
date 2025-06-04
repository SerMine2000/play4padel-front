// Componente Avatar reutilizable para toda la aplicación
import React, { useState } from 'react';
import { IonAvatar } from '@ionic/react';
import { obtenerEstilosAvatar, obtenerInicialUsuario } from '../utils/constants';
import './Avatar.css';

interface PropiedadesAvatar {
  idUsuario: number;
  nombre?: string;
  urlAvatar?: string;
  tamaño?: number;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Avatar: React.FC<PropiedadesAvatar> = ({
  idUsuario,
  nombre,
  urlAvatar,
  tamaño = 42,
  className = '',
  onClick,
  style = {}
}) => {
  const [errorImagen, setErrorImagen] = useState(false);

  const manejarErrorImagen = () => {
    setErrorImagen(true);
  };

  const deberiasMostrarAvatarGenerado = !urlAvatar || errorImagen;

  if (deberiasMostrarAvatarGenerado) {
    // Avatar generado con inicial y color
    const estilosAvatar = obtenerEstilosAvatar(idUsuario, nombre, tamaño);
    const inicial = obtenerInicialUsuario(nombre);

    return (
      <div
        className={`avatar-generado ${className}`}
        style={{ ...estilosAvatar, ...style, cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      >
        {inicial}
      </div>
    );
  }

  // Avatar con imagen
  return (
    <IonAvatar 
      className={className}
      style={{ 
        width: `${tamaño}px`, 
        height: `${tamaño}px`,
        cursor: onClick ? 'pointer' : 'default',
        ...style 
      }}
      onClick={onClick}
    >
      <img
        src={urlAvatar}
        alt={nombre || 'Usuario'}
        onError={manejarErrorImagen}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
        }}
      />
    </IonAvatar>
  );
};

export default Avatar;