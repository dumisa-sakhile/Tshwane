import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/workshops")({
  component: WorkshopsPage,
});

function WorkshopsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <GraduationCap className="h-10 w-10 text-green-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Business Workshops
          </h1>
          <p className="text-lg text-gray-600">
            Learn essential digital and business skills
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-lg mb-4">What to Expect:</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <span>Digital marketing and e-commerce workshops</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <span>Financial literacy and business planning sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <span>Technology skills development programs</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <span>Networking events and mentorship opportunities</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600">Feature Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
