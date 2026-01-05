import { apiService } from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);

      if (response.token) {
        apiService.setToken(response.token);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server. Please ensure the backend is running at http://localhost:8080');
        }
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', data);

      if (response.token) {
        apiService.setToken(response.token);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server. Please ensure the backend is running at http://localhost:8080');
        }
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      return await apiService.get<User>('/auth/me');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user information');
    }
  },

  async logout() {
    apiService.clearToken();
  },
};