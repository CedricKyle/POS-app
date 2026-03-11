import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Transaction } from "@/types/transaction";

function txnsRef(uid: string) {
  return collection(db, "users", uid, "transactions");
}

export async function fetchTransactionsFromFirestore(
  uid: string,
): Promise<Transaction[]> {
  const q = query(txnsRef(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      items: data.items ?? [],
      total: data.total ?? 0,
      discount: data.discount ?? 0,
      paymentType: data.paymentType,
      ...(data.customerId ? { customerId: data.customerId } : {}),
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    } as Transaction;
  });
}

export async function fetchCustomerName(
  uid: string,
  customerId: string,
): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid, "customers", customerId));
  if (!snap.exists()) return null;
  return (snap.data().name as string) ?? null;
}
