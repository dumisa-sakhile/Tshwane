import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../config/firebase";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/funding")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    description: "",
    address: "",
    number: "",
  });

  // Submit new funding application
  const submitApplication = useMutation({
    mutationFn: async (applicationData: any) => {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      try {
        const docRef = await addDoc(collection(db, "funding"), {
          ...applicationData,
          userId: user.uid,
          Name: user.displayName?.split(" ")[0] || "",
          Surname: user.displayName?.split(" ")[1] || "",
          email: user.email || "",
          DOB: new Date(),
          status: "pending",
          feedback: "",
        });
        return docRef.id;
      } catch (error) {
        console.error("Error submitting application:", error);
        throw error;
      }
    },
    onSuccess: (docId) => {
      // Show success toast
      toast.success("Application submitted successfully! 🎉", {
        duration: 4000,
        position: "top-center",
      });

      // Invalidate all tanstack queries to refresh data
      queryClient.invalidateQueries();

      // Reset form
      setFormData({
        businessName: "",
        category: "",
        description: "",
        address: "",
        number: "",
      });

      // Show thank you message
      setShowThankYou(true);

      console.log("Application submitted with ID:", docId);
    },
    onError: (error: any) => {
      console.error("Submission error:", error);
      toast.error(
        error.message || "Failed to submit application. Please try again.",
        {
          duration: 4000,
          position: "top-center",
        }
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.businessName ||
      !formData.category ||
      !formData.description ||
      !formData.address ||
      !formData.number
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please log in to submit an application");
      return;
    }

    submitApplication.mutate(formData);
  };

  const handleNewApplication = () => {
    setShowThankYou(false);
    setFormData({
      businessName: "",
      category: "",
      description: "",
      address: "",
      number: "",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Funding Applications
        </h1>
        <p className="text-gray-600 mt-2">
          Apply for funding opportunities for your business
        </p>
      </div>

      {/* Show loading if user is not authenticated yet */}
      {!user ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : showThankYou ? (
        /* Thank You Message */
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You for Your Application!
            </h2>
            <p className="text-gray-600 mb-6">
              Your funding application has been submitted successfully. Our team
              will review your application and get back to you within 5-7
              business days.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 text-sm">
                <strong>What happens next?</strong>
                <br />
                1. Our team will review your application
                <br />
                2. We may contact you for additional information
                <br />
                3. You'll receive a decision via email
              </p>
            </div>
            <Button onClick={handleNewApplication} className="mt-4">
              Submit Another Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Application Form */
        <Card>
          <CardHeader>
            <CardTitle>New Funding Application</CardTitle>
            <CardDescription>
              Complete this form to apply for business funding opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessName: e.target.value,
                      })
                    }
                    placeholder="Enter your business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Business Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech">Technology</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Food">Food & Beverage</SelectItem>
                      <SelectItem value="Services">
                        Professional Services
                      </SelectItem>
                      <SelectItem value="Manufacturing">
                        Manufacturing
                      </SelectItem>
                      <SelectItem value="Creative">Creative Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Full business address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Contact Number *</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your business, products/services, and funding needs..."
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitApplication.isPending}
                className="w-full md:w-auto">
                {submitApplication.isPending
                  ? "Submitting..."
                  : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
