import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

function calculateProfileCompletion(user) {
  if (!user) return 0;
  const checks = [
    !!user.name,
    !!user.email,
    !!user.phone,
    !!user.city,
    !!user.state,
    (user.skills ?? []).length > 0,
    (user.interests ?? []).length > 0,
    !!user.experience
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export default function Profile() {
  const { user } = useAuth();
  const completion = calculateProfileCompletion(user);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">Your personal and employment information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Keep your profile complete to get better job recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile completeness</span>
              <span className="font-semibold">{completion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{user?.name || "Not provided"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "Not provided"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge variant="secondary" className="uppercase">{user?.role || "villager"}</Badge>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Employment status</p>
                <p className="font-medium capitalize">{user?.employmentStatus || "unemployed"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
