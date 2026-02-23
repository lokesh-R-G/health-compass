// User and Auth Types
export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  blood_group: string;
  region: string;
  password: string;
  role?: UserRole;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// Patient Types
export interface PatientProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  blood_group: string;
  region: string;
}

export type RecordStatus = "pending" | "approved" | "rejected";

export interface MedicalRecord {
  _id?: string;
  id?: number;
  patient_id?: string;
  patient_name?: string;
  diagnosis: string;
  medication: string;
  hospital?: string;
  date: string;
  status?: RecordStatus;
  created_at?: string;
  doctor_notes?: string;
}

export interface CreateMedicalRecordRequest {
  diagnosis: string;
  medication: string;
  hospital: string;
  date: string;
}

// Doctor Types
export interface Doctor {
  _id?: string;
  id?: number;
  user_id?: string | number;
  name: string;
  email?: string;
  specialization?: string;
  region?: string;
  available_dates?: string[];
}

export interface PendingRecord extends MedicalRecord {
  patient_name: string;
  patient_region?: string;
}

export interface ApproveRejectRequest {
  record_id: string | number;
  action: "approve" | "reject";
  notes?: string;
}

// Appointment Types
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Appointment {
  _id?: string;
  id?: number;
  patient_id?: string | number;
  patient_name?: string;
  doctor_id?: string | number;
  doctor_name?: string;
  date: string;
  time: string;
  appointment_date?: string;
  appointment_time?: string;
  reason?: string;
  status: AppointmentStatus;
  created_at?: string;
}

export interface BookAppointmentRequest {
  doctor_id: string | number;
  date: string;
  time: string;
  reason?: string;
  appointment_date?: string;
  appointment_time?: string;
}

export interface UpdateAppointmentRequest {
  appointment_id: string | number;
  status: AppointmentStatus;
}

// Analytics Types
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RegionalStat {
  _id?: string;
  id?: number;
  region: string;
  disease: string;
  date: string;
  total_cases: number;
  rainfall: number;
  humidity: number;
  ph: number;
  tds: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface RegionRisk {
  _id?: string;
  region_id: string;
  region?: string;
  risk_score: number;
  risk_level?: RiskLevel;
  total_cases?: number;
  growth_rate?: number;
  is_anomaly?: boolean;
}

export interface RiskTrendPoint {
  date: string;
  score: number;
  cases?: number;
}

export interface RiskTrend {
  _id?: string;
  date: string;
  risk_score: number;
  total_cases?: number;
  region_id?: string;
}

export interface DiseaseDistribution {
  disease: string;
  count: number;
  percentage: number;
}

export interface EnvironmentalData {
  _id?: string;
  region_id: string;
  region?: string;
  rainfall: number;
  humidity: number;
  temperature?: number;
  water_ph: number;
  tds: number;
  ph?: number;
  air_quality?: string;
}

export interface AdminDashboardData {
  total_patients: number;
  cases_today: number;
  active_alerts: number;
  avg_risk_score: number;
  cases_trend: RiskTrendPoint[];
  disease_distribution: DiseaseDistribution[];
  region_risks: RegionRisk[];
  water_quality: { region: string; ph: number; tds: number }[];
  weather_data: EnvironmentalData;
}

export interface PatientDashboardData {
  risk_score: number;
  risk_level: RiskLevel;
  rainfall: number;
  humidity: number;
  water_ph: number;
  water_tds: number;
  trends: RiskTrend[];
  alerts: Alert[];
  region: string;
}

// Notification Types
export type NotificationType = "risk" | "appointment" | "record" | "info" | "alert";

export interface Notification {
  _id?: string;
  id?: number;
  user_id?: string | number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  is_read?: boolean;
  created_at: string;
  severity?: RiskLevel;
  level?: RiskLevel;
}

export interface Alert {
  _id?: string;
  id?: number;
  title: string;
  description?: string;
  time: string;
  level: RiskLevel;
  type?: NotificationType;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
