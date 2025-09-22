import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../config/firebase";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/dashboard/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [user, setUser] = useState<any>(null);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all users from the users collection
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(`Fetched ${allUsers.length} users`);
        return allUsers;
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });

  // Helper function to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    // Handle Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }

    // Handle regular Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }

    // Handle string dates
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-600 mt-2">
          Complete list of registered users from the Firestore users collection
        </p>
      </div>

      {/* Show loading if user is not authenticated yet */}
      {!user ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Users Table</CardTitle>
            <CardDescription>
              {users?.length || 0} total users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading users. Please try refreshing the page.
              </div>
            ) : users?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found in the system.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Surname</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || user.displayName?.split(" ")[0] || "N/A"}
                        </TableCell>
                        <TableCell>
                          {user.surname || user.displayName?.split(" ")[1] || "N/A"}
                        </TableCell>
                        <TableCell>
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          {user.gender || "Not specified"}
                        </TableCell>
                        <TableCell>
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}