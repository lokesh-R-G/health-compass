import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/StateDisplays";

interface MedicalRecord {
  id: number;
  diagnosis: string;
  medication: string;
  hospital: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const sampleRecords: MedicalRecord[] = [
  { id: 1, diagnosis: "Seasonal Flu", medication: "Oseltamivir", hospital: "City General Hospital", date: "2025-01-15", status: "approved" },
  { id: 2, diagnosis: "Dengue Fever", medication: "Acetaminophen", hospital: "Regional Medical Center", date: "2025-02-01", status: "pending" },
  { id: 3, diagnosis: "Gastroenteritis", medication: "ORS + Zinc", hospital: "Community Health Center", date: "2025-02-10", status: "rejected" },
];

export default function MedicalHistory() {
  const [records] = useState<MedicalRecord[]>(sampleRecords);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ diagnosis: "", medication: "", hospital: "", date: "" });

  const inputClass = "mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API placeholder: POST /api/medical-record
    setShowForm(false);
    setForm({ diagnosis: "", medication: "", hospital: "", date: "" });
  };

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
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
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
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.diagnosis}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.medication}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.hospital}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
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
