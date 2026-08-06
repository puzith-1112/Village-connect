import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListAgriculture,
  useCreateAgriculture,
  useUpdateAgriculture,
  useDeleteAgriculture,
  getListAgricultureQueryKey
} from "../lib/api-client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Sprout, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
const CATEGORY_LABELS = {
  tip: "Farming Tip",
  scheme: "Government Scheme",
  news: "News & Update"
};
const CATEGORY_COLORS = {
  tip: "bg-green-100 text-green-800",
  scheme: "bg-amber-100 text-amber-800",
  news: "bg-blue-100 text-blue-800"
};
function Agriculture() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useListAgriculture({ query: { queryKey: getListAgricultureQueryKey() } });
  const createMutation = useCreateAgriculture();
  const updateMutation = useUpdateAgriculture();
  const deleteMutation = useDeleteAgriculture();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", category: "tip", content: "", imageUrl: "" });
  const isAdmin = user?.role === "admin";
  const handleSubmit = () => {
    if (!form.title || !form.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    const data = {
      title: form.title,
      category: form.category,
      content: form.content,
      imageUrl: form.imageUrl || null,
      tips: form.category === "tip" ? form.content : form.title,
      schemes: form.category === "scheme" ? form.content : form.title
    };
    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, data },
        {
          onSuccess: () => {
            toast.success("Entry updated successfully");
            queryClient.invalidateQueries({ queryKey: getListAgricultureQueryKey() });
            setOpen(false);
            setEditItem(null);
          },
          onError: () => toast.error("Failed to update entry")
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast.success("Entry created successfully");
            queryClient.invalidateQueries({ queryKey: getListAgricultureQueryKey() });
            setOpen(false);
          },
          onError: () => toast.error("Failed to create entry")
        }
      );
    }
  };
  const handleDelete = (id) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Entry deleted");
          queryClient.invalidateQueries({ queryKey: getListAgricultureQueryKey() });
        },
        onError: () => toast.error("Failed to delete entry")
      }
    );
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item?.title ?? item?.tips ?? "",
      category: item?.category ?? "tip",
      content: item?.content ?? item?.schemes ?? "",
      imageUrl: item?.imageUrl ?? ""
    });
    setOpen(true);
  };
  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", category: "tip", content: "", imageUrl: "" });
    setOpen(true);
  };
  return <AppLayout>
      <div className="space-y-8 px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Sprout className="size-9 text-primary" /> Agricultural Support
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">Farming tips, government schemes, and agricultural news</p>
          </div>
          {isAdmin && <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} size="lg" className="gap-2">
                  <Plus className="size-5" /> Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editItem ? "Edit Entry" : "Add New Entry"}</DialogTitle>
                </DialogHeader>
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
                        <SelectItem value="tip">Farming Tip</SelectItem>
                        <SelectItem value="scheme">Government Scheme</SelectItem>
                        <SelectItem value="news">News & Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
    value={form.content}
    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
    placeholder="Describe the tip or scheme..."
    rows={5}
  />
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editItem ? "Save Changes" : "Create Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>}
        </div>

        {isLoading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(items ?? []).map((item) => <Card key={item.id} className={`flex flex-col ${isAdmin ? "cursor-pointer hover:border-primary/50" : ""}`} onClick={() => {
    if (isAdmin) {
      openEdit({ id: item.id, title: item.title, category: item.category, content: item.content, imageUrl: item.imageUrl, tips: item.tips, schemes: item.schemes });
    }
  }}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{item.title ?? item.tips ?? "Agriculture Update"}</CardTitle>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${CATEGORY_COLORS[item.category ?? "tip"]}`}>
                      {CATEGORY_LABELS[item.category ?? "tip"]}
                    </span>
                  </div>
                  <CardDescription>{format(new Date(item.updatedAt), "dd MMM yyyy")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{item.content ?? item.schemes ?? item.tips}</p>
                  {isAdmin && <div className="flex gap-2 mt-4">
                      <Button
    variant="outline"
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      openEdit({ id: item.id, title: item.title, category: item.category, content: item.content, imageUrl: item.imageUrl, tips: item.tips, schemes: item.schemes });
    }}
  >
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
            {(items ?? []).length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">
                No agriculture entries yet.
              </div>}
          </div>}
      </div>
    </AppLayout>;
}
export {
  Agriculture as default
};
