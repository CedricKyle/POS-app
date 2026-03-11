import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product, ProductFormData } from "@/types/product";
import {
  fetchProductsFromFirestore,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
} from "@/services/productsService";

// ─── State ────────────────────────────────────────────────────────────────────

export interface ProductsState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (uid: string) => fetchProductsFromFirestore(uid),
);

export const addProduct = createAsyncThunk(
  "products/add",
  async ({ uid, data }: { uid: string; data: ProductFormData }) =>
    addProductToFirestore(uid, data),
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({
    uid,
    productId,
    data,
  }: {
    uid: string;
    productId: string;
    data: ProductFormData;
  }) => {
    await updateProductInFirestore(uid, productId, data);
    return { productId, data };
  },
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async ({ uid, productId }: { uid: string; productId: string }) => {
    await deleteProductFromFirestore(uid, productId);
    return productId;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    /** Deduct sold quantities from in-memory stock after a successful checkout. */
    deductStock(
      state,
      action: PayloadAction<{ productId: string; qty: number }[]>,
    ) {
      for (const { productId, qty } of action.payload) {
        const product = state.items.find((p) => p.id === productId);
        if (product) {
          product.stock = Math.max(0, product.stock - qty);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load products.";
      });

    // addProduct
    builder
      .addCase(
        addProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.items.unshift(action.payload);
        },
      )
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to add product.";
      });

    // updateProduct
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const { productId, data } = action.payload;
        const idx = state.items.findIndex((p) => p.id === productId);
        if (idx !== -1) {
          const { imageBase64, ...rest } = data;
          const updated = {
            ...state.items[idx],
            ...rest,
            originalStock: rest.stock,
          };
          if (imageBase64) {
            updated.imageBase64 = imageBase64;
          } else {
            delete updated.imageBase64;
          }
          state.items[idx] = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update product.";
      });

    // deleteProduct
    builder
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter((p) => p.id !== action.payload);
        },
      )
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete product.";
      });
  },
});

export const { deductStock } = productsSlice.actions;
export default productsSlice.reducer;
