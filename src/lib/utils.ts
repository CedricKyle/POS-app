import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductUnit } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Philippine Peso currency: ₱1,234.56 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function isWeightBased(unit: ProductUnit): boolean {
  return ["kg", "g", "L", "mL"].includes(unit);
}

/** Format a quantity with appropriate precision.
 *  Weight/volume units: up to 3 decimal places, trailing zeros stripped.
 *  Discrete units: whole number. */
export function formatQty(qty: number, unit: ProductUnit): string {
  if (isWeightBased(unit)) {
    return parseFloat(qty.toFixed(3)).toString();
  }
  return Math.round(qty).toString();
}
