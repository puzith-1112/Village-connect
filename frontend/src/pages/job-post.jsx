import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useCreateJob, getListJobsQueryKey } from "@/lib/api-client";
import { ArrowLeft, WandSparkles } from "lucide-react";

export default function JobPost() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createJobMutation = useCreateJob();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    duration: ""
  });
  const [skillInput, setSkillInput] = useState("");
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [errors, setErrors] = useState({});

  const canPost = user?.role === "provider";

  const addSkill = () => {
    const normalized = skillInput.trim();
    if (!normalized) return;
    if (skillsRequired.includes(normalized.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkillsRequired((prev) => [...prev, normalized.toLowerCase()]);
    setSkillInput("");
  };

  const removeSkill = (target) => {
    setSkillsRequired((prev) => prev.filter((skill) => skill !== target));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Job title is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (!form.location.trim()) nextErrors.location = "Location is required";
    if (!form.salary.trim()) nextErrors.salary = "Salary is required";
    if (!form.duration.trim()) nextErrors.duration = "Duration is required";
    if (skillsRequired.length === 0) nextErrors.skillsRequired = "Add at least one required skill";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields");
      return;
    }

    createJobMutation.mutate(
      { data: { ...form, skillsRequired } },
      {
        onSuccess: (response) => {
          toast.success("Job posted successfully");
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey({}) });
          if (response?.id) {
            navigate(`/jobs/${response.id}`);
            return;
          }
          navigate("/jobs");
        },
        onError: (error) => {
          toast.error(error?.message ?? "Failed to post job");
        }
      }
    );
  };

  if (!canPost) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
          <p className="text-muted-foreground">Only service providers can create job postings.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl px-4 md:px-6 lg:px-8 py-6 space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="size-4" /> Back to Jobs
        </Button>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <WandSparkles className="size-6 text-primary" /> Provider Job Posting Studio
            </CardTitle>
            <CardDescription>Create a premium job listing with clear expectations and candidate-fit signals.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Village Field Assistant"
                />
                {errors.title ? <p className="text-xs text-destructive mt-1">{errors.title}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe role responsibilities and required qualifications"
                />
                {errors.description ? <p className="text-xs text-destructive mt-1">{errors.description}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Village Center"
                  />
                  {errors.location ? <p className="text-xs text-destructive mt-1">{errors.location}</p> : null}
                </div>
                <div>
                  <label className="text-sm font-medium">Salary</label>
                  <Input
                    value={form.salary}
                    onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
                    placeholder="12000 / month"
                  />
                  {errors.salary ? <p className="text-xs text-destructive mt-1">{errors.salary}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="3 months / Seasonal"
                  />
                  {errors.duration ? <p className="text-xs text-destructive mt-1">{errors.duration}</p> : null}
                </div>
                <div>
                  <label className="text-sm font-medium">Skills Required</label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Add skill and press Enter"
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                  {errors.skillsRequired ? <p className="text-xs text-destructive mt-1">{errors.skillsRequired}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 min-h-8">
                {skillsRequired.map((skill) => (
                  <button type="button" key={skill} onClick={() => removeSkill(skill)}>
                    <Badge variant="secondary" className="cursor-pointer">{skill} x</Badge>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="submit" disabled={createJobMutation.isPending}>
                  {createJobMutation.isPending ? "Posting..." : "Post Job"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
