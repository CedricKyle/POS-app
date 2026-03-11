import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// ─── Loading spinner ──────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      Loading…
    </div>
  );
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Redirect unauthenticated users to /login.

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── ManagerRoute ─────────────────────────────────────────────────────────────
// Redirect unauthenticated users to /login; cashiers to /.

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (appUser && appUser.role !== "manager") return <Navigate to="/" replace />;
  return <>{children}</>;
}
