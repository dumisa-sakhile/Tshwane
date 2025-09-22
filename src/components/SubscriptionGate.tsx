import { useState } from "react";
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
    "Market Visibility Tools",
  ],
  2: [
    "Funding Application Portal",
    "Business Workshops",
    "Market Visibility Tools",
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

  // Convert userPlan to number for comparison
  const currentPlanLevel =
    typeof userPlan === "string"
      ? userPlan === "none"
        ? 0
        : parseInt(userPlan) || 0
      : userPlan || 0;

  // Check if user has access
  const hasAccess = currentPlanLevel >= requiredPlan;

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

        // Call parent callback if provided
        if (onPlanUpdate) {
          onPlanUpdate(planLevel);
        }

        // Hide success message after 5 seconds instead of 3
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
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

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="max-w-lg mx-auto text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              Congratulations!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 mt-2">
              You've successfully upgraded to{" "}
              <span className="font-semibold text-gray-900">
                {planName} Plan
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-3">
                🎉 You now have access to:
              </h4>
              <ul className="space-y-2 text-left">
                {newPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2">
                Continue to {featureName}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSuccess(false)}
                className="w-full text-gray-600 hover:text-gray-800">
                Continue Exploring Dashboard
              </Button>
              <p className="text-xs text-gray-500">
                Your dashboard will refresh to show all available features
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

  // Default blocked access UI
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Premium Feature
          </CardTitle>
          <CardDescription>
            {featureName} requires a{" "}
            {planNames[requiredPlan as keyof typeof planNames]} plan or higher
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            You're currently on the{" "}
            {planNames[currentPlanLevel as keyof typeof planNames]} plan.
            Upgrade to unlock this feature and many more!
          </p>
          <div className="space-y-2">
            <Button onClick={() => setShowUpgrade(true)} className="w-full">
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
