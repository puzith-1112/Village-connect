import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { Briefcase, Sprout, HeartPulse, BookOpen, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

function Home() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_10%_20%,hsl(var(--primary)/0.17),transparent_40%),radial-gradient(circle_at_90%_30%,hsl(var(--chart-2)/0.22),transparent_34%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)))]">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "44px 44px"
          }}
        />
        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-6 py-24 md:px-8">
          <div className="flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-7">
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium">
                <Sparkles className="mr-2 size-4" /> Rural opportunity platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-tight">Connecting Villages to Opportunities</h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                A unified digital hub where villagers discover jobs and services, while providers and admins create measurable local impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/jobs">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto font-semibold gap-2">
                    Explore Jobs <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/jobs/post">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto font-semibold">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="w-full max-w-md bg-card/90 backdrop-blur border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle>Platform Pulse</CardTitle>
                <CardDescription>Real-time village growth indicators</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Employment rate</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Jobs posted</p>
                  <p className="text-2xl font-bold">126</p>
                </div>
                <div className="rounded-md border p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Service coverage</p>
                  <p className="text-2xl font-bold">Agriculture, healthcare, education</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl leading-tight">Built for villagers, providers, and admins</h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Clear workflows for information access, job posting, application review, and assignment.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Local Jobs</CardTitle>
                <CardDescription className="text-base">Providers publish opportunities, villagers apply, and admins assign candidates.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="size-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Sprout className="size-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Agriculture</CardTitle>
                <CardDescription className="text-base">Actionable advice, schemes, and updates for farmers and households.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="size-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <HeartPulse className="size-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Healthcare</CardTitle>
                <CardDescription className="text-base">Access verified health resources and essential service updates.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <BookOpen className="size-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Education</CardTitle>
                <CardDescription className="text-base">Upskilling and learning opportunities that improve employability.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 lg:col-span-2">
              <CardHeader>
                <div className="size-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <MessageSquare className="size-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Grievance Portal</CardTitle>
                <CardDescription className="text-base">Residents can raise concerns and monitor progress with transparent status updates.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>"I found my first job in my own district."</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lakshmi, Villager</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>"Posting openings is now simple and transparent."</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ravi, Service Provider</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>"Applicant selection is faster with relevance filters."</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Meena, Admin</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

export {
  Home as default
};
