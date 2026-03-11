import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Package,
  ClipboardList,
  Wallet,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// ─── Nav item config ─────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  managerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "POS", icon: ShoppingCart, to: "/" },
  { label: "Products", icon: Package, to: "/products" },
  { label: "Records", icon: ClipboardList, to: "/records", managerOnly: true },
  { label: "Loan", icon: Wallet, to: "/loan", managerOnly: true },
  { label: "Settings", icon: Settings, to: "/settings", managerOnly: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuickNav() {
  const { appUser } = useAuth();
  const location = useLocation();

  const isManager = appUser?.role === "manager";

  const items = NAV_ITEMS.filter((item) => !item.managerOnly || isManager);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="h-16 flex items-center justify-around max-w-2xl mx-auto px-2">
        {items.map(({ label, icon: Icon, to }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-14 select-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Active indicator bar */}
              <span
                className={cn(
                  "absolute -top-px h-0.5 w-6 rounded-full bg-primary transition-opacity",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                className="h-5.5 w-5.5 shrink-0"
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
