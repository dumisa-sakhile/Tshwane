import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { SubscriptionGate } from "../../components/SubscriptionGate";
import { Wifi } from "lucide-react";

interface UserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  plan: string;
  name?: string;
  surname?: string;
  gender?: string;
  dob?: string; // Date of Birth as ISO string
}

export const Route = createFileRoute("/dashboard/broadband")({
  component: BroadbandPage,
});

function BroadbandPage() {
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
      featureName="Broadband Access Initiatives"
      onPlanUpdate={handlePlanUpdate}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Wifi className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Broadband Access Initiatives
            </h1>
            <p className="text-gray-600">
              Get connected through partnerships with ISPs like MTN
            </p>
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
}
