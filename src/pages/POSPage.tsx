import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/cartSlice";
import { fetchProducts } from "@/store/productsSlice";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types/product";
import POSProductGrid from "@/components/pos/POSProductGrid";
import CartBar from "@/components/pos/CartBar";
import CartSheet from "@/components/pos/CartSheet";

export default function POSPage() {
  const dispatch = useAppDispatch();
  const { appUser } = useAuth();

  const products = useAppSelector((s) => s.products.items);
  const productsStatus = useAppSelector((s) => s.products.status);

  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch products if they haven't been loaded yet
  useEffect(() => {
    if (appUser && productsStatus === "idle") {
      dispatch(fetchProducts(appUser.uid));
    }
  }, [appUser, productsStatus, dispatch]);

  const productStockMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.stock])),
    [products],
  );

  const handleProductTap = (product: Product) => {
    dispatch(addToCart(product));
  };

  return (
    <>
      {/* Sticky search bar — sits below the AppHeader (sticky top-0 z-40) */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b px-3 py-2">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search products…"
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Product grid — extra bottom padding to clear CartBar */}
      <div className="pb-24">
        <POSProductGrid
          products={products}
          onProductTap={handleProductTap}
          searchQuery={searchQuery}
        />
      </div>

      {/* Sticky cart summary bar above QuickNav */}
      <CartBar onOpen={() => setCartOpen(true)} />

      {/* Cart bottom sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        productStockMap={productStockMap}
      />
    </>
  );
}
