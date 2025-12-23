import { useState } from "react";
import { Link } from "wouter";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { sampleOrders, formatPrice } from "@/lib/data";

type TabType = "profile" | "orders" | "wishlist" | "addresses" | "settings";

const navItems: { key: TabType; label: string; icon: typeof User }[] = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "orders", label: "Order History", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "settings", label: "Settings", icon: Settings },
];

const sampleAddresses = [
  {
    id: "1",
    name: "Home",
    address: "123 Golden Lane, Jewellery District, Mumbai, Maharashtra 400001",
    isDefault: true,
  },
  {
    id: "2",
    name: "Office",
    address: "456 Diamond Street, Business Park, Delhi 110001",
    isDefault: false,
  },
];

const sampleWishlist = [
  { id: "7", name: "Emerald Statement Necklace", price: 8999, imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop" },
  { id: "8", name: "Vintage Ruby Ring", price: 6499, imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&h=300&fit=crop" },
];

function ProfileTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-normal">My Profile</h2>
      <Card className="p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              PS
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-xl font-medium">Priya Sharma</h3>
            <p className="text-muted-foreground">Member since Dec 2024</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              defaultValue="Priya Sharma"
              data-testid="input-fullname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue="priya.sharma@email.com"
              data-testid="input-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              defaultValue="+91 98765 43210"
              data-testid="input-phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              defaultValue="1990-05-15"
              data-testid="input-dob"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button data-testid="button-save-profile">Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}

function OrdersTab() {
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
        {sampleOrders.map((order) => (
          <Card
            key={order.id}
            className="p-4 sm:p-6 rounded-2xl"
            data-testid={`card-order-${order.id}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-mono font-semibold">{order.id}</p>
                  <Badge
                    className={`capitalize ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : order.status === "shipped"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
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
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0"
                >
                  <img
                    src={item.product.imageUrl || ""}
                    alt={item.product.name}
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
        ))}
      </div>
    </div>
  );
}

function WishlistTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-normal">Wishlist</h2>
      {sampleWishlist.length === 0 ? (
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
          {sampleWishlist.map((item) => (
            <Card key={item.id} className="p-4 rounded-2xl">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2">{item.name}</h4>
                  <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
                  <Button size="sm" className="mt-2">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-normal">Saved Addresses</h2>
        <Button data-testid="button-add-address">Add New Address</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sampleAddresses.map((address) => (
          <Card
            key={address.id}
            className={`p-4 rounded-2xl relative ${
              address.isDefault ? "ring-2 ring-primary" : ""
            }`}
          >
            {address.isDefault && (
              <Badge className="absolute top-3 right-3">Default</Badge>
            )}
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {address.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {address.address}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              {!address.isDefault && (
                <Button variant="outline" size="sm">
                  Set as Default
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
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

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "orders":
        return <OrdersTab />;
      case "wishlist":
        return <WishlistTab />;
      case "addresses":
        return <AddressesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <ProfileTab />;
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
    </div>
  );
}
