import { Wallet } from "lucide-react";

export default function LoanPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground px-6">
      <Wallet className="h-16 w-16 opacity-30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Loan (Utang)</h2>
        <p className="text-sm mt-1 max-w-xs">
          Credit tracking, outstanding balances, and payment history per
          customer is coming soon.
        </p>
      </div>
    </div>
  );
}
