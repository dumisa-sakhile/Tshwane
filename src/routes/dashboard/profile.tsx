import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Mail, Edit3, Save, X, ArrowLeft, ChevronDownIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

interface UserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  plan: string;
  name?: string;
  surname?: string;
  gender?: string;
  dob?: string;
  createdAt?: any;
}

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const queryClient = useQueryClient();

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setFormData(data); // Initialize form data
          return data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile");
        return null;
      }
    },
    enabled: !!user?.uid,
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<UserData>) => {
      if (!user?.uid) throw new Error("No user found");

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...updatedData,
        updatedAt: new Date(),
      });

      return updatedData;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.uid] });
    },
    onError: (error: any) => {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(userData || {});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500">
          Error loading profile. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              {isEditing
                ? "Edit your personal information below"
                : "Your personal information and account details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ""}
                    disabled
                    className="pl-10 bg-gray-50"
                    placeholder="Email address"
                  />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={
                    isEditing
                      ? formData.displayName || ""
                      : userData?.displayName || "Not set"
                  }
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Display name"
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="name"
                  value={
                    isEditing
                      ? formData.name || ""
                      : userData?.name || "Not set"
                  }
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  placeholder="First name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={
                    isEditing
                      ? formData.surname || ""
                      : userData?.surname || "Not set"
                  }
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Last name"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={userData?.gender || "Not specified"}
                    disabled
                    className="capitalize"
                  />
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                {isEditing ? (
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="dob"
                        className="w-full justify-between font-normal">
                        {formData.dob
                          ? format(new Date(formData.dob), "MMMM d, yyyy")
                          : "Select date"}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.dob ? new Date(formData.dob) : undefined
                        }
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange(
                              "dob",
                              format(date, "yyyy-MM-dd")
                            );
                          }
                          setIsDatePickerOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    value={
                      userData?.dob
                        ? format(new Date(userData.dob), "MMMM d, yyyy")
                        : "Not set"
                    }
                    disabled
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">* Required fields</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
