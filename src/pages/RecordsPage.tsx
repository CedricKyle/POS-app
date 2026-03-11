import { ClipboardList } from "lucide-react";

export default function RecordsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground px-6">
      <ClipboardList className="h-16 w-16 opacity-30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Records</h2>
        <p className="text-sm mt-1 max-w-xs">
          Full transaction history with date filtering and per-transaction
          breakdowns is coming soon.
        </p>
      </div>
    </div>
  );
}
