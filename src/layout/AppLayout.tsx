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
    <div className="min-h-svh flex flex-col bg-background">
      <AppHeader pageTitle={pageTitle} />
      <div className="flex-1">{children}</div>
      {/* Spacer so body content doesn't slide under the fixed QuickNav */}
      <div
        className="h-16 shrink-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      />
      <QuickNav />
      <Toaster position="top-center" />
    </div>
  );
}
