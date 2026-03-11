import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartDiscount,
  selectCartGrandTotal,
  selectOrderDiscount,
  selectPaymentType,
  selectCustomerId,
  setOrderDiscount,
  setPaymentType,
  clearCart,
} from "@/store/cartSlice";
import { deductStock } from "@/store/productsSlice";
import { checkout } from "@/services/checkoutService";
import { useAuth } from "@/hooks/useAuth";
import CartItemRow from "./CartItemRow";
import CustomerSelector from "./CustomerSelector";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  productStockMap: Map<string, number>;
}

export default function CartSheet({
  open,
  onClose,
  productStockMap,
}: CartSheetProps) {
  const dispatch = useAppDispatch();
  const { appUser } = useAuth();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalDiscount = useAppSelector(selectCartDiscount);
  const grandTotal = useAppSelector(selectCartGrandTotal);
  const orderDiscount = useAppSelector(selectOrderDiscount);
  const paymentType = useAppSelector(selectPaymentType);
  const customerId = useAppSelector(selectCustomerId);

  const [orderDiscountInput, setOrderDiscountInput] = useState(
    orderDiscount > 0 ? String(orderDiscount) : "",
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const cashInputRef = useRef<HTMLInputElement>(null);

  const cashReceived = parseFloat(cashInput) || 0;
  const change = cashReceived - grandTotal;

  // Auto-focus cash input when dialog opens
  useEffect(() => {
    if (confirmOpen) {
      setCashInput("");
      setTimeout(() => cashInputRef.current?.focus(), 80);
    }
  }, [confirmOpen]);

  const canCheckout =
    items.length > 0 &&
    !isCheckingOut &&
    (paymentType === "cash" || (paymentType === "utang" && !!customerId));

  const canConfirm =
    !isCheckingOut && (paymentType === "utang" || cashReceived >= grandTotal);

  const handleOrderDiscountBlur = () => {
    const val = Math.max(0, parseFloat(orderDiscountInput) || 0);
    dispatch(setOrderDiscount(val));
  };

  // Opens the confirmation dialog
  const handleCheckoutClick = () => {
    if (!canCheckout) return;
    setConfirmOpen(true);
  };

  // Fires after user confirms in the dialog
  const handleConfirm = async () => {
    if (!appUser || !canConfirm) return;
    setIsCheckingOut(true);
    try {
      await checkout({
        uid: appUser.uid,
        items,
        subtotal,
        discount: totalDiscount,
        orderDiscount,
        paymentType,
        customerId,
      });
      // Update Redux stock immediately so the product grid reflects the sale
      dispatch(
        deductStock(items.map((i) => ({ productId: i.productId, qty: i.qty }))),
      );
      dispatch(clearCart());
      setOrderDiscountInput("");
      setConfirmOpen(false);
      onClose();
      toast.success("Checkout complete!", {
        description: `₱${grandTotal.toFixed(2)} · ${paymentType === "cash" ? "Cash" : "Utang"}`,
      });
    } catch (err) {
      toast.error("Checkout failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[90svh] flex flex-col gap-0 p-0 rounded-t-2xl"
        >
          <SheetHeader className="px-4 pt-5 pb-3 pr-12">
            <SheetTitle className="flex items-center gap-2 text-base">
              🛒 Cart
              {items.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length} item{items.length > 1 ? "s" : ""})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <Separator />

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16 text-muted-foreground text-sm">
              Cart is empty — tap a product to add it.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Cart items */}
              <div className="px-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    stock={productStockMap.get(item.productId) ?? item.qty}
                  />
                ))}
              </div>

              <Separator className="mt-1" />

              {/* Order-level discount */}
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="text-sm flex-1 text-muted-foreground">
                  Order Discount
                </span>
                <Input
                  type="number"
                  placeholder="₱0"
                  className="h-8 w-28 text-right text-sm"
                  value={orderDiscountInput}
                  onChange={(e) => setOrderDiscountInput(e.target.value)}
                  onBlur={handleOrderDiscountBlur}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleOrderDiscountBlur()
                  }
                  min={0}
                />
              </div>

              <Separator />

              {/* Summary */}
              <div className="px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−₱{totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-1 border-t">
                  <span>Total</span>
                  <span>₱{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Payment type */}
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                  Payment
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={paymentType === "cash" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => dispatch(setPaymentType("cash"))}
                  >
                    Cash
                  </Button>
                  <Button
                    variant={paymentType === "utang" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => dispatch(setPaymentType("utang"))}
                  >
                    Utang
                  </Button>
                </div>
              </div>

              {/* Customer selector — utang only */}
              {paymentType === "utang" && (
                <div className="px-4 pb-2">
                  <CustomerSelector />
                </div>
              )}

              {/* Checkout button */}
              <div
                className="px-4 pt-2 pb-6"
                style={{
                  paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
                }}
              >
                <Button
                  className="w-full h-12 text-base font-semibold"
                  disabled={!canCheckout}
                  onClick={handleCheckoutClick}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    `Checkout — ₱${grandTotal.toFixed(2)}`
                  )}
                </Button>
                {paymentType === "utang" && !customerId && (
                  <p className="text-xs text-destructive text-center mt-2">
                    Select a customer to enable checkout
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Checkout Confirmation Dialog ─────────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(v) => !isCheckingOut && setConfirmOpen(v)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Checkout</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Order total */}
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold">
                ₱{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Cash received — only relevant for cash payments */}
            {paymentType === "cash" && (
              <>
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    htmlFor="cash-received"
                  >
                    Cash Received
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₱
                    </span>
                    <Input
                      ref={cashInputRef}
                      id="cash-received"
                      type="number"
                      placeholder="0.00"
                      className="pl-7 text-lg h-11"
                      value={cashInput}
                      min={0}
                      step={1}
                      onChange={(e) => setCashInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && canConfirm && handleConfirm()
                      }
                    />
                  </div>
                </div>

                {/* Change */}
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span className="text-sm text-muted-foreground">Change</span>
                  <span
                    className={
                      cashReceived > 0 && change < 0
                        ? "text-destructive font-semibold text-lg"
                        : "font-semibold text-lg"
                    }
                  >
                    {cashReceived === 0
                      ? "—"
                      : change < 0
                        ? `−₱${Math.abs(change).toFixed(2)}`
                        : `₱${change.toFixed(2)}`}
                  </span>
                </div>

                {cashReceived > 0 && change < 0 && (
                  <p className="text-xs text-destructive text-center -mt-2">
                    Cash received is less than the total.
                  </p>
                )}
              </>
            )}

            {/* Utang: just confirm */}
            {paymentType === "utang" && (
              <p className="text-sm text-muted-foreground text-center">
                This will be recorded as credit (utang).
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isCheckingOut}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing…
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
