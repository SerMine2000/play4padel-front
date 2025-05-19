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
      console.log(`Realizando petición GET a: ${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      console.log("Respuesta completa del fetch:", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error("Error en la respuesta del fetch:", errorData);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      // Verificamos el contenido antes de intentar convertirlo a JSON
      const contentType = response.headers.get('Content-Type');
      let jsonData: T | null = null;

      if (contentType && contentType.includes('application/json')) {
        try {
          jsonData = await response.json();
          console.log("JSON Data final:", jsonData);
        } catch (error) {
          console.error("Error al convertir a JSON:", error);
          jsonData = { error: "Error al convertir la respuesta a JSON" } as T;
        }
      } else {
        console.warn("Respuesta no es JSON, tipo de contenido:", contentType);
        console.log("Texto bruto de la respuesta:", await response.text());
      }

return jsonData;

    } catch (error) {
      console.error("Error en la función get:", error);
      throw new Error('Error al realizar la petición GET');
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


    console.log("Payload enviado al backend (PUT):", data)

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    return await response.json();
  }

  async put(endpoint: string, data: any, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authToken = token || this.getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  console.log("Payload enviado al backend (PUT):", JSON.stringify(data));

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    console.log("Respuesta completa del PUT:", response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error("Error en la respuesta del PUT:", errorData);
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const responseData = await response.json().catch(() => null);
    console.log("JSON Data recibido del backend (PUT):", responseData);

    return responseData;

  } catch (error) {
    console.error("Error al realizar la petición PUT:", error);
    throw new Error('Error al actualizar el perfil');
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

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    return await response.json();
  }
}

export default new ApiService();
