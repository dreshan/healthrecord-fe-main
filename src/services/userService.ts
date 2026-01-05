import { apiService } from './api';
import { User } from '../types';

export const userService = {
  async getAllPatients(): Promise<User[]> {
    const data = await apiService.get<any[]>('/users/patients');

    return data.map((p: any) => ({
      id: String(p.id),
      email: p.email,
      fullName: p.fullName,
      role: p.role.toLowerCase(),
      phone: p.phone,
      address: p.address,
      licenseNumber: p.licenseNumber,
      pharmacyId: p.pharmacyId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },

  async getAllDoctors(): Promise<User[]> {
    const data = await apiService.get<any[]>('/users/doctors');

    return data.map((d: any) => ({
      id: String(d.id),
      email: d.email,
      fullName: d.fullName,
      role: d.role.toLowerCase(),
      phone: d.phone,
      address: d.address,
      licenseNumber: d.licenseNumber,
      pharmacyId: d.pharmacyId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },

  async getUserById(id: string | number): Promise<User> {
    const data = await apiService.get<any>(`/users/${id}`);

    return {
      id: String(data.id),
      email: data.email,
      fullName: data.fullName,
      role: data.role.toLowerCase(),
      phone: data.phone,
      address: data.address,
      licenseNumber: data.licenseNumber,
      pharmacyId: data.pharmacyId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const data = await apiService.put<any>('/users/profile', userData);

    return {
      id: String(data.id),
      email: data.email,
      fullName: data.fullName,
      role: data.role.toLowerCase(),
      phone: data.phone,
      address: data.address,
      licenseNumber: data.licenseNumber,
      pharmacyId: data.pharmacyId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  async getUsersByRole(role: string): Promise<User[]> {
    const endpoint = role.toLowerCase() === 'pharmacist' ? '/users/pharmacists' :
                    role.toLowerCase() === 'doctor' ? '/users/doctors' :
                    role.toLowerCase() === 'patient' ? '/users/patients' :
                    `/users/role/${role}`;

    const response = await apiService.get<any[]>(endpoint);

    if (!Array.isArray(response)) {
      throw new Error(`Expected array response but got ${typeof response}`);
    }

    return response.map((user: any) => ({
      id: String(user.id),
      email: user.email,
      fullName: user.fullName || user.name,
      role: user.role.toLowerCase(),
      phone: user.phone,
      address: user.address,
      licenseNumber: user.licenseNumber,
      pharmacyId: user.pharmacyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },
};