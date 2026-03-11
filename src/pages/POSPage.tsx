import { ShoppingCart } from "lucide-react";

export default function POSPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground px-6">
      <ShoppingCart className="h-16 w-16 opacity-30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Point of Sale</h2>
        <p className="text-sm mt-1 max-w-xs">
          The POS screen is coming soon. Add products to cart, apply discounts,
          and process sales here.
        </p>
      </div>
    </div>
  );
}
