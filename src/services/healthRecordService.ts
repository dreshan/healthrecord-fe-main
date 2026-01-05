import { apiService } from './api';
import { HealthRecord, CreateHealthRecordRequest } from '../types';

export const healthRecordService = {
  async getMyRecords(): Promise<HealthRecord[]> {
    try {
      return await apiService.get<HealthRecord[]>('/health-records');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch health records');
    }
  },

  async getRecordById(id: string): Promise<HealthRecord> {
    try {
      return await apiService.get<HealthRecord>(`/health-records/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Record not found');
    }
  },

  async createRecord(data: CreateHealthRecordRequest): Promise<HealthRecord> {
    try {
      return await apiService.post<HealthRecord>('/health-records', data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create health record');
    }
  },

  async updateRecord(id: string, data: Partial<CreateHealthRecordRequest>): Promise<HealthRecord> {
    try {
      return await apiService.put<HealthRecord>(`/health-records/${id}`, data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update health record');
    }
  },

  async deleteRecord(id: string): Promise<void> {
    try {
      await apiService.delete(`/health-records/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete health record');
    }
  },
};