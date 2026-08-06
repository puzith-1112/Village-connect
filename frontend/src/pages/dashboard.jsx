import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useGetDashboardSummary,
  useListJobs,
  useListMyJobApplications,
  getGetDashboardSummaryQueryKey,
  getListJobsQueryKey,
  getListMyJobApplicationsQueryKey
} from "../lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Briefcase, Sprout, HeartPulse, BookOpen, MessageSquare, Target, TrendingUp, UserRound, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });

  const { data: jobsData, isLoading: loadingJobs } = useListJobs(
    { page: 1, limit: 6 },
    { query: { queryKey: getListJobsQueryKey({ page: 1, limit: 6 }) } }
  );

  const isVillager = user?.role === "villager";
  const isAdminWorkspace = user?.role === "admin" || user?.role === "provider";

  const { data: myApplicationsData, isLoading: loadingMyApplications } = useListMyJobApplications(
    {},
    {
      query: {
        enabled: isVillager,
        queryKey: getListMyJobApplicationsQueryKey()
      }
    }
  );

  const profileCompletionChecks = [
    !!user?.name,
    !!user?.email,
    (user?.skills ?? []).length > 0,
    (user?.interests ?? []).length > 0,
    !!user?.experience
  ];
  const profileCompletion = Math.round((profileCompletionChecks.filter(Boolean).length / profileCompletionChecks.length) * 100);

  const recommendedJobs = (jobsData?.data ?? []).filter((job) => {
    if (!isVillager) return false;
    const userSkills = (user?.skills ?? []).map((item) => item.toLowerCase());
    const required = (job.skillsRequired ?? []).map((item) => item.toLowerCase());
    return required.some((skill) => userSkills.includes(skill));
  });

  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 py-6">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary font-semibold">{isAdminWorkspace ? "Admin workspace" : "Village workspace"}</p>
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {isAdminWorkspace ? "Track opportunities, applications, and assignment health." : "Discover services, recommended jobs, and your application progress."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total villagers</CardTitle>
              <UserRound className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{summary?.totalUsers || 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active jobs</CardTitle>
              <Briefcase className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{summary?.totalJobs || 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Target className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMyApplications ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{(myApplicationsData?.total ?? 0)}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profile readiness</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profileCompletion}%</div>
            </CardContent>
          </Card>
        </div>

        {isVillager ? <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle2 className="size-5 text-primary" /> Profile summary</CardTitle>
                <CardDescription>Complete profile fields to improve recommendation quality.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="text-muted-foreground">Skills:</span> {(user?.skills ?? []).join(", ") || "Add skills in profile"}</p>
                <p><span className="text-muted-foreground">Interests:</span> {(user?.interests ?? []).join(", ") || "Add interests in profile"}</p>
                <p><span className="text-muted-foreground">Employment:</span> <span className="capitalize">{user?.employmentStatus ?? "unemployed"}</span></p>
                <Link href="/profile"><Button variant="outline" className="mt-2">Open Profile</Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="size-5 text-primary" /> Recommended jobs</CardTitle>
                <CardDescription>Matches based on your listed skills and interests.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingJobs ? <Skeleton className="h-20 w-full" /> : (recommendedJobs.length > 0 ? recommendedJobs.slice(0, 3).map((job) => <div key={job.id} className="rounded-md border p-3">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                        <div className="mt-2 flex flex-wrap gap-2">{(job.skillsRequired ?? []).slice(0, 3).map((skill) => <Badge key={`${job.id}-${skill}`} variant="outline">{skill}</Badge>)}</div>
                      </div>) : <p className="text-sm text-muted-foreground">No high-match jobs yet. Add more skills to improve matching.</p>)}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Applied jobs</CardTitle>
                <CardDescription>Track each application: Applied, Selected, or Rejected.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingMyApplications ? <Skeleton className="h-20 w-full" /> : (myApplicationsData?.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No applications yet.</p> : (myApplicationsData?.data ?? []).map((application) => <div key={`${application.jobId}-${application.appliedAt}`} className="rounded-md border p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{application.title}</p>
                          <p className="text-sm text-muted-foreground">{application.location}</p>
                        </div>
                        <Badge variant="secondary" className="uppercase">{application.applicationStatus}</Badge>
                      </div>)}
              </CardContent>
            </Card>
          </div> : <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Admin focus</CardTitle>
                <CardDescription>Monitor unemployment and assignment readiness.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Unemployed count</p>
                  <p className="text-3xl font-bold">{loadingSummary ? "-" : summary?.totalUsers - (summary?.totalJobs || 0)}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Open jobs</p>
                  <p className="text-3xl font-bold">{loadingJobs ? "-" : (jobsData?.data ?? []).filter((job) => job.status === "open").length}</p>
                </div>
                <div className="rounded-md border p-4 sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Assignment health</p>
                  <p className="font-medium text-primary">Ready</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruitment actions</CardTitle>
                <CardDescription>Review applicants and assign candidates quickly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin"><Button className="w-full">Review Applicants</Button></Link>
                {user?.role === "provider" ? <Link href="/jobs/post"><Button variant="outline" className="w-full">Create Job Posting</Button></Link> : null}
              </CardContent>
            </Card>
          </div>}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Agriculture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{loadingSummary ? "Loading..." : `${summary?.totalAgricultureEntries || 0} knowledge entries available`}</p>
              <Link href="/agriculture"><Button variant="ghost" className="px-0">Open agriculture hub</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Healthcare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Community health services and awareness resources.</p>
              <Link href="/healthcare"><Button variant="ghost" className="px-0">Open healthcare services</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Upskilling and learning opportunities for all residents.</p>
              <Link href="/education"><Button variant="ghost" className="px-0">Open education center</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>;
}
export {
  Dashboard as default
};
