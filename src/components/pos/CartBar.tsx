import { ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCartGrandTotal, selectItemCount } from "@/store/cartSlice";

interface CartBarProps {
  onOpen: () => void;
}

export default function CartBar({ onOpen }: CartBarProps) {
  const itemCount = useAppSelector(selectItemCount);
  const grandTotal = useAppSelector(selectCartGrandTotal);

  return (
    <div
      className="fixed inset-x-0 z-40 px-4 pointer-events-none mb-2"
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto w-full flex items-center gap-3 px-4 py-3 bg-white text-black rounded-2xl shadow-lg active:scale-[0.98] transition-transform select-none"
      >
        {/* Cart icon with badge */}
        <div className="relative shrink-0">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 h-4 min-w-4 px-0.5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </div>

        <span className="flex-1 text-left text-sm font-medium">
          {itemCount === 0
            ? "Cart is empty"
            : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
        </span>

        {itemCount > 0 && (
          <span className="text-sm font-semibold">
            ₱{grandTotal.toFixed(2)}
          </span>
        )}
      </button>
    </div>
  );
}
