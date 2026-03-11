import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/layout/AppLayout";
import { Spinner, ProtectedRoute, ManagerRoute } from "./Guards";

// Pages
import LoginPage from "@/pages/LoginPage";
import POSPage from "@/pages/POSPage";
import ProductManagement from "@/pages/ProductManagement";
import RecordsPage from "@/pages/RecordsPage";
import LoanPage from "@/pages/LoanPage";
import SettingsPage from "@/pages/SettingsPage";
import UserManagement from "@/pages/UserManagement";

export default function AppRoutes() {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* ── Public ── */}
      <Route
        path="/login"
        element={firebaseUser ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* ── Cashier + Manager ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout pageTitle="POS">
              <POSPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppLayout pageTitle="Products">
              <ProductManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Manager only ── */}
      <Route
        path="/records"
        element={
          <ManagerRoute>
            <AppLayout pageTitle="Records">
              <RecordsPage />
            </AppLayout>
          </ManagerRoute>
        }
      />
      <Route
        path="/loan"
        element={
          <ManagerRoute>
            <AppLayout pageTitle="Loan">
              <LoanPage />
            </AppLayout>
          </ManagerRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ManagerRoute>
            <AppLayout pageTitle="Settings">
              <SettingsPage />
            </AppLayout>
          </ManagerRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ManagerRoute>
            <AppLayout pageTitle="User Management">
              <UserManagement />
            </AppLayout>
          </ManagerRoute>
        }
      />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
