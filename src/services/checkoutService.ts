import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { CartItem } from "@/types/product";

interface CheckoutParams {
  uid: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  orderDiscount: number;
  paymentType: "cash" | "utang";
  customerId?: string;
}

export async function checkout({
  uid,
  items,
  subtotal,
  discount,
  orderDiscount,
  paymentType,
  customerId,
}: CheckoutParams): Promise<string> {
  if (items.length === 0) throw new Error("Cart is empty.");
  if (paymentType === "utang" && !customerId) {
    throw new Error("Customer is required for credit (utang) transactions.");
  }

  const grandTotal = Math.max(0, subtotal - discount);
  const batch = writeBatch(db);

  // 1. Transaction document
  const txnRef = doc(collection(db, "users", uid, "transactions"));
  batch.set(txnRef, {
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      unit: item.unit,
      qty: item.qty,
      discount: item.discount,
    })),
    total: grandTotal,
    discount: orderDiscount,
    paymentType,
    ...(customerId ? { customerId } : {}),
    createdAt: serverTimestamp(),
  });

  // 2. Atomic stock deduction for each product
  for (const item of items) {
    const productRef = doc(db, "users", uid, "products", item.productId);
    batch.update(productRef, { stock: increment(-item.qty) });
  }

  // 3. Loan record for utang payments
  if (paymentType === "utang" && customerId) {
    const loanRef = doc(collection(db, "users", uid, "loans"));
    batch.set(loanRef, {
      customerId,
      amount: grandTotal,
      amountPaid: 0,
      status: "pending",
      transactionId: txnRef.id,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return txnRef.id;
}
