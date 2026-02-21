import { useState } from "react";
import { FileText, CheckCircle, XCircle, Calendar, Eye } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { RegionMap } from "@/components/RegionMap";

const pendingRecords = [
  { id: 1, patient: "John Smith", diagnosis: "Dengue Fever", medication: "Acetaminophen", hospital: "Regional Medical Center", date: "2025-02-01" },
  { id: 2, patient: "Maria Garcia", diagnosis: "Malaria", medication: "Artemether", hospital: "Community Health Center", date: "2025-02-05" },
  { id: 3, patient: "Ahmed Hassan", diagnosis: "Typhoid", medication: "Ciprofloxacin", hospital: "City General Hospital", date: "2025-02-08" },
];

const appointments = [
  { id: 1, patient: "John Smith", date: "2026-02-23", time: "10:00 AM", status: "confirmed" as const },
  { id: 2, patient: "Maria Garcia", date: "2026-02-24", time: "11:30 AM", status: "pending" as const },
  { id: 3, patient: "Ahmed Hassan", date: "2026-02-25", time: "2:00 PM", status: "confirmed" as const },
];

export default function DoctorDashboard() {
  const [viewingPatient, setViewingPatient] = useState<string | null>(null);

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
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.patient}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.diagnosis}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.medication}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-md bg-success/10 p-1.5 text-success hover:bg-success/20 transition-colors" title="Approve">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button className="rounded-md bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors" title="Reject">
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewingPatient(viewingPatient === r.patient ? null : r.patient)}
                        className="rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors"
                        title="View History"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient History Panel */}
      {viewingPatient && (
        <div className="rounded-xl border bg-card p-5 shadow-card animate-slide-up">
          <h3 className="mb-3 text-sm font-semibold">Patient History: {viewingPatient}</h3>
          <p className="text-sm text-muted-foreground">Patient history will be loaded from the API. <span className="text-xs">(GET /api/patient/history)</span></p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appointments */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Upcoming Appointments
          </h3>
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{a.patient}</p>
                  <p className="text-xs text-muted-foreground">{a.date} at {a.time}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Region Risk */}
        <RegionMap />
      </div>
    </div>
  );
}
