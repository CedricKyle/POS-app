import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import cartReducer from "./cartSlice";
import recordsReducer from "./recordsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    records: recordsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Firestore Timestamps are not plain-serializable objects;
        // ignore them in the products slice to avoid warnings.
        ignoredPaths: ["products.items"],
        ignoredActionPaths: ["payload", "meta.arg"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
