import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Lock, CheckCircle, X } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface SubscriptionGateProps {
  userPlan: string | number;
  requiredPlan: number;
  featureName: string;
  children: React.ReactNode;
  onPlanUpdate?: (newPlan: number) => void;
}

const planNames = {
  0: "Free",
  1: "Standard",
  2: "Premium",
};

const planPrices = {
  0: "R0",
  1: "R99",
  2: "R149",
};

const planFeatures = {
  0: ["Funding Application Portal"],
  1: [
    "Funding Application Portal",
    "Business Workshops",
    "Mergers and Acquisitions",
  ],
  2: [
    "Funding Application Portal",
    "Business Workshops",
    "Mergers and Acquisitions",
    "Secure Document Management",
    "Broadband Access Initiatives",
  ],
};

export function SubscriptionGate({
  userPlan,
  requiredPlan,
  featureName,
  children,
  onPlanUpdate,
}: SubscriptionGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [countdown, setCountdown] = useState(5); // Reduced countdown since we're not doing page refresh
  const queryClient = useQueryClient();

  // Convert userPlan to number for comparison
  const currentPlanLevel =
    typeof userPlan === "string"
      ? userPlan === "none"
        ? 0
        : parseInt(userPlan) || 0
      : userPlan || 0;

  // Check if user has access
  const hasAccess = currentPlanLevel >= requiredPlan;

  // Countdown effect for success UI
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccess && countdown === 0) {
      // Invalidate all queries to ensure data is refreshed
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      // Hide success message after invalidating queries
      setShowSuccess(false);
    }
  }, [showSuccess, countdown, queryClient]);

  const handleUpgrade = async (planLevel: number) => {
    setIsUpgrading(true);
    try {
      // Update user's plan in Firestore
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          plan: planLevel.toString(),
        });

        setSelectedPlan(planLevel);
        setShowUpgrade(false);
        setShowSuccess(true);
        setCountdown(5); // Reset countdown (reduced since no page refresh)

        // Show success toast
        const planName = planNames[planLevel as keyof typeof planNames];
        toast.success(`🎉 Successfully upgraded to ${planName} Plan!`, {
          duration: 4000,
          position: "top-center",
        });

        // Call parent callback if provided to update local state immediately
        if (onPlanUpdate) {
          onPlanUpdate(planLevel);
        }

        // Invalidate queries immediately to sync data across the app
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        queryClient.invalidateQueries({ queryKey: ["plan"] });

        // Note: Countdown will auto-hide the success message
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Failed to upgrade plan. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getAvailablePlans = () => {
    // Always show Standard and Premium if user doesn't have them
    const plans = [];
    if (currentPlanLevel < 1) {
      plans.push(1); // Standard
    }
    if (currentPlanLevel < 2) {
      plans.push(2); // Premium
    }
    return plans;
  };

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Success UI
  if (showSuccess && selectedPlan) {
    const newPlanFeatures =
      planFeatures[selectedPlan as keyof typeof planFeatures];
    const planName = planNames[selectedPlan as keyof typeof planNames];
    const planPrice = planPrices[selectedPlan as keyof typeof planPrices];

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="max-w-lg mx-auto text-center shadow-2xl border-green-200">
          <CardHeader className="pb-4">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              🎉 Congratulations!
            </CardTitle>
            <CardDescription className="text-xl text-gray-700 mt-3">
              You've successfully upgraded to{" "}
              <span className="font-bold text-green-700">
                {planName} Plan ({planPrice}/month)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-green-800 mb-4 text-lg">
                🚀 You now have access to:
              </h4>
              <ul className="space-y-3 text-left">
                {newPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">
                  ✨ Syncing your new features across the app...
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Success message will disappear in {countdown} second
                  {countdown !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3">
                  Access {featureName} Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 text-gray-600 hover:text-gray-800 border-gray-300 py-3">
                  Continue Exploring
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                ✨ Your new features are now available across the entire app
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Upgrade UI
  if (showUpgrade) {
    const availablePlans = getAvailablePlans();

    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpgrade(false)}
              className="mb-4">
              <X className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600">
              Upgrade to access {featureName} and unlock more features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {availablePlans.map((planLevel) => (
              <Card
                key={planLevel}
                className={`relative border-2 transition-colors ${
                  planLevel === 2 ? "border-purple-500" : "border-blue-500"
                } hover:shadow-lg`}>
                {planLevel === 2 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {planNames[planLevel as keyof typeof planNames]}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {planPrices[planLevel as keyof typeof planPrices]}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {planFeatures[planLevel as keyof typeof planFeatures].map(
                      (feature) => (
                        <li key={feature} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      )
                    )}
                  </ul>
                  <Button
                    onClick={() => handleUpgrade(planLevel)}
                    disabled={isUpgrading}
                    className={`w-full ${
                      planLevel === 2
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}>
                    {isUpgrading
                      ? "Upgrading..."
                      : `Upgrade to ${planNames[planLevel as keyof typeof planNames]}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default blocked access UI - Show upgrade options directly
  const availablePlans = getAvailablePlans();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {availablePlans.map((planLevel) => (
            <Card
              key={planLevel}
              className={`relative border-2 transition-colors ${
                planLevel === 2 ? "border-purple-500" : "border-blue-500"
              } hover:shadow-lg`}>
              {planLevel === 2 && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {planNames[planLevel as keyof typeof planNames]}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {planPrices[planLevel as keyof typeof planPrices]}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {planFeatures[planLevel as keyof typeof planFeatures].map(
                    (feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
                <Button
                  onClick={() => handleUpgrade(planLevel)}
                  disabled={isUpgrading}
                  className={`w-full ${
                    planLevel === 2
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                  {isUpgrading
                    ? "Upgrading..."
                    : `Upgrade to ${planNames[planLevel as keyof typeof planNames]}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="px-8">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
