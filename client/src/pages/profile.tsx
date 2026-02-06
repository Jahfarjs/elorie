import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SafeImage } from "@/components/ui/safe-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatPrice } from "@/lib/data";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { Address, Item, Order } from "@/lib/types";
import { mapItemToProduct } from "@/lib/mappers";
import { consumePendingCartAction } from "@/lib/pending-cart";

type TabType = "profile" | "orders" | "wishlist" | "addresses" | "settings";

const navItems: { key: TabType; label: string; icon: typeof User }[] = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "orders", label: "Order History", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "settings", label: "Settings", icon: Settings },
];

// Demo data removed – wishlist and addresses now use real user/cart data.

const formatAddressLine = (addr?: Address | null, fallback?: string) => {
  if (addr) {
    return [
      addr.address,
      addr.landmark,
      addr.city,
      addr.district,
      addr.state,
      addr.pinCode,
    ]
      .filter((p) => Boolean(p && String(p).trim()))
      .join(", ");
  }
  return (fallback || "").trim();
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    state: "",
    landmark: "",
    pinCode: "",
    password: "",
  });
  const { login, register } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: {
            label: "Home",
            address: form.address,
            city: form.city,
            district: form.district,
            state: form.state,
            landmark: form.landmark,
            contactNumber: form.phone,
            pinCode: form.pinCode,
          },
          password: form.password,
        });
      }

      // After successful authentication, attempt to restore any pending cart action.
      const pending = consumePendingCartAction();
      if (pending) {
        try {
          const response = await api.get<Item>(`/items/${pending.productId}`);
          if (!response.data || !response.data._id || !response.data.type) {
            throw new Error("Invalid product for pending cart action");
          }
          const product = mapItemToProduct(response.data);
          await addItem(product, pending.quantity);
          toast({
            title: "Added to cart",
            description: `${pending.quantity} x ${product.name} added to your cart.`,
          });

          if (pending.returnTo) {
            setLocation(pending.returnTo);
          } else {
            setLocation("/cart");
          }
        } catch {
          toast({
            title: "Could not restore cart item",
            description: "Please try adding the product to your cart again.",
          });
        }
      }
    } catch (error) {
      const anyError = error as any;
      const status = anyError?.response?.status as number | undefined;
      const data = anyError?.response?.data as
        | { message?: string; errors?: string[] }
        | undefined;

      // Prefer backend validation / auth messages when available.
      const description =
        data?.errors?.[0] ||
        data?.message ||
        "Please check your details and try again.";

      toast({
        title:
          status === 400
            ? "Validation error"
            : status === 401
            ? "Invalid credentials"
            : "Authentication failed",
        description,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-normal">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Register" : "Sign In"}
        </Button>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <Input
                id="register-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-phone">Phone</Label>
              <Input
                id="register-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="register-address">Address *</Label>
                <Input
                  id="register-address"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-city">City *</Label>
                <Input
                  id="register-city"
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-district">District *</Label>
                <Input
                  id="register-district"
                  value={form.district}
                  onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-state">State *</Label>
                <Input
                  id="register-state"
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-pincode">Pin Code *</Label>
                <Input
                  id="register-pincode"
                  value={form.pinCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, pinCode: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="register-landmark">Landmark</Label>
                <Input
                  id="register-landmark"
                  value={form.landmark}
                  onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
                />
              </div>
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
        <Button type="submit" className="w-full">
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>
    </div>
  );
}

function ProfileTab({
  user,
  onSave,
  onManageAddresses,
}: {
  user: { name: string; email: string; phone: string; address: string; addresses?: Address[]; defaultAddress?: Address | null };
  onSave: (payload: { name: string; email: string; phone: string }) => void;
  onManageAddresses: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  useEffect(() => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    setIsEditing(false);
  }, [user]);

  const defaultAddress =
    (Array.isArray(user.addresses) && (user.addresses.find((a) => a.isDefault) || user.addresses[0])) ||
    user.defaultAddress ||
    null;
  const addressLine = formatAddressLine(defaultAddress, user.address);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-normal">My Profile</h2>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setForm({ name: user.name, email: user.email, phone: user.phone });
              setIsEditing(false);
            }}
            data-testid="button-cancel-edit-profile"
          >
            Cancel
          </Button>
        )}
      </div>
      <Card className="p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              {getInitials(user.name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-xl font-medium">{user.name}</h3>
            <p className="text-muted-foreground">Member since {new Date().getFullYear()}</p>
          </div>
        </div>

        {isEditing ? (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  data-testid="input-fullname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {addressLine || "-"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onManageAddresses}
                  type="button"
                  data-testid="button-manage-addresses"
                >
                  Manage Addresses
                </Button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => onSave(form)} data-testid="button-save-profile">
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium" data-testid="text-profile-name">
                  {user.name || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-words" data-testid="text-profile-email">
                  {user.email || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium" data-testid="text-profile-phone">
                  {user.phone || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Default Address</p>
                <p className="font-medium text-muted-foreground leading-relaxed" data-testid="text-profile-address">
                  {addressLine || "-"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onManageAddresses}
                  type="button"
                  data-testid="button-manage-addresses-view"
                >
                  Manage Addresses
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

const orderStatusDisplay: Record<
  Order["status"],
  { label: string; badgeClass: string }
> = {
  pendingPayment: {
    label: "Pending Payment",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  orderPlaced: {
    label: "Placed",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  orderConfirmed: {
    label: "Confirmed",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  orderDispatched: {
    label: "Dispatched",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  orderDelivered: {
    label: "Delivered",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

function OrdersTab({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-normal">Order History</h2>
        <Link href="/tracking">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Track Order
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = orderStatusDisplay[order.status] ?? {
            label: order.status.replace("order", "").replace(/([A-Z])/g, " $1").trim(),
            badgeClass: "bg-muted text-muted-foreground",
          };
          return (
          <Card
            key={order._id}
            className="p-4 sm:p-6 rounded-2xl"
            data-testid={`card-order-${order._id}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-mono font-semibold">{order._id}</p>
                  <Badge className={`capitalize ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(order.createdAt || order.orderDate)
                    ? new Date(order.createdAt || order.orderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
                {order.status === "pendingPayment" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Complete payment from checkout to confirm this order.
                  </p>
                )}
                {order.status === "cancelled" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment was cancelled. You can place a new order from your cart.
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatPrice(order.totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-3 overflow-x-auto pb-2">
              {order.items
                .filter((item) => item.item != null)
                .map((item) => (
                  <div
                    key={`${order._id}-${item.item._id}`}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0"
                  >
                    <SafeImage
                      src={item.item.images?.[0] || item.item.image || ""}
                      alt={item.item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>

            <div className="flex justify-end mt-4">
              <Link href={`/tracking`}>
                <Button variant="outline" size="sm">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
}

function WishlistTab() {
  const { items } = useCart();
  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-normal">Wishlist</h2>
      {!hasItems ? (
        <Card className="p-8 rounded-2xl text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty</p>
          <Link href="/shop">
            <Button variant="outline" className="mt-4">
              Browse Products
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 rounded-2xl"
              data-testid={`card-wishlist-item-${entry.productId}`}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <SafeImage
                    src={entry.product.imageUrl || ""}
                    alt={entry.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2">
                    {entry.product.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {entry.product.category}
                  </p>
                  <p className="font-semibold mt-1">
                    {formatPrice(entry.product.price)}
                  </p>
                  <Link href="/cart">
                    <Button size="sm" className="mt-2">
                      View in Cart
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressesTab({
  user,
  onSaveAddresses,
}: {
  user: { address: string; addresses?: Address[] };
  onSaveAddresses: (addresses: Address[]) => Promise<void>;
}) {
  const { toast } = useToast();
  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const hasAddresses = addresses.length > 0;
  const hasLegacyAddress = Boolean(user.address && user.address.trim().length > 0);
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Address>({
    label: "Home",
    address: "",
    city: "",
    district: "",
    state: "",
    landmark: "",
    contactNumber: "",
    pinCode: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      label: "Home",
      address: "",
      city: "",
      district: "",
      state: "",
      landmark: "",
      contactNumber: "",
      pinCode: "",
    });
  };

  const setDefault = async (id?: string) => {
    if (!id) return;
    const next = addresses.map((a) => ({ ...a, isDefault: String(a._id) === String(id) }));
    await onSaveAddresses(next);
    toast({ title: "Default address updated" });
  };

  const confirmDeleteAddress = (id?: string) => {
    if (!id) return;
    setDeletingAddressId(String(id));
    setDeleteConfirmOpen(true);
  };

  const removeAddress = async () => {
    if (!deletingAddressId) return;
    const next = addresses.filter((a) => String(a._id) !== String(deletingAddressId));
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0].isDefault = true;
    }
    await onSaveAddresses(next);
    toast({ title: "Address removed" });
    setDeleteConfirmOpen(false);
    setDeletingAddressId(null);
  };

  const startEdit = (addr: Address) => {
    setEditingId(String(addr._id || ""));
    setForm({
      label: addr.label || "Home",
      address: addr.address,
      city: addr.city,
      district: addr.district,
      state: addr.state,
      landmark: addr.landmark || "",
      contactNumber: addr.contactNumber,
      pinCode: addr.pinCode,
    });
    setOpen(true);
  };

  const saveAddress = async () => {
    const required: Array<keyof Address> = ["address", "city", "district", "state", "contactNumber", "pinCode"];
    const missing = required.find((k) => !form[k] || !String(form[k] ?? "").trim());
    if (missing) {
      toast({ title: "Missing fields", description: "Please fill all required fields." });
      return;
    }

    let next: Address[];
    if (editingId) {
      next = addresses.map((a) =>
        String(a._id) === String(editingId) ? { ...a, ...form } : a
      );
    } else {
      next = [
        ...addresses,
        { ...form, isDefault: addresses.length === 0 },
      ];
    }
    // Ensure one default
    if (next.length > 0 && !next.some((a) => a.isDefault)) next[0].isDefault = true;

    await onSaveAddresses(next);
    toast({ title: "Address saved" });
    setOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-normal">Saved Addresses</h2>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Address
        </Button>
      </div>

      {!hasAddresses && !hasLegacyAddress ? (
        <Card className="p-8 rounded-2xl text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            You haven&apos;t added an address yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Update your address in the profile tab to see it here.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {hasAddresses ? (
            addresses.map((addr) => (
              <div key={String(addr._id || addr.address)} className="relative">
                {addr.isDefault ? (
                  <Badge className="absolute -top-2 -right-2">Default</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-3 -right-3 h-8"
                    onClick={() => void setDefault(String(addr._id))}
                  >
                    Set default
                  </Button>
                )}
                <Card className={`p-4 rounded-2xl ${addr.isDefault ? "ring-2 ring-primary" : ""}`}>
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {addr.label || "Address"}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {[addr.address, addr.landmark, addr.city, addr.district, addr.state, addr.pinCode]
                      .filter((p) => Boolean(p && String(p).trim()))
                      .join(", ")}
                  </p>
                  {addr.contactNumber && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Contact: {addr.contactNumber}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => startEdit(addr)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => confirmDeleteAddress(String(addr._id))}>
                      Delete
                    </Button>
                  </div>
                </Card>
              </div>
            ))
          ) : (
            <div className="relative">
              <Badge className="absolute -top-2 -right-2">Default</Badge>
              <Card className="p-4 rounded-2xl ring-2 ring-primary">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Home
                </h4>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {user.address}
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add new address"}</DialogTitle>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Label</Label>
              <Input value={form.label || ""} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address *</Label>
              <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>District *</Label>
              <Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Pin Code *</Label>
              <Input value={form.pinCode} onChange={(e) => setForm((p) => ({ ...p, pinCode: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Landmark</Label>
              <Input value={form.landmark || ""} onChange={(e) => setForm((p) => ({ ...p, landmark: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Contact Number *</Label>
              <Input value={form.contactNumber} onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveAddress()}>{editingId ? "Save changes" : "Add address"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void removeAddress()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-normal">Settings</h2>

      <Card className="p-6 rounded-2xl">
        <h3 className="font-medium mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              data-testid="input-current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              data-testid="input-new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              data-testid="input-confirm-password"
            />
          </div>
          <Button data-testid="button-update-password">Update Password</Button>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl">
        <h3 className="font-medium mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Email notifications for order updates</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">SMS notifications for delivery</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Marketing and promotional emails</span>
          </label>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl border-destructive/50">
        <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive" data-testid="button-delete-account">
          Delete Account
        </Button>
      </Card>
    </div>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { user, loading, logout, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const response = await api.get<{ data: Order[] }>("/orders");
      setOrders(response.data.data);
    };
    fetchOrders();
  }, [user]);

  const handleProfileSave = async (payload: {
    name: string;
    email: string;
    phone: string;
  }) => {
    try {
      await api.put("/auth/me", payload);
      await refreshProfile();
      toast({ title: "Profile updated" });
    } catch (error) {
      toast({ title: "Update failed", description: "Please try again." });
    }
  };

  const handleAddressesSave = async (addresses: Address[]) => {
    try {
      await api.put("/auth/me", { addresses });
      await refreshProfile();
    } catch (error) {
      toast({ title: "Update failed", description: "Please try again." });
      throw error;
    }
  };

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 rounded-2xl">
              <AuthPanel />
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return user ? (
          <ProfileTab
            user={user}
            onSave={handleProfileSave}
            onManageAddresses={() => setActiveTab("addresses")}
          />
        ) : null;
      case "orders":
        return <OrdersTab orders={orders} />;
      case "wishlist":
        return <WishlistTab />;
      case "addresses":
        return user ? <AddressesTab user={user} onSaveAddresses={handleAddressesSave} /> : null;
      case "settings":
        return <SettingsTab />;
      default:
        return user ? <ProfileTab user={user} onSave={handleProfileSave} /> : null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-8">
            My Account
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 shrink-0">
              <Card className="p-2 rounded-2xl">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          activeTab === item.key
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        data-testid={`button-tab-${item.key}`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                  <Separator className="my-2" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => setLogoutConfirmOpen(true)}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </nav>
              </Card>
            </aside>

            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to log out of your account?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setLogoutConfirmOpen(false);
                logout();
              }}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
