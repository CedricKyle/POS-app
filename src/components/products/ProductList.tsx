import { PackageSearch } from "lucide-react";
import ProductRow from "./ProductRow";
import type { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
  isManager: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductList({
  products,
  isManager,
  onEdit,
  onDelete,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <PackageSearch className="h-12 w-12 opacity-40" />
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border mx-4 rounded-lg border border-border overflow-hidden">
      {products.map((product) => (
        <ProductRow
          key={product.id}
          product={product}
          isManager={isManager}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
