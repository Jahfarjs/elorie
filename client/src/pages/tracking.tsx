import { useState } from "react";
import { Link } from "wouter";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowLeft,
  Search,
  Box,
  Home as HomeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { sampleOrders, formatPrice } from "@/lib/data";

const statusSteps = [
  { key: "processing", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: HomeIcon },
];

function getStatusIndex(status: string): number {
  const statusMap: Record<string, number> = {
    processing: 0,
    confirmed: 1,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
  };
  return statusMap[status] ?? 0;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
  return colorMap[status] || "";
}

export default function Tracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(sampleOrders[1]);
  const currentStatusIndex = getStatusIndex(selectedOrder.status);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = sampleOrders.find(
      (order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedOrder(found);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal">
              Track Your Order
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your order ID or tracking number to check the status
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-10">
            <Input
              placeholder="Enter Order ID or Tracking Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-tracking-search"
            />
            <Button type="submit" data-testid="button-track">
              <Search className="h-4 w-4 mr-2" />
              Track
            </Button>
          </form>

          <Card className="p-6 sm:p-8 rounded-2xl mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p
                  className="font-mono font-semibold text-lg"
                  data-testid="text-order-id"
                >
                  {selectedOrder.id}
                </p>
              </div>
              <Badge
                className={`${getStatusColor(selectedOrder.status)} capitalize`}
                data-testid="badge-status"
              >
                {selectedOrder.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted hidden sm:block" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-primary hidden sm:block transition-all duration-500"
                style={{
                  width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                  maxWidth: "calc(100% - 40px)",
                }}
              />

              <div className="flex flex-col sm:flex-row sm:justify-between gap-6 sm:gap-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-2 sm:flex-1"
                    >
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="sm:text-center">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl">
              <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Order Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Date</span>
                  <span>
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tracking Number</span>
                  <span className="font-mono">
                    {selectedOrder.trackingNumber || "Not yet assigned"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedOrder.shippingAddress}
              </p>
            </Card>
          </div>

          <Card className="p-6 rounded-2xl mt-6">
            <h3 className="font-serif text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.product.imageUrl || ""}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
