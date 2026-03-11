import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
  onClick: (tx: Transaction) => void;
}

export default function TransactionCard({
  transaction,
  index,
  onClick,
}: TransactionCardProps) {
  const date = parseISO(transaction.createdAt);
  const time = format(date, "h:mm a");

  return (
    <button
      type="button"
      onClick={() => onClick(transaction)}
      className="w-full text-left rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors active:scale-[0.99]"
    >
      {/* Transaction number */}
      <span className="text-xs font-mono text-muted-foreground shrink-0 w-16">
        #{String(index + 1).padStart(4, "0")}
      </span>

      {/* Payment type badge */}
      <Badge
        variant={transaction.paymentType === "cash" ? "secondary" : "outline"}
        className={
          transaction.paymentType === "utang"
            ? "border-amber-500 text-amber-600 bg-amber-50"
            : ""
        }
      >
        {transaction.paymentType === "cash" ? "Cash" : "Utang"}
      </Badge>

      {/* Total */}
      <span className="flex-1 min-w-0 text-sm font-semibold tabular-nums">
        {formatCurrency(transaction.total)}
      </span>

      {/* Time */}
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>

      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}
