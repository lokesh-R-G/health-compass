import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-slide-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">HealthIQ</h1>
        <p className="mb-8 text-muted-foreground">Regional Health Intelligence & Emergency Medical System</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
