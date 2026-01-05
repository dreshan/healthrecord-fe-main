import { apiService } from './api';
import { Prescription, CreatePrescriptionRequest, ClinicVisitRequest } from '../types';

export const prescriptionService = {
  async getMyPrescriptions(): Promise<Prescription[]> {
    return apiService.get<Prescription[]>('/prescriptions/my');
  },

  async getPrescriptionById(id: string): Promise<Prescription> {
    return apiService.get<Prescription>(`/prescriptions/${id}`);
  },

  async createPrescription(data: CreatePrescriptionRequest): Promise<Prescription> {
    return apiService.post<Prescription>('/prescriptions', data);
  },

  async requestClinicVisit(data: ClinicVisitRequest): Promise<Prescription> {
    return apiService.post<Prescription>('/prescriptions/clinic-visit', data);
  },

  async updatePrescription(id: string, data: Partial<CreatePrescriptionRequest>): Promise<Prescription> {
    return apiService.put<Prescription>(`/prescriptions/${id}`, data);
  },

  async deletePrescription(id: string): Promise<void> {
    return apiService.delete(`/prescriptions/${id}`);
  },

  async getAssignedPrescriptions(): Promise<Prescription[]> {
    return apiService.get<Prescription[]>('/prescriptions/assigned');
  },

    async assignToPharmacy(prescriptionId: string, pharmacyId: string): Promise<Prescription> {
    return apiService.post<Prescription>(`/prescriptions/${prescriptionId}/assign-pharmacy`, { pharmacyId });
  },

  async updatePharmacyInfo(data: UpdatePrescriptionPharmacyInfoRequest): Promise<Prescription> {
    console.log('[prescriptionService] updatePharmacyInfo called with:', data);
    const result = await apiService.put<Prescription>(`/prescriptions/${data.prescriptionId}/pharmacy-info`, data);
    console.log('[prescriptionService] updatePharmacyInfo result:', result);
    return result;
  },
};