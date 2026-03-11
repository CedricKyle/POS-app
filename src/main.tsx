import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./assets/index.css";
import { store } from "./store/store";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./router/AppRoutes";

// ─── Root ─────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
