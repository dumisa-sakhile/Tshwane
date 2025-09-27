import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Eye,
  BarChart3,
  Search,
  Filter,
  Target,
} from "lucide-react";

// Business interface derived from funding applications
interface Business {
  id: string;
  businessName: string;
  legalStructure: string;
  industry: string;
  businessDescription: string;
  yearsInOperation: number;
  numberOfEmployees: number;
  townshipLocation: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  existingDebt?: number;
  mainCustomers: string;
  revenueStreams: string;
  fundingRequested: number;
  fundingType: string;
  fundingPurpose: string[];
  fundingStatus: string;
  jobsToCreate: number;
  communityImpact: string;
  growthPlan: string;
  challenges: string;
  submissionDate: Date;
  isBlackOwned: boolean;
  isWomenOwned: boolean;
  isYouthOwned: boolean;
  isDisabilityOwned: boolean;
}

export const Route = createFileRoute("/dashboard/admin/businesses")({
  component: BusinessRegistry,
});
function BusinessRegistry() {
  const [user, setUser] = useState<any>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all funding applications to create business profiles
  const {
    data: businesses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["business-registry"],
    queryFn: async () => {
      if (!user?.uid) return [];

      try {
        const q = query(
          collection(db, "funding"),
          orderBy("submissionDate", "desc")
        );

        const querySnapshot = await getDocs(q);
        const businessData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            businessName: data.businessInfo?.businessName || "Unknown Business",
            legalStructure:
              data.businessInfo?.legalStructure || "Not specified",
            industry: data.businessInfo?.industry || "Not specified",
            businessDescription: data.businessInfo?.businessDescription || "",
            yearsInOperation: data.businessInfo?.yearsInOperation || 0,
            numberOfEmployees: data.businessInfo?.numberOfEmployees || 0,
            townshipLocation:
              data.businessInfo?.townshipLocation || "Not specified",
            ownerName: data.ownerInfo?.fullName || "Unknown Owner",
            ownerEmail: data.ownerInfo?.email || "",
            ownerPhone: data.ownerInfo?.phoneNumber || "",
            monthlyRevenue: data.businessPerformance?.monthlyRevenue || 0,
            monthlyExpenses: data.businessPerformance?.monthlyExpenses || 0,
            existingDebt: data.businessPerformance?.existingDebt || 0,
            mainCustomers: data.businessPerformance?.mainCustomers || "",
            revenueStreams: data.businessPerformance?.revenueStreams || "",
            fundingRequested: data.fundingRequest?.amountRequested || 0,
            fundingType: data.fundingRequest?.fundingType || "Not specified",
            fundingPurpose: data.fundingRequest?.purpose || [],
            fundingStatus: data.status || "pending",
            jobsToCreate: data.impactPlan?.jobsToCreate || 0,
            communityImpact: data.impactPlan?.communityImpact || "",
            growthPlan: data.impactPlan?.growthPlan || "",
            challenges: data.impactPlan?.challenges || "",
            submissionDate: data.submissionDate?.toDate?.() || new Date(),
            isBlackOwned:
              data.ownerInfo?.ownershipDemographics?.isBlackOwned || false,
            isWomenOwned:
              data.ownerInfo?.ownershipDemographics?.isWomenOwned || false,
            isYouthOwned:
              data.ownerInfo?.ownershipDemographics?.isYouthOwned || false,
            isDisabilityOwned:
              data.ownerInfo?.ownershipDemographics?.isDisabilityOwned || false,
          } as Business;
        });

        return businessData;
      } catch (error) {
        console.error("Error fetching business data:", error);
        toast.error("Failed to load business registry");
        return [];
      }
    },
    enabled: !!user?.uid,
  });

  // Get unique values for filters
  const industries = [...new Set(businesses.map((b) => b.industry))].filter(
    Boolean
  );
  const locations = [
    ...new Set(businesses.map((b) => b.townshipLocation)),
  ].filter(Boolean);

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        business.businessName.toLowerCase().includes(search) ||
        business.ownerName.toLowerCase().includes(search) ||
        business.industry.toLowerCase().includes(search) ||
        business.townshipLocation.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    if (filterIndustry !== "all" && business.industry !== filterIndustry)
      return false;
    if (
      filterLocation !== "all" &&
      business.townshipLocation !== filterLocation
    )
      return false;
    if (filterStatus !== "all" && business.fundingStatus !== filterStatus)
      return false;

    return true;
  });

  // Analytics calculations
  const totalBusinesses = businesses.length;
  const totalFundingRequested = businesses.reduce(
    (sum, b) => sum + b.fundingRequested,
    0
  );
  const totalJobsToCreate = businesses.reduce(
    (sum, b) => sum + b.jobsToCreate,
    0
  );
  const averageEmployees =
    businesses.length > 0
      ? Math.round(
          businesses.reduce((sum, b) => sum + b.numberOfEmployees, 0) /
            businesses.length
        )
      : 0;

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: "outline" as const,
        color: "text-orange-600 bg-orange-50",
      },
      under_review: {
        variant: "secondary" as const,
        color: "text-blue-600 bg-blue-50",
      },
      approved: {
        variant: "default" as const,
        color: "text-green-600 bg-green-50",
      },
      rejected: {
        variant: "destructive" as const,
        color: "text-red-600 bg-red-50",
      },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  // Get demographics badges
  const getDemographicsBadges = (business: Business) => {
    const badges = [];
    if (business.isBlackOwned)
      badges.push({
        label: "Black Owned",
        color: "bg-purple-100 text-purple-800",
      });
    if (business.isWomenOwned)
      badges.push({ label: "Women Owned", color: "bg-pink-100 text-pink-800" });
    if (business.isYouthOwned)
      badges.push({ label: "Youth Owned", color: "bg-blue-100 text-blue-800" });
    if (business.isDisabilityOwned)
      badges.push({
        label: "Disability Owned",
        color: "bg-green-100 text-green-800",
      });
    return badges;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate profit margin
  const getProfitMargin = (revenue: number, expenses: number) => {
    if (revenue === 0) return 0;
    return ((revenue - expenses) / revenue) * 100;
  };

  if (!user) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            Business Registry
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive directory and analytics of township businesses
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Businesses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBusinesses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Funding Requested
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalFundingRequested)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Jobs to Create
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalJobsToCreate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <CardTitle>
                Business Directory ({filteredBusinesses.length})
              </CardTitle>
              <CardDescription>
                Registered businesses in the township economic hub
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select
                  value={filterIndustry}
                  onValueChange={setFilterIndustry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterLocation}
                  onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading businesses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading businesses. Please try refreshing the page.
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No businesses found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Funding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => {
                    const statusInfo = getStatusBadge(business.fundingStatus);
                    const profitMargin = getProfitMargin(
                      business.monthlyRevenue,
                      business.monthlyExpenses
                    );

                    return (
                      <TableRow key={business.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {business.businessName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {business.ownerName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{business.industry}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {business.townshipLocation}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>{business.numberOfEmployees}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatCurrency(business.monthlyRevenue)}
                            </p>
                            <p
                              className={`text-xs ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {profitMargin.toFixed(1)}% margin
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {formatCurrency(business.fundingRequested)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {business.fundingType}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusInfo.variant}
                            className={statusInfo.color}>
                            {business.fundingStatus
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBusiness(business)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
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

      {/* Business Detail Modal */}
      {selectedBusiness && (
        <Dialog
          open={!!selectedBusiness}
          onOpenChange={() => setSelectedBusiness(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedBusiness.businessName}
              </DialogTitle>
              <DialogDescription>
                Comprehensive business profile and analytics
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Business Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Business Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Legal Structure:</span>
                      <span>{selectedBusiness.legalStructure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Industry:</span>
                      <span>{selectedBusiness.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Years in Operation:</span>
                      <span>{selectedBusiness.yearsInOperation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Employees:</span>
                      <span>{selectedBusiness.numberOfEmployees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Location:</span>
                      <span>{selectedBusiness.townshipLocation}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Owner Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Full Name:</span>
                      <span>{selectedBusiness.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedBusiness.ownerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedBusiness.ownerPhone}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="font-medium text-sm mb-2">Demographics:</p>
                    <div className="flex flex-wrap gap-1">
                      {getDemographicsBadges(selectedBusiness).map(
                        (badge, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${badge.color}`}>
                            {badge.label}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedBusiness.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Monthly Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(selectedBusiness.monthlyExpenses)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p
                      className={`text-xl font-bold ${
                        getProfitMargin(
                          selectedBusiness.monthlyRevenue,
                          selectedBusiness.monthlyExpenses
                        ) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {getProfitMargin(
                        selectedBusiness.monthlyRevenue,
                        selectedBusiness.monthlyExpenses
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Funding Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Funding Request
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Amount Requested:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(selectedBusiness.fundingRequested)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Funding Type:</span>
                      <span>{selectedBusiness.fundingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={
                          getStatusBadge(selectedBusiness.fundingStatus).variant
                        }>
                        {selectedBusiness.fundingStatus
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-2">Purpose:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBusiness.fundingPurpose.map((purpose, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs">
                          {purpose}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact & Growth */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impact & Growth Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm">Jobs to Create:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedBusiness.jobsToCreate}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Submission Date:</p>
                    <p className="text-sm text-gray-600">
                      {selectedBusiness.submissionDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="font-medium text-sm">Community Impact:</p>
                    <p className="text-sm text-gray-700">
                      {selectedBusiness.communityImpact}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Growth Plan:</p>
                    <p className="text-sm text-gray-700">
                      {selectedBusiness.growthPlan}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Challenges:</p>
                    <p className="text-sm text-gray-700">
                      {selectedBusiness.challenges}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Business Description
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedBusiness.businessDescription}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
