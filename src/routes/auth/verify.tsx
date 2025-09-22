import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { auth, db } from "../../config/firebase";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/auth/verify")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [needsEmailInput, setNeedsEmailInput] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Redirect to dashboard when user signs in
      if (currentUser && isVerified) {
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 2000); // slightly longer delay for verification UX
      }
    });
    return () => unsubscribe();
  }, [navigate, isVerified]);

  useEffect(() => {
    const verifyMagicLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        const emailForSignIn = window.localStorage.getItem("emailForSignIn");

        if (!emailForSignIn) {
          setError(
            "No email found for verification. Please enter your email below."
          );
          setNeedsEmailInput(true);
          setIsLoading(false);
          return;
        }

        try {
          await signInWithEmailLink(auth, emailForSignIn, window.location.href);
          window.localStorage.removeItem("emailForSignIn");

          const user = auth.currentUser;
          if (user) {
            await setDoc(
              doc(db, "users", user.uid),
              {
                email: user.email,
                displayName: user.displayName || "Anonymous",
                lastLogin: new Date().toISOString(),
                emailVerified: true,
              },
              { merge: true }
            );
          }

          toast.success("Email verified successfully!");
          setIsVerified(true);
          setError(null);
        } catch (err: any) {
          setError(`Verification failed: ${err.message}`);
          toast.error(`Verification failed: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        setError(
          "Invalid verification link. Please check your email for the correct link."
        );
        setIsLoading(false);
      }
    };

    verifyMagicLinkSignIn();
  }, []);

  const validateEmail = (email: string): boolean => emailRegex.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
    setError(null);
  };

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || !email) return;

    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem("emailForSignIn");

      const user = auth.currentUser;
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email,
            displayName: user.displayName || "Anonymous",
            lastLogin: new Date().toISOString(),
            emailVerified: true,
          },
          { merge: true }
        );
      }

      toast.success("Email verified successfully!");
      setIsVerified(true);
      setNeedsEmailInput(false);
    } catch (err: any) {
      setError(`Verification failed: ${err.message}`);
      toast.error(`Verification failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
        {/* Title & Description */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Email Verification
          </h1>
          <p className="text-sm text-gray-600">
            {needsEmailInput
              ? "Enter your email to complete verification"
              : "Verifying your email address..."}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
              aria-live="assertive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          ) : user && isVerified ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Email Verified Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Welcome to Township Economic Hub! Redirecting to your
                  dashboard...
                </p>
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          ) : needsEmailInput ? (
            <form onSubmit={handleManualVerification} className="space-y-4">
              <div>
                <label
                  className="block text-sm mb-2 text-gray-700"
                  htmlFor="verify-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="verify-email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full bg-gray-50 text-gray-800 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-200"
                  required
                  aria-invalid={!isValidEmail}
                />
                {!isValidEmail && email && (
                  <div
                    className="text-red-500 text-sm mt-2"
                    aria-live="assertive">
                    Please enter a valid email address.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValidEmail || !email}
                className={`w-full py-3 px-4 rounded-lg transition-all duration-200 ${
                  isLoading || !isValidEmail || !email
                    ? "opacity-50 cursor-not-allowed bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium`}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Verification Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  The verification link appears to be invalid or expired.
                </p>
                <button
                  onClick={() => navigate({ to: "/auth" })}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble?{" "}
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="text-blue-600 hover:text-blue-700 underline">
              Go back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
