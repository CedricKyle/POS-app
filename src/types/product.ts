import type { Timestamp } from "firebase/firestore";

export type ProductUnit = "pcs" | "kg" | "g" | "L" | "mL" | "pack" | "box";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  originalStock?: number; // reference max — set at create/restock time
  unit: ProductUnit;
  category: string;
  imageBase64?: string;
  createdAt: Timestamp;
}

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  unit: ProductUnit;
  category: string;
  /** Base64 data-URL for the product image.
   *  `null`  → explicitly remove an existing image on update.
   *  `undefined` / absent → leave unchanged (for add: no image). */
  imageBase64?: string | null;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: ProductUnit;
  qty: number;
  discount: number;
}
