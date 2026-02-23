import { useState, useEffect } from "react";
import { Plus, FileText, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/StateDisplays";
import { patientService } from "@/services/patientService";
import type { MedicalRecord } from "@/types";

export default function MedicalHistory() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ diagnosis: "", medication: "", hospital: "", date: "" });

  const inputClass = "mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getMedicalHistory();
      setRecords(data);
    } catch (err: any) {
      console.error("Failed to fetch medical history:", err);
      setError(err.message || "Failed to load medical history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newRecord = await patientService.addMedicalRecord({
        diagnosis: form.diagnosis,
        medication: form.medication,
        hospital: form.hospital,
        date: form.date,
      });
      setRecords((prev) => [newRecord, ...prev]);
      setShowForm(false);
      setForm({ diagnosis: "", medication: "", hospital: "", date: "" });
    } catch (err: any) {
      console.error("Failed to add record:", err);
      alert(err.message || "Failed to add medical record");
    } finally {
      setSubmitting(false);
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
        <span className="ml-2 text-muted-foreground">Loading records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Error Loading Records
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchRecords}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Medical History</h1>
          <p className="text-sm text-muted-foreground">View and manage your medical records</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Record
        </button>
      </div>

      {/* Add Record Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 shadow-card animate-slide-up">
          <h3 className="mb-4 text-sm font-semibold">New Medical Record</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Diagnosis</label>
              <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className={inputClass} placeholder="Enter diagnosis" required />
            </div>
            <div>
              <label className="text-sm font-medium">Medication</label>
              <input type="text" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} className={inputClass} placeholder="Enter medication" required />
            </div>
            <div>
              <label className="text-sm font-medium">Hospital Name</label>
              <input type="text" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className={inputClass} placeholder="Enter hospital" required />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Record
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <EmptyState title="No records yet" description="Add your first medical record to get started." icon={<FileText className="h-6 w-6" />} />
      ) : (
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Diagnosis</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Medication</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hospital</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.diagnosis}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.medication}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.hospital || "N/A"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status || "pending"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
