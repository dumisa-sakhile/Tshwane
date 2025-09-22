import { createFileRoute,Link } from "@tanstack/react-router";
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
  Shield,
  Lock,
  Zap,
  Users,
  Target,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Unlocking Digital Innovation for Township Economic
                Revitalisation
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Connecting township entrepreneurs with funding opportunities and
                resources to grow their businesses.
              </p>
              <Link to="/auth" className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                  Find Funding Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10">
                  Learn About Workshops
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="bg-white rounded-xl p-6 text-gray-800 shadow-2xl">
                  <h3 className="font-bold text-lg mb-4">
                    Join hundreds of township businesses
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business" className="text-sm">
                        Business Type
                      </Label>
                      <Input
                        type="text"
                        id="business"
                        placeholder="What's your business?"
                        className="mt-1"
                      />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Addressing Township Business Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-2">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <MapPin className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-red-600">
                  Limited Broadband Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Many township businesses struggle with unreliable internet
                  connectivity, limiting their digital presence.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Users className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <CardTitle className="text-yellow-600">
                  Poor Market Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Township businesses often lack visibility in formal markets
                  and struggle to reach broader customer bases.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-blue-600">
                  Digital Tools Gap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Limited access to digital tools and platforms prevents growth
                  and innovation in township economies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Our Solution: Township Economic Hub
              </h2>
              <p className="text-lg mb-6 text-gray-600">
                We've created a dedicated platform to help township
                entrepreneurs access funding, resources, and workshops to grow
                their businesses in the digital economy.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-full mt-1">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Hyperlocal Focus</h3>
                    <p className="text-gray-600">
                      Unlike generic funding platforms, we specialize in
                      township-specific opportunities and challenges.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-full mt-1">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Secure Document Handling
                    </h3>
                    <p className="text-gray-600">
                      Safely upload and store your ID, proof of address, and
                      CIPC documents with bank-level security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-full mt-1">
                    <Lock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Low-Bandwidth Optimized
                    </h3>
                    <p className="text-gray-600">
                      Our platform works even in areas with limited internet
                      connectivity, with offline capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-700">
                    Services We Offer
                  </CardTitle>
                  <CardDescription>
                    Comprehensive support for township entrepreneurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2">
                      Funding Application Portal
                    </h4>
                    <p className="text-gray-600">
                      Find and apply for relevant funding opportunities with our
                      streamlined application process.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2">
                      Business Workshops
                    </h4>
                    <p className="text-gray-600">
                      Learn essential digital and business skills through our
                      regularly scheduled workshops.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2">
                      Market Visibility Tools
                    </h4>
                    <p className="text-gray-600">
                      Increase your business visibility with our digital
                      marketing and listing services.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2">
                      Secure Document Management
                    </h4>
                    <p className="text-gray-600">
                      Store and manage your business documents securely with
                      encrypted databases.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2">
                      Broadband Access Initiatives
                    </h4>
                    <p className="text-gray-600">
                      We help township businesses get connected through
                      partnerships with ISPs like MTN. 
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Enterprise-Grade Security
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            We take the security of your data seriously with multiple layers of
            protection
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-blue-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle>Confidentiality</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Your sensitive documents are protected with encrypted
                  databases and multi-factor authentication.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle>Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Comprehensive audit trails track all changes to applications,
                  ensuring transparency and accountability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Offline access and mobile optimization ensure the platform
                  works even in low-bandwidth areas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to grow your township business?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join our platform today and access funding opportunities, workshops,
            and tools designed specifically for township entrepreneurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8">
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Township Economic Hub
              </h3>
              <p className="text-gray-400">
                Unlocking digital innovation for township economic
                revitalization.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Funding Opportunities
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Workshops
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Success Stories
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
              </div>
              <p className="mt-4 text-gray-400">info@townshipeconomichub.org</p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Tswane Economic Hub. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
