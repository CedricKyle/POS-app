# 🧾 POS App

A lightweight, mobile-first Point of Sale web application built for tablets and phones. Designed for small businesses to manage sales, products, records, and customer credit (utang) in one place.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | React |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (neutral) |
| State Management | Redux Toolkit |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth |

---

## Features

### 📟 POS
- Add products to cart by tapping
- Adjust quantities directly in cart
- Apply discounts per item or on total
- Checkout and record the transaction
- Support for cash and credit (utang) payment types

### 📦 Products
- View all products in a grid/list layout
- Add, edit, and delete products
- Set product name, price, category, and stock
- Search and filter products

### 📋 Records
- View full transaction history
- Filter by date range
- See per-transaction breakdown (items, total, payment type)
- Summary totals (daily / weekly / monthly)

### 💸 Loan (Utang)
- Log credit purchases tied to a customer name
- Track outstanding balances per customer
- Record partial or full payments
- View payment history per customer

### ⚙️ Settings
- Manage store name and info
- Upload and update store logo
- Manage user account (Firebase Auth)
- Category management for products
- App preferences

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | POS | Main selling screen |
| `/products` | Products | Product management |
| `/records` | Records | Transaction history |
| `/loan` | Loan (Utang) | Credit tracking |
| `/settings` | Settings | App configuration |

---

## Firebase Data Model

```
/users/{userId}
  /products/{productId}
    - name: string
    - price: number
    - stock: number
    - category: string
    - createdAt: timestamp

  /transactions/{transactionId}
    - items: { productId, name, price, qty }[]
    - total: number
    - discount: number
    - paymentType: "cash" | "utang"
    - customerId?: string
    - createdAt: timestamp

  /customers/{customerId}
    - name: string
    - totalOwed: number
    - createdAt: timestamp

  /loans/{loanId}
    - customerId: string
    - amount: number
    - amountPaid: number
    - status: "pending" | "partial" | "paid"
    - transactionId?: string
    - createdAt: timestamp

  /settings/{userId}
    - storeName: string
    - logoUrl: string
    - categories: string[]
```

---
## Security

### Authentication (Firebase Auth)
- Email/password sign-in with Firebase Authentication
- Protected routes — unauthenticated users are redirected to login
- Auth state persisted via Firebase session (no manual token handling)
- Auto sign-out on token expiry
- Password reset via Firebase email flow

### DDoS & Abuse Protection
- **Firebase App Check** — enforces that requests come only from your registered app (blocks bots and unauthorized API calls)
- **Firestore rate limits** — Firestore enforces per-document write limits natively (1 write/sec per document)
- **Client-side rate limiting** — debounce and throttle applied on search inputs and rapid form submissions to reduce unnecessary reads/writes
- **Auth brute-force protection** — Firebase Auth automatically locks accounts after repeated failed sign-in attempts
- **Environment variables** — all Firebase config is kept in `.env` and never committed to the repository
- **Firestore indexes** — only expose the queries the app actually uses; no open-ended collection group queries

### Best Practices Checklist

| Item | Status |
|---|---|
| Firestore security rules scoped per user | ✅ |
| Firebase App Check enabled | ✅ |
| `.env` excluded from version control | ✅ |
| No sensitive logic on the client | ✅ |
| Auth-gated routes on all pages | ✅ |
| Input validation before Firestore writes | ✅ |

---

## Design Notes

- **Mobile-first** — optimized for phones and tablets (touch targets, bottom nav)
- **Neutral color palette** via shadcn/ui for a clean, professional look
- **Offline-friendly** — Firestore's local cache keeps the app usable with poor connectivity
- **Single-user** — each account manages their own store data

---

## License

MIT