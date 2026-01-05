import { apiService } from './api';

export interface PharmacyAssignment {
  id: number;
  prescriptionId: number;
  patientName?: string;
  pharmacyName?: string;
  medicineAvailability: 'PENDING' | 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  price?: number;
  pharmacyNotes?: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedAt: string;
  updatedAt: string;
  prescriptionDetails?: string;
  doctorName?: string;
}

export const pharmacyAssignmentService = {
  assignToPharmacy: async (prescriptionId: number, pharmacyId: number): Promise<PharmacyAssignment> => {
    const response = await apiService.post<PharmacyAssignment>('/pharmacy-assignments/assign', {
      prescriptionId,
      pharmacyId
    });
    return response;
  },

  getPatientAssignments: async (): Promise<PharmacyAssignment[]> => {
    const response = await apiService.get<PharmacyAssignment[]>('/pharmacy-assignments/patient');
    return response;
  },

  getPharmacyAssignments: async (): Promise<PharmacyAssignment[]> => {
    const response = await apiService.get<PharmacyAssignment[]>('/pharmacy-assignments/pharmacy');
    return response;
  },

  updateAssignment: async (
    assignmentId: number,
    updates: {
      medicineAvailability?: string;
      price?: number;
      pharmacyNotes?: string;
      status?: string;
    }
  ): Promise<PharmacyAssignment> => {
    const response = await apiService.put<PharmacyAssignment>(`/pharmacy-assignments/${assignmentId}`, updates);
    return response;
  },

  getByPrescription: async (prescriptionId: number): Promise<PharmacyAssignment> => {
    const response = await apiService.get<PharmacyAssignment>(`/pharmacy-assignments/prescription/${prescriptionId}`);
    return response;
  }
};