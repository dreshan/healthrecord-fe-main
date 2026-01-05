export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'doctor' | 'pharmacist';
  phone?: string;
  address?: string;
  licenseNumber?: string;
  pharmacyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'patient' | 'doctor' | 'pharmacist';
  phone?: string;
  address?: string;
  licenseNumber?: string;
  pharmacyId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  recordType: 'lab_report' | 'prescription' | 'medical_history' | 'vaccination';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  consultationId?: string;
  doctorId: string;
  patientId: string;
  medications?: string;
  dosage?: string;
  diagnosis?: string;
  instructions?: string;
  status: 'pending' | 'assigned' | 'fulfilled' | 'partially_fulfilled' | 'cancelled';
  isClinicVisit: boolean;
  assignedPharmacyId?: number;
  pharmacyNotes?: string;
  pharmacyUpdatedAt?: string;
  doctor?: User;
  patient?: User;
  pharmacy?: Pharmacy;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  quantity: number;
  frequency: string;
  duration: string;
  pharmacyId?: number;
  fulfilledByPharmacy?: string;
  fulfilledAt?: string;
  status: 'pending' | 'fulfilled';
  createdAt: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface PharmacyInventory {
  id: number;
  pharmacyId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  lastUpdated: string;
}

export interface Consultation {
  id: number;
  doctorId: string;
  patientId: string;
  symptoms?: string;
  subject?: string;
  message?: string;
  appointmentDate: string;
  status: 'pending' | 'completed' | 'visit_clinic' | 'cancelled' | 'replied' | 'closed';
  notes?: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  doctorName?: string;
  doctor?: User;
  patient?: User;
}

export interface CreateHealthRecordRequest {
  title: string;
  description?: string;
  recordType: string;
  fileUrl?: string;
}

export interface CreatePrescriptionRequest {
  consultationId?: number;
  patientId: string;
  medications?: string;
  dosage?: string;
  diagnosis?: string;
  instructions?: string;
  isClinicVisit?: boolean;
}

export interface CreateConsultationRequest {
  doctorId: string;
  symptoms?: string;
  subject?: string;
  message?: string;
  appointmentDate?: string;
}

export interface UpdateConsultationRequest {
  status?: 'pending' | 'completed' | 'visit_clinic' | 'cancelled';
  notes?: string;
}

export interface ClinicVisitRequest {
  consultationId: number;
  patientId: string;
  notes?: string;
}

export interface CreateInventoryRequest {
  medicineName: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateInventoryRequest {
  quantity: number;
  unitPrice: number;
}

export interface FulfillPrescriptionItemRequest {
  itemId: number;
  pharmacyId: number;
}

export interface PrescriptionPharmacyUpdate {
  id: number;
  prescriptionId: number;
  pharmacyId: number;
  medicineAvailability?: any;
  totalCost?: number;
  notes?: string;
  updatedAt: string;
}

export interface AssignPrescriptionToPharmacyRequest {
  prescriptionId: number;
  pharmacyId: number;
}

export interface UpdatePrescriptionPharmacyInfoRequest {
  prescriptionId: number;
  pharmacyNotes: string;
  medicineAvailability?: any;
  totalCost?: number;
}