"use client";

import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, CarFront, Layout, Trash2, Loader2 } from "lucide-react";
import { deleteMyAccount } from "@/actions/settings";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HeaderAuth({ isAdmin }) {
  const [mounted, setMounted] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { signOut } = useClerk();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const res = await deleteMyAccount();
      if (res?.success) {
        toast.success("Your account and all details have been deleted.");
        setDeleteAccountOpen(false);
        await signOut({ redirectUrl: "/" });
      } else {
        toast.error("Failed to delete account");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <SignedIn>
        <Button asChild>
          <Link href="/saved-cars">
            <>
              <Heart size={18} />
              <span className="hidden md:inline">saved cars</span>
            </>
          </Link>
        </Button>

        {isAdmin ? (
          <Button asChild variant="outline">
            <Link href="/admin">
              <>
                <Layout size={18} />
                <span className="hidden md:inline">Admin Portal</span>
              </>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/reservations">
              <>
                <CarFront size={18} />
                <span className="hidden md:inline">My Reservations</span>
              </>
            </Link>
          </Button>
        )}
      </SignedIn>

      <SignedOut>
        <SignInButton fallbackRedirectUrl="/">
          <Button variant="outline">Login</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Action
              label="Delete Account"
              labelIcon={<Trash2 size={16} className="text-red-500" />}
              onClick={() => setDeleteAccountOpen(true)}
            />
          </UserButton.MenuItems>
        </UserButton>

        {/* Delete My Account Confirmation Dialog */}
        <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <p>Are you sure you want to delete your account?</p>
                <p className="text-red-600 font-medium">
                  This will permanently delete your profile, all test drive reservations, and all saved cars from the database. This action cannot be undone.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteAccountOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account & All Details"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SignedIn>
    </div>
  );
}
