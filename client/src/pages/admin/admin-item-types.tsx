import { useEffect, useState } from "react";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/admin-api";
import type { ItemTypeRecord } from "@/lib/types";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function AdminItemTypes() {
  const { toast } = useToast();
  const [itemTypes, setItemTypes] = useState<ItemTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItemTypes = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get<ItemTypeRecord[]>("/item-types");
      setItemTypes(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemTypes();
  }, []);

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setNameInput("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast({ title: "Name required", description: "Please enter a type name." });
      return;
    }
    try {
      await adminApi.post("/item-types", { name: nameInput.trim() });
      toast({ title: "Item type created" });
      resetForm();
      fetchItemTypes();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to create item type.";
      toast({ title: "Error", description: msg });
    }
  };

  const startEdit = (type: ItemTypeRecord) => {
    setEditingId(type._id);
    setNameInput(type.name);
    setShowCreateForm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !editingId) return;
    try {
      await adminApi.put(`/item-types/${editingId}`, { name: nameInput.trim() });
      toast({ title: "Item type updated" });
      resetForm();
      fetchItemTypes();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update item type.";
      toast({ title: "Error", description: msg });
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminApi.delete(`/item-types/${deletingId}`);
      toast({ title: "Item type deleted" });
      fetchItemTypes();
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    } catch (error) {
      toast({ title: "Delete failed" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">Item Types</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Add, edit, or remove item categories used when creating items.
            </p>
          </div>
          {!showCreateForm && !editingId && (
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          )}
        </div>

        {showCreateForm && (
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg sm:text-xl">New Item Type</h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleCreate}>
              <div className="flex-1 space-y-2">
                <Label>Type Name <span className="text-red-500">*</span></Label>
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Necklaces"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 sm:items-end sm:pt-7">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <h2 className="font-serif text-lg sm:text-xl mb-4">All Types</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : itemTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No item types found. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {itemTypes.map((type) => (
                <div key={type._id}>
                  {editingId === type._id ? (
                    <Card className="p-3 border-2 border-primary">
                      <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleUpdate}>
                        <div className="flex-1 space-y-2">
                          <Label>Type Name <span className="text-red-500">*</span></Label>
                          <Input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2 sm:items-end sm:pt-7">
                          <Button type="submit">Update</Button>
                          <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors">
                      <span className="font-medium">{type.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(type)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDelete(type._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item Type</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this item type? Existing items using this type will retain their current value.
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
