import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../config/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import {
  Users,
  Edit,
  Shield,
  Star,
  Calendar,
  Mail,
  User,
  Filter,
  Search,
} from "lucide-react";

// User interface based on the Firestore collection structure
interface User {
  id: string;
  displayName: string;
  email: string;
  name: string;
  surname: string;
  dob: string;
  gender: string;
  plan: string; // "none", "1", "2"
  isAdmin: boolean;
  photoURL: string;
  lastLogin: string;
  createdAt?: any;
}

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterAdmin, setFilterAdmin] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const queryClient = useQueryClient();

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all users from the users collection
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const q = query(collection(db, "users"), orderBy("lastLogin", "desc"));
        const snapshot = await getDocs(q);
        const allUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        console.log(`Fetched ${allUsers.length} users`);
        return allUsers;
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        throw error;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: {
      userId: string;
      updates: Partial<User>;
    }) => {
      const { userId, updates } = userData;

      // Remove email from updates as it's not editable
      const { email, ...editableUpdates } = updates;

      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        ...editableUpdates,
        updatedAt: new Date(),
      });

      return { userId, updates: editableUpdates };
    },
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
      console.error("Update error:", error);
    },
  });

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      displayName: user.displayName || "",
      name: user.name || "",
      surname: user.surname || "",
      dob: user.dob || "",
      gender: user.gender || "",
      plan: user.plan || "none",
      isAdmin: user.isAdmin || false,
    });
    setEditDialogOpen(true);
  };

  // Handle form submission
  const handleSubmitEdit = () => {
    if (!selectedUser) return;

    // Basic validation
    if (!editForm.displayName?.trim()) {
      toast.error("Display name is required");
      return;
    }

    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates: editForm,
    });
  };

  // Get plan display name and badge variant
  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case "none":
      case "0":
        return {
          name: "Free",
          variant: "outline" as const,
          color: "text-gray-600",
        };
      case "1":
        return {
          name: "Standard",
          variant: "secondary" as const,
          color: "text-blue-600",
        };
      case "2":
        return {
          name: "Premium",
          variant: "default" as const,
          color: "text-orange-600 bg-orange-50 border-orange-200",
        };
      default:
        return {
          name: "Free",
          variant: "outline" as const,
          color: "text-gray-600",
        };
    }
  };

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      // Handle Firestore timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }

      // Handle string dates
      if (typeof timestamp === "string") {
        return new Date(timestamp).toLocaleDateString();
      }

      // Handle Date objects
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }

      return "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        user.displayName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.name?.toLowerCase().includes(search) ||
        user.surname?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Plan filter
    if (filterPlan !== "all") {
      const userPlan = user.plan === "none" ? "0" : user.plan;
      if (userPlan !== filterPlan) return false;
    }

    // Admin filter
    if (filterAdmin !== "all") {
      if (filterAdmin === "admin" && !user.isAdmin) return false;
      if (filterAdmin === "user" && user.isAdmin) return false;
    }

    return true;
  });

  // Get user initials for avatar
  const getUserInitials = (user: User) => {
    if (user.name && user.surname) {
      return `${user.name[0]}${user.surname[0]}`.toUpperCase();
    }
    if (user.displayName) {
      const names = user.displayName.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, plans, and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((user) => user.isAdmin).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Premium Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((user) => user.plan === "2").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    users.filter((user) => {
                      if (!user.lastLogin) return false;
                      const lastLogin = new Date(user.lastLogin);
                      const today = new Date();
                      return lastLogin.toDateString() === today.toDateString();
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="0">Free</SelectItem>
                    <SelectItem value="1">Standard</SelectItem>
                    <SelectItem value="2">Premium</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterAdmin} onValueChange={setFilterAdmin}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="user">Regular Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading users. Please try refreshing the page.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const planInfo = getPlanInfo(user.plan);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.photoURL}
                                alt={user.displayName}
                              />
                              <AvatarFallback>
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.displayName || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.name || user.surname
                                  ? `${user.name || ""} ${user.surname || ""}`.trim()
                                  : "No name set"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={planInfo.variant}
                            className={planInfo.color}>
                            {planInfo.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="destructive">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <User className="h-3 w-3 mr-1" />
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.gender || "Not set"}</TableCell>
                        <TableCell>{user.dob || "Not set"}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.lastLogin)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Email cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email (Read-only)</Label>
              <Input
                id="email"
                value={selectedUser?.email || ""}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={editForm.displayName || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, displayName: e.target.value })
                }
                placeholder="Enter display name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="name"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={editForm.surname || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, surname: e.target.value })
                  }
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={editForm.dob || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, dob: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={editForm.gender || "not_specified"}
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    gender: value === "not_specified" ? "" : value,
                  })
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not specified</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={editForm.plan || "none"}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, plan: value })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Free</SelectItem>
                  <SelectItem value="1">Standard</SelectItem>
                  <SelectItem value="2">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="isAdmin">Admin Status</Label>
              <Select
                value={editForm.isAdmin ? "true" : "false"}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, isAdmin: value === "true" })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Regular User</SelectItem>
                  <SelectItem value="true">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
