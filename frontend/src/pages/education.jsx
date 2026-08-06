import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListEducation,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  getListEducationQueryKey
} from "../lib/api-client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
const CATEGORY_LABELS = {
  course: "Course",
  resource: "Resource",
  scholarship: "Scholarship"
};
const CATEGORY_COLORS = {
  course: "bg-amber-100 text-amber-800",
  resource: "bg-sky-100 text-sky-800",
  scholarship: "bg-emerald-100 text-emerald-800"
};
function Education() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useListEducation({ query: { queryKey: getListEducationQueryKey() } });
  const createMutation = useCreateEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", category: "course", content: "", link: "" });
  const isAdmin = user?.role === "admin";
  const handleSubmit = () => {
    if (!form.title || !form.content) {
      toast.error("Please fill in required fields");
      return;
    }
    const data = {
      title: form.title,
      category: form.category,
      content: form.content,
      link: form.link || null,
      imageUrl: null,
      resources: form.category === "resource" ? form.content : form.title,
      courses: form.category === "course" ? form.content : form.title
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data }, {
        onSuccess: () => {
          toast.success("Entry updated");
          queryClient.invalidateQueries({ queryKey: getListEducationQueryKey() });
          setOpen(false);
          setEditItem(null);
        },
        onError: () => toast.error("Failed to update")
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast.success("Entry created");
          queryClient.invalidateQueries({ queryKey: getListEducationQueryKey() });
          setOpen(false);
        },
        onError: () => toast.error("Failed to create")
      });
    }
  };
  const handleDelete = (id) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Entry deleted");
        queryClient.invalidateQueries({ queryKey: getListEducationQueryKey() });
      },
      onError: () => toast.error("Failed to delete")
    });
  };
  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <BookOpen className="size-9 text-primary" /> Educational Resources
            </h1>
            <p className="text-muted-foreground mt-1">Courses, learning resources, and scholarship opportunities</p>
          </div>
          {isAdmin && <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2" onClick={() => {
    setEditItem(null);
    setForm({ title: "", category: "course", content: "", link: "" });
  }}>
                  <Plus className="size-5" /> Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editItem ? "Edit Entry" : "Add Education Entry"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Entry title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Describe the course, resource, or scholarship..." rows={5} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Link (optional)</label>
                    <Input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://..." />
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editItem ? "Save Changes" : "Create Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>}
        </div>

        {isLoading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(items ?? []).map((item) => <Card key={item.id} className={`flex flex-col ${isAdmin ? "cursor-pointer hover:border-primary/50" : ""}`} onClick={() => {
    if (isAdmin) {
      setEditItem({ id: item.id, title: item.title, category: item.category, content: item.content, link: item.link });
      setForm({ title: item.title ?? item.resources ?? "", category: item.category ?? "course", content: item.content ?? item.courses ?? "", link: item.link ?? "" });
      setOpen(true);
    }
  }}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{item.title ?? item.resources ?? "Education Update"}</CardTitle>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${CATEGORY_COLORS[item.category ?? "course"]}`}>
                      {CATEGORY_LABELS[item.category ?? "course"]}
                    </span>
                  </div>
                  <CardDescription>{format(new Date(item.updatedAt), "dd MMM yyyy")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{item.content ?? item.courses ?? item.resources}</p>
                  {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                      <ExternalLink className="size-4" /> Learn More
                    </a>}
                  {isAdmin && <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={(e) => {
    e.stopPropagation();
    setEditItem({ id: item.id, title: item.title, category: item.category, content: item.content, link: item.link });
    setForm({ title: item.title ?? item.resources ?? "", category: item.category ?? "course", content: item.content ?? item.courses ?? "", link: item.link ?? "" });
    setOpen(true);
  }}>
                        <Pencil className="size-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={(e) => {
    e.stopPropagation();
    handleDelete(item.id);
  }}>
                        <Trash2 className="size-4 mr-1" /> Delete
                      </Button>
                    </div>}
                </CardContent>
              </Card>)}
            {(items ?? []).length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">No education entries yet.</div>}
          </div>}
      </div>
    </AppLayout>;
}
export {
  Education as default
};
