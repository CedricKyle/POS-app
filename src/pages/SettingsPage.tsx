import { Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Configure your store and manage accounts.
      </p>

      <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
        {/* User Management */}
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-sm">User Management</p>
              <p className="text-xs text-muted-foreground">
                Add, edit, or remove cashier and manager accounts.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/users">Manage</Link>
          </Button>
        </div>

        <Separator />

        {/* Store settings placeholder */}
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-sm">Store Settings</p>
              <p className="text-xs text-muted-foreground">
                Store name, logo, and categories — coming soon.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
