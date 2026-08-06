import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListGrievances,
  useCreateGrievance,
  useUpdateGrievanceStatus,
  getListGrievancesQueryKey
} from "../lib/api-client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_progress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-100 text-blue-800 border-blue-200" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-green-100 text-green-800 border-green-200" }
};
function Grievances() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });
  const { data: grievancesData, isLoading } = useListGrievances(
    { page, limit: 10 },
    { query: { queryKey: getListGrievancesQueryKey({ page, limit: 10 }) } }
  );
  const createMutation = useCreateGrievance();
  const updateMutation = useUpdateGrievanceStatus();

  const openDetail = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance?.status ?? "");
    setAdminResponse(grievance?.adminResponse ?? "");
    setDetailOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedGrievance) return;
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    updateMutation.mutate(
      {
        id: selectedGrievance.id,
        data: {
          status: newStatus,
          adminResponse: adminResponse || void 0
        }
      },
      {
        onSuccess: () => {
          toast.success("Grievance updated successfully");
          queryClient.invalidateQueries({ queryKey: getListGrievancesQueryKey({ page, limit: 10 }) });
          setDetailOpen(false);
          setSelectedGrievance(null);
        },
        onError: () => toast.error("Failed to update grievance")
      }
    );
  };

  const handleSubmit = () => {
    if (!form.title || !form.description) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate(
      { data: { title: form.title, description: form.description } },
      {
        onSuccess: () => {
          toast.success("Grievance submitted successfully");
          queryClient.invalidateQueries({ queryKey: getListGrievancesQueryKey({ page, limit: 10 }) });
          setOpen(false);
          setForm({ title: "", description: "" });
        },
        onError: () => toast.error("Failed to submit grievance")
      }
    );
  };
  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare className="size-9 text-primary" /> Community Grievances
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">Track the status of your submitted complaints and requests</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="size-5" /> New Grievance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a Grievance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
    value={form.title}
    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
    placeholder="Brief summary of your complaint"
  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
    value={form.description}
    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
    placeholder="Provide detailed information about your complaint..."
    rows={5}
  />
                </div>
                <Button
    onClick={handleSubmit}
    className="w-full"
    disabled={createMutation.isPending}
  >
                  {createMutation.isPending ? "Submitting..." : "Submit Grievance"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedGrievance?.title || "Grievance Details"}</DialogTitle>
              </DialogHeader>
              {selectedGrievance && <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">Submitted {format(new Date(selectedGrievance.createdAt), "MMM d, yyyy")}</p>
                    <Badge className={`${STATUS_CONFIG[selectedGrievance.status]?.color ?? ""} border`}>
                      {STATUS_CONFIG[selectedGrievance.status]?.label ?? selectedGrievance.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {selectedGrievance.description}
                    </p>
                  </div>
                  {selectedGrievance.adminResponse && <div>
                      <label className="text-sm font-medium">Admin Response</label>
                      <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                        {selectedGrievance.adminResponse}
                      </p>
                    </div>}
                  {isAdmin && <div className="space-y-3 border-t pt-4">
                      <p className="text-sm font-medium">Update Status</p>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
    value={adminResponse}
    onChange={(e) => setAdminResponse(e.target.value)}
    placeholder="Write admin response (optional)"
    rows={4}
  />
                      <Button onClick={handleStatusUpdate} className="w-full" disabled={updateMutation.isPending || !newStatus}>
                        {updateMutation.isPending ? "Updating..." : "Update Grievance"}
                      </Button>
                    </div>}
                </div>}
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div> : grievancesData?.data && grievancesData.data.length > 0 ? <div className="space-y-4">
            {grievancesData.data.map((grievance) => {
    const config = STATUS_CONFIG[grievance.status];
    const Icon = config?.icon || Clock;
    return <Card key={grievance.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => openDetail(grievance)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{grievance.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{grievance.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted {format(new Date(grievance.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <Badge className={`${config?.color} border`}>
                            <Icon className="size-3 mr-1" />
                            {config?.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
  })}
          </div> : <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
            <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No grievances submitted yet</h3>
            <p className="text-muted-foreground mt-2">Click "New Grievance" to submit your first complaint.</p>
          </div>}

        {grievancesData && grievancesData.totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-8">
            <Button
    variant="outline"
    onClick={() => setPage((p) => Math.max(1, p - 1))}
    disabled={page === 1}
  >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {grievancesData.totalPages}
            </span>
            <Button
    variant="outline"
    onClick={() => setPage((p) => Math.min(grievancesData.totalPages, p + 1))}
    disabled={page === grievancesData.totalPages}
  >
              Next
            </Button>
          </div>}
      </div>
    </AppLayout>;
}
export {
  Grievances as default
};
