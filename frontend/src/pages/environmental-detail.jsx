import { useRoute, Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetEnvironmental } from "../lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Leaf, ExternalLink, AlertCircle } from "lucide-react";
import { format } from "date-fns";
const categoryOptions = {
  "soil": "🌱 Soil Health",
  "water": "💧 Water Conservation",
  "air": "🌫️ Air Quality",
  "climate": "🌍 Climate Awareness",
  "renewable": "☀️ Renewable Energy",
  "waste": "♻️ Waste Management",
  "biodiversity": "🦋 Biodiversity"
};
function EnvironmentalDetail() {
  const [, params] = useRoute("/environmental/:id");
  const { data: item, isLoading, error } = useGetEnvironmental(
    { id: params?.id },
    { query: { enabled: !!params?.id } }
  );
  if (isLoading) {
    return <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>;
  }
  if (error || !item) {
    return <AppLayout>
        <div className="space-y-6">
          <Link href="/environmental">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Environmental Content
            </Button>
          </Link>
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Content Not Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The environmental content you're looking for doesn't exist or has been removed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>;
  }
  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6 max-w-3xl">
        <Link href="/environmental">
          <Button variant="outline" className="gap-2 text-lg">
            <ArrowLeft className="size-5" />
            Back to Environmental Content
          </Button>
        </Link>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="size-6 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {categoryOptions[item.category] || item.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Published {format(new Date(item.createdAt), "MMMM dd, yyyy")}</span>
                  {item.updatedAt !== item.createdAt && <span>Updated {format(new Date(item.updatedAt), "MMMM dd, yyyy")}</span>}
                </div>
              </div>
            </CardHeader>
          </Card>

          {item.imageUrl && <Card>
              <CardContent className="p-0">
                <div className="h-96 bg-linear-to-br from-green-100 to-blue-100 overflow-hidden rounded-lg">
                  <img
    src={item.imageUrl}
    alt={item.title}
    className="w-full h-full object-cover"
  />
                </div>
              </CardContent>
            </Card>}

          {item.description && <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </CardContent>
            </Card>}

          {item.content && <Card>
              <CardHeader>
                <CardTitle>Detailed Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </CardContent>
            </Card>}

          {item.resources && item.resources.length > 0 && <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {item.resources.map((resource, idx) => <li key={idx} className="flex items-start gap-3">
                      <ExternalLink className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <a
    href={resource}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-primary hover:underline break-all"
  >
                        {resource}
                      </a>
                    </li>)}
                </ul>
              </CardContent>
            </Card>}

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Leaf className="size-4" />
                Did You Know?
              </h3>
              <p className="text-sm text-muted-foreground">
                Environmental conservation practices not only help protect nature but also improve agricultural yields,
                save water, reduce costs, and create a healthier community for future generations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>;
}
export {
  EnvironmentalDetail as default
};
