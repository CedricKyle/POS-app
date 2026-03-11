import TransactionCard from "./TransactionCard";
import type { Transaction } from "@/types/transaction";

interface TransactionGroupProps {
  date: string;
  transactions: Transaction[];
  globalOffset: number;
  onSelect: (tx: Transaction) => void;
}

export default function TransactionGroup({
  date,
  transactions,
  globalOffset,
  onSelect,
}: TransactionGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Date header */}
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
        {date}
      </h3>

      {/* Transaction cards */}
      {transactions.map((tx, i) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          index={globalOffset + i}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
