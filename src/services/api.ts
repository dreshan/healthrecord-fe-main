const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    console.log('[ApiService] Setting token, length:', token.length);
    this.token = token;
    localStorage.setItem('authToken', token);
    console.log('[ApiService] Token stored in localStorage');
  }

  clearToken() {
    console.log('[ApiService] Clearing token');
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    console.log('[ApiService] Getting token:', this.token ? 'Token exists' : 'No token');
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Always try to get token from localStorage in case it was updated
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && storedToken !== this.token) {
      console.log('[ApiService] Token found in localStorage, updating instance token');
      this.token = storedToken;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log('[ApiService] Request to:', endpoint);
    console.log('[ApiService] Token available:', !!this.token);
    if (this.token) {
      console.log('[ApiService] Token preview:', this.token.substring(0, 20) + '...');
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('[ApiService] Authorization header added');
    } else {
      console.warn('[ApiService] No token available for request');
    }

    try {
      console.log('[ApiService] Making fetch request to:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      console.log('[ApiService] Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;

          // If unauthorized or forbidden, clear token
          if (response.status === 401 || response.status === 403) {
            console.error('[ApiService] Authentication failed (401/403). Token may be invalid or expired.');
            if (response.status === 403) {
              errorMessage = 'Access forbidden. Your session may have expired. Please login again.';
            }
            this.clearToken();
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
          if (response.status === 403) {
            errorMessage = 'Access forbidden (403). Please logout and login again.';
          }
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('API Request Error:', {
        endpoint,
        error,
        token: this.token ? 'Token exists' : 'No token'
      });
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log(`[API Service] GET ${API_BASE_URL}${endpoint}`);
    console.log(`[API Service] Token:`, this.token ? 'Present' : 'Missing');
    const result = await this.request<T>(endpoint, { method: 'GET' });
    console.log(`[API Service] GET ${endpoint} response:`, result);
    return result;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`POST ${API_BASE_URL}${endpoint}`, data);
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    console.log(`POST ${endpoint} response:`, result);
    return result;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`[API Service] PUT ${API_BASE_URL}${endpoint}`, data);
    console.log(`[API Service] Token:`, this.token ? 'Present' : 'Missing');
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    console.log(`[API Service] PUT ${endpoint} response:`, result);
    return result;
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();