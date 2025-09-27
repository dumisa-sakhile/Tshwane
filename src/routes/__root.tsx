import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Monitor, Smartphone, AlertTriangle } from "lucide-react";

// Mobile Warning Component
function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth < 768; // Below tablet size
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-orange-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Desktop Required</h1>
          <p className="text-gray-600 leading-relaxed">
            For the best experience with the Tshwane Economic Hub dashboard,
            please use a laptop or desktop computer.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Smartphone className="h-5 w-5" />
              <span className="text-sm">Mobile</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-blue-600">
              <Monitor className="h-5 w-5" />
              <span className="text-sm font-medium">Desktop</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Our dashboard is optimized for larger screens to provide you with
            the best tools and experience.
          </p>
        </div>

        <div className="text-xs text-gray-400">Tshwane Economic Hub</div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <div className="poppins-light h-full overflow-y-auto">
      <MobileWarning />
      <Header />
      <Outlet />
    </div>
  ),
});
