import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./assets/index.css";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/UserManagement";

// ─── Protected Route ──────────────────────────────────────────────────────────
// Redirects to /login if the user is not authenticated.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  const { firebaseUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  return (
    <Routes>
      {/* If already logged in, redirect / to the user management page */}
      <Route
        path="/"
        element={
          firebaseUser ? (
            <Navigate to="/users" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public */}
      <Route
        path="/login"
        element={
          firebaseUser ? <Navigate to="/users" replace /> : <LoginPage />
        }
      />

      {/* Protected */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
