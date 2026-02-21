import { useState } from "react";
import { Calendar, Search } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/StateDisplays";

const doctors = [
  { id: 1, name: "Dr. Sarah Chen", specialization: "Cardiology", region: "North Region", available: ["2026-02-23", "2026-02-25", "2026-02-27"] },
  { id: 2, name: "Dr. James Wilson", specialization: "Dermatology", region: "Central Region", available: ["2026-02-22", "2026-02-24"] },
  { id: 3, name: "Dr. Priya Patel", specialization: "Infectious Disease", region: "West Region", available: ["2026-02-23", "2026-02-26", "2026-02-28"] },
  { id: 4, name: "Dr. Michael Osei", specialization: "General Medicine", region: "East Region", available: ["2026-02-22", "2026-02-24", "2026-02-26"] },
];

const upcomingAppointments = [
  { id: 1, doctor: "Dr. Sarah Chen", date: "2026-02-23", time: "10:00 AM", status: "confirmed" as const },
  { id: 2, doctor: "Dr. James Wilson", date: "2026-02-25", time: "2:30 PM", status: "pending" as const },
];

const specializations = ["All", "Cardiology", "Dermatology", "Infectious Disease", "General Medicine"];
const regions = ["All", "North Region", "South Region", "East Region", "West Region", "Central Region"];

export default function Appointments() {
  const [specFilter, setSpecFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const filteredDoctors = doctors.filter((d) => {
    if (specFilter !== "All" && d.specialization !== specFilter) return false;
    if (regionFilter !== "All" && d.region !== regionFilter) return false;
    return true;
  });

  const handleBook = () => {
    // API placeholder: POST /api/appointment/book
    setSelectedDoctor(null);
    setSelectedDate("");
  };

  const selectClass = "rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Appointments</h1>
        <p className="text-sm text-muted-foreground">Find a doctor and book your appointment</p>
      </div>

      {/* Upcoming Appointments */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold">Upcoming Appointments</h3>
        {upcomingAppointments.length === 0 ? (
          <EmptyState title="No upcoming appointments" description="Book an appointment below." icon={<Calendar className="h-6 w-6" />} />
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{appt.doctor}</p>
                  <p className="text-xs text-muted-foreground">{appt.date} at {appt.time}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Search */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" /> Find a Doctor
        </h3>
        <div className="mb-4 flex flex-wrap gap-3">
          <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} className={selectClass}>
            {specializations.map((s) => <option key={s} value={s}>{s === "All" ? "All Specializations" : s}</option>)}
          </select>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={selectClass}>
            {regions.map((r) => <option key={r} value={r}>{r === "All" ? "All Regions" : r}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">{doc.specialization} · {doc.region}</p>
                </div>
                <button
                  onClick={() => setSelectedDoctor(selectedDoctor === doc.id ? null : doc.id)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {selectedDoctor === doc.id ? "Close" : "View Slots"}
                </button>
              </div>

              {selectedDoctor === doc.id && (
                <div className="mt-3 pt-3 border-t animate-fade-in">
                  <p className="text-xs text-muted-foreground mb-2">Available dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.available.map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${selectedDate === date ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                  {selectedDate && (
                    <button
                      onClick={handleBook}
                      className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Book Appointment
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
