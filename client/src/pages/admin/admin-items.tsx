import { useEffect, useState } from "react";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/admin-api";
import type { Item, ItemType, PaginationResponse } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { Plus, Edit, Trash2, X } from "lucide-react";

const itemTypes: ItemType[] = [
  "Necklaces",
  "Rings",
  "Earrings",
  "Bracelets",
  "Bangles",
  "Anklets",
];

const emptyForm = {
  type: "Necklaces" as ItemType,
  title: "",
  description: "",
  material: "",
  originalAmount: 0,
  ourAmount: 0,
  rating: 5,
  reviewCount: 0,
  isTrendingNow: false,
  isBestSeller: false,
  isCombo: false,
  shippingCharge: 0,
  codAvailable: true,
  imageFiles: [] as File[],
  imageUrls: [] as string[],
  imageUrlInput: "",
  existingImages: [] as string[],
  removedImages: [] as string[],
};

export default function AdminItems() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const fetchItems = async (pageNumber = page) => {
    setLoading(true);
    try {
      const response = await adminApi.get<PaginationResponse<Item>>("/items", {
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
    fetchItems(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowCreateForm(false);
  };

  const getPrimaryImage = (item: Item) => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return item.image || "";
  };

  const removeExistingImage = (imageUrl: string) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((image) => image !== imageUrl),
      removedImages: prev.removedImages.includes(imageUrl)
        ? prev.removedImages
        : [...prev.removedImages, imageUrl],
    }));
  };

  const removeNewImage = (imageUrl: string) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((image) => image !== imageUrl),
    }));
  };

  const removeNewFile = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, fileIndex) => fileIndex !== index),
    }));
  };

  const addImageUrl = () => {
    const trimmed = form.imageUrlInput.trim();
    if (!trimmed) return;
    if (form.imageUrls.includes(trimmed)) {
      setForm((prev) => ({ ...prev, imageUrlInput: "" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, trimmed],
      imageUrlInput: "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("type", form.type);
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("material", form.material);
    payload.append("originalAmount", String(form.originalAmount));
    payload.append("ourAmount", String(form.ourAmount));
    payload.append("rating", String(form.rating));
    payload.append("reviewCount", String(form.reviewCount));
    payload.append("shippingCharge", String(form.shippingCharge));
    payload.append("isTrendingNow", String(form.isTrendingNow));
    payload.append("isBestSeller", String(form.isBestSeller));
    payload.append("isCombo", String(form.isCombo));
    payload.append("codAvailable", String(form.codAvailable));
    
    // For editing: include existing images that weren't removed
    if (editingId) {
      form.existingImages.forEach((imageUrl) => payload.append("images", imageUrl));
    }
    
    form.imageFiles.forEach((file) => payload.append("images", file));
    form.imageUrls.forEach((imageUrl) => payload.append("images", imageUrl));

    if (editingId && form.removedImages.length > 0) {
      payload.append("removedImages", JSON.stringify(form.removedImages));
    }

    const totalImages = form.existingImages.length + form.imageFiles.length + form.imageUrls.length;
    if (totalImages === 0) {
      toast({ title: "Image required", description: "Please add at least one image." });
      return;
    }

    try {
      if (editingId) {
        await adminApi.put(`/items/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Item updated" });
      } else {
        await adminApi.post("/items", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Item created" });
      }
      resetForm();
      fetchItems(page);
    } catch (error) {
      toast({ title: "Save failed", description: "Please check the fields." });
    }
  };

  const handleEdit = (item: Item) => {
    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
        ? [item.image]
        : [];
    setEditingId(item._id);
    setShowCreateForm(false); // Don't show create form when editing
    setForm({
      type: item.type,
      title: item.title,
      description: item.description || "",
      material: item.material || "",
      originalAmount: item.originalAmount,
      ourAmount: item.ourAmount,
      rating: item.rating,
      reviewCount: item.reviewCount || 0,
      isTrendingNow: item.isTrendingNow,
      isBestSeller: item.isBestSeller,
      isCombo: item.isCombo,
      shippingCharge: item.shippingCharge,
      codAvailable: item.codAvailable ?? true,
      imageFiles: [],
      imageUrls: [],
      imageUrlInput: "",
      existingImages: images,
      removedImages: [],
    });
    
    // Scroll to the item being edited
    setTimeout(() => {
      const element = document.getElementById(`item-${item._id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const confirmDelete = (itemId: string) => {
    setDeletingItemId(itemId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItemId) return;
    try {
      await adminApi.delete(`/items/${deletingItemId}`);
      toast({ title: "Item deleted" });
      fetchItems(page);
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
            <h1 className="font-serif text-2xl sm:text-3xl">Items</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Create, update, and manage store items.</p>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Item
            </Button>
          )}
        </div>

        {showCreateForm && !editingId && (
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg sm:text-xl">Create Item</h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as ItemType }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Input value={form.material} onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="5" 
                  step="0.1" 
                  value={form.rating} 
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Review Count</Label>
                <Input 
                  type="number" 
                  min="0" 
                  value={form.reviewCount} 
                  onChange={(e) => setForm((prev) => ({ ...prev, reviewCount: Number(e.target.value) }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Original Amount <span className="text-red-500">*</span>
                </Label>
                <Input type="number" value={form.originalAmount} onChange={(e) => setForm((prev) => ({ ...prev, originalAmount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>
                  Our Amount <span className="text-red-500">*</span>
                </Label>
                <Input type="number" value={form.ourAmount} onChange={(e) => setForm((prev) => ({ ...prev, ourAmount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Shipping Charge</Label>
                <Input type="number" value={form.shippingCharge} onChange={(e) => setForm((prev) => ({ ...prev, shippingCharge: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.codAvailable} onCheckedChange={(value) => setForm((prev) => ({ ...prev, codAvailable: value }))} />
                <Label>COD Available</Label>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Image Files <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setForm((prev) => ({ ...prev, imageFiles: Array.from(e.target.files || []) }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Image URL (optional)</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={form.imageUrlInput}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrlInput: e.target.value }))}
                    placeholder="Paste an image URL and click add"
                  />
                  <Button type="button" variant="outline" onClick={addImageUrl}>
                    Add URL
                  </Button>
                </div>
              </div>
              {(editingId && form.existingImages.length > 0) && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.existingImages.map((imageUrl) => (
                      <div key={imageUrl} className="relative rounded-lg overflow-hidden border">
                        <SafeImage src={imageUrl} alt="Existing item" className="w-full h-28 object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7"
                          onClick={() => removeExistingImage(imageUrl)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(form.imageFiles.length > 0 || form.imageUrls.length > 0) && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>New Images</Label>
                  <div className="space-y-2">
                    {form.imageFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span className="text-sm text-muted-foreground truncate">{file.name}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeNewFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {form.imageUrls.map((imageUrl) => (
                      <div key={imageUrl} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span className="text-sm text-muted-foreground truncate">{imageUrl}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeNewImage(imageUrl)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Switch checked={form.isTrendingNow} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isTrendingNow: value }))} />
                <Label>Trending</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isBestSeller} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isBestSeller: value }))} />
                <Label>Best Seller</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isCombo} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isCombo: value }))} />
                <Label>Combo</Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:col-span-2">
                <Button type="submit" className="w-full sm:w-auto">Create Item</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-xl">Items List</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchItems(Math.max(1, page - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchItems(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Loading items...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No items found.</p>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const discount = item.originalAmount > item.ourAmount
                  ? Math.round(((item.originalAmount - item.ourAmount) / item.originalAmount) * 100)
                  : null;
                
                const primaryImage = getPrimaryImage(item);
                const itemKey = item._id || `${item.title}-${primaryImage}`;
                const isEditing = editingId === item._id;

                return (
                  <div key={itemKey} id={`item-${item._id}`} className="space-y-4">
                    <Card className="group relative bg-card rounded-2xl overflow-visible transition-all duration-300 hover:shadow-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-48 aspect-square rounded-xl overflow-hidden bg-muted shrink-0">
                          <SafeImage
                            src={primaryImage}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {discount && (
                            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-primary text-primary-foreground text-xs">
                              -{discount}%
                            </Badge>
                          )}
                          {item.isCombo && !discount && (
                            <Badge variant="secondary" className="absolute top-2 sm:top-3 left-2 sm:left-3 text-xs">
                              Combo
                            </Badge>
                          )}
                          {item.isTrendingNow && !discount && !item.isCombo && (
                            <Badge variant="secondary" className="absolute top-2 sm:top-3 left-2 sm:left-3 text-xs">
                              Trending
                            </Badge>
                          )}
                          {item.isBestSeller && !discount && !item.isTrendingNow && !item.isCombo && (
                            <Badge variant="secondary" className="absolute top-2 sm:top-3 left-2 sm:left-3 text-xs">
                              Best Seller
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5 sm:space-y-2">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {item.type}
                          </p>
                          <h3 className="font-serif font-medium text-base sm:text-lg">
                            {item.title}
                          </h3>
                          {item.material && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {item.material}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base sm:text-lg text-foreground">
                              {formatPrice(Number(item.ourAmount ?? 0))}
                            </span>
                            {Number(item.originalAmount ?? 0) > Number(item.ourAmount ?? 0) && (
                              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                {formatPrice(Number(item.originalAmount ?? 0))}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
                        </div>
                      </div>
                    </Card>
                    
                    {isEditing && (
                      <Card className="p-4 sm:p-6 border-2 border-primary">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-serif text-lg sm:text-xl">Edit Item</h2>
                          <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                          <div className="space-y-2">
                            <Label>
                              Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as ItemType }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Title <span className="text-red-500">*</span>
                            </Label>
                            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Description</Label>
                            <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Material</Label>
                            <Input value={form.material} onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Rating</Label>
                            <Input 
                              type="number" 
                              min="0" 
                              max="5" 
                              step="0.1" 
                              value={form.rating} 
                              onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Review Count</Label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={form.reviewCount} 
                              onChange={(e) => setForm((prev) => ({ ...prev, reviewCount: Number(e.target.value) }))} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Original Amount <span className="text-red-500">*</span>
                            </Label>
                            <Input type="number" value={form.originalAmount} onChange={(e) => setForm((prev) => ({ ...prev, originalAmount: Number(e.target.value) }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Our Amount <span className="text-red-500">*</span>
                            </Label>
                            <Input type="number" value={form.ourAmount} onChange={(e) => setForm((prev) => ({ ...prev, ourAmount: Number(e.target.value) }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Shipping Charge</Label>
                            <Input type="number" value={form.shippingCharge} onChange={(e) => setForm((prev) => ({ ...prev, shippingCharge: Number(e.target.value) }))} />
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={form.codAvailable} onCheckedChange={(value) => setForm((prev) => ({ ...prev, codAvailable: value }))} />
                            <Label>COD Available</Label>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>
                              Image Files <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => setForm((prev) => ({ ...prev, imageFiles: Array.from(e.target.files || []) }))}
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Image URL (optional)</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                value={form.imageUrlInput}
                                onChange={(e) => setForm((prev) => ({ ...prev, imageUrlInput: e.target.value }))}
                                placeholder="Paste an image URL and click add"
                              />
                              <Button type="button" variant="outline" onClick={addImageUrl}>
                                Add URL
                              </Button>
                            </div>
                          </div>
                          {(form.existingImages.length > 0) && (
                            <div className="space-y-2 sm:col-span-2">
                              <Label>Current Images</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {form.existingImages.map((imageUrl) => (
                                  <div key={imageUrl} className="relative rounded-lg overflow-hidden border">
                                    <SafeImage src={imageUrl} alt="Existing item" className="w-full h-28 object-cover" />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-7 w-7"
                                      onClick={() => removeExistingImage(imageUrl)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(form.imageFiles.length > 0 || form.imageUrls.length > 0) && (
                            <div className="space-y-2 sm:col-span-2">
                              <Label>New Images</Label>
                              <div className="space-y-2">
                                {form.imageFiles.map((file, index) => (
                                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="text-sm text-muted-foreground truncate">{file.name}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeNewFile(index)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                {form.imageUrls.map((imageUrl) => (
                                  <div key={imageUrl} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="text-sm text-muted-foreground truncate">{imageUrl}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeNewImage(imageUrl)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Switch checked={form.isTrendingNow} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isTrendingNow: value }))} />
                            <Label>Trending</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={form.isBestSeller} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isBestSeller: value }))} />
                            <Label>Best Seller</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={form.isCombo} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isCombo: value }))} />
                            <Label>Combo</Label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 sm:col-span-2">
                            <Button type="submit" className="w-full sm:w-auto">Update Item</Button>
                            <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this item? This action cannot be undone.
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
