import { Banknote, BookOpen, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RecordsSummaryBarProps {
  cash: number;
  utang: number;
  grand: number;
}

export default function RecordsSummaryBar({
  cash,
  utang,
  grand,
}: RecordsSummaryBarProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3 grid grid-cols-3 text-center">
      <div className="flex flex-col items-center gap-1 px-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Banknote className="h-3.5 w-3.5 shrink-0" />
          <span>Cash</span>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-green-600 tabular-nums">
          {formatCurrency(cash)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 px-1 border-x border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          <span>Utang</span>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-amber-600 tabular-nums">
          {formatCurrency(utang)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 px-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Wallet className="h-3.5 w-3.5 shrink-0" />
          <span>Total</span>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-primary tabular-nums">
          {formatCurrency(grand)}
        </span>
      </div>
    </div>
  );
}
