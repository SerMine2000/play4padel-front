import { API_URL } from "../utils/constants";

// Definimos un tipo para el contexto de autenticación
interface AuthContextType {
  refreshAccessToken: () => Promise<void>;
  logout: () => void;
}

class ApiService {
  private authContext: AuthContextType | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  // Método para inyectar el contexto de autenticación
  setAuthContext(authContext: AuthContextType) {
    this.authContext = authContext;
  }

  // Método auxiliar para obtener el token automáticamente
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para intentar renovar el token
  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      console.error("❌ No hay refresh token disponible");
      return false;
    }

    // Si ya se está renovando, esperar a que termine
    if (this.isRefreshing && this.refreshPromise) {
      try {
        await this.refreshPromise;
        return true;
      } catch {
        return false;
      }
    }

    // Marcar que estamos renovando
    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al renovar token');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      return true;
    } catch (error) {
      console.error("❌ Error al renovar token:", error);
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async get<T = any>(endpoint: string, token?: string): Promise<T | null> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ GET Error Response:", errorData);
        
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
                method: 'GET',
                headers: newHeaders,
              });

              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData;
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

  async post(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
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
        
        console.error("❌ POST Error Response:", errorData);
        
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

      const responseData = await response.json();
      return responseData;

    } catch (error) {
      console.error("💥 POST Request Failed:", error);
      throw error;
    }
  }

  async put(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

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

  async delete(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

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

export default new ApiService();