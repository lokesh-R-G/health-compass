import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Calendar, Eye, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { RegionMap } from "@/components/RegionMap";
import { doctorService } from "@/services/doctorService";
import { appointmentService } from "@/services/appointmentService";
import type { MedicalRecord, Appointment } from "@/types";

export default function DoctorDashboard() {
  const [viewingPatient, setViewingPatient] = useState<string | null>(null);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [pendingRecords, setPendingRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recordsData, appointmentsData] = await Promise.all([
        doctorService.getPendingRecords(),
        appointmentService.getAppointments(),
      ]);

      setPendingRecords(recordsData);
      setAppointments(appointmentsData);
    } catch (err: any) {
      console.error("Failed to fetch doctor dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      setActionLoading(recordId);
      await doctorService.approveRecord(recordId);
      setPendingRecords((prev) => prev.filter((r) => r._id !== recordId));
    } catch (err: any) {
      console.error("Failed to approve record:", err);
      alert(err.message || "Failed to approve record");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (recordId: string) => {
    try {
      setActionLoading(recordId);
      await doctorService.rejectRecord(recordId);
      setPendingRecords((prev) => prev.filter((r) => r._id !== recordId));
    } catch (err: any) {
      console.error("Failed to reject record:", err);
      alert(err.message || "Failed to reject record");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewHistory = async (patientName: string, patientId: string) => {
    if (viewingPatientId === patientId) {
      setViewingPatient(null);
      setViewingPatientId(null);
      setPatientHistory([]);
      return;
    }

    try {
      setViewingPatient(patientName);
      setViewingPatientId(patientId);
      setHistoryLoading(true);
      const history = await doctorService.getPatientHistory(patientId);
      setPatientHistory(history);
    } catch (err: any) {
      console.error("Failed to fetch patient history:", err);
      setPatientHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Error Loading Dashboard
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Doctor Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage patient records and appointments</p>
      </div>

      {/* Pending Records */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" /> Pending Medical Records
        </h3>
        {pendingRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Diagnosis</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Medication</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRecords.map((r) => (
                  <tr key={r._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.patient_name || "Unknown"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.diagnosis}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.medication}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actionLoading === r._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(r._id!)}
                              className="rounded-md bg-success/10 p-1.5 text-success hover:bg-success/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(r._id!)}
                              className="rounded-md bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewHistory(r.patient_name || "Unknown", r.patient_id!)}
                              className="rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors"
                              title="View History"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pending records to review</p>
        )}
      </div>

      {/* Patient History Panel */}
      {viewingPatient && (
        <div className="rounded-xl border bg-card p-5 shadow-card animate-slide-up">
          <h3 className="mb-3 text-sm font-semibold">Patient History: {viewingPatient}</h3>
          {historyLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading history...</span>
            </div>
          ) : patientHistory.length > 0 ? (
            <div className="space-y-2">
              {patientHistory.map((record) => (
                <div key={record._id} className="rounded-lg border p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{record.diagnosis}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(record.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Medication: {record.medication}</p>
                  {record.hospital && (
                    <p className="text-xs text-muted-foreground">Hospital: {record.hospital}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No history found for this patient</p>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appointments */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Upcoming Appointments
          </h3>
          <div className="space-y-3">
            {appointments.length > 0 ? (
              appointments.map((a) => (
                <div key={a._id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{a.patient_name || "Patient"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)} at {a.time}</p>
                    {a.reason && <p className="text-xs text-muted-foreground">{a.reason}</p>}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Region Risk */}
        <RegionMap />
      </div>
    </div>
  );
}
