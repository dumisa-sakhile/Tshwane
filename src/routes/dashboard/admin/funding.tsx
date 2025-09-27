import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../config/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Building2,
  FileText,
Filter,  
} from "lucide-react";

// Types
interface FundingApplication {
  id: string;
  applicationId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "pending" | "under_review" | "approved" | "rejected";
  submissionDate?: Date;
  reviewerId?: string;
  reviewerName?: string;
  reviewDate?: Date;
  feedback?: string;
  businessInfo: {
    businessName: string;
    legalStructure: string;
    industry: string;
    businessDescription: string;
    yearsInOperation: number;
    numberOfEmployees: number;
    townshipLocation: string;
  };
  ownerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    ownershipDemographics: {
      isBlackOwned: boolean;
      isWomenOwned: boolean;
      isYouthOwned: boolean;
      isDisabilityOwned: boolean;
    };
  };
  fundingRequest: {
    amountRequested: number;
    fundingType: string;
    purpose: string[];
    detailedPurpose: string;
    preferredRepaymentTerm?: string;
    collateralAvailable?: boolean;
  };
  businessPerformance: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    existingDebt?: number;
    mainCustomers: string;
    revenueStreams: string;
  };
  impactPlan: {
    jobsToCreate: number;
    communityImpact: string;
    growthPlan: string;
    challenges: string;
  };
  supportingDocuments: {
    blobId: string | null;
    blobUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
  };
  declarations: {
    accuracy: boolean;
    compliance: boolean;
    dataProcessing: boolean;
  };
}

export const Route = createFileRoute("/dashboard/admin/funding")({
  component: AdminFundingReview,
});

function AdminFundingReview() {
  const [user, setUser] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<FundingApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewForm, setReviewForm] = useState({
    status: "",
    feedback: "",
  });

  const queryClient = useQueryClient();

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all funding applications
  const {
    data: applications = [],
    isLoading,
  } = useQuery({
    queryKey: ["admin-funding-applications"],
    queryFn: async () => {
      if (!user?.uid) return [];

      try {
        const q = query(
          collection(db, "funding"),
          orderBy("submissionDate", "desc")
        );

        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            applicationId: data.applicationId ?? doc.id,
            userId: data.userId ?? "",
            createdAt:
              data.createdAt?.toDate?.() ??
              new Date(data.createdAt || Date.now()),
            updatedAt:
              data.updatedAt?.toDate?.() ??
              new Date(data.updatedAt || Date.now()),
            status: data.status ?? "pending",
            submissionDate: data.submissionDate?.toDate?.() ?? null,
            reviewerId: data.reviewerId,
            reviewerName: data.reviewerName,
            reviewDate: data.reviewDate?.toDate?.() ?? null,
            feedback: data.feedback,
            businessInfo: data.businessInfo ?? {},
            ownerInfo: data.ownerInfo ?? {},
            fundingRequest: data.fundingRequest ?? {},
            businessPerformance: data.businessPerformance ?? {},
            impactPlan: data.impactPlan ?? {},
            supportingDocuments: data.supportingDocuments ?? {},
            declarations: data.declarations ?? {},
          } as FundingApplication;
        });

        return apps;
      } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
    },
    enabled: !!user?.uid,
  });

  // Review application mutation
  const reviewApplicationMutation = useMutation({
    mutationFn: async ({
      applicationId,
      status,
      feedback,
    }: {
      applicationId: string;
      status: string;
      feedback: string;
    }) => {
      if (!user?.uid) throw new Error("Admin not authenticated");

      const docRef = doc(db, "funding", applicationId);
      await updateDoc(docRef, {
        status: status,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email,
        reviewDate: new Date(),
        feedback: feedback,
        updatedAt: new Date(),
      });

      return { applicationId, status, feedback };
    },
    onSuccess: () => {
      toast.success("Application reviewed successfully!");
      queryClient.invalidateQueries({
        queryKey: ["admin-funding-applications"],
      });
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewForm({ status: "", feedback: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to review application");
      console.error("Review error:", error);
    },
  });

  // Handle review submission
  const handleReview = () => {
    if (!selectedApplication || !reviewForm.status) {
      toast.error("Please select a status");
      return;
    }

    if (
      (reviewForm.status === "rejected" || reviewForm.status === "approved") &&
      !reviewForm.feedback.trim()
    ) {
      toast.error("Please provide feedback for your decision");
      return;
    }

    reviewApplicationMutation.mutate({
      applicationId: selectedApplication.id,
      status: reviewForm.status,
      feedback: reviewForm.feedback,
    });
  };

  // Open review dialog
  const openReviewDialog = (application: FundingApplication) => {
    setSelectedApplication(application);
    setReviewForm({
      status: application.status === "pending" ? "" : application.status,
      feedback: application.feedback || "",
    });
    setReviewDialogOpen(true);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: "outline" as const,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      under_review: {
        variant: "secondary" as const,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      approved: {
        variant: "default" as const,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      rejected: {
        variant: "destructive" as const,
        color: "text-red-600",
        bg: "bg-red-50",
      },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
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
            Funding Applications Review
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage funding applications from township businesses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    applications.filter((app) => app.status === "pending")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Under Review
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    applications.filter((app) => app.status === "under_review")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    applications.filter((app) => app.status === "approved")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    applications.filter((app) => app.status === "rejected")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Applications</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Label htmlFor="status-filter">Filter by Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
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
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.businessInfo?.businessName || "N/A"}
                      </TableCell>
                      <TableCell>{app.ownerInfo?.fullName || "N/A"}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(
                          app.fundingRequest?.amountRequested || 0
                        )}
                      </TableCell>
                      <TableCell>
                        {app.businessInfo?.industry || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadge(app.status).variant}
                          className={`${getStatusBadge(app.status).color} ${getStatusBadge(app.status).bg}`}>
                          {app.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.submissionDate
                          ? new Date(app.submissionDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openReviewDialog(app)}>
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      {selectedApplication && !reviewDialogOpen && (
        <Dialog
          open={!!selectedApplication}
          onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Detailed view of funding application
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Business Name:</p>
                    <p>{selectedApplication.businessInfo?.businessName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Legal Structure:</p>
                    <p>{selectedApplication.businessInfo?.legalStructure}</p>
                  </div>
                  <div>
                    <p className="font-medium">Industry:</p>
                    <p>{selectedApplication.businessInfo?.industry}</p>
                  </div>
                  <div>
                    <p className="font-medium">Years in Operation:</p>
                    <p>{selectedApplication.businessInfo?.yearsInOperation}</p>
                  </div>
                  <div>
                    <p className="font-medium">Employees:</p>
                    <p>{selectedApplication.businessInfo?.numberOfEmployees}</p>
                  </div>
                  <div>
                    <p className="font-medium">Location:</p>
                    <p>{selectedApplication.businessInfo?.townshipLocation}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-medium">Description:</p>
                  <p className="text-sm">
                    {selectedApplication.businessInfo?.businessDescription}
                  </p>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Full Name:</p>
                    <p>{selectedApplication.ownerInfo?.fullName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p>{selectedApplication.ownerInfo?.email}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone:</p>
                    <p>{selectedApplication.ownerInfo?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium">Demographics:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isBlackOwned && (
                        <Badge variant="outline">Black Owned</Badge>
                      )}
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isWomenOwned && (
                        <Badge variant="outline">Women Owned</Badge>
                      )}
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isYouthOwned && (
                        <Badge variant="outline">Youth Owned</Badge>
                      )}
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isDisabilityOwned && (
                        <Badge variant="outline">Disability Owned</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Funding Request */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Funding Request
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Amount Requested:</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(
                        selectedApplication.fundingRequest?.amountRequested || 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Funding Type:</p>
                    <p>{selectedApplication.fundingRequest?.fundingType}</p>
                  </div>
                  <div>
                    <p className="font-medium">Purpose:</p>
                    <p>
                      {selectedApplication.fundingRequest?.purpose?.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Repayment Term:</p>
                    <p>
                      {selectedApplication.fundingRequest
                        ?.preferredRepaymentTerm || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-medium">Detailed Purpose:</p>
                  <p className="text-sm">
                    {selectedApplication.fundingRequest?.detailedPurpose}
                  </p>
                </div>
              </div>

              {/* Business Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Business Performance
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Monthly Revenue:</p>
                    <p>
                      {formatCurrency(
                        selectedApplication.businessPerformance
                          ?.monthlyRevenue || 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Monthly Expenses:</p>
                    <p>
                      {formatCurrency(
                        selectedApplication.businessPerformance
                          ?.monthlyExpenses || 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Existing Debt:</p>
                    <p>
                      {formatCurrency(
                        selectedApplication.businessPerformance?.existingDebt ||
                          0
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="font-medium">Main Customers:</p>
                    <p className="text-sm">
                      {selectedApplication.businessPerformance?.mainCustomers}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Revenue Streams:</p>
                    <p className="text-sm">
                      {selectedApplication.businessPerformance?.revenueStreams}
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact Plan */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Impact & Growth Plan
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="font-medium">Jobs to Create:</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {selectedApplication.impactPlan?.jobsToCreate || 0} jobs
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">Community Impact:</p>
                    <p className="text-sm">
                      {selectedApplication.impactPlan?.communityImpact}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Growth Plan:</p>
                    <p className="text-sm">
                      {selectedApplication.impactPlan?.growthPlan}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Challenges:</p>
                    <p className="text-sm">
                      {selectedApplication.impactPlan?.challenges}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              {selectedApplication.supportingDocuments?.fileName && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Supporting Documents
                  </h3>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">
                      {selectedApplication.supportingDocuments.fileName}
                    </p>
                    {selectedApplication.supportingDocuments.blobUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          window.open(
                            selectedApplication.supportingDocuments.blobUrl!,
                            "_blank"
                          )
                        }>
                        <FileText className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Review Status</h3>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Current Status:</p>
                    <Badge
                      variant={
                        getStatusBadge(selectedApplication.status).variant
                      }>
                      {selectedApplication.status
                        .replace("_", " ")
                        .toUpperCase()}
                    </Badge>
                  </div>
                  {selectedApplication.reviewerName && (
                    <div>
                      <p className="font-medium">Reviewed by:</p>
                      <p className="text-sm">
                        {selectedApplication.reviewerName}
                      </p>
                    </div>
                  )}
                  {selectedApplication.reviewDate && (
                    <div>
                      <p className="font-medium">Review Date:</p>
                      <p className="text-sm">
                        {new Date(
                          selectedApplication.reviewDate
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedApplication.feedback && (
                    <div>
                      <p className="font-medium">Feedback:</p>
                      <p className="text-sm">{selectedApplication.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
              <Button onClick={() => openReviewDialog(selectedApplication)}>
                Review Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Update the status and provide feedback for this application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status">Status Decision</Label>
              <Select
                value={reviewForm.status}
                onValueChange={(value) =>
                  setReviewForm({ ...reviewForm, status: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feedback">Feedback/Comments</Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback about your decision..."
                value={reviewForm.feedback}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, feedback: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewApplicationMutation.isPending}>
              {reviewApplicationMutation.isPending
                ? "Submitting..."
                : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
