import type { ProductUnit } from "./product";

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  unit: ProductUnit;
  qty: number;
  discount: number;
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  total: number;
  discount: number;
  paymentType: "cash" | "utang";
  customerId?: string;
  /** ISO date string — converted from Firestore Timestamp in the service layer */
  createdAt: string;
}
