import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { SubscriptionGate } from "../../components/SubscriptionGate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Shield, FileText, Upload, Download, Lock } from "lucide-react";

interface UserData {
  plan: string;
  email: string;
  displayName?: string;
}

export const Route = createFileRoute("/dashboard/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePlanUpdate = (newPlan: number) => {
    if (userData) {
      setUserData({
        ...userData,
        plan: newPlan.toString(),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Please log in to access this page.</div>
      </div>
    );
  }

  return (
    <SubscriptionGate
      userPlan={userData.plan}
      requiredPlan={2} // Requires Premium plan
      featureName="Secure Document Management"
      onPlanUpdate={handlePlanUpdate}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Secure Document Management
            </h1>
            <p className="text-gray-600">
              Store and manage your business documents securely with encryption
            </p>
          </div>
        </div>

     
      </div>
    </SubscriptionGate>
  );
}
