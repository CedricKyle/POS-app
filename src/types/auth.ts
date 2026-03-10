export type UserRole = "cashier" | "manager";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}
