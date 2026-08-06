import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetGrievance, useUpdateGrievanceStatus } from "../lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-100 text-blue-800" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-green-100 text-green-800" }
};
function GrievanceDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const { data: grievance, isLoading } = useGetGrievance(
    { id },
    { query: { enabled: !!id } }
  );
  const updateMutation = useUpdateGrievanceStatus();
  const isAdmin = user?.role === "admin";
  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    updateMutation.mutate(
      { id, data: { status: newStatus, adminResponse: adminResponse || void 0 } },
      {
        onSuccess: () => {
          toast.success("Grievance updated successfully");
          setAdminResponse("");
          setNewStatus("");
        },
        onError: () => toast.error("Failed to update grievance")
      }
    );
  };
  if (isLoading) {
    return <AppLayout>
        <div className="space-y-6 max-w-2xl">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>;
  }
  if (!grievance) {
    return <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-4">Grievance not found</h2>
          <Button onClick={() => navigate("/grievances")}>Back to Grievances</Button>
        </div>
      </AppLayout>;
  }
  const config = STATUS_CONFIG[grievance.status];
  const Icon = config?.icon || Clock;
  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/grievances")} className="gap-2 text-lg">
          <ArrowLeft className="size-5" /> Back to Grievances
        </Button>

        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-4xl font-bold">{grievance.title}</CardTitle>
                <CardDescription className="text-lg mt-3">Submitted by {grievance.userName}</CardDescription>
              </div>
              <Badge className={`${config?.color} text-base`}>
                <Icon className="size-4 mr-2" />
                {config?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{format(new Date(grievance.createdAt), "MMMM d, yyyy h:mm a")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{format(new Date(grievance.updatedAt), "MMMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{grievance.description}</p>
            </div>

            {grievance.adminResponse && <div className="border-t pt-6 bg-muted/40 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Admin Response</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{grievance.adminResponse}</p>
              </div>}

            {isAdmin && <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">New Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Admin Response</label>
                    <Textarea
    value={adminResponse}
    onChange={(e) => setAdminResponse(e.target.value)}
    placeholder="Provide your response to this grievance..."
    rows={4}
  />
                  </div>
                  <Button
    onClick={handleStatusUpdate}
    className="w-full"
    disabled={updateMutation.isPending || !newStatus}
  >
                    {updateMutation.isPending ? "Updating..." : "Update Grievance"}
                  </Button>
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
}
export {
  GrievanceDetail as default
};
