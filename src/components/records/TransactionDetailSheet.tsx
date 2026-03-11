import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { fetchCustomerName } from "@/services/recordsService";
import { useAuth } from "@/hooks/useAuth";
import { formatQty } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  transactionNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TransactionDetailSheet({
  transaction,
  transactionNumber,
  open,
  onOpenChange,
}: TransactionDetailSheetProps) {
  const { appUser } = useAuth();
  const [customerData, setCustomerData] = useState<{
    txId: string;
    name: string | null;
  } | null>(null);

  // Derive the customer name only if it belongs to the current transaction
  const customerName =
    customerData != null && customerData.txId === transaction?.id
      ? customerData.name
      : null;

  // Fetch customer name when the sheet opens for an utang transaction
  useEffect(() => {
    if (!open || !transaction || !appUser) return;
    if (transaction.paymentType !== "utang" || !transaction.customerId) return;

    let cancelled = false;
    fetchCustomerName(appUser.uid, transaction.customerId).then((name) => {
      if (!cancelled) setCustomerData({ txId: transaction.id, name });
    });
    return () => {
      cancelled = true;
    };
  }, [open, transaction, appUser]);

  if (!transaction) return null;

  const date = parseISO(transaction.createdAt);
  const dateStr = format(date, "MMM d, yyyy — h:mm a");

  const subtotal = transaction.items.reduce((sum, item) => {
    const itemSubtotal = item.price * item.qty - item.discount;
    return sum + itemSubtotal;
  }, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85svh] overflow-y-auto rounded-t-2xl pb-6 pl-3 pr-3"
      >
        <SheetHeader className="text-left px-1 pb-2">
          <SheetTitle className="text-base">
            Transaction #{String(transactionNumber).padStart(4, "0")}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </SheetHeader>

        <Separator className="my-3" />

        {/* Items table */}
        <div className="flex flex-col gap-2 px-1">
          {transaction.items.map((item) => {
            const itemTotal = item.price * item.qty - item.discount;
            return (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{item.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {formatQty(item.qty, item.unit)} {item.unit} ×{" "}
                    {formatCurrency(item.price)}
                    {item.discount > 0 && (
                      <span className="text-amber-600 ml-1">
                        − {formatCurrency(item.discount)}
                      </span>
                    )}
                  </p>
                </div>
                <span className="font-medium shrink-0">
                  {formatCurrency(itemTotal)}
                </span>
              </div>
            );
          })}
        </div>

        <Separator className="my-3" />

        {/* Totals */}
        <div className="flex flex-col gap-1.5 px-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {transaction.discount > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Discount</span>
              <span>− {formatCurrency(transaction.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Payment info */}
        <div className="flex items-center gap-2 px-1 text-sm">
          <span className="text-muted-foreground">Payment Type:</span>
          <Badge
            variant={
              transaction.paymentType === "cash" ? "secondary" : "outline"
            }
            className={
              transaction.paymentType === "utang"
                ? "border-amber-500 text-amber-600 bg-amber-50"
                : ""
            }
          >
            {transaction.paymentType === "cash" ? "Cash" : "Utang"}
          </Badge>
          {transaction.paymentType === "utang" && customerName && (
            <span className="text-muted-foreground">— {customerName}</span>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
