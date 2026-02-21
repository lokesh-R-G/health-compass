import { useAuth } from "@/contexts/AuthContext";
import PatientDashboard from "@/pages/PatientDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  switch (role) {
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <PatientDashboard />;
  }
}
