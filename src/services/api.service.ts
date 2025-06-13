import { API_URL } from "../utils/constants";

/**
 * Interfaz que define los métodos que debe implementar el contexto de autenticación
 * para permitir la renovación automática de tokens y el logout
 */
interface AuthContextType {
  refreshAccessToken: () => Promise<void>;
  logout: () => void;
}

/**
 * Servicio centralizado para realizar peticiones HTTP al backend de la API.
 * Maneja automáticamente la autenticación JWT, renovación de tokens y manejo de errores.
 * Implementa el patrón Singleton para mantener una instancia única en toda la aplicación.
 */
class ApiService {
  // Referencia al contexto de autenticación para gestionar tokens y logout
  private authContext: AuthContextType | null = null;
  // Flag para evitar múltiples renovaciones simultáneas de token
  private isRefreshing = false;
  // Promesa para manejar renovaciones concurrentes de token
  private refreshPromise: Promise<void> | null = null;

  /**
   * Método para inyectar el contexto de autenticación en el servicio.
   * Permite al servicio realizar logout automático cuando los tokens expiran.
   */
  setAuthContext(authContext: AuthContextType) {
    this.authContext = authContext;
  }

  /**
   * Método auxiliar para obtener el token de acceso desde localStorage.
   * Utilizado por todos los métodos HTTP para autenticar las peticiones.
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Método privado para renovar el token de acceso cuando expira (error 401).
   * Utiliza el refresh token almacenado para obtener un nuevo access token.
   * Implementa protección contra renovaciones concurrentes.
   */
  private async tryRefreshToken(): Promise<boolean> {
    // Obtenemos el refresh token desde localStorage
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Si no hay refresh token, no podemos renovar la sesión
    if (!refreshToken) {
      console.error("❌ No hay refresh token disponible");
      return false;
    }

    // Si ya hay una renovación en curso, esperamos a que termine
    if (this.isRefreshing && this.refreshPromise) {
      try {
        await this.refreshPromise;
        return true;
      } catch {
        return false;
      }
    }

    // Marcamos que estamos iniciando el proceso de renovación
    this.isRefreshing = true;

    try {
      // Realizamos la petición al endpoint de renovación de token
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      // Verificamos que la respuesta sea exitosa
      if (!response.ok) {
        throw new Error('Error al renovar token');
      }

      // Extraemos el nuevo token de la respuesta y lo guardamos
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      return true;
    } catch (error) {
      console.error("❌ Error al renovar token:", error);
      return false;
    } finally {
      // Limpiamos las flags de renovación
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Realiza una petición HTTP GET al endpoint especificado.
   * Maneja automáticamente la autenticación JWT y la renovación de tokens.
   * Incluye reintentos automáticos en caso de expiración de token (401).
   */
  async get<T = any>(endpoint: string, token?: string): Promise<T | null> {
    // Configuramos los headers base para la petición
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Utilizamos el token proporcionado o el almacenado en localStorage
    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      // Realizamos la petición GET al endpoint
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      // Si la respuesta no es exitosa, manejamos el error
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ GET Error Response:", errorData);
        
        // Si es un error 401 (no autorizado), intentamos renovar el token
        if (response.status === 401) {
          const refreshSuccessful = await this.tryRefreshToken();
          
          // Si la renovación fue exitosa, reintentamos la petición
          if (refreshSuccessful) {
            const newToken = this.getToken();
            if (newToken) {
              const newHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              };
              
              // Realizamos el reintento con el nuevo token
              const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: newHeaders,
              });

              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData;
              }
            }
          }
          
          // Si la renovación falló, limpiamos los tokens y redirigimos al login
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          if (this.authContext) {
            this.authContext.logout();
          } else if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      // Verificamos que la respuesta sea JSON válido
      const contentType = response.headers.get('Content-Type');
      let jsonData: T | null = null;

      if (contentType && contentType.includes('application/json')) {
        try {
          jsonData = await response.json();
        } catch (error) {
          console.error("❌ Error parsing JSON:", error);
          throw new Error("Error al convertir la respuesta a JSON");
        }
      } else {
        console.warn("⚠️ Response is not JSON:", contentType);
        const textResponse = await response.text();
        throw new Error("La respuesta no es JSON válido");
      }

      return jsonData;
    } catch (error) {
      console.error("💥 GET Request Failed:", error);
      throw error;
    }
  }

  /**
   * Realiza una petición HTTP POST para enviar datos al servidor.
   * Incluye manejo automático de autenticación y renovación de tokens.
   */
  async post(endpoint: string, data: any, token?: string) {
    // Configuramos los headers para la petición POST
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Añadimos el token de autenticación si está disponible
    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      // Realizamos la petición POST con los datos serializados
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      // Manejamos errores de respuesta
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ POST Error Response:", errorData);
        
        // Implementamos reintento automático en caso de token expirado
        if (response.status === 401) {
          const refreshSuccessful = await this.tryRefreshToken();
          
          if (refreshSuccessful) {
            const newToken = this.getToken();
            if (newToken) {
              const newHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              };
              
              // Reintentamos la petición con el nuevo token
              const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: newHeaders,
                body: JSON.stringify(data),
              });

              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData;
              }
            }
          }
          
          // Si falló, limpiamos tokens y redirigimos al login
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          if (this.authContext) {
            this.authContext.logout();
          } else if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      // Devolvemos los datos de respuesta
      const responseData = await response.json();
      return responseData;

    } catch (error) {
      console.error("💥 POST Request Failed:", error);
      throw error;
    }
  }

  /**
   * Realiza una petición HTTP PUT para actualizar datos en el servidor.
   * Implementa el mismo patrón de autenticación y renovación de tokens que GET y POST.
   */
  async put(endpoint: string, data: any, token?: string) {
    // Configuramos headers para la petición PUT
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Añadimos autenticación JWT
    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ PUT Error Response:", errorData);
        
        // Si es un error 401, intentar renovar el token
        if (response.status === 401) {
          const refreshSuccessful = await this.tryRefreshToken();
          
          if (refreshSuccessful) {
            // Reintentar la petición con el nuevo token
            const newToken = this.getToken();
            if (newToken) {
              const newHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              };
              
              const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: newHeaders,
                body: JSON.stringify(data),
              });

              if (retryResponse.ok) {
                try {
                  const retryData = await retryResponse.json();
                  return retryData;
                } catch {
                  return null;
                }
              }
            }
          }
          
          // Si la renovación falló, limpiar tokens y hacer logout
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          if (this.authContext) {
            this.authContext.logout();
          } else if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      try {
        const responseData = await response.json();
        return responseData;
      } catch {
        // Algunas respuestas PUT pueden no tener contenido JSON
        return null;
      }

    } catch (error) {
      console.error("💥 PUT Request Failed:", error);
      throw error;
    }
  }

  /**
   * Realiza una petición HTTP DELETE para eliminar recursos del servidor.
   * Maneja autenticación JWT y renovación automática de tokens como los demás métodos.
   */
  async delete(endpoint: string, token?: string) {
    // Configuramos headers para la petición DELETE
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Incluimos el token de autenticación
    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ DELETE Error Response:", errorData);
        
        // Si es un error 401, intentar renovar el token
        if (response.status === 401) {
          const refreshSuccessful = await this.tryRefreshToken();
          
          if (refreshSuccessful) {
            // Reintentar la petición con el nuevo token
            const newToken = this.getToken();
            if (newToken) {
              const newHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              };
              
              const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: newHeaders,
              });

              if (retryResponse.ok) {
                try {
                  const retryData = await retryResponse.json();
                  return retryData;
                } catch {
                  return null;
                }
              }
            }
          }
          
          // Si la renovación falló, limpiar tokens y hacer logout
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          if (this.authContext) {
            this.authContext.logout();
          } else if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      try {
        const responseData = await response.json();
        return responseData;
      } catch {
        // Algunas respuestas DELETE pueden no tener contenido JSON
        return null;
      }

    } catch (error) {
      console.error("💥 DELETE Request Failed:", error);
      throw error;
    }
  }
}

// Exportamos una instancia única del servicio (patrón Singleton)
export default new ApiService();