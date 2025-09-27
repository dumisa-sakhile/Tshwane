import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../config/firebase";
import { toast } from "react-hot-toast";
import { CheckCircle, FileText, Upload, Eye, Plus, X } from "lucide-react";
import { put } from "@vercel/blob";

// Type definitions
interface FundingApplication {
  applicationId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
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
    fileType: string | null;
    pdfPages: number | null;
    uploadDate: Date | null;
    documentChecklist: {
      hasBankStatements: boolean;
      hasBusinessRegistration: boolean;
      hasTaxDocuments: boolean;
      hasBusinessPlan: boolean;
      hasOtherDocuments: boolean;
    };
  };
  declaration: {
    informationAccurate: boolean;
    agreeToTerms: boolean;
    allowContact: boolean;
  };
}

export const Route = createFileRoute("/dashboard/funding")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search?.tab as string) || "new",
    };
  },
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [user, setUser] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<FundingApplication | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Form state with v2 schema
  const [formData, setFormData] = useState<Partial<FundingApplication>>({
    status: "draft",
    businessInfo: {
      businessName: "",
      legalStructure: "",
      industry: "",
      businessDescription: "",
      yearsInOperation: 0,
      numberOfEmployees: 1,
      townshipLocation: "",
    },
    ownerInfo: {
      fullName: "",
      email: "",
      phoneNumber: "",
      ownershipDemographics: {
        isBlackOwned: false,
        isWomenOwned: false,
        isYouthOwned: false,
        isDisabilityOwned: false,
      },
    },
    fundingRequest: {
      amountRequested: 0,
      fundingType: "grant",
      purpose: [],
      detailedPurpose: "",
      preferredRepaymentTerm: "",
      collateralAvailable: false,
    },
    businessPerformance: {
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      existingDebt: 0,
      mainCustomers: "",
      revenueStreams: "",
    },
    impactPlan: {
      jobsToCreate: 0,
      communityImpact: "",
      growthPlan: "",
      challenges: "",
    },
    supportingDocuments: {
      blobId: null,
      blobUrl: null,
      fileName: null,
      fileSize: null,
      fileType: null,
      pdfPages: null,
      uploadDate: null,
      documentChecklist: {
        hasBankStatements: false,
        hasBusinessRegistration: false,
        hasTaxDocuments: false,
        hasBusinessPlan: false,
        hasOtherDocuments: false,
      },
    },
    declaration: {
      informationAccurate: false,
      agreeToTerms: false,
      allowContact: false,
    },
  });

  // PDF file state
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Fetch user's submitted applications
  const {
    data: applications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["funding-applications", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      console.log("Fetching applications for user:", user.uid);

      try {
        const q = query(
          collection(db, "funding"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        console.log("Found documents:", querySnapshot.docs.length);

        const apps = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document data:", { id: doc.id, data });

          return {
            applicationId: data.applicationId ?? doc.id,
            userId: data.userId ?? "",
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : data.createdAt instanceof Date
                ? data.createdAt
                : new Date(data.createdAt || Date.now()),
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate()
              : data.updatedAt instanceof Date
                ? data.updatedAt
                : new Date(data.updatedAt || Date.now()),
            status: data.status ?? "draft",
            submissionDate: data.submissionDate?.toDate
              ? data.submissionDate.toDate()
              : data.submissionDate instanceof Date
                ? data.submissionDate
                : data.submissionDate
                  ? new Date(data.submissionDate)
                  : null,
            reviewerId: data.reviewerId ?? undefined,
            reviewerName: data.reviewerName ?? undefined,
            reviewDate: data.reviewDate?.toDate
              ? data.reviewDate.toDate()
              : data.reviewDate,
            feedback: data.feedback ?? undefined,
            businessInfo: data.businessInfo ?? {
              businessName: "",
              legalStructure: "",
              industry: "",
              businessDescription: "",
              yearsInOperation: 0,
              numberOfEmployees: 0,
              townshipLocation: "",
            },
            ownerInfo: data.ownerInfo ?? {
              fullName: "",
              email: "",
              phoneNumber: "",
              ownershipDemographics: {
                isBlackOwned: false,
                isWomenOwned: false,
                isYouthOwned: false,
                isDisabilityOwned: false,
              },
            },
            fundingRequest: data.fundingRequest ?? {
              amountRequested: 0,
              fundingType: "",
              purpose: [],
              detailedPurpose: "",
              preferredRepaymentTerm: "",
              collateralAvailable: false,
            },
            businessPerformance: data.businessPerformance ?? {
              monthlyRevenue: 0,
              monthlyExpenses: 0,
              existingDebt: 0,
              mainCustomers: "",
              revenueStreams: "",
            },
            impactPlan: data.impactPlan ?? {
              jobsToCreate: 0,
              communityImpact: "",
              growthPlan: "",
              challenges: "",
            },
            supportingDocuments: {
              ...data.supportingDocuments,
              blobId: data.supportingDocuments?.blobId ?? null,
              blobUrl: data.supportingDocuments?.blobUrl ?? null,
              fileName: data.supportingDocuments?.fileName ?? null,
              fileSize: data.supportingDocuments?.fileSize ?? null,
              fileType: data.supportingDocuments?.fileType ?? null,
              pdfPages: data.supportingDocuments?.pdfPages ?? null,
              uploadDate: data.supportingDocuments?.uploadDate?.toDate
                ? data.supportingDocuments.uploadDate.toDate()
                : (data.supportingDocuments?.uploadDate ?? null),
              documentChecklist: data.supportingDocuments
                ?.documentChecklist || {
                hasBankStatements: false,
                hasBusinessRegistration: false,
                hasTaxDocuments: false,
                hasBusinessPlan: false,
                hasOtherDocuments: false,
              },
            },
            declaration: data.declaration ?? {
              informationAccurate: false,
              agreeToTerms: false,
              allowContact: false,
            },
          } as FundingApplication;
        });

        // Sort applications by creation date (newest first)
        return apps.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
    },
    enabled: !!user?.uid,
  });

  // Upload PDF to Vercel Blob
  const uploadPDFMutation = useMutation({
    mutationFn: async (file: File) => {
      const blob = await put(
        `funding-applications/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
          contentType: "application/pdf",
          token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
        }
      );
      return blob;
    },
    onError: (error) => {
      toast.error("Failed to upload PDF. Please try again.");
      console.error("PDF upload error:", error);
    },
  });

  // Submit funding application
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: Partial<FundingApplication>) => {
      if (!user?.uid) throw new Error("User not authenticated");

      // Upload PDF if exists
      let blobData = null;
      if (pdfFile) {
        const blob = await uploadPDFMutation.mutateAsync(pdfFile);
        blobData = {
          blobId: blob.pathname,
          blobUrl: blob.url,
          fileName: pdfFile.name,
          fileSize: pdfFile.size,
          fileType: pdfFile.type,
          pdfPages: 0, // You can extract this with pdfjs-dist if needed
          uploadDate: new Date(),
          documentChecklist:
            applicationData.supportingDocuments?.documentChecklist || {},
        };
      }

      const applicationWithUserData = {
        ...applicationData,
        applicationId: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "submitted" as const,
        submissionDate: new Date(),
        supportingDocuments: blobData || applicationData.supportingDocuments,
      };

      const docRef = await addDoc(
        collection(db, "funding"),
        applicationWithUserData
      );
      return docRef.id;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["funding-applications"] });
      setShowThankYou(true);
      // Navigate to view tab after successful submission
      setTimeout(() => {
        navigate({ to: "/dashboard/funding", search: { tab: "view" } });
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit application.");
      console.error("Submission error:", error);
    },
  });

  // Custom validation functions
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhoneNumber = (phone: string): string => {
    if (!phone) return "Phone number is required";
    // Remove all spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    // Check for South African phone number format (10-11 digits, optionally starting with +27)
    const phoneRegex = /^(\+27|0)?[0-9]{9,10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid phone number (e.g., +27 12 345 6789 or 012 345 6789)";
    }
    return "";
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate business information
    if (!formData.businessInfo?.businessName?.trim()) {
      errors.businessName = "Business name is required";
    }

    if (!formData.businessInfo?.businessDescription?.trim()) {
      errors.businessDescription = "Business description is required";
    }

    // Validate owner information
    if (!formData.ownerInfo?.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    // Validate email
    const emailError = validateEmail(formData.ownerInfo?.email || "");
    if (emailError) errors.email = emailError;

    // Validate phone number
    const phoneError = validatePhoneNumber(
      formData.ownerInfo?.phoneNumber || ""
    );
    if (phoneError) errors.phoneNumber = phoneError;

    // Validate funding request
    if (
      !formData.fundingRequest?.amountRequested ||
      formData.fundingRequest.amountRequested <= 0
    ) {
      errors.amountRequested = "Please enter a valid funding amount";
    }

    if (!formData.fundingRequest?.detailedPurpose?.trim()) {
      errors.detailedPurpose = "Purpose of funding is required";
    }

    // Validate declarations
    if (!formData.declaration?.informationAccurate) {
      errors.declaration = "You must confirm the information is accurate";
    }

    if (!formData.declaration?.agreeToTerms) {
      errors.terms = "You must agree to the terms and conditions";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit an application");
      return;
    }

    // Validate form with custom validation
    if (!validateForm()) {
      toast.error("Please fix the errors above and try again");
      return;
    }

    submitApplicationMutation.mutate(formData);
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF file must be smaller than 10MB");
      return;
    }

    setPdfFile(file);
    toast.success("PDF ready for upload");
  };

  const getStatusBadge = (status: string) => {
    // Map status to colors and variants
    const statusConfig: Record<
      string,
      {
        variant: "secondary" | "default" | "destructive" | "outline";
        className: string;
      }
    > = {
      draft: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
      submitted: {
        variant: "default",
        className: "bg-orange-100 text-orange-800",
      },
      pending: {
        variant: "default",
        className: "bg-orange-100 text-orange-800",
      },
      under_review: {
        variant: "outline",
        className: "bg-yellow-100 text-yellow-800",
      },
      approved: {
        variant: "secondary",
        className: "bg-green-100 text-green-800",
      },
      rejected: {
        variant: "destructive",
        className: "bg-rose-100 text-rose-800",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status === "under_review"
          ? "Under Review"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Funding Applications
        </h1>
        <p className="text-gray-600 mt-2">Manage your funding applications</p>
      </div>

      {/* Tab Navigation with Router Links */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to="/dashboard/funding"
              search={{ tab: "new" }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                search.tab === "new"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Link>
            <Link
              to="/dashboard/funding"
              search={{ tab: "view" }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                search.tab === "view"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <Eye className="w-4 h-4 mr-2" />
              View Applications ({applications.length})
            </Link>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {search.tab === "new" && (
          <>
            {showThankYou ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="text-center py-12">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Thank You for Your Application!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your funding application has been submitted successfully.
                  </p>
                  <Button
                    onClick={() => {
                      setShowThankYou(false);
                      navigate({
                        to: "/dashboard/funding",
                        search: { tab: "new" },
                      });
                    }}>
                    Submit Another Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>New Funding Application</CardTitle>
                  <CardDescription>
                    Complete all sections to apply for business funding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Business Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name *</Label>
                          <Input
                            id="businessName"
                            value={formData.businessInfo?.businessName || ""}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                businessInfo: {
                                  ...prev.businessInfo!,
                                  businessName: e.target.value,
                                },
                              }));
                              // Clear error when user starts typing
                              if (formErrors.businessName) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  businessName: "",
                                }));
                              }
                            }}
                            placeholder="Enter business name"
                            className={
                              formErrors.businessName ? "border-red-500" : ""
                            }
                          />
                          {formErrors.businessName && (
                            <p className="text-sm text-red-600">
                              {formErrors.businessName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="legalStructure">
                            Legal Structure *
                          </Label>
                          <Select
                            value={formData.businessInfo?.legalStructure || ""}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                businessInfo: {
                                  ...prev.businessInfo!,
                                  legalStructure: value,
                                },
                              }))
                            }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select structure" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sole_proprietor">
                                Sole Proprietor
                              </SelectItem>
                              <SelectItem value="pty_ltd">Pty Ltd</SelectItem>
                              <SelectItem value="partnership">
                                Partnership
                              </SelectItem>
                              <SelectItem value="cooperative">
                                Cooperative
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry *</Label>
                          <Select
                            value={formData.businessInfo?.industry || ""}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                businessInfo: {
                                  ...prev.businessInfo!,
                                  industry: value,
                                },
                              }))
                            }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="manufacturing">
                                Manufacturing
                              </SelectItem>
                              <SelectItem value="agriculture">
                                Agriculture
                              </SelectItem>
                              <SelectItem value="technology">
                                Technology
                              </SelectItem>
                              <SelectItem value="food_beverage">
                                Food & Beverage
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="townshipLocation">
                            Township Location *
                          </Label>
                          <Select
                            value={
                              formData.businessInfo?.townshipLocation || ""
                            }
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                businessInfo: {
                                  ...prev.businessInfo!,
                                  townshipLocation: value,
                                },
                              }))
                            }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select township" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="soshanguve">
                                Soshanguve
                              </SelectItem>
                              <SelectItem value="mamelodi">Mamelodi</SelectItem>
                              <SelectItem value="atteridgeville">
                                Atteridgeville
                              </SelectItem>
                              <SelectItem value="hammanskraal">
                                Hammanskraal
                              </SelectItem>
                              <SelectItem value="garankuwa">
                                Garankuwa
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessDescription">
                          Business Description *
                        </Label>
                        <Textarea
                          id="businessDescription"
                          value={
                            formData.businessInfo?.businessDescription || ""
                          }
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              businessInfo: {
                                ...prev.businessInfo!,
                                businessDescription: e.target.value,
                              },
                            }));
                            // Clear error when user starts typing
                            if (formErrors.businessDescription) {
                              setFormErrors((prev) => ({
                                ...prev,
                                businessDescription: "",
                              }));
                            }
                          }}
                          placeholder="Describe your business..."
                          rows={3}
                          className={
                            formErrors.businessDescription
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {formErrors.businessDescription && (
                          <p className="text-sm text-red-600">
                            {formErrors.businessDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Owner Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Owner Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={formData.ownerInfo?.fullName || ""}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                ownerInfo: {
                                  ...prev.ownerInfo!,
                                  fullName: e.target.value,
                                },
                              }));
                              // Clear error when user starts typing
                              if (formErrors.fullName) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  fullName: "",
                                }));
                              }
                            }}
                            placeholder="Your full name"
                            className={
                              formErrors.fullName ? "border-red-500" : ""
                            }
                          />
                          {formErrors.fullName && (
                            <p className="text-sm text-red-600">
                              {formErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.ownerInfo?.email || ""}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                ownerInfo: {
                                  ...prev.ownerInfo!,
                                  email: e.target.value,
                                },
                              }));
                              // Clear email error when user starts typing
                              if (formErrors.email) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  email: "",
                                }));
                              }
                            }}
                            placeholder="your.email@example.com"
                            className={formErrors.email ? "border-red-500" : ""}
                          />
                          {formErrors.email && (
                            <p className="text-sm text-red-600">
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number *</Label>
                          <Input
                            id="phoneNumber"
                            value={formData.ownerInfo?.phoneNumber || ""}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                ownerInfo: {
                                  ...prev.ownerInfo!,
                                  phoneNumber: e.target.value,
                                },
                              }));
                              // Clear phone error when user starts typing
                              if (formErrors.phoneNumber) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  phoneNumber: "",
                                }));
                              }
                            }}
                            placeholder="Phone number (e.g., +27 12 345 6789)"
                            className={
                              formErrors.phoneNumber ? "border-red-500" : ""
                            }
                          />
                          {formErrors.phoneNumber && (
                            <p className="text-sm text-red-600">
                              {formErrors.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Ownership Demographics</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { key: "isBlackOwned", label: "Black-owned" },
                            { key: "isWomenOwned", label: "Women-owned" },
                            { key: "isYouthOwned", label: "Youth-owned" },
                            {
                              key: "isDisabilityOwned",
                              label: "Disability-owned",
                            },
                          ].map(({ key, label }) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2">
                              <Checkbox
                                checked={
                                  formData.ownerInfo?.ownershipDemographics?.[
                                    key as keyof typeof formData.ownerInfo.ownershipDemographics
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    ownerInfo: {
                                      ...prev.ownerInfo!,
                                      ownershipDemographics: {
                                        ...prev.ownerInfo!
                                          .ownershipDemographics,
                                        [key]: checked,
                                      },
                                    },
                                  }))
                                }
                              />
                              <Label className="text-sm">{label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Funding Request Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Funding Request</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amountRequested">
                            Amount Requested (ZAR) *
                          </Label>
                          <Input
                            id="amountRequested"
                            type="number"
                            value={
                              formData.fundingRequest?.amountRequested || ""
                            }
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                fundingRequest: {
                                  ...prev.fundingRequest!,
                                  amountRequested: Number(e.target.value),
                                },
                              }));
                              // Clear error when user starts typing
                              if (formErrors.amountRequested) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  amountRequested: "",
                                }));
                              }
                            }}
                            placeholder="50000"
                            className={
                              formErrors.amountRequested ? "border-red-500" : ""
                            }
                          />
                          {formErrors.amountRequested && (
                            <p className="text-sm text-red-600">
                              {formErrors.amountRequested}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fundingType">Funding Type *</Label>
                          <Select
                            value={formData.fundingRequest?.fundingType || ""}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                fundingRequest: {
                                  ...prev.fundingRequest!,
                                  fundingType: value,
                                },
                              }))
                            }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grant">Grant</SelectItem>
                              <SelectItem value="loan">Loan</SelectItem>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="detailedPurpose">
                          Purpose of Funding *
                        </Label>
                        <Textarea
                          id="detailedPurpose"
                          value={formData.fundingRequest?.detailedPurpose || ""}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              fundingRequest: {
                                ...prev.fundingRequest!,
                                detailedPurpose: e.target.value,
                              },
                            }));
                            // Clear error when user starts typing
                            if (formErrors.detailedPurpose) {
                              setFormErrors((prev) => ({
                                ...prev,
                                detailedPurpose: "",
                              }));
                            }
                          }}
                          placeholder="Explain how you will use the funds..."
                          rows={3}
                          className={
                            formErrors.detailedPurpose ? "border-red-500" : ""
                          }
                        />
                        {formErrors.detailedPurpose && (
                          <p className="text-sm text-red-600">
                            {formErrors.detailedPurpose}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Supporting Documents Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Supporting Documents
                      </h3>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <Label
                            htmlFor="pdf-upload"
                            className="cursor-pointer">
                            <span className="text-blue-600 font-medium">
                              Upload PDF
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              or drag and drop
                            </span>
                          </Label>
                          <Input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handlePDFUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Combine all documents into a single PDF (max 10MB)
                          </p>
                          {pdfFile && (
                            <div className="mt-2 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">{pdfFile.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            {
                              key: "hasBankStatements",
                              label: "Bank Statements",
                            },
                            {
                              key: "hasBusinessRegistration",
                              label: "Registration",
                            },
                            { key: "hasTaxDocuments", label: "Tax Documents" },
                            { key: "hasBusinessPlan", label: "Business Plan" },
                            {
                              key: "hasOtherDocuments",
                              label: "Other Documents",
                            },
                          ].map(({ key, label }) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2">
                              <Checkbox
                                checked={
                                  formData.supportingDocuments
                                    ?.documentChecklist?.[
                                    key as keyof typeof formData.supportingDocuments.documentChecklist
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    supportingDocuments: {
                                      ...prev.supportingDocuments!,
                                      documentChecklist: {
                                        ...prev.supportingDocuments!
                                          .documentChecklist,
                                        [key]: checked,
                                      },
                                    },
                                  }))
                                }
                              />
                              <Label className="text-sm">{label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Declaration Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Declaration</h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "informationAccurate",
                            label:
                              "I confirm the information provided is accurate and complete",
                          },
                          {
                            key: "agreeToTerms",
                            label:
                              "I agree to the terms and conditions of the funding application",
                          },
                          {
                            key: "allowContact",
                            label: "I allow contact regarding my application",
                          },
                        ].map(({ key, label }) => (
                          <div
                            key={key}
                            className="flex items-center space-x-2">
                            <Checkbox
                              checked={
                                formData.declaration?.[
                                  key as keyof typeof formData.declaration
                                ] || false
                              }
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  declaration: {
                                    ...prev.declaration!,
                                    [key]: checked,
                                  },
                                }))
                              }
                            />
                            <Label
                              className={
                                key === "informationAccurate" ||
                                key === "agreeToTerms"
                                  ? "font-medium"
                                  : ""
                              }>
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {/* Display declaration validation errors */}
                      {(formErrors.declaration || formErrors.terms) && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          {formErrors.declaration && (
                            <p className="text-sm text-red-600">
                              {formErrors.declaration}
                            </p>
                          )}
                          {formErrors.terms && (
                            <p className="text-sm text-red-600">
                              {formErrors.terms}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        submitApplicationMutation.isPending ||
                        uploadPDFMutation.isPending
                      }
                      className="w-full">
                      {submitApplicationMutation.isPending
                        ? "Submitting..."
                        : "Submit Application"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {search.tab === "view" && (
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>
                View and track your submitted funding applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-center py-8 text-red-600">
                  <p>Error loading applications: {error.message}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-2"
                    variant="outline">
                    Retry
                  </Button>
                </div>
              )}
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Submit your first funding application to get started
                  </p>
                  <Link to="/dashboard/funding" search={{ tab: "new" }}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Application
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Found {applications.length} application(s)
                    </p>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Amount Requested</TableHead>
                          <TableHead>Submission Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow
                            key={app.applicationId}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelectedApplication(app)}>
                            <TableCell className="font-medium">
                              {app.businessInfo?.businessName ||
                                "Unnamed Business"}
                            </TableCell>
                            <TableCell>
                              R
                              {app.fundingRequest?.amountRequested?.toLocaleString() ||
                                "0"}
                            </TableCell>
                            <TableCell>
                              {app.submissionDate
                                ? app.submissionDate.toLocaleDateString()
                                : "Date not available"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(
                                app.status === "submitted"
                                  ? "pending"
                                  : app.status
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApplication(app);
                                }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Application Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApplication(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Application Status */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedApplication.businessInfo?.businessName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Application ID: {selectedApplication.applicationId}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(
                    selectedApplication.status === "submitted"
                      ? "pending"
                      : selectedApplication.status
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted:{" "}
                    {selectedApplication.submissionDate?.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Business Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Business Name
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.businessName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Legal Structure
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.legalStructure ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Industry
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.industry || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Township Location
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.townshipLocation ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Years in Operation
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.yearsInOperation || 0}{" "}
                      years
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Number of Employees
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.numberOfEmployees || 0}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">
                      Business Description
                    </label>
                    <p className="text-sm">
                      {selectedApplication.businessInfo?.businessDescription ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Owner Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <p className="text-sm">
                      {selectedApplication.ownerInfo?.fullName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-sm">
                      {selectedApplication.ownerInfo?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <p className="text-sm">
                      {selectedApplication.ownerInfo?.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Demographics
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isBlackOwned && (
                        <Badge variant="outline" className="text-xs">
                          Black-owned
                        </Badge>
                      )}
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isWomenOwned && (
                        <Badge variant="outline" className="text-xs">
                          Women-owned
                        </Badge>
                      )}
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isYouthOwned && (
                        <Badge variant="outline" className="text-xs">
                          Youth-owned
                        </Badge>
                      )}
                      {selectedApplication.ownerInfo?.ownershipDemographics
                        ?.isDisabilityOwned && (
                        <Badge variant="outline" className="text-xs">
                          Disability-owned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Funding Request */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Funding Request
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Amount Requested
                    </label>
                    <p className="text-sm font-semibold">
                      R
                      {selectedApplication.fundingRequest?.amountRequested?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Funding Type
                    </label>
                    <p className="text-sm">
                      {selectedApplication.fundingRequest?.fundingType || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">
                      Purpose of Funding
                    </label>
                    <p className="text-sm">
                      {selectedApplication.fundingRequest?.detailedPurpose ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              {selectedApplication.supportingDocuments?.blobUrl && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Supporting Documents
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedApplication.supportingDocuments.fileName ||
                              "Document.pdf"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedApplication.supportingDocuments.fileSize
                              ? `${(selectedApplication.supportingDocuments.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : "Size not available"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            selectedApplication.supportingDocuments?.blobUrl ??
                              undefined,
                            "_blank"
                          )
                        }>
                        View Document
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedApplication.feedback && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Feedback</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedApplication.feedback}</p>
                    {selectedApplication.reviewerName && (
                      <p className="text-xs text-gray-500 mt-2">
                        - {selectedApplication.reviewerName} on{" "}
                        {selectedApplication.reviewDate?.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
