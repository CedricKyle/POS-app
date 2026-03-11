import { useEffect, useMemo, useState } from "react";
import { Plus, LayoutGrid, List, Search, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/store/productsSlice";

import { useDebounce } from "@/hooks/useDebounce";
import ProductGrid from "@/components/products/ProductGrid";
import ProductList from "@/components/products/ProductList";
import ProductFormSheet from "@/components/products/ProductFormSheet";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";

import type { Product, ProductFormData } from "@/types/product";

// Default categories — replace with a settings-driven list when available
const DEFAULT_CATEGORIES = [
  "Beverages",
  "Snacks",
  "Condiments",
  "Canned Goods",
  "Personal Care",
  "Household",
  "Others",
];

type ViewMode = "grid" | "list";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductManagement() {
  const { appUser } = useAuth();
  const dispatch = useAppDispatch();
  const { items: products, status, error } = useAppSelector((s) => s.products);

  const isManager = appUser?.role === "manager";
  const uid = appUser?.uid ?? "";

  // ── Load products on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (uid && status === "idle") {
      dispatch(fetchProducts(uid));
    }
  }, [uid, status, dispatch]);

  // ── View mode ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // ── Search & category filter ───────────────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Derive categories from loaded products (+ defaults)
  const categories = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const merged = Array.from(
      new Set([...DEFAULT_CATEGORIES, ...fromProducts]),
    );
    return merged.sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory
        ? p.category === activeCategory
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  // ── Form sheet state ───────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openAdd = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  // ── Delete dialog state ────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: ProductFormData) => {
    if (!uid) return;
    try {
      if (editingProduct) {
        await dispatch(
          updateProduct({ uid, productId: editingProduct.id, data }),
        ).unwrap();
        toast.success("Product updated.");
      } else {
        await dispatch(addProduct({ uid, data })).unwrap();
        toast.success("Product added.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      throw new Error("Submit failed"); // keep sheet open
    }
  };

  const handleDeleteConfirm = async () => {
    if (!uid || !deletingProduct) return;
    await dispatch(
      deleteProduct({ uid, productId: deletingProduct.id }),
    ).unwrap();
    toast.success("Product deleted.");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Sticky top bar ── */}
      <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 h-9"
              placeholder="Search products…"
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-md border border-border overflow-hidden shrink-0">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              className="rounded-none h-9 w-9 px-0"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              className="rounded-none h-9 w-9 px-0"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add button — manager only */}
          {isManager && (
            <Button
              size="sm"
              className="gap-1.5 shrink-0 h-9"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>

        {/* Category pills */}
        <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          <Badge
            variant={activeCategory === null ? "default" : "outline"}
            className="cursor-pointer shrink-0 select-none"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer shrink-0 select-none"
              onClick={() =>
                setActiveCategory((prev) => (prev === cat ? null : cat))
              }
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto">
        {/* Loading state */}
        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground text-sm">
            <Package className="h-5 w-5 animate-pulse" />
            Loading products…
          </div>
        )}

        {/* Error state */}
        {status === "failed" && (
          <div className="m-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error ?? "Failed to load products."}
          </div>
        )}

        {/* Product list/grid */}
        {status === "succeeded" &&
          (viewMode === "grid" ? (
            <ProductGrid
              products={filtered}
              isManager={isManager}
              onEdit={openEdit}
              onDelete={openDeleteDialog}
            />
          ) : (
            <div className="py-4">
              <ProductList
                products={filtered}
                isManager={isManager}
                onEdit={openEdit}
                onDelete={openDeleteDialog}
              />
            </div>
          ))}
      </main>

      {/* ── Add / Edit sheet ── */}
      <ProductFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={editingProduct}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      {/* ── Delete dialog ── */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={deletingProduct}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
