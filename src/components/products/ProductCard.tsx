import { useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/product";
import { cn, formatQty } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

interface ProductCardProps {
  product: Product;
  isManager: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({
  product,
  isManager,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    if (!isManager) return;
    longPressTimer.current = setTimeout(() => onDelete(product), 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const originalQty = product.originalStock ?? product.stock;
  const stockRatio = originalQty > 0 ? product.stock / originalQty : 1;
  const isOut = product.stock === 0;
  const isCritical = !isOut && stockRatio <= 0.1;
  const isLow = !isCritical && stockRatio <= 0.5;

  const stockVariant = isOut || isCritical ? "destructive" : "outline";
  const stockBadgeClass = isLow
    ? "bg-yellow-500/15 text-yellow-700 border-yellow-400 dark:text-yellow-400 dark:border-yellow-700"
    : undefined;

  return (
    <Card
      className="relative overflow-hidden cursor-pointer select-none active:scale-[0.98] transition-transform"
      onClick={() => isManager && onEdit(product)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        {/* Product image */}
        {product.imageBase64 && (
          <div className="w-full aspect-square overflow-hidden rounded-md bg-muted">
            <img
              src={product.imageBase64}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Top row: category + manager actions */}
        <div className="flex items-start justify-between gap-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
            {product.category}
          </span>
          {isManager && (
            <div
              className="flex gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => onEdit(product)}
                aria-label="Edit product"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => onDelete(product)}
                aria-label="Delete product"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Name */}
        <p className="font-semibold text-sm leading-snug line-clamp-2">
          {product.name}
        </p>

        {/* Price + stock */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="font-bold text-base">
            {formatCurrency(product.price)}
          </span>
          <Badge
            variant={stockVariant}
            className={cn("text-[10px] px-1.5 py-0.5", stockBadgeClass)}
          >
            {product.stock === 0
              ? "Out"
              : `${formatQty(product.stock, product.unit)} ${product.unit}`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
