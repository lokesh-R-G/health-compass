import apiClient from "@/lib/api";
import type {
  Doctor,
  PendingRecord,
  ApproveRejectRequest,
  MedicalRecord,
  Appointment,
  UpdateAppointmentRequest,
} from "@/types";

export const doctorService = {
  /**
   * Get list of doctors
   */
  getDoctors: async (filters?: {
    specialization?: string;
    region?: string;
  }): Promise<Doctor[]> => {
    const params = new URLSearchParams();
    if (filters?.specialization) params.append("specialization", filters.specialization);
    if (filters?.region) params.append("region", filters.region);
    
    const response = await apiClient.get<Doctor[]>(`/doctors?${params.toString()}`);
    return response.data;
  },

  /**
   * Get list of all doctors (alias for getDoctors)
   */
  getDoctorsList: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<Doctor[]>("/doctors");
    return response.data;
  },

  /**
   * Get pending medical records for approval
   */
  getPendingRecords: async (): Promise<PendingRecord[]> => {
    const response = await apiClient.get<PendingRecord[]>("/doctor/pending");
    return response.data;
  },

  /**
   * Approve a medical record
   */
  approveRecord: async (recordId: string): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>(`/doctor/approve/${recordId}`);
    return response.data;
  },

  /**
   * Reject a medical record
   */
  rejectRecord: async (recordId: string, notes?: string): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>(`/doctor/reject/${recordId}`, { notes });
    return response.data;
  },

  /**
   * Approve or reject a medical record
   */
  approveRejectRecord: async (data: ApproveRejectRequest): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>("/doctor/approve", data);
    return response.data;
  },

  /**
   * Get patient history (read-only for doctors)
   */
  getPatientHistory: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await apiClient.get<MedicalRecord[]>(`/doctor/patient/${patientId}/history`);
    return response.data;
  },

  /**
   * Get doctor appointments
   */
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>("/doctor/appointments");
    return response.data;
  },

  /**
   * Update appointment status
   */
  updateAppointmentStatus: async (data: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>("/doctor/appointment/update", data);
    return response.data;
  },

  /**
   * Get doctor's available slots
   */
  getAvailableSlots: async (doctorId: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`/doctors/${doctorId}/slots`);
    return response.data;
  },
};
