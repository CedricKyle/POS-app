import { Package } from "lucide-react";
import { cn, formatQty } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { isWeightBased } from "@/store/cartSlice";
import type { Product } from "@/types/product";

interface POSProductCardProps {
  product: Product;
  cartQty: number;
  onTap: () => void;
}

export default function POSProductCard({
  product,
  cartQty,
  onTap,
}: POSProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isInCart = cartQty > 0;

  const originalQty = product.originalStock ?? product.stock;
  const stockRatio = originalQty > 0 ? product.stock / originalQty : 1;
  const isCritical = !isOutOfStock && stockRatio <= 0.1;
  const isLow = !isCritical && stockRatio <= 0.5;

  const stockVariant = isOutOfStock || isCritical ? "destructive" : "outline";
  const stockBadgeClass = isLow
    ? "bg-yellow-500/15 text-yellow-700 border-yellow-400 dark:text-yellow-400 dark:border-yellow-700"
    : undefined;

  const cartLabel = isWeightBased(product.unit)
    ? cartQty % 1 === 0
      ? cartQty.toFixed(1)
      : String(cartQty)
    : cartQty > 9
      ? "9+"
      : String(cartQty);

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={onTap}
      className={cn(
        "relative flex flex-col rounded-xl border bg-card text-left p-3 gap-2 w-full",
        "transition-all select-none active:scale-95",
        isOutOfStock
          ? "opacity-40 cursor-not-allowed"
          : "hover:border-primary/50 hover:shadow-sm active:bg-muted/40",
        isInCart && !isOutOfStock && "border-primary/70 bg-primary/5",
      )}
    >
      {/* Product image */}
      {product.imageBase64 ? (
        <img
          src={product.imageBase64}
          alt={product.name}
          className="w-full aspect-square object-cover rounded-lg"
        />
      ) : (
        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground opacity-30" />
        </div>
      )}

      {/* Name */}
      <p className="text-sm font-medium leading-tight line-clamp-2">
        {product.name}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-base font-semibold text-primary">
          ₱{product.price.toFixed(2)}
        </span>
        <span className="text-xs text-muted-foreground">/{product.unit}</span>
      </div>

      {/* Stock badge */}
      <Badge
        variant={stockVariant}
        className={cn("text-[10px] px-1.5 py-0.5 w-fit", stockBadgeClass)}
      >
        {isOutOfStock
          ? "Out of stock"
          : `${formatQty(product.stock, product.unit)} ${product.unit}`}
      </Badge>

      {/* In-cart indicator */}
      {isInCart && (
        <div className="absolute top-2 right-2 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {cartLabel}
        </div>
      )}
    </button>
  );
}
