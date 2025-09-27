import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, getDocs, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../config/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  FileText,
  GraduationCap,
  Eye,
  Shield,
  Wifi,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [user, setUser] = useState<any>(null);

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch funding applications stats
  const { data: fundingStats = { approved: 0, pending: 0, rejected: 0 } } =
    useQuery({
      queryKey: ["funding-stats", user?.uid],
      queryFn: async () => {
        if (!user?.uid) return { approved: 0, pending: 0, rejected: 0 };

        try {
          // Get approved applications
          const approvedQuery = query(
            collection(db, "funding"),
            where("userId", "==", user.uid),
            where("status", "==", "approved")
          );
          const approvedSnapshot = await getDocs(approvedQuery);
          const approved = approvedSnapshot.size;

          // Get pending applications
          const pendingQuery = query(
            collection(db, "funding"),
            where("userId", "==", user.uid),
            where("status", "==", "pending")
          );
          const pendingSnapshot = await getDocs(pendingQuery);
          const pending = pendingSnapshot.size;

          // Get rejected applications
          const rejectedQuery = query(
            collection(db, "funding"),
            where("userId", "==", user.uid),
            where("status", "==", "rejected")
          );
          const rejectedSnapshot = await getDocs(rejectedQuery);
          const rejected = rejectedSnapshot.size;

          return { approved, pending, rejected };
        } catch (error) {
          console.error("Error fetching funding stats:", error);
          return { approved: 0, pending: 0, rejected: 0 };
        }
      },
      enabled: !!user?.uid,
    });

  const services = [
    {
      title: "Funding Application Portal",
      description: "Find and apply for relevant funding opportunities",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      href: "/dashboard/funding",
    },
    {
      title: "Business Workshops",
      description: "Learn essential digital and business skills",
      icon: GraduationCap,
      color: "bg-green-50 text-green-600",
      href: "/dashboard/workshops",
    },
    {
      title: "Market Visibility Tools",
      description: "Increase your business visibility online",
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
      href: "/dashboard/visibility",
    },
    {
      title: "Mergers and Acquisitions",
      description: "Facilitate partnerships, mergers and acquisitions",
      icon: Shield,
      color: "bg-yellow-50 text-yellow-600",
      href: "/dashboard/mergers",
    },
    {
      title: "Broadband Access Initiatives",
      description: "Get connected through our ISP partnerships",
      icon: Wifi,
      color: "bg-red-50 text-red-600",
      href: "/dashboard/broadband",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your Tshwane Economic Hub dashboard. Access all your
          business growth tools and resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Link
            key={service.title}
            to={service.href}
            className="block transition-transform hover:scale-105">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div
                  className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-600 font-medium">
                  Click to access →
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funding Application Stats</CardTitle>
          <CardDescription>
            Overview of your funding application status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {user ? fundingStats.approved : 0}
              </div>
              <div className="text-sm text-gray-600">Approved Applications</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {user ? fundingStats.pending : 0}
              </div>
              <div className="text-sm text-gray-600">Pending Applications</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {user ? fundingStats.rejected : 0}
              </div>
              <div className="text-sm text-gray-600">Rejected Applications</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
