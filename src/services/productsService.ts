import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product, ProductFormData } from "@/types/product";

function productsRef(uid: string) {
  return collection(db, "users", uid, "products");
}

function productDocRef(uid: string, productId: string) {
  return doc(db, "users", uid, "products", productId);
}

export async function fetchProductsFromFirestore(
  uid: string,
): Promise<Product[]> {
  const q = query(productsRef(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function addProductToFirestore(
  uid: string,
  data: ProductFormData,
): Promise<Product> {
  const { imageBase64, ...rest } = data;
  const docRef = await addDoc(productsRef(uid), {
    ...rest,
    originalStock: rest.stock,
    // Only persist the image if one was actually provided
    ...(imageBase64 ? { imageBase64 } : {}),
    createdAt: serverTimestamp(),
  });
  // Read the document back so the Redux state has the resolved server timestamp.
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as Product;
}

export async function updateProductInFirestore(
  uid: string,
  productId: string,
  data: ProductFormData,
): Promise<void> {
  const { imageBase64, ...rest } = data;
  await updateDoc(productDocRef(uid, productId), {
    ...rest,
    originalStock: rest.stock,
    // null → remove the stored image; string → set/replace it
    imageBase64: imageBase64 ?? deleteField(),
  });
}

export async function deleteProductFromFirestore(
  uid: string,
  productId: string,
): Promise<void> {
  await deleteDoc(productDocRef(uid, productId));
}
