import apiClient from "@/lib/api";
import type {
  Appointment,
  BookAppointmentRequest,
} from "@/types";

export const appointmentService = {
  /**
   * Book an appointment
   */
  bookAppointment: async (data: BookAppointmentRequest): Promise<Appointment> => {
    // Map frontend format to backend format
    const payload = {
      doctor_id: data.doctor_id,
      appointment_date: data.date || data.appointment_date,
      appointment_time: data.time || data.appointment_time || "10:00",
      reason: data.reason || "",
    };
    const response = await apiClient.post<Appointment>("/appointment/book", payload);
    return response.data;
  },

  /**
   * Get patient's appointments
   */
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>("/appointment/list");
    return response.data;
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>(`/appointment/${appointmentId}/cancel`);
    return response.data;
  },
};
