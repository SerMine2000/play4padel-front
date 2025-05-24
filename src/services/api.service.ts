import { API_URL } from "../utils/constants";

class ApiService {
  // Método auxiliar para obtener el token automáticamente
  private getToken(): string | null {
    return localStorage.getItem('token');
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
      console.log("🚀 GET Request:", {
        url: `${API_URL}${endpoint}`,
        headers: { ...headers, Authorization: authToken ? `Bearer ${authToken.substring(0, 20)}...` : 'No token' }
      });

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      console.log("📥 GET Response Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ GET Error Response:", errorData);
        
        // Si es un error 401, limpiar el token
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          console.log('🚨 Error 401 - Token expirado, limpiando tokens');
          // Opcional: redirigir al login
          if (window.location.pathname !== '/login') {
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
          console.log("✅ GET Success Response:", jsonData);
        } catch (error) {
          console.error("❌ Error parsing JSON:", error);
          throw new Error("Error al convertir la respuesta a JSON");
        }
      } else {
        console.warn("⚠️ Response is not JSON:", contentType);
        const textResponse = await response.text();
        console.log("📝 Text Response:", textResponse);
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

    console.log("🚀 POST Request:", {
      url: `${API_URL}${endpoint}`,
      data,
      headers: { ...headers, Authorization: authToken ? `Bearer ${authToken.substring(0, 20)}...` : 'No token' }
    });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log("📥 POST Response Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ POST Error Response:", errorData);
        
        // Si es un error 401, limpiar el token
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          console.log('🚨 Error 401 - Token expirado, limpiando tokens');
          // Opcional: redirigir al login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ POST Success Response:", responseData);
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

    console.log("🚀 PUT Request:", {
      url: `${API_URL}${endpoint}`,
      data,
      headers: { ...headers, Authorization: authToken ? `Bearer ${authToken.substring(0, 20)}...` : 'No token' }
    });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      console.log("📥 PUT Response Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ PUT Error Response:", errorData);
        
        // Si es un error 401, limpiar el token
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          console.log('🚨 Error 401 - Token expirado, limpiando tokens');
          // Opcional: redirigir al login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      try {
        const responseData = await response.json();
        console.log("✅ PUT Success Response:", responseData);
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

    console.log("🚀 DELETE Request:", {
      url: `${API_URL}${endpoint}`,
      headers: { ...headers, Authorization: authToken ? `Bearer ${authToken.substring(0, 20)}...` : 'No token' }
    });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      console.log("📥 DELETE Response Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("❌ DELETE Error Response:", errorData);
        
        // Si es un error 401, limpiar el token
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          console.log('🚨 Error 401 - Token expirado, limpiando tokens');
          // Opcional: redirigir al login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
      }

      try {
        const responseData = await response.json();
        console.log("✅ DELETE Success Response:", responseData);
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