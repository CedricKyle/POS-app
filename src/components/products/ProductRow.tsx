import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { cn, formatQty } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

interface ProductRowProps {
  product: Product;
  isManager: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductRow({
  product,
  isManager,
  onEdit,
  onDelete,
}: ProductRowProps) {
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
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
      {/* Thumbnail */}
      <div className="w-10 h-10 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
        {product.imageBase64 ? (
          <img
            src={product.imageBase64}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground select-none">
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">
          {product.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {product.category}
        </p>
      </div>

      {/* Price */}
      <span className="font-semibold text-sm whitespace-nowrap">
        {formatCurrency(product.price)}
      </span>

      {/* Stock badge */}
      <Badge
        variant={stockVariant}
        className={cn("text-[10px] px-1.5 py-0.5 shrink-0", stockBadgeClass)}
      >
        {product.stock === 0
          ? "Out"
          : `${formatQty(product.stock, product.unit)} ${product.unit}`}
      </Badge>

      {/* Actions (manager only) */}
      {isManager && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onEdit(product)}
            aria-label="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(product)}
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
