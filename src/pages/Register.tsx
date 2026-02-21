import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const regions = ["North Region", "South Region", "East Region", "West Region", "Central Region"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", dob: "", gender: "", bloodGroup: "", region: "", password: "", confirmPassword: ""
  });
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const inputClass = "mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join HealthIQ today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="John Doe" required />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="+1 234 567 890" required />
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="text-sm font-medium">Gender</label>
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inputClass} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Blood Group</label>
              <select value={form.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)} className={inputClass} required>
                <option value="">Select</option>
                {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Region</label>
            <select value={form.region} onChange={(e) => update("region", e.target.value)} className={inputClass} required>
              <option value="">Select region</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className={inputClass} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Create Account
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
