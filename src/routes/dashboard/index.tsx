import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { FileText, GraduationCap, Eye, Shield, Wifi } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const services = [
    {
      title: "Funding Application Portal",
      description: "Find and apply for relevant funding opportunities",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Business Workshops",
      description: "Learn essential digital and business skills",
      icon: GraduationCap,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Market Visibility Tools",
      description: "Increase your business visibility online",
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Secure Document Management",
      description: "Store and manage business documents securely",
      icon: Shield,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Broadband Access Initiatives",
      description: "Get connected through our ISP partnerships",
      icon: Wifi,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your Tswane Economic Hub dashboard. Access all your
          business growth tools and resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.title}
            className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div
                className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                <service.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Click on the menu to access this service
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>
            Overview of your business activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">
                Applications Submitted
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Workshops Attended</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">
                Marketing Tools Active
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-500">Documents Stored</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
