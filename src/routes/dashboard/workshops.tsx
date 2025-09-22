import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { SubscriptionGate } from "../../components/SubscriptionGate";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "../../components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  GraduationCap,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { format, isAfter, isSameDay, startOfDay } from "date-fns";

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

interface Instructor {
  name: string;
  number: string;
  img: string;
  role: string;
}

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  category: string;
  instructor: Instructor;
  price: number;
  isOnline: boolean;
  requirements?: string[];
  whatYouWillLearn: string[];
}

// Mock future events with detailed instructor information
const mockFutureEvents: Workshop[] = [
  {
    id: "future-1",
    title: "Digital Marketing for Small Businesses",
    description:
      "Learn how to effectively market your business online using social media, SEO, and digital advertising strategies.",
    date: new Date(2025, 8, 25), // September 25, 2025
    startTime: "09:00",
    endTime: "12:00",
    location: "Tshwane Innovation Hub",
    maxParticipants: 25,
    currentParticipants: 18,
    category: "Digital Skills",
    instructor: {
      name: "Sarah Mthembu",
      number: "+27 82 123 4567",
      img: "/samukelisiwe.jpg",
      role: "Digital Marketing Specialist",
    },
    price: 250,
    isOnline: false,
    requirements: ["Basic computer skills", "Smartphone or laptop"],
    whatYouWillLearn: [
      "Social media marketing strategies",
      "Google Ads basics",
      "Content creation for business",
      "Analytics and reporting",
    ],
  },
  {
    id: "future-2",
    title: "Financial Literacy & Business Planning",
    description:
      "Master the fundamentals of business finance, budgeting, and creating a comprehensive business plan.",
    date: new Date(2025, 8, 28), // September 28, 2025
    startTime: "14:00",
    endTime: "17:00",
    location: "Centurion Business Centre",
    maxParticipants: 30,
    currentParticipants: 22,
    category: "Business Development",
    instructor: {
      name: "Thabo Molefe",
      number: "+27 83 234 5678",
      img: "/siyabonga.jpg",
      role: "Business Development Consultant",
    },
    price: 300,
    isOnline: false,
    requirements: ["Basic mathematics", "Business idea or existing business"],
    whatYouWillLearn: [
      "Financial planning basics",
      "Cash flow management",
      "Business plan template",
      "Funding opportunities",
    ],
  },
  {
    id: "future-3",
    title: "E-commerce & Online Store Setup",
    description:
      "Build your online presence and learn to set up an e-commerce store from scratch.",
    date: new Date(2025, 9, 2), // October 2, 2025
    startTime: "10:00",
    endTime: "15:00",
    location: "Online Workshop",
    maxParticipants: 40,
    currentParticipants: 35,
    category: "Digital Skills",
    instructor: {
      name: "Nomsa Khumalo",
      number: "+27 84 345 6789",
      img: "/selby.jpg",
      role: "E-commerce Specialist",
    },
    price: 200,
    isOnline: true,
    requirements: [
      "Internet connection",
      "Computer/laptop",
      "Basic computer skills",
    ],
    whatYouWillLearn: [
      "E-commerce platform selection",
      "Product photography",
      "Payment gateway integration",
      "Online marketing strategies",
    ],
  },
  {
    id: "future-4",
    title: "Agricultural Technology & Innovation",
    description:
      "Discover modern farming techniques and agricultural technology solutions for sustainable farming.",
    date: new Date(2025, 9, 5), // October 5, 2025
    startTime: "08:00",
    endTime: "16:00",
    location: "Tshwane Agricultural College",
    maxParticipants: 20,
    currentParticipants: 15,
    category: "Agriculture",
    instructor: {
      name: "Dr. Mpho Tladi",
      number: "+27 85 456 7890",
      img: "/quinton.jpg",
      role: "Agricultural Technology Expert",
    },
    price: 400,
    isOnline: false,
    requirements: ["Interest in agriculture", "Basic literacy"],
    whatYouWillLearn: [
      "Smart farming techniques",
      "Irrigation systems",
      "Crop management apps",
      "Market access strategies",
    ],
  },
  {
    id: "future-5",
    title: "Youth Entrepreneurship Bootcamp",
    description:
      "An intensive program designed for young entrepreneurs to develop business skills and network with peers.",
    date: new Date(2025, 9, 10), // October 10, 2025
    startTime: "09:00",
    endTime: "17:00",
    location: "University of Pretoria Innovation Hub",
    maxParticipants: 50,
    currentParticipants: 45,
    category: "Entrepreneurship",
    instructor: {
      name: "Lerato Sibeko",
      number: "+27 86 567 8901",
      img: "/sakhile.jpg",
      role: "Youth Development Coordinator",
    },
    price: 150,
    isOnline: false,
    requirements: ["Age 18-35", "Business idea", "High school certificate"],
    whatYouWillLearn: [
      "Business model development",
      "Pitch preparation",
      "Networking skills",
      "Funding options for youth",
    ],
  },
];

export const Route = createFileRoute("/dashboard/workshops")({
  component: WorkshopsPage,
});

function WorkshopsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null
  );

  // Fetch workplace data from Firestore and combine with mock future events
  const { data: workshops = [], isLoading: workshopsLoading } = useQuery({
    queryKey: ["workshops"],
    queryFn: async () => {
      try {
        // Fetch workplace data from Firestore
        const workplaceQuery = query(
          collection(db, "workplace"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(workplaceQuery);

        const workplaceData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        // Transform workplace data to workshop format if needed
        const firestoreWorkshops: Workshop[] = workplaceData
          .filter((item: any) => item.type === "workshop" || item.category) // Filter for workshop-related items
          .map((item: any) => ({
            id: item.id,
            title: item.title || item.name || "Workshop",
            description: item.description || "Workshop description",
            date: item.date ? new Date(item.date.seconds * 1000) : new Date(),
            startTime: item.startTime || "09:00",
            endTime: item.endTime || "12:00",
            location: item.location || "TBD",
            maxParticipants: item.maxParticipants || 20,
            currentParticipants: item.currentParticipants || 0,
            category: item.category || "General",
            instructor: item.instructor || {
              name: item.instructorName || item.name || "Instructor",
              number: item.instructorNumber || item.number || "+27 11 000 0000",
              img: item.instructorImg || item.img || "/default-avatar.jpg",
              role: item.instructorRole || item.role || "Instructor",
            },
            price: item.price || 0,
            isOnline: item.isOnline || false,
            requirements: item.requirements || [],
            whatYouWillLearn: item.whatYouWillLearn || [],
          }));

        // Combine Firestore data with mock future events
        const allWorkshops = [...firestoreWorkshops, ...mockFutureEvents];

        console.log(
          "Fetched workshops from Firestore:",
          firestoreWorkshops.length
        );
        console.log("Mock future events:", mockFutureEvents.length);
        console.log("Total workshops:", allWorkshops.length);

        return allWorkshops;
      } catch (error) {
        console.error("Error fetching workplace data:", error);
        // If Firestore fails, return only mock future events
        console.log("Falling back to mock future events only");
        return mockFutureEvents;
      }
    },
  });
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
    // Update local state when plan changes
    if (userData) {
      setUserData({
        ...userData,
        plan: newPlan.toString(),
      });
    }
  };

  // Filter workshops for selected date
  const workshopsForSelectedDate = workshops.filter(
    (workshop) => selectedDate && isSameDay(workshop.date, selectedDate)
  );

  // Get upcoming workshops
  const upcomingWorkshops = workshops
    .filter((workshop) => isAfter(workshop.date, startOfDay(new Date())))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  // Get dates that have workshops for calendar highlighting
  const workshopDates = workshops.map((workshop) => workshop.date);

  if (loading || workshopsLoading) {
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
      requiredPlan={1} // Requires Standard plan or higher
      featureName="Business Workshops"
      onPlanUpdate={handlePlanUpdate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Workshops
            </h1>
            <p className="text-gray-600">
              Learn essential digital and business skills through our
              comprehensive workshop program
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Workshop Calendar
                </CardTitle>
                <CardDescription>
                  Select a date to view available workshops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    workshopDay: workshopDates,
                  }}
                  modifiersStyles={{
                    workshopDay: {
                      backgroundColor: "#10b981",
                      color: "white",
                      fontWeight: "bold",
                    },
                  }}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Workshop available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workshops List Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Selected Date Workshops */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Workshops on {format(selectedDate, "MMMM dd, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workshopsForSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                      {workshopsForSelectedDate.map((workshop) => (
                        <div
                          key={workshop.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">
                              {workshop.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                workshop.isOnline
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}>
                              {workshop.isOnline ? "Online" : "In-Person"}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {workshop.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {workshop.startTime} - {workshop.endTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {workshop.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {workshop.currentParticipants}/
                              {workshop.maxParticipants} participants
                            </div>
                            <div className="font-medium text-green-600">
                              R{workshop.price}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <img
                                src={workshop.instructor.img}
                                alt={workshop.instructor.name}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/default-avatar.jpg";
                                }}
                              />
                              <span className="text-sm text-gray-500">
                                {workshop.instructor.name} -{" "}
                                {workshop.instructor.role}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedWorkshop(workshop)}>
                                View Details
                              </Button>
                              <Button size="sm">Register</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No workshops scheduled for this date.</p>
                      <p className="text-sm">
                        Try selecting another date or check out upcoming
                        workshops below.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Workshops */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Workshops</CardTitle>
                <CardDescription>
                  Don't miss these upcoming learning opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingWorkshops.map((workshop) => (
                    <div
                      key={workshop.id}
                      className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{workshop.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {workshop.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {format(workshop.date, "MMM dd")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {workshop.startTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {workshop.isOnline ? "Online" : workshop.location}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedWorkshop(workshop)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Workshop Categories</CardTitle>
                <CardDescription>Explore workshops by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from(new Set(workshops.map((w) => w.category))).map(
                    (category) => {
                      const categoryCount = workshops.filter(
                        (w) => w.category === category
                      ).length;
                      return (
                        <div
                          key={category}
                          className="bg-gray-50 rounded-lg p-3 text-center">
                          <h4 className="font-medium text-sm">{category}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {categoryCount} workshops
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Workshop Detail Modal/Sidebar would go here */}
        {selectedWorkshop && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedWorkshop.title}</CardTitle>
                  <CardDescription>{selectedWorkshop.category}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedWorkshop(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">What You'll Learn:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {selectedWorkshop.whatYouWillLearn.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  {selectedWorkshop.requirements && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {selectedWorkshop.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="font-medium">
                        {format(selectedWorkshop.date, "MMMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="font-medium">
                        {selectedWorkshop.startTime} -{" "}
                        {selectedWorkshop.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="font-medium">
                        {selectedWorkshop.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Instructor:</span>
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedWorkshop.instructor.img}
                          alt={selectedWorkshop.instructor.name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/default-avatar.jpg";
                          }}
                        />
                        <div className="text-right">
                          <div className="font-medium">
                            {selectedWorkshop.instructor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedWorkshop.instructor.role}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedWorkshop.instructor.number}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-medium text-green-600">
                        R{selectedWorkshop.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Spots Available:
                      </span>
                      <span className="font-medium">
                        {selectedWorkshop.maxParticipants -
                          selectedWorkshop.currentParticipants}{" "}
                        / {selectedWorkshop.maxParticipants}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" size="lg">
                    Register for Workshop
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SubscriptionGate>
  );
}
