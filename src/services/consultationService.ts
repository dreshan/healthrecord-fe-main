import { apiService } from './api';
import { Consultation, CreateConsultationRequest, UpdateConsultationRequest } from '../types';

export const consultationService = {
  async getMyConsultations(): Promise<Consultation[]> {
    const data = await apiService.get<any[]>('/consultations/my');

    return data.map((c: any) => ({
      id: c.id,
      doctorId: String(c.doctorId),
      patientId: String(c.patientId),
      symptoms: c.symptoms,
      subject: c.subject,
      message: c.message,
      appointmentDate: c.appointmentDate,
      status: c.status,
      notes: c.notes,
      reply: c.reply,
      patientName: c.patientName,
      doctorName: c.doctorName,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  async getPendingConsultations(): Promise<Consultation[]> {
    const data = await apiService.get<any[]>('/consultations/pending');

    return data.map((c: any) => ({
      id: c.id,
      doctorId: String(c.doctorId),
      patientId: String(c.patientId),
      symptoms: c.symptoms,
      subject: c.subject,
      message: c.message,
      appointmentDate: c.appointmentDate,
      status: c.status,
      notes: c.notes,
      reply: c.reply,
      patientName: c.patientName,
      doctorName: c.doctorName,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  async getConsultationById(id: number): Promise<Consultation> {
    const data = await apiService.get<any>(`/consultations/${id}`);

    return {
      id: data.id,
      doctorId: String(data.doctorId),
      patientId: String(data.patientId),
      symptoms: data.symptoms,
      subject: data.subject,
      message: data.message,
      appointmentDate: data.appointmentDate,
      status: data.status,
      notes: data.notes,
      reply: data.reply,
      patientName: data.patientName,
      doctorName: data.doctorName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  async createConsultation(data: CreateConsultationRequest): Promise<Consultation> {
    console.log('[Consultation Service] Creating consultation with data:', data);
    console.log('[Consultation Service] Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');

    // Format appointmentDate for Spring Boot LocalDateTime
    let formattedDate: string;
    if (data.appointmentDate) {
      // datetime-local format: "2024-01-05T14:30"
      // Add seconds if missing
      formattedDate = data.appointmentDate.includes(':') && data.appointmentDate.split(':').length === 2
        ? `${data.appointmentDate}:00`
        : data.appointmentDate;
    } else {
      // Use current date/time in LocalDateTime format (no timezone)
      const now = new Date();
      formattedDate = now.toISOString().slice(0, 19); // "2024-01-05T14:30:00"
    }

    const requestPayload = {
      doctorId: data.doctorId,
      symptoms: data.symptoms,
      appointmentDate: formattedDate,
    };

    console.log('[Consultation Service] Request payload:', requestPayload);
    console.log('[Consultation Service] Formatted date:', formattedDate);

    try {
      const consultation = await apiService.post<any>('/consultations', requestPayload);
      console.log('[Consultation Service] Response:', consultation);

      return {
        id: consultation.id,
        doctorId: String(consultation.doctorId),
        patientId: String(consultation.patientId),
        symptoms: consultation.symptoms,
        subject: consultation.subject,
        message: consultation.message,
        appointmentDate: consultation.appointmentDate,
        status: consultation.status,
        notes: consultation.notes,
        reply: consultation.reply,
        patientName: consultation.patientName,
        doctorName: consultation.doctorName,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
      };
    } catch (error) {
      console.error('[Consultation Service] Error creating consultation:', error);
      if (error instanceof Error) {
        console.error('[Consultation Service] Error message:', error.message);
        console.error('[Consultation Service] Error stack:', error.stack);
      }
      throw error;
    }
  },

  async updateConsultation(id: number, data: UpdateConsultationRequest): Promise<Consultation> {
    const consultation = await apiService.put<any>(`/consultations/${id}`, data);

    return {
      id: consultation.id,
      doctorId: String(consultation.doctorId),
      patientId: String(consultation.patientId),
      symptoms: consultation.symptoms,
      subject: consultation.subject,
      message: consultation.message,
      appointmentDate: consultation.appointmentDate,
      status: consultation.status,
      notes: consultation.notes,
      reply: consultation.reply,
      patientName: consultation.patientName,
      doctorName: consultation.doctorName,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  },

  async deleteConsultation(id: number): Promise<void> {
    await apiService.delete(`/consultations/${id}`);
  },
};