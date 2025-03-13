// src/services/api.service.ts
import { API_URL } from '../utils/constants';

class ApiService {
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      console.log(`Realizando petición GET a: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta API:', errorData, 'Status:', response.status);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Respuesta API para ${endpoint}:`, 
        data.length > 20 ? `[Array con ${data.length} elementos]` : data);
      return data;
    } catch (error: any) {
      console.error(`Error completo en API GET ${endpoint}:`, error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error(`Error en la solicitud GET a ${endpoint}`);
    }
  }
  
  async post(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      console.log(`Realizando petición POST a: ${API_URL}${endpoint}`, data);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta API POST:', errorData);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`Respuesta POST para ${endpoint}:`, responseData);
      return responseData;
    } catch (error: any) {
      console.error(`Error completo en API POST ${endpoint}:`, error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error(`Error en la solicitud POST a ${endpoint}`);
    }
  }
  
  async put(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      console.log(`Realizando petición PUT a: ${API_URL}${endpoint}`, data);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta API PUT:', errorData);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`Respuesta PUT para ${endpoint}:`, responseData);
      return responseData;
    } catch (error: any) {
      console.error(`Error completo en API PUT ${endpoint}:`, error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error(`Error en la solicitud PUT a ${endpoint}`);
    }
  }
  
  async delete(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      console.log(`Realizando petición DELETE a: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta API DELETE:', errorData);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`Respuesta DELETE para ${endpoint}:`, responseData);
      return responseData;
    } catch (error: any) {
      console.error(`Error completo en API DELETE ${endpoint}:`, error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error(`Error en la solicitud DELETE a ${endpoint}`);
    }
  }
}

export default new ApiService();