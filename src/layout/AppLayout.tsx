import type { ReactNode } from "react";
import AppHeader from "./AppHeader";
import QuickNav from "./QuickNav";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  return (
    <div className="h-svh flex flex-col bg-background">
      <AppHeader pageTitle={pageTitle} />
      {/* Only this area scrolls — header and QuickNav stay fixed */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
        {/* Spacer so content doesn't slide under the fixed QuickNav */}
        <div
          className="h-16 shrink-0"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        />
      </div>
      <QuickNav />
      <Toaster position="top-center" />
    </div>
  );
}
