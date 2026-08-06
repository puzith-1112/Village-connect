import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListJobs,
  getListJobsQueryKey
} from "../lib/api-client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Search, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
function Jobs() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const { data: jobsData, isLoading } = useListJobs(
    { search: search || void 0, location: location || void 0 },
    { query: { queryKey: getListJobsQueryKey({ search: search || void 0, location: location || void 0 }) } }
  );
  const canPostJob = user?.role === "provider";
  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Local Jobs</h1>
            <p className="text-muted-foreground mt-3 text-lg">Explore verified village opportunities and essential services.</p>
          </div>
          {canPostJob && <Link href="/jobs/post">
              <Button className="gap-2">
                <Plus className="size-4" />
                Post a Job
              </Button>
            </Link>}
        </div>

        <Card className="bg-muted/40 border-dashed shadow-sm">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
    placeholder="Search jobs by title..."
    className="pl-10 h-12 text-base bg-background"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
    placeholder="Filter by location..."
    className="pl-10 h-12 text-base bg-background"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
  />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>)}
          </div> : jobsData?.data && jobsData.data.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobsData.data.map((job) => <Card key={job.id} className="flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Briefcase className="size-3.5 mr-1.5" />
                    <span>{job.postedByName}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(job.skillsRequired ?? []).slice(0, 3).map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    {job.duration ? <Badge variant="secondary">{job.duration}</Badge> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="size-4 mr-2 text-primary" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    {job.salary && <div className="flex items-center">
                        <span className="font-medium mr-1">$</span>
                        <span className="truncate">{job.salary}</span>
                      </div>}
                    <div className="flex items-center col-span-2 text-muted-foreground">
                      <Calendar className="size-4 mr-2" />
                      <span>Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="col-span-2">
                      <Badge className="uppercase">{job.status ?? "open"}</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/jobs/${job.id}`} className="w-full">
                    <Button variant="secondary" className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>)}
          </div> : <div className="text-center py-32 bg-muted/20 rounded-lg border border-dashed">
            <Briefcase className="size-16 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold">No jobs found</h3>
            <p className="text-muted-foreground mt-3 text-lg">Try adjusting your search criteria.</p>
          </div>}
      </div>
    </AppLayout>;
}
export {
  Jobs as default
};
