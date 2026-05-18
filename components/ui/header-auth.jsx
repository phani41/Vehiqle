"use client";

import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, CarFront, Layout } from "lucide-react";

export default function HeaderAuth({ isAdmin }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        />
      </SignedIn>
    </div>
  );
}
