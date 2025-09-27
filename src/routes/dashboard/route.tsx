import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { Button } from "../../components/ui/button";
import {
  FileText,
  GraduationCap,
  Eye,
  Shield,
  Wifi,
  Users,
  Building2,
  LogOut,
  Home,
  Lock,
  DollarSign
} from "lucide-react";

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

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists()) {
            // Merge existing data with defaults
            const existingData = userDoc.data();
            const userData: UserData = {
              email: existingData.email || user.email || "",
              displayName: existingData.displayName || user.displayName || "",
              photoURL: existingData.photoURL || user.photoURL || "",
              isAdmin: existingData.isAdmin || false,
              plan: existingData.plan || "none",
              name: existingData.name || "",
              surname: existingData.surname || "",
              gender: existingData.gender || "",
              dob: existingData.dob || "",
            };

            // Update the document with merged defaults if any fields were missing
            await setDoc(doc(db, "users", user.uid), userData, { merge: true });
            setUserData(userData);
          } else {
            // Create new document with defaults
            const newUserData: UserData = {
              email: user.email || "",
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              isAdmin: false,
              plan: "none",
              name: "",
              surname: "",
              gender: "",
              dob: "",
            };

            // Create the document in Firestore with merge to preserve any existing fields
            await setDoc(doc(db, "users", user.uid), newUserData, {
              merge: true,
            });
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching/creating user data:", error);
          // Fallback to local data with defaults
          const fallbackData: UserData = {
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            isAdmin: false,
            plan: "none",
            name: "",
            surname: "",
            gender: "",
            dob: "",
          };
          setUserData(fallbackData);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Convert plan to numeric value for comparison
  const currentPlanLevel = userData?.plan
    ? userData.plan === "none"
      ? 0
      : parseInt(userData.plan) || 0
    : 0;

  // Function to determine which icon to show (Lock or feature icon)
  const getMenuIcon = (item: (typeof menuItems)[0]) => {
    const isLocked = currentPlanLevel < item.requiredPlan;
    return isLocked ? Lock : item.icon;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 fixed inset-0">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 fixed inset-0">
        <div className="text-lg">Please log in to access the dashboard.</div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard/",
      requiredPlan: 0,
    },
    {
      title: "Funding Application Portal",
      icon: FileText,
      href: "/dashboard/funding",
      requiredPlan: 0,
    },
    {
      title: "Business Workshops",
      icon: GraduationCap,
      href: "/dashboard/workshops",
      requiredPlan: 1,
    },
    {
      title: "Market Visibility Tools",
      icon: Eye,
      href: "/dashboard/visibility",
      requiredPlan: 1,
    },
    {
      title: "Mergers and Acquisitions",
      icon: Shield,
      href: "/dashboard/documents",
      requiredPlan: 2,
    },
    {
      title: "Broadband Access Initiatives",
      icon: Wifi,
      href: "/dashboard/broadband",
      requiredPlan: 2,
    },
  ];

  const adminItems = [
    {
      title: "Funding Applications",
      icon: DollarSign,
      href: "/dashboard/admin/funding",
    },
    {
      title: "Users",
      icon: Users,
      href: "/dashboard/admin",
    },
    {
      title: "Business Profiles",
      icon: Building2,
      href: "/dashboard/admin/businesses",
    },
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 flex fixed inset-0 overflow-hidden">
      {/* Side Menu */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {userData?.displayName?.charAt(0)?.toUpperCase() ||
                  userData?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userData?.displayName || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Services
            </h3>
            {menuItems.map((item) => {
              const MenuIcon = getMenuIcon(item);
              const isLocked = currentPlanLevel < item.requiredPlan;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isLocked
                      ? "text-gray-400 hover:bg-gray-50 hover:text-gray-500"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  activeProps={{
                    className: isLocked
                      ? "bg-gray-50 text-gray-400 border-r-2 border-gray-300"
                      : "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                  }}
                  activeOptions={{ exact: true }}>
                  <MenuIcon
                    className={`mr-3 h-4 w-4 flex-shrink-0 ${
                      isLocked ? "text-gray-400" : ""
                    }`}
                  />
                  <span className="flex-1">{item.title}</span>
                  {isLocked && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-2">
                      {item.requiredPlan === 1 ? "Standard" : "Premium"}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section - Only show if user is admin */}
          {userData?.isAdmin && (
            <div className="pt-6 space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </h3>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700  hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  activeProps={{
                    className:
                      "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                  }}
                  activeOptions={{ exact: true }}>
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
