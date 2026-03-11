import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, ProductUnit } from "@/types/product";
import type { Product } from "@/types/product";
import type { RootState } from "./store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEIGHT_UNITS: ProductUnit[] = ["kg", "g", "L", "mL"];

export function isWeightBased(unit: ProductUnit): boolean {
  return WEIGHT_UNITS.includes(unit);
}

function qtyStep(unit: ProductUnit): number {
  return isWeightBased(unit) ? 0.1 : 1;
}

function round3(n: number): number {
  return parseFloat(n.toFixed(3));
}

// ─── State ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  orderDiscount: number;
  paymentType: "cash" | "utang";
  customerId?: string;
  customerName?: string;
}

const initialState: CartState = {
  items: [],
  orderDiscount: 0,
  paymentType: "cash",
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const p = action.payload;
      if (p.stock === 0) return;
      const inc = qtyStep(p.unit);
      const existing = state.items.find((i) => i.productId === p.id);
      if (existing) {
        existing.qty = round3(Math.min(existing.qty + inc, p.stock));
      } else {
        state.items.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit,
          qty: Math.min(inc, p.stock),
          discount: 0,
        });
      }
    },

    incrementQty(
      state,
      action: PayloadAction<{ productId: string; stock: number }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (!item) return;
      item.qty = round3(
        Math.min(item.qty + qtyStep(item.unit), action.payload.stock),
      );
    },

    decrementQty(state, action: PayloadAction<string>) {
      const idx = state.items.findIndex((i) => i.productId === action.payload);
      if (idx === -1) return;
      const item = state.items[idx];
      const newQty = round3(item.qty - qtyStep(item.unit));
      if (newQty <= 0) {
        state.items.splice(idx, 1);
      } else {
        item.qty = newQty;
      }
    },

    setQty(state, action: PayloadAction<{ productId: string; qty: number }>) {
      const { productId, qty } = action.payload;
      const idx = state.items.findIndex((i) => i.productId === productId);
      if (idx === -1) return;
      if (qty <= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items[idx].qty = round3(qty);
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },

    setItemDiscount(
      state,
      action: PayloadAction<{ productId: string; discount: number }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) {
        item.discount = Math.max(0, action.payload.discount);
      }
    },

    setOrderDiscount(state, action: PayloadAction<number>) {
      state.orderDiscount = Math.max(0, action.payload);
    },

    setPaymentType(state, action: PayloadAction<"cash" | "utang">) {
      state.paymentType = action.payload;
      if (action.payload === "cash") {
        delete state.customerId;
        delete state.customerName;
      }
    },

    setCustomer(
      state,
      action: PayloadAction<{ id: string; name: string } | undefined>,
    ) {
      state.customerId = action.payload?.id;
      state.customerName = action.payload?.name;
    },

    clearCart(state) {
      state.items = [];
      state.orderDiscount = 0;
      state.paymentType = "cash";
      delete state.customerId;
      delete state.customerName;
    },
  },
});

export const {
  addToCart,
  incrementQty,
  decrementQty,
  setQty,
  removeFromCart,
  setItemDiscount,
  setOrderDiscount,
  setPaymentType,
  setCustomer,
  clearCart,
} = cartSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectItemCount = (state: RootState) => state.cart.items.length;
export const selectPaymentType = (state: RootState) => state.cart.paymentType;
export const selectCustomerId = (state: RootState) => state.cart.customerId;
export const selectCustomerName = (state: RootState) => state.cart.customerName;
export const selectOrderDiscount = (state: RootState) =>
  state.cart.orderDiscount;

export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

export const selectCartDiscount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.discount, 0) +
  state.cart.orderDiscount;

export const selectCartGrandTotal = (state: RootState) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const discount =
    state.cart.items.reduce((sum, item) => sum + item.discount, 0) +
    state.cart.orderDiscount;
  return Math.max(0, subtotal - discount);
};

export default cartSlice.reducer;
