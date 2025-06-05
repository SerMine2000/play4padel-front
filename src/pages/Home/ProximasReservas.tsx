import React, { useState, useEffect } from 'react';
import { IonCard } from '@ionic/react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import './Home.css';

export interface Reserva {
  id: string;
  pista: string;
  clubNombre: string;
  fecha: string; // Ejemplo: "2025-04-24 - 18:00"
  hora: string;
  usuario?: string; // Para clubes, mostrar quién hizo la reserva
}

interface ProximasReservasProps {
  reservas?: Reserva[]; // Props opcional para mantener compatibilidad
}

const ProximasReservas: React.FC<ProximasReservasProps> = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) {
        console.log('❌ No hay usuario logueado');
        setLoading(false);
        setError('No hay usuario logueado');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      console.log('=== 📋 INICIANDO CARGA DE RESERVAS ===');
      console.log('👤 Usuario actual:', {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        id_rol: user.id_rol
      });
      
      try {
        let reservasData: any[] = [];
        let endpoint = '';
        let success = false;
        
        // Determinar endpoint según el rol
        if (user.role?.toUpperCase() === 'CLUB' || user.id_rol?.toUpperCase() === 'CLUB') {
          endpoint = `/reservas?id_club=${user.id}`;
        } else {
          endpoint = `/reservas?id_usuario=${user.id}`;
        }

        console.log(`🎯 Endpoint a usar: ${endpoint}`);

        try {
          console.log(`🔄 Llamando al backend: ${endpoint}`);
          const data = await apiService.get(endpoint);
          
          console.log('📦 Respuesta del backend:', data);
          console.log('📊 Tipo de respuesta:', typeof data);
          console.log('📏 Es array?:', Array.isArray(data));
          
          if (Array.isArray(data)) {
            reservasData = data;
            success = true;
          } else if (data && Array.isArray(data.reservas)) {
            reservasData = data.reservas;
            success = true;
          } else if (data && Array.isArray(data.data)) {
            reservasData = data.data;
            success = true;
          } else {
            console.log('⚠️ Estructura de respuesta inesperada:', data);
          }
          
        } catch (apiError) {
          console.error(`❌ Error en endpoint ${endpoint}:`, apiError);
          
          // Fallback: intentar obtener todas las reservas
          console.log('🔄 Intentando fallback con /reservas');
          try {
            const allData = await apiService.get('/reservas');
            console.log('📦 Todas las reservas (fallback):', allData);
            
            if (Array.isArray(allData)) {
              // Filtrar por usuario
              if (user.role?.toUpperCase() === 'CLUB' || user.id_rol?.toUpperCase() === 'CLUB') {
                reservasData = allData.filter((r: any) => {
                  const match = r.id_club === user.id || 
                               r.club_id === user.id ||
                               (r.club && r.club.id === user.id);
                  if (match) console.log('✅ Reserva de club encontrada:', r);
                  return match;
                });
              } else {
                reservasData = allData.filter((r: any) => {
                  const match = r.id_usuario === user.id || 
                               r.usuario_id === user.id ||
                               (r.usuario && r.usuario.id === user.id);
                  if (match) console.log('✅ Reserva de usuario encontrada:', r);
                  return match;
                });
              }
              success = true;
              console.log(`🎯 Reservas filtradas para usuario ${user.id}:`, reservasData);
            }
          } catch (fallbackError) {
            console.error('❌ Fallback también falló:', fallbackError);
            throw apiError; // Re-lanzar el error original
          }
        }

        console.log(`📋 Total reservas encontradas: ${reservasData.length}`);
        
        if (reservasData.length === 0) {
          console.log('📭 No se encontraron reservas para este usuario');
          setReservas([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Transformar datos a formato esperado
        console.log('🔄 Transformando datos...');
        const reservasFormateadas = reservasData.map((reserva: any, index: number) => {
          console.log(`📝 Procesando reserva ${index + 1}:`, reserva);
          
          // Obtener nombre de la pista
          const pistaNombre = 
            reserva.pista?.nombre || 
            reserva.pista?.numero ? `Pista ${reserva.pista.numero}` :
            reserva.pistaNombre || 
            reserva.nombre_pista ||
            reserva.nombrePista || 
            reserva.court_name ||
            reserva.pista ||
            (reserva.id_pista ? `Pista ${reserva.id_pista}` : `Pista ${index + 1}`);

          // Obtener nombre del club
          const clubNombre = 
            reserva.club?.nombre || 
            reserva.clubNombre || 
            reserva.nombre_club ||
            reserva.nombreClub || 
            reserva.club_name ||
            reserva.club ||
            'Club';

          // Formatear fecha y hora
          let fechaCompleta = '';
          if (reserva.fecha && reserva.hora_inicio) {
            fechaCompleta = `${reserva.fecha} - ${reserva.hora_inicio}`;
          } else if (reserva.fechaHora) {
            fechaCompleta = reserva.fechaHora;
          } else if (reserva.fecha) {
            fechaCompleta = reserva.fecha;
          } else {
            fechaCompleta = 'Fecha por confirmar';
          }

          // Obtener nombre del usuario (para clubes)
          const usuarioNombre = 
            reserva.usuario?.nombre || 
            reserva.usuarioNombre || 
            reserva.nombre_usuario ||
            reserva.nombreUsuario ||
            reserva.user_name ||
            reserva.usuario;

          const reservaFormateada = {
            id: reserva.id || `reserva-${index}`,
            pista: pistaNombre,
            clubNombre: clubNombre,
            fecha: fechaCompleta,
            hora: reserva.hora_inicio || reserva.time || '',
            usuario: usuarioNombre
          };
          
          console.log(`✅ Reserva ${index + 1} formateada:`, reservaFormateada);
          return reservaFormateada;
        });

        console.log('🎉 Reservas finales para mostrar:', reservasFormateadas);
        setReservas(reservasFormateadas);
        setError(null);
        
      } catch (error) {
        console.error('💥 Error general cargando reservas:', error);
        setError('No se pudieron cargar las reservas en este momento');
        setReservas([]);
      } finally {
        setLoading(false);
        console.log('=== 🏁 CARGA DE RESERVAS FINALIZADA ===');
      }
    };

    fetchReservas();
  }, [user]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="proximas-reservas">
        <h2>{user?.role.toUpperCase() === 'CLUB' ? 'Reservas del club' : 'Mis reservas'}</h2>
        <div className="sin-reservas-centrado">Cargando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proximas-reservas">
        <h2>{user?.role.toUpperCase() === 'CLUB' ? 'Reservas del club' : 'Mis reservas'}</h2>
        <div className="sin-reservas-centrado" style={{ color: 'var(--ion-color-danger)' }}>
          {error}
        </div>
      </div>
    );
  }

  // Mensaje cuando no hay reservas (datos reales)
  if (reservas.length === 0) {
    return (
      <div className="proximas-reservas">
        <h2>{user?.role.toUpperCase() === 'CLUB' ? 'Reservas del club' : 'Mis reservas'}</h2>
        <div className="sin-reservas-centrado">
          {user?.role.toUpperCase() === 'CLUB' 
            ? 'No hay reservas en el club' 
            : 'No tienes reservas actualmente'
          }
        </div>
      </div>
    );
  }

  // Mostrar reservas reales
  return (
    <div className="proximas-reservas">
      <h2>{user?.role.toUpperCase() === 'CLUB' ? 'Reservas del club' : 'Mis reservas'}</h2>
      <div className="reservas-list">
        {reservas.map((reserva) => (
          <IonCard className="reserva-card" key={reserva.id}>
            <div className="reserva-info-left">
              <p className="reserva-club-nombre">{reserva.clubNombre}</p>
              <p className="reserva-pista-nombre">{reserva.pista}</p>
              {user?.role.toUpperCase() === 'CLUB' && reserva.usuario && (
                <p className="reserva-usuario-nombre" style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--ion-text-color)', 
                  opacity: 0.5,
                  margin: '2px 0 0 0'
                }}>
                  {reserva.usuario}
                </p>
              )}
            </div>
            <div className="reserva-fecha">
              {reserva.fecha}
            </div>
          </IonCard>
        ))}
      </div>
    </div>
  );
};

export default ProximasReservas;
