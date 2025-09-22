import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../config/firebase";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Don't show header if user is logged in or still loading
  if (user || loading) {
    return null;
  }

  return (
    <header className="absolute top-0 left-0 w-full bg-transparent z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-black hover:">
              Tshwane Economic Hub
            </span>
          </Link>

          {/* Pricing Button - Right aligned */}
          <div className="flex items-center space-x-4">
            <Link to="/pricing">
              <Button
                variant="outline"
                className="border-white text-black hover:bg-slate-300 hover:text-gray-900">
                Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
