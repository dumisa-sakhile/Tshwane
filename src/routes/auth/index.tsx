import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { auth, db } from "../../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLinkSent, setIsLinkSent] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Redirect to dashboard when user signs in
      if (currentUser) {
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 1000); // short delay for UX
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const verifyMagicLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        const emailForSignIn = window.localStorage.getItem("emailForSignIn");
        if (!emailForSignIn) {
          setError("No email found for sign-in. Please enter your email.");
          toast.error("No email found for sign-in. Please enter your email.");
          setIsLoading(false);
          return;
        }
        try {
          await signInWithEmailLink(auth, emailForSignIn, window.location.href);
          window.localStorage.removeItem("emailForSignIn");
          const user = auth.currentUser;
          if (user) {
            // First check if user document exists
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              // User exists, only update lastLogin and ensure required fields exist
              const existingData = userDoc.data();
              const updateData: any = {
                lastLogin: new Date().toISOString(),
              };

              // Only set defaults for missing fields
              if (!existingData.email) updateData.email = user.email;
              if (!existingData.displayName)
                updateData.displayName = user.displayName || "Anonymous";
              if (!existingData.photoURL)
                updateData.photoURL = user.photoURL || "";
              if (existingData.isAdmin === undefined)
                updateData.isAdmin = false;
              if (!existingData.plan) updateData.plan = "none";
              // Only set these fields if they are completely missing from the document
              if (!existingData.hasOwnProperty("name")) updateData.name = "";
              if (!existingData.hasOwnProperty("surname"))
                updateData.surname = "";
              if (!existingData.hasOwnProperty("gender"))
                updateData.gender = "";
              if (!existingData.hasOwnProperty("dob")) updateData.dob = "";

              await setDoc(userDocRef, updateData, { merge: true });
            } else {
              // New user, set all defaults
              await setDoc(
                userDocRef,
                {
                  email: user.email,
                  displayName: user.displayName || "Anonymous",
                  photoURL: user.photoURL || "",
                  isAdmin: false,
                  plan: "none",
                  name: "",
                  surname: "",
                  gender: "",
                  dob: "",
                  lastLogin: new Date().toISOString(),
                },
                { merge: true }
              );
            }
          }
          toast.success("Successfully signed in!");
          setIsLinkSent(false);
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
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

  const getEmailProviderUrl = (email: string): string => {
    const domain = email.split("@")[1]?.toLowerCase();
    switch (domain) {
      case "gmail.com":
        return "https://mail.google.com";
      case "outlook.com":
      case "hotmail.com":
        return "https://outlook.live.com";
      case "yahoo.com":
        return "https://mail.yahoo.com";
      default:
        return "mailto:";
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setEmail("");
      setIsValidEmail(false);
      setIsLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        // First check if user document exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // User exists, only update lastLogin and ensure required fields exist
          const existingData = userDoc.data();
          const updateData: any = {
            lastLogin: new Date().toISOString(),
          };

          // Only set defaults for missing fields
          if (!existingData.email) updateData.email = user.email;
          if (!existingData.displayName)
            updateData.displayName = user.displayName || "Anonymous";
          if (!existingData.photoURL) updateData.photoURL = user.photoURL || "";
          if (existingData.isAdmin === undefined) updateData.isAdmin = false;
          if (!existingData.plan) updateData.plan = "none";
          // Only set these fields if they are completely missing from the document
          if (!existingData.hasOwnProperty("name")) updateData.name = "";
          if (!existingData.hasOwnProperty("surname")) updateData.surname = "";
          if (!existingData.hasOwnProperty("gender")) updateData.gender = "";
          if (!existingData.hasOwnProperty("dob")) updateData.dob = "";

          await setDoc(userDocRef, updateData, { merge: true });
        } else {
          // New user, set all defaults
          await setDoc(
            userDocRef,
            {
              email: user.email,
              displayName: user.displayName || "Anonymous",
              photoURL: user.photoURL || "",
              isAdmin: false,
              plan: "none",
              name: "",
              surname: "",
              gender: "",
              dob: "",
              lastLogin: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }
      toast.success("Successfully signed in with Google!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center p-4 poppins-light relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full blur-3xl opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 relative overflow-hidden z-10">
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10">
          {/* Title & Description */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Log In or Create an Account
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to your account or create a new one to get started.
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

            {user ? (
              <div className="text-center">
                <div className="mb-4 text-green-600 text-sm">
                  Successfully signed in! Redirecting to dashboard...
                </div>
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : isLinkSent ? (
              <div className="text-center space-y-4">
                <div
                  className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm"
                  aria-live="polite">
                  Magic link sent! Please check your email to sign in or create
                  an account.
                </div>
                <a
                  href={getEmailProviderUrl(
                    window.localStorage.getItem("emailForSignIn") || ""
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white inline-block text-center">
                  Open Email
                </a>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center bg-gradient-to-r from-white to-gray-50 text-gray-800 border border-gray-200 shadow-lg ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-gray-50 hover:to-white hover:shadow-xl transform hover:scale-[1.02]"
                  }`}
                  aria-label="Sign in with Google">
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google Icon"
                    className="w-5 h-5 mr-2"
                  />
                  {isLoading ? "Signing in..." : "Sign in with Google"}
                </button>

                <div className="flex items-center">
                  <div className="flex-grow border-t border-indigo-200"></div>
                  <span className="mx-4 text-sm text-gray-500 font-medium">
                    or
                  </span>
                  <div className="flex-grow border-t border-indigo-200"></div>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm mb-2 text-gray-700 font-medium"
                      htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm border border-gray-200 shadow-sm transition-all duration-200"
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
                    className={`w-full py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
                      isLoading || !isValidEmail || !email
                        ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                        : "bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    }`}>
                    {isLoading ? "Sending..." : "Email magic link"}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Create an account to see what offers are available!
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
