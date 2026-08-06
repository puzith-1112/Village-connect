import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  useGetDashboardSummary,
  useListGrievances,
  useListJobs,
  useListJobApplicants,
  useAssignJob,
  getGetDashboardSummaryQueryKey,
  getListGrievancesQueryKey,
  getListJobsQueryKey,
  getListJobApplicantsQueryKey
} from "../lib/api-client";
import { Shield, Users, Briefcase, MessageSquare, Clock3, CheckCircle2, BarChart3 } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });
  const { data: grievancesData, isLoading: loadingGrievances } = useListGrievances(
    { page: 1, limit: 10 },
    { query: { queryKey: getListGrievancesQueryKey({ page: 1, limit: 10 }) } }
  );
  const { data: jobsData, isLoading: loadingJobs } = useListJobs(
    { page: 1, limit: 10 },
    { query: { queryKey: getListJobsQueryKey({ page: 1, limit: 10 }) } }
  );
  const { data: applicantsData, isLoading: loadingApplicants } = useListJobApplicants(
    { id: selectedJobId, skill: skillFilter || void 0, interest: interestFilter || void 0, sortBy },
    {
      query: {
        enabled: tab === "jobs" && !!selectedJobId,
        queryKey: getListJobApplicantsQueryKey({ id: selectedJobId, skill: skillFilter || void 0, interest: interestFilter || void 0, sortBy })
      }
    }
  );
  const assignJobMutation = useAssignJob();
  const canManageApplicants = user?.role === "admin" || user?.role === "provider";
  const visibleJobs = (jobsData?.data ?? []).filter((job) => user?.role !== "provider" || String(job.postedBy) === String(user?.id));

  if (!canManageApplicants) {
    return (
      <AppLayout>
        <div className="text-center py-32 px-4">
          <h1 className="text-4xl font-bold mb-6">Access Denied</h1>
          <p className="text-muted-foreground mb-8 text-lg">Only admins and providers can access this page.</p>
        </div>
      </AppLayout>
    );
  }

  const handleAssign = (applicationId) => {
    if (!selectedJobId) return;
    assignJobMutation.mutate(
      { id: selectedJobId, applicationId, data: {} },
      {
        onSuccess: () => {
          toast.success("Applicant accepted successfully");
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey({ page: 1, limit: 10 }) });
          queryClient.invalidateQueries({ queryKey: getListJobApplicantsQueryKey({ id: selectedJobId, skill: skillFilter || void 0, interest: interestFilter || void 0, sortBy }) });
        },
        onError: (error) => {
          toast.error(error?.message ?? "Failed to accept applicant");
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3"><Shield className="size-8 text-primary" /> Recruitment & Admin Panel</h1>
          <p className="text-muted-foreground mt-3 text-lg">Review applications, assign candidates, and manage platform operations</p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-2 w-fit">
          <Button variant={tab === "overview" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("overview")} className="gap-2">
            <BarChart3 className="size-4" /> Overview
          </Button>
          <Button variant={tab === "grievances" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("grievances")} className="gap-2">
            <MessageSquare className="size-4" /> Grievances
          </Button>
          <Button variant={tab === "jobs" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("jobs")} className="gap-2">
            <Briefcase className="size-4" /> Jobs
          </Button>
        </div>

        {tab === "overview" && <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    {loadingSummary ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-4xl font-bold mt-1">{summary?.totalUsers ?? 0}</p>}
                  </div>
                  <Users className="size-7 text-primary" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    {loadingSummary ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-4xl font-bold mt-1">{summary?.totalJobs ?? 0}</p>}
                  </div>
                  <Briefcase className="size-7 text-primary" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Grievances</p>
                    {loadingSummary ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-4xl font-bold mt-1">{summary?.totalGrievances ?? 0}</p>}
                  </div>
                  <MessageSquare className="size-7 text-primary" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    {loadingSummary ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-4xl font-bold mt-1">{summary?.pendingGrievances ?? 0}</p>}
                  </div>
                  <Clock3 className="size-7 text-amber-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    {loadingSummary ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-4xl font-bold mt-1">{summary?.resolvedGrievances ?? 0}</p>}
                  </div>
                  <CheckCircle2 className="size-7 text-green-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Agriculture Entries</p>
                    {loadingSummary ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-4xl font-bold mt-1">{summary?.totalAgricultureEntries ?? 0}</p>}
                  </div>
                  <BarChart3 className="size-7 text-primary" />
                </CardContent>
              </Card>
            </div>

            <p className="text-muted-foreground text-sm">Use the Grievances and Jobs tabs to manage entries. Use the Agriculture, Healthcare, and Education pages from the sidebar to manage those sections.</p>
          </>}

        {tab === "grievances" && <Card>
            <CardHeader>
              <CardTitle>Recent Grievances</CardTitle>
              <CardDescription>Latest complaints submitted by users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingGrievances ? <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </> : (grievancesData?.data ?? []).map((item) => <div key={item.id} className="rounded-md border p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                    <Badge variant="secondary" className="uppercase">{item.status?.replace("_", " ")}</Badge>
                  </div>)}
            </CardContent>
          </Card>}

        {tab === "jobs" && <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Pick a job to review and assign applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingJobs ? <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </> : visibleJobs.length === 0 ? <p className="text-sm text-muted-foreground">No jobs available to manage yet.</p> : visibleJobs.map((job) => <div key={job.id} className="rounded-md border p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Status: {(job.status ?? "open").toUpperCase()}</p>
                      </div>
                      <Button variant={selectedJobId === job.id ? "secondary" : "outline"} onClick={() => setSelectedJobId(job.id)}>
                        Manage Applicants
                      </Button>
                    </div>)}
              </CardContent>
            </Card>

            {selectedJobId && <Card>
                <CardHeader>
                  <CardTitle>Applicant Selection</CardTitle>
                  <CardDescription>Filter applicants by skills and interests, then accept the best match.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input placeholder="Filter by skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
                    <Input placeholder="Filter by interest" value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)} />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort applicants" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Sort by Relevance</SelectItem>
                        <SelectItem value="experience">Sort by Experience</SelectItem>
                        <SelectItem value="recent">Sort by Most Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loadingApplicants ? <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </> : (applicantsData?.applicants ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No applicants found for this job and filter selection.</p> : (applicantsData?.applicants ?? []).map((applicant) => <div key={applicant.applicationId} className="rounded-md border p-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{applicant.name}</p>
                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                          </div>
                          <Badge variant="secondary" className="uppercase">{applicant.applicationStatus}</Badge>
                        </div>
                        <p className="text-sm"><span className="font-medium">Skills:</span> {(applicant.skills ?? []).join(", ") || "N/A"}</p>
                        <p className="text-sm"><span className="font-medium">Interests:</span> {(applicant.interests ?? []).join(", ") || "N/A"}</p>
                        <p className="text-sm"><span className="font-medium">Experience:</span> {applicant.experience || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">Relevance score: {applicant.relevanceScore ?? 0}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(applicant.applicationId)}
                          disabled={assignJobMutation.isPending || applicant.applicationStatus === "selected" || applicantsData?.job?.status === "filled"}
                        >
                          Accept Applicant
                        </Button>
                      </div>)}
                </CardContent>
              </Card>}
          </div>}
      </div>
    </AppLayout>
  );
}


