import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { db, getAuthForUserCreation } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { AppUser, UserRole } from "@/types/auth";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

// icons
import {
  UserPlus,
  Trash2,
  Pencil,
  Users,
  ShieldCheck,
  UserCircle2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

// ─── Add User Dialog ──────────────────────────────────────────────────────────

interface AddUserDialogProps {
  onCreated: (newUser: AppUser) => void;
}

function AddUserDialog({ onCreated }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cashier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("cashier");
    setError("");
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const creationAuth = getAuthForUserCreation();

    try {
      // Step 1 — create the Auth account in an isolated session
      const { user } = await createUserWithEmailAndPassword(
        creationAuth,
        email,
        password,
      );

      try {
        // Step 2 — persist the user doc (manager's primary session is still active)
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email,
          displayName: name,
          role,
          createdAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        // Firestore write failed — roll back by deleting the Auth account
        // so the manager can retry without hitting email-already-in-use
        await creationAuth.currentUser?.delete().catch(() => {});
        throw firestoreErr;
      } finally {
        // Always clean up the isolated session
        await creationAuth.signOut().catch(() => {});
      }

      // Step 3 — optimistically update the table, no page reload needed
      onCreated({
        uid: user.uid,
        email,
        displayName: name,
        role,
        createdAt: new Date(),
      });
      setOpen(false);
      resetForm();
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "auth/email-already-in-use") {
        setError("That email is already registered.");
      } else if (e.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to create user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim() && email.trim() && password.trim() && !loading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new account and assign a role. The user can sign in
            immediately with these credentials.
          </DialogDescription>
        </DialogHeader>

        <form id="add-user-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 py-2">
            {/* Display Name */}
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Display Name</Label>
              <Input
                id="add-name"
                placeholder="e.g. Juan dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="add-password">Temporary Password</Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["cashier", "manager"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {role === r && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    )}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            disabled={!canSubmit}
            className="gap-2 ml-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit User Dialog ─────────────────────────────────────────────────────────

interface EditUserDialogProps {
  user: AppUser;
  onUpdated: (updated: AppUser) => void;
}

function EditUserDialog({ user, onUpdated }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.displayName);
  const [role, setRole] = useState<UserRole>(user.role);
  // password section
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setName(user.displayName);
    setRole(user.role);
    setChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setError("");
    setSuccess("");
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Display name cannot be empty.");
      return;
    }

    if (changePassword) {
      if (!currentPassword) {
        setError("Please enter the user's current password.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Update Firestore profile (name + role)
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name.trim(),
        role,
      });

      // 2. Optionally update the Firebase Auth password
      if (changePassword) {
        const secondaryAuth = getAuthForUserCreation();
        try {
          const { user: targetUser } = await signInWithEmailAndPassword(
            secondaryAuth,
            user.email,
            currentPassword,
          );
          await updatePassword(targetUser, newPassword);
        } catch (authErr: unknown) {
          const e = authErr as { code?: string };
          if (
            e.code === "auth/wrong-password" ||
            e.code === "auth/invalid-credential"
          ) {
            setError("Current password is incorrect.");
          } else if (e.code === "auth/weak-password") {
            setError("New password must be at least 6 characters.");
          } else {
            setError("Failed to update password. Please try again.");
          }
          setLoading(false);
          return;
        } finally {
          await getAuthForUserCreation()
            .signOut()
            .catch(() => {});
        }
      }

      onUpdated({ ...user, displayName: name.trim(), role });
      setSuccess("User updated successfully.");
      // Close after a short delay so the user sees the success message
      setTimeout(() => handleOpenChange(false), 800);
    } catch {
      setError("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    name.trim() !== user.displayName ||
    role !== user.role ||
    (changePassword && currentPassword && newPassword);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          title="Edit user"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update profile details for{" "}
            <span className="font-semibold text-foreground">
              {user.displayName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form id="edit-user-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 py-2">
            {/* Display Name */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-name-${user.uid}`}>Display Name</Label>
              <Input
                id={`edit-name-${user.uid}`}
                placeholder="e.g. Juan dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-email-${user.uid}`}>Email</Label>
              <Input
                id={`edit-email-${user.uid}`}
                type="email"
                value={user.email}
                disabled
                className="text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["cashier", "manager"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {role === r && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    )}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Password toggle */}
            <div className="rounded-lg border border-border p-3 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setChangePassword((v) => !v);
                  setCurrentPassword("");
                  setNewPassword("");
                }}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
              >
                <KeyRound className="h-4 w-4 shrink-0" />
                {changePassword ? "Cancel password change" : "Change password"}
              </button>

              {changePassword && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-current-pw-${user.uid}`}>
                      Current Password
                    </Label>
                    <Input
                      id={`edit-current-pw-${user.uid}`}
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-new-pw-${user.uid}`}>
                      New Password
                    </Label>
                    <Input
                      id={`edit-new-pw-${user.uid}`}
                      type="password"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Feedback */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            disabled={!hasChanges || loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  user: AppUser;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmDialog({
  user,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Delete user"
          disabled={isDeleting}
          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription className="pt-1">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {user.displayName}
            </span>{" "}
            ({user.email})? This will remove their account from the system.
            <span className="block mt-2 font-medium text-destructive/80">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            className="gap-2 ml-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  // Optimistically add the new user to the table — instant, no reload needed
  const handleUserCreated = (newUser: AppUser) => {
    setUsers((prev) =>
      [...prev, newUser].sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      ),
    );
  };

  const handleUserUpdated = (updated: AppUser) => {
    setUsers((prev) =>
      prev
        .map((u) => (u.uid === updated.uid ? updated : u))
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    );
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: AppUser[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: data.email ?? "",
          displayName: data.displayName ?? "",
          role: data.role as UserRole,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        };
      });

      // Always include the logged-in user even if their doc was just auto-created
      if (appUser && !list.find((u) => u.uid === appUser.uid)) {
        list.unshift(appUser);
      }

      setUsers(list.sort((a, b) => a.displayName.localeCompare(b.displayName)));
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (appUser) setUsers([appUser]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (uid: string) => {
    if (uid === appUser?.uid) return;
    setDeletingUid(uid);
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeletingUid(null);
    }
  };

  const managers = users.filter((u) => u.role === "manager");
  const cashiers = users.filter((u) => u.role === "cashier");

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {/* ── Page title + Add button ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cashier and manager accounts for your store.
          </p>
        </div>

        {appUser && <AddUserDialog onCreated={handleUserCreated} />}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: <Users className="h-4 w-4" />,
          },
          {
            label: "Managers",
            value: managers.length,
            icon: <ShieldCheck className="h-4 w-4" />,
          },
          {
            label: "Cashiers",
            value: cashiers.length,
            icon: <UserCircle2 className="h-4 w-4" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Users table ── */}
      {loadingUsers ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No users yet. Add your first user.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  {/* Name + avatar */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {u.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.displayName}</span>
                      {u.uid === appUser?.uid && (
                        <span className="text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {u.email}
                  </TableCell>

                  {/* Role badge */}
                  <TableCell>
                    <Badge
                      variant={u.role === "manager" ? "default" : "secondary"}
                      className="capitalize gap-1"
                    >
                      {u.role === "manager" && (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      {u.role}
                    </Badge>
                  </TableCell>

                  {/* Actions: Edit + Delete */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Edit — always shown */}
                      <EditUserDialog user={u} onUpdated={handleUserUpdated} />

                      {/* Delete — hidden for current user */}
                      {u.uid !== appUser?.uid ? (
                        <DeleteConfirmDialog
                          user={u}
                          onConfirm={() => handleDelete(u.uid)}
                          isDeleting={deletingUid === u.uid}
                        />
                      ) : (
                        <span className="w-4" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
