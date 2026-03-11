import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCustomer,
  selectCustomerId,
  selectCustomerName,
} from "@/store/cartSlice";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
}

export default function CustomerSelector() {
  const dispatch = useAppDispatch();
  const { appUser } = useAuth();
  const selectedId = useAppSelector(selectCustomerId);
  const selectedName = useAppSelector(selectCustomerName);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search customers with debounce
  useEffect(() => {
    if (!searchTerm.trim() || !appUser) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      const snap = await getDocs(
        collection(db, "users", appUser.uid, "customers"),
      );
      const q = searchTerm.toLowerCase();
      const matched = snap.docs
        .map((d) => ({ id: d.id, name: d.data().name as string }))
        .filter((c) => c.name.toLowerCase().includes(q))
        .slice(0, 8);
      setResults(matched);
      setIsOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, appUser]);

  const handleSelect = (customer: Customer) => {
    dispatch(setCustomer({ id: customer.id, name: customer.name }));
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!searchTerm.trim() || !appUser) return;
    setIsCreating(true);
    try {
      const docRef = await addDoc(
        collection(db, "users", appUser.uid, "customers"),
        { name: searchTerm.trim(), createdAt: serverTimestamp() },
      );
      handleSelect({ id: docRef.id, name: searchTerm.trim() });
    } finally {
      setIsCreating(false);
    }
  };

  // Show selected customer
  if (selectedId) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
        <Check className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm font-medium flex-1 truncate">
          {selectedName}
        </span>
        <button
          type="button"
          className="text-xs text-muted-foreground underline shrink-0"
          onClick={() => dispatch(setCustomer(undefined))}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <p className="text-xs text-muted-foreground mb-1.5">
        Customer <span className="text-destructive">*</span>
      </p>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search or add customer…"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && results.length > 0 && setIsOpen(true)}
        />
      </div>

      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg overflow-hidden">
          {results.map((customer) => (
            <button
              key={customer.id}
              type="button"
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors"
              onClick={() => handleSelect(customer)}
            >
              {customer.name}
            </button>
          ))}
          <button
            type="button"
            disabled={isCreating}
            className={cn(
              "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 text-primary hover:bg-muted transition-colors",
              results.length > 0 && "border-t",
            )}
            onClick={handleCreate}
          >
            <UserPlus className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {isCreating
                ? "Adding…"
                : `Add "${searchTerm.trim()}" as new customer`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
