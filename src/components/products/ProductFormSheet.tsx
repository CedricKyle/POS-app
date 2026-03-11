import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, ProductFormData, ProductUnit } from "@/types/product";
import { isWeightBased } from "@/lib/utils";

// ─── Image helpers ────────────────────────────────────────────────────────────

function compressImageToBase64(
  file: File,
  maxPx = 400,
  quality = 0.75,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxPx) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          }
        } else if (height > maxPx) {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─── Validation schema ────────────────────────────────────────────────────────

const PRODUCT_UNITS = [
  "pcs",
  "kg",
  "g",
  "L",
  "mL",
  "pack",
  "box",
] as const satisfies readonly ProductUnit[];

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  price: z
    .number({ error: "Price is required" })
    .positive("Price must be greater than 0"),
  stock: z
    .number({ error: "Stock is required" })
    .nonnegative("Stock cannot be negative"),
  unit: z.enum(PRODUCT_UNITS, { error: "Unit is required" }),
  category: z.string().min(1, "Category is required"),
  imageBase64: z.string().nullable().optional(),
});

type ProductSchema = z.infer<typeof productSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: string[];
  onSubmit: (data: ProductFormData) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductFormSheet({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
}: ProductFormSheetProps) {
  const isEdit = !!product;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: undefined,
      stock: undefined,
      unit: "pcs" as ProductUnit,
      category: "",
      imageBase64: null,
    },
  });

  const imageBase64 = watch("imageBase64");

  // Populate form when editing
  useEffect(() => {
    if (open && product) {
      reset({
        name: product.name,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        category: product.category,
        imageBase64: product.imageBase64 ?? null,
      });
    } else if (open && !product) {
      reset({
        name: "",
        price: undefined,
        stock: undefined,
        unit: "pcs" as ProductUnit,
        category: "",
        imageBase64: null,
      });
    }
  }, [open, product, reset]);

  const unit = watch("unit");
  const stockStep = isWeightBased(unit) ? "0.001" : "1";

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setValue("imageBase64", await compressImageToBase64(file));
    } catch {
      // silently ignore compression errors
    }
    e.target.value = "";
  };

  const handleFormSubmit = async (values: ProductSchema) => {
    await onSubmit(values as ProductFormData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90svh] overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          <SheetTitle>{isEdit ? "Edit Product" : "Add Product"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the product details below."
              : "Fill in the details to add a new product."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 px-1"
        >
          {/* Image */}
          <div className="space-y-1.5">
            <Label>
              Product Image{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imageBase64 ? (
              <div className="flex items-start gap-3">
                <div className="relative w-24 h-24 shrink-0">
                  <img
                    src={imageBase64}
                    alt="Product preview"
                    className="w-full h-full object-cover rounded-md border border-border"
                  />
                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-muted"
                    onClick={() => setValue("imageBase64", null)}
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="w-full h-24 flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border bg-muted/40 hover:bg-muted/70 transition-colors text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Tap to upload image</span>
              </button>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              placeholder="e.g. Bottled Water 500ml"
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="product-price">Price (₱)</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <Label htmlFor="product-unit">Unit</Label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="product-unit" className="w-full">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.unit && (
              <p className="text-xs text-destructive">{errors.unit.message}</p>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <Label htmlFor="product-stock">Stock</Label>
            <Input
              id="product-stock"
              type="number"
              min="0"
              step={stockStep}
              placeholder="0"
              {...register("stock", { valueAsNumber: true })}
            />
            {errors.stock && (
              <p className="text-xs text-destructive">{errors.stock.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="product-category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="product-category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <SheetFooter className="pt-2 flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Save Changes" : "Add Product"}
            </Button>
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
