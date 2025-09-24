import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth, db } from "../config/firebase";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupFormProps {
  className?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ className = "" }) => {
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
                  lastLogin: new Date().toISOString(),
                  isAdmin: false,
                  plan: "none",
                  name: "",
                  surname: "",
                  gender: "",
                  dob: "",
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
              lastLogin: new Date().toISOString(),
              isAdmin: false,
              plan: "none",
              name: "",
              surname: "",
              gender: "",
              dob: "",
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
    <div
      className={`bg-white rounded-xl p-6 text-gray-800 shadow-2xl ${className}`}>
      <h3 className="font-bold text-lg mb-4">
        Join hundreds of township businesses
      </h3>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {user ? (
        <div className="text-center">
          <div className="mb-4 text-green-600 text-sm">
            Successfully signed in! Redirecting to dashboard...
          </div>
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : isLinkSent ? (
        <div className="text-center space-y-4">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
            Magic link sent! Please check your email to complete your signup.
          </div>
          <a
            href={getEmailProviderUrl(
              window.localStorage.getItem("emailForSignIn") || ""
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white inline-block text-center">
            Open Email
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center bg-gray-100 text-gray-800 border hover:bg-gray-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}>
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google Icon"
              className="w-4 h-4 mr-2"
            />
            {isLoading ? "Logging in..." : "Log in with Google"}
          </button>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className="mt-1"
                required
              />
              {!isValidEmail && email && (
                <div className="text-red-500 text-sm mt-1">
                  Please enter a valid email address.
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isValidEmail || !email}
              className={`w-full bg-blue-600 hover:bg-blue-700 ${
                isLoading || !isValidEmail || !email
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}>
              {isLoading ? "Getting Started..." : "Get Started"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
