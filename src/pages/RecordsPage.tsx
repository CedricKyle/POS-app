import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchTransactions,
  setFilterMode,
  setCustomRange,
  selectRecordsFilter,
  selectRecordsStatus,
  selectGroupedByDate,
  selectSummaryTotals,
} from "@/store/recordsSlice";
import RecordsFilterTabs from "@/components/records/RecordsFilterTabs";
import DateRangePicker from "@/components/records/DateRangePicker";
import RecordsSummaryBar from "@/components/records/RecordsSummaryBar";
import TransactionGroup from "@/components/records/TransactionGroup";
import TransactionDetailSheet from "@/components/records/TransactionDetailSheet";
import type { Transaction } from "@/types/transaction";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function RecordsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-9 rounded-lg bg-muted" />
      <div className="h-16 rounded-xl bg-muted" />
      <div className="h-20 rounded-xl bg-muted" />
      <div className="h-14 rounded-xl bg-muted" />
      <div className="h-14 rounded-xl bg-muted" />
      <div className="h-14 rounded-xl bg-muted" />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <ClipboardList className="h-12 w-12 opacity-25" />
      <p className="text-sm font-medium">No transactions found</p>
      <p className="text-xs max-w-xs text-center">
        Try a different date range or switch to a broader filter.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecordsPage() {
  const dispatch = useAppDispatch();
  const { appUser } = useAuth();

  const filter = useAppSelector(selectRecordsFilter);
  const status = useAppSelector(selectRecordsStatus);
  const groupedByDate = useAppSelector(selectGroupedByDate);
  const totals = useAppSelector(selectSummaryTotals);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedTxNumber, setSelectedTxNumber] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch once on mount (re-fetch if the user somehow changes)
  useEffect(() => {
    if (appUser && status === "idle") {
      dispatch(fetchTransactions(appUser.uid));
    }
  }, [appUser, dispatch, status]);

  const handleSelectTx = (tx: Transaction, number: number) => {
    setSelectedTx(tx);
    setSelectedTxNumber(number);
    setSheetOpen(true);
  };

  const dateGroups = Object.entries(groupedByDate);

  // Build cumulative offsets so transaction numbers are globally sequential
  const offsets: Record<string, number> = {};
  let offset = 0;
  for (const [date, txs] of dateGroups) {
    offsets[date] = offset;
    offset += txs.length;
  }

  const isLoading = status === "loading";
  const isEmpty = !isLoading && dateGroups.length === 0;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-4">
      {/* Filter tabs */}
      <RecordsFilterTabs
        mode={filter.mode}
        onChange={(mode) => dispatch(setFilterMode(mode))}
      />

      {/* Custom date range picker */}
      <DateRangePicker
        from={filter.from}
        to={filter.to}
        onChange={(from, to) => dispatch(setCustomRange({ from, to }))}
      />

      {/* Summary bar (manager only) */}
      <RecordsSummaryBar
        cash={totals.cash}
        utang={totals.utang}
        grand={totals.grand}
      />

      {/* Transaction list */}
      {isLoading ? (
        <RecordsSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-5">
          {dateGroups.map(([date, transactions]) => (
            <TransactionGroup
              key={date}
              date={date}
              transactions={transactions}
              globalOffset={offsets[date]}
              onSelect={(tx) =>
                handleSelectTx(tx, offsets[date] + transactions.indexOf(tx) + 1)
              }
            />
          ))}
        </div>
      )}

      {/* Transaction detail sheet */}
      <TransactionDetailSheet
        transaction={selectedTx}
        transactionNumber={selectedTxNumber}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
