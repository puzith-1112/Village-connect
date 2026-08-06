import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useListMyJobApplications, getListMyJobApplicationsQueryKey } from "@/lib/api-client";
import { Briefcase } from "lucide-react";

const statusClasses = {
  pending: "bg-amber-100 text-amber-900",
  selected: "bg-green-100 text-green-900",
  rejected: "bg-rose-100 text-rose-900"
};

export default function Applications() {
  const { user } = useAuth();
  const isVillager = user?.role === "villager";

  const { data, isLoading } = useListMyJobApplications(
    {},
    {
      query: {
        enabled: isVillager,
        queryKey: getListMyJobApplicationsQueryKey()
      }
    }
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-2">Track every job you applied for in one place.</p>
        </div>

        {!isVillager ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Application tracking is available for villagers and residents.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : (data?.data ?? []).length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Briefcase className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold">No applications yet</p>
              <p className="text-muted-foreground">Apply to jobs and track progress here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.data ?? []).map((item) => (
              <Card key={`${item.jobId}-${item.appliedAt}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Application status</p>
                    <Badge className={statusClasses[item.applicationStatus] ?? ""}>{item.applicationStatus}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Job status</p>
                    <p className="text-sm font-medium uppercase">{item.status}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="text-sm font-medium">{item.salary || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
