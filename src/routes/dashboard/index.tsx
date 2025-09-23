import { createFileRoute, Link } from "@tanstack/react-router";
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
      href: "/dashboard/documents",
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
