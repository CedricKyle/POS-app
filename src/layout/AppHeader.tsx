import { useState } from "react";
import { ShoppingCart, LogOut, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  pageTitle?: string;
}

export default function AppHeader({ pageTitle }: AppHeaderProps) {
  const { appUser, signOutUser } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-5 w-5" />
            <span>Divina's Variety Store</span>
            {pageTitle && (
              <span className="text-muted-foreground font-normal text-sm hidden sm:inline">
                / {pageTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle2 className="h-4 w-4" />
              <span>{appUser?.displayName}</span>
              <Badge variant="secondary" className="capitalize text-xs">
                {appUser?.role}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setConfirmOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Sign out
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                signOutUser();
              }}
              className="gap-2 ml-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
