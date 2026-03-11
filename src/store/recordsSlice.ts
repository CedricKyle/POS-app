import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  format,
} from "date-fns";
import { fetchTransactionsFromFirestore } from "@/services/recordsService";
import type { Transaction } from "@/types/transaction";
import type { RootState } from "./store";

// ─── State ────────────────────────────────────────────────────────────────────

export type FilterMode = "daily" | "weekly" | "monthly" | "custom";

interface FilterState {
  mode: FilterMode;
  from: string | null; // ISO date string (date only, e.g. "2026-03-01")
  to: string | null;
}

interface RecordsState {
  items: Transaction[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filter: FilterState;
}

const initialState: RecordsState = {
  items: [],
  status: "idle",
  error: null,
  filter: {
    mode: "daily",
    from: null,
    to: null,
  },
};

// ─── Thunk ────────────────────────────────────────────────────────────────────

export const fetchTransactions = createAsyncThunk(
  "records/fetchAll",
  async (userId: string) => fetchTransactionsFromFirestore(userId),
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const recordsSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    setFilterMode(state, action: PayloadAction<FilterMode>) {
      state.filter.mode = action.payload;
      // Clear custom range when switching to a quick filter
      state.filter.from = null;
      state.filter.to = null;
    },
    setCustomRange(
      state,
      action: PayloadAction<{ from: string | null; to: string | null }>,
    ) {
      state.filter.mode = "custom";
      state.filter.from = action.payload.from;
      state.filter.to = action.payload.to;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load transactions.";
      });
  },
});

export const { setFilterMode, setCustomRange } = recordsSlice.actions;
export default recordsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAllTransactions = (state: RootState) => state.records.items;
export const selectRecordsStatus = (state: RootState) => state.records.status;
export const selectRecordsError = (state: RootState) => state.records.error;
export const selectRecordsFilter = (state: RootState) => state.records.filter;

export const selectFilteredTransactions = createSelector(
  selectAllTransactions,
  selectRecordsFilter,
  (items, filter) => {
    const now = new Date();

    return items.filter((tx) => {
      const date = parseISO(tx.createdAt);

      switch (filter.mode) {
        case "daily":
          return isWithinInterval(date, {
            start: startOfDay(now),
            end: endOfDay(now),
          });

        case "weekly":
          return isWithinInterval(date, {
            start: startOfWeek(now, { weekStartsOn: 1 }),
            end: endOfWeek(now, { weekStartsOn: 1 }),
          });

        case "monthly":
          return isWithinInterval(date, {
            start: startOfMonth(now),
            end: endOfMonth(now),
          });

        case "custom": {
          const from = filter.from
            ? startOfDay(parseISO(filter.from))
            : new Date(0);
          const to = filter.to ? endOfDay(parseISO(filter.to)) : endOfDay(now);
          if (from > to) return false;
          return isWithinInterval(date, { start: from, end: to });
        }

        default:
          return true;
      }
    });
  },
);

export const selectGroupedByDate = createSelector(
  selectFilteredTransactions,
  (transactions) => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
      const key = format(parseISO(tx.createdAt), "MMM d, yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    }
    return groups;
  },
);

export const selectSummaryTotals = createSelector(
  selectFilteredTransactions,
  (transactions) => {
    const cash = transactions
      .filter((t) => t.paymentType === "cash")
      .reduce((sum, t) => sum + t.total, 0);
    const utang = transactions
      .filter((t) => t.paymentType === "utang")
      .reduce((sum, t) => sum + t.total, 0);
    return { cash, utang, grand: cash + utang };
  },
);
