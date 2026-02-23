import { useState, useEffect } from "react";
import { Calendar, Search, Loader2, AlertCircle, X } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/StateDisplays";
import { appointmentService } from "@/services/appointmentService";
import { doctorService } from "@/services/doctorService";
import type { Appointment, Doctor } from "@/types";

const specializations = ["All", "General Physician", "Internal Medicine", "Cardiology", "Dermatology"];
const regions = ["All", "Chennai_South", "Chennai_Central", "Coimbatore"];

export default function Appointments() {
  const [specFilter, setSpecFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appointmentsData, doctorsData] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getDoctorsList(),
      ]);

      setAppointments(appointmentsData);
      setDoctors(doctorsData);
    } catch (err: any) {
      console.error("Failed to fetch appointments data:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    if (specFilter !== "All" && d.specialization !== specFilter) return false;
    if (regionFilter !== "All" && d.region !== regionFilter) return false;
    return true;
  });

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    try {
      setBooking(true);
      const newAppointment = await appointmentService.bookAppointment({
        doctor_id: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        reason,
      });
      setAppointments((prev) => [...prev, newAppointment]);
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
      setReason("");
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      alert(err.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setCanceling(appointmentId);
      await appointmentService.cancelAppointment(appointmentId);
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCanceling(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const selectClass = "rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Error Loading Appointments
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
        <h1 className="text-xl font-bold">Appointments</h1>
        <p className="text-sm text-muted-foreground">Find a doctor and book your appointment</p>
      </div>

      {/* Upcoming Appointments */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold">Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <EmptyState title="No upcoming appointments" description="Book an appointment below." icon={<Calendar className="h-6 w-6" />} />
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{appt.doctor_name || "Doctor"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(appt.date)} at {appt.time}</p>
                  {appt.reason && <p className="text-xs text-muted-foreground">{appt.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={appt.status} />
                  {appt.status === "pending" && (
                    <button
                      onClick={() => handleCancel(appt._id!)}
                      disabled={canceling === appt._id}
                      className="rounded-md bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      {canceling === appt._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
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

        {filteredDoctors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doctors found matching your criteria</p>
        ) : (
          <div className="space-y-3">
            {filteredDoctors.map((doc) => (
              <div key={doc._id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.specialization} · {doc.region}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(selectedDoctor === doc._id ? null : doc._id!)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    {selectedDoctor === doc._id ? "Close" : "Book"}
                  </button>
                </div>

                {selectedDoctor === doc._id && (
                  <div className="mt-3 pt-3 border-t animate-fade-in">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Time</label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select time</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground">Reason (optional)</label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Brief description of your visit"
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {selectedDate && selectedTime && (
                      <button
                        onClick={handleBook}
                        disabled={booking}
                        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {booking && <Loader2 className="h-4 w-4 animate-spin" />}
                        Book Appointment
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
