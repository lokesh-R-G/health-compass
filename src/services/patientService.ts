import apiClient from "@/lib/api";
import type {
  PatientProfile,
  MedicalRecord,
  CreateMedicalRecordRequest,
  PatientDashboardData,
} from "@/types";

export const patientService = {
  /**
   * Get patient profile
   */
  getProfile: async (): Promise<PatientProfile> => {
    const response = await apiClient.get<PatientProfile>("/patient/profile");
    return response.data;
  },

  /**
   * Update patient profile
   */
  updateProfile: async (data: Partial<PatientProfile>): Promise<PatientProfile> => {
    const response = await apiClient.put<PatientProfile>("/patient/profile", data);
    return response.data;
  },

  /**
   * Get medical history
   */
  getMedicalHistory: async (): Promise<MedicalRecord[]> => {
    const response = await apiClient.get<MedicalRecord[]>("/patient/history");
    return response.data;
  },

  /**
   * Add a new medical record
   */
  addMedicalRecord: async (data: CreateMedicalRecordRequest): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>("/medical-record", data);
    return response.data;
  },

  /**
   * Get patient dashboard data
   */
  getDashboardData: async (): Promise<PatientDashboardData> => {
    const response = await apiClient.get<PatientDashboardData>("/patient/dashboard");
    return response.data;
  },
};
