import { useMemo } from "react";
import { Package } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCartItems } from "@/store/cartSlice";
import type { Product } from "@/types/product";
import POSProductCard from "./POSProductCard";

interface POSProductGridProps {
  products: Product[];
  onProductTap: (product: Product) => void;
  searchQuery: string;
}

export default function POSProductGrid({
  products,
  onProductTap,
  searchQuery,
}: POSProductGridProps) {
  const cartItems = useAppSelector(selectCartItems);

  const cartMap = useMemo(
    () => new Map(cartItems.map((i) => [i.productId, i.qty])),
    [cartItems],
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Package className="h-10 w-10 opacity-30" />
        <p className="text-sm">No products yet. Add some in Products.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
        <p className="text-sm">No products match &ldquo;{searchQuery}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4">
      {filtered.map((product) => (
        <POSProductCard
          key={product.id}
          product={product}
          cartQty={cartMap.get(product.id) ?? 0}
          onTap={() => onProductTap(product)}
        />
      ))}
    </div>
  );
}
