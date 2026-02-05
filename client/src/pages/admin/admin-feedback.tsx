import { useEffect, useState } from "react";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/admin-api";
import type { Feedback, PaginationResponse } from "@/lib/types";
import { Plus, Edit, Trash2, X, Star } from "lucide-react";

const emptyForm = {
  customerName: "",
  rating: 5,
  description: "",
};

export default function AdminFeedback() {
  const { toast } = useToast();
  const [items, setItems] = useState<Feedback[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const fetchFeedback = async (pageNumber = page) => {
    setLoading(true);
    try {
      const response = await adminApi.get<PaginationResponse<Feedback>>("/feedback", {
        params: { page: pageNumber, limit: 10 },
      });
      setItems(response.data.data);
      setTotalPages(response.data.totalPages);
      setPage(response.data.currentPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await adminApi.put(`/feedback/${editingId}`, form);
        toast({ title: "Feedback updated" });
      } else {
        await adminApi.post("/feedback", form);
        toast({ title: "Feedback created" });
      }
      resetForm();
      fetchFeedback(page);
    } catch (error) {
      toast({ title: "Save failed", description: "Please check the fields." });
    }
  };

  const handleEdit = (item: Feedback) => {
    setEditingId(item._id);
    setShowCreateForm(true);
    setForm({
      customerName: item.customerName,
      rating: item.rating,
      description: item.description,
    });
  };

  const confirmDelete = (itemId: string) => {
    setDeletingItemId(itemId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItemId) return;
    try {
      await adminApi.delete(`/feedback/${deletingItemId}`);
      toast({ title: "Feedback deleted" });
      fetchFeedback(page);
      setDeleteConfirmOpen(false);
      setDeletingItemId(null);
    } catch (error) {
      toast({ title: "Delete failed" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">Feedback</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage customer stories.</p>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Feedback
            </Button>
          )}
        </div>

        {showCreateForm && (
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg sm:text-xl">{editingId ? "Edit Feedback" : "Create Feedback"}</h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:col-span-2">
                <Button type="submit" className="w-full sm:w-auto">{editingId ? "Update Feedback" : "Create Feedback"}</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-xl">Feedback List</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchFeedback(Math.max(1, page - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchFeedback(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Loading feedback...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No feedback found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {items.map((item) => (
                <Card key={item._id} className="p-4 sm:p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">{item.customerName}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              i < item.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-xs sm:text-sm text-muted-foreground ml-1">
                          {item.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 sm:line-clamp-4 mb-4 flex-1">
                    {item.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(item)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => confirmDelete(item._id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this feedback? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
