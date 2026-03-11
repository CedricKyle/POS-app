import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import {
  incrementQty,
  decrementQty,
  setQty,
  removeFromCart,
  setItemDiscount,
  isWeightBased,
} from "@/store/cartSlice";
import type { CartItem } from "@/types/product";

interface CartItemRowProps {
  item: CartItem;
  stock: number;
}

export default function CartItemRow({ item, stock }: CartItemRowProps) {
  const dispatch = useAppDispatch();
  const [editingQty, setEditingQty] = useState(false);
  const [qtyInput, setQtyInput] = useState(String(item.qty));
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState(
    item.discount > 0 ? String(item.discount) : "",
  );

  const weightBased = isWeightBased(item.unit);
  const subtotal = item.price * item.qty;

  const formatQty = (q: number) =>
    weightBased ? (q % 1 === 0 ? q.toFixed(1) : String(q)) : String(q);

  const handleQtyBlur = () => {
    const parsed = parseFloat(qtyInput);
    if (!isNaN(parsed) && parsed > 0) {
      dispatch(
        setQty({ productId: item.productId, qty: Math.min(parsed, stock) }),
      );
    } else {
      dispatch(removeFromCart(item.productId));
    }
    setEditingQty(false);
  };

  const handleDiscountBlur = () => {
    const val = Math.max(0, parseFloat(discountInput) || 0);
    dispatch(setItemDiscount({ productId: item.productId, discount: val }));
    setEditingDiscount(false);
  };

  return (
    <div className="py-3 border-b last:border-b-0">
      {/* Name + subtotal */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ₱{item.price.toFixed(2)} / {item.unit}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold">₱{subtotal.toFixed(2)}</p>
          {item.discount > 0 && (
            <p className="text-xs text-green-600">
              −₱{item.discount.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* − */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => dispatch(decrementQty(item.productId))}
        >
          <Minus className="h-3 w-3" />
        </Button>

        {/* Qty */}
        {editingQty ? (
          <Input
            type="number"
            className="h-8 w-16 text-center text-sm px-1"
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onBlur={handleQtyBlur}
            onKeyDown={(e) => e.key === "Enter" && handleQtyBlur()}
            autoFocus
            min={weightBased ? 0.1 : 1}
            step={weightBased ? 0.1 : 1}
          />
        ) : (
          <button
            type="button"
            className="h-8 min-w-12 px-2 text-sm font-medium border rounded-md bg-background text-center"
            onClick={() => {
              setQtyInput(String(item.qty));
              setEditingQty(true);
            }}
          >
            {formatQty(item.qty)}
          </button>
        )}

        {/* + */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={item.qty >= stock}
          onClick={() =>
            dispatch(incrementQty({ productId: item.productId, stock }))
          }
        >
          <Plus className="h-3 w-3" />
        </Button>

        {/* Per-item discount */}
        {editingDiscount ? (
          <Input
            type="number"
            placeholder="₱ off"
            className="h-8 w-20 text-sm text-center ml-auto px-1"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            onBlur={handleDiscountBlur}
            onKeyDown={(e) => e.key === "Enter" && handleDiscountBlur()}
            autoFocus
            min={0}
            step={1}
          />
        ) : (
          <button
            type="button"
            className="ml-auto h-8 px-2 text-xs text-muted-foreground border rounded-md bg-background hover:text-foreground transition-colors"
            onClick={() => {
              setDiscountInput(item.discount > 0 ? String(item.discount) : "");
              setEditingDiscount(true);
            }}
          >
            {item.discount > 0 ? `−₱${item.discount}` : "Disc."}
          </button>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
          onClick={() => dispatch(removeFromCart(item.productId))}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
