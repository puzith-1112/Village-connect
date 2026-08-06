import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useQueryClient } from "@tanstack/react-query";
import { useApplyForJob, useGetJob, getGetJobQueryKey } from "../lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const applyMutation = useApplyForJob();
  const [form, setForm] = useState({
    skills: "",
    interests: "",
    experience: ""
  });

  const { data: job, isLoading } = useGetJob(
    { id },
    { query: { enabled: !!id } }
  );

  const isVillager = user?.role === "villager";
  const isFilled = job?.status === "filled";

  const handleApply = () => {
    if (!id) return;

    const skills = form.skills.split(",").map((item) => item.trim()).filter(Boolean);
    const interests = form.interests.split(",").map((item) => item.trim()).filter(Boolean);

    if (skills.length === 0 || interests.length === 0) {
      toast.error("Please add at least one skill and one interest");
      return;
    }

    applyMutation.mutate(
      {
        id,
        data: {
          skills,
          interests,
          experience: form.experience.trim() || undefined
        }
      },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully");
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey({ id }) });
        },
        onError: (error) => {
          toast.error(error?.message ?? "Failed to apply for this job");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-4">Job not found</h2>
          <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/jobs")} className="gap-2 text-lg">
          <ArrowLeft className="size-5" /> Back to Jobs
        </Button>

        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-4xl font-bold">{job.title}</CardTitle>
                <CardDescription className="text-lg mt-3">{job.postedByName}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>
              {job.salary && (
                <div className="flex items-center gap-3">
                  <DollarSign className="size-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium">{job.salary}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Posted</p>
                  <p className="font-medium">{format(new Date(job.createdAt), "MMMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="size-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Posted by</p>
                  <p className="font-medium">{job.postedByName}</p>
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <p className="text-sm text-muted-foreground">Required skills</p>
                <div className="flex flex-wrap gap-2">
                  {(job.skillsRequired ?? []).length === 0 ? <p className="text-sm">Not specified</p> : (job.skillsRequired ?? []).map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                </div>
                {job.duration ? <p className="text-sm"><span className="text-muted-foreground">Duration:</span> {job.duration}</p> : null}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Application</h3>
              {isFilled ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                  This position is already filled.
                </p>
              ) : null}
              {!isVillager ? (
                <p className="text-sm text-muted-foreground">Only villagers can apply for this job.</p>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Skills (comma separated)</label>
                    <Input
                      value={form.skills}
                      onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
                      placeholder="Farming, Welding, Tractor driving"
                      disabled={isFilled}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Interests (comma separated)</label>
                    <Input
                      value={form.interests}
                      onChange={(e) => setForm((prev) => ({ ...prev, interests: e.target.value }))}
                      placeholder="Agriculture, Livestock"
                      disabled={isFilled}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Experience (optional)</label>
                    <Textarea
                      rows={3}
                      value={form.experience}
                      onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
                      placeholder="Any related experience"
                      disabled={isFilled}
                    />
                  </div>
                  <Button className="w-full h-12 text-base" size="lg" onClick={handleApply} disabled={isFilled || applyMutation.isPending}>
                    {applyMutation.isPending ? "Submitting..." : "Apply for This Job"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


