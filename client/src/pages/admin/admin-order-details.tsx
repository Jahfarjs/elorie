import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";
import { formatPrice } from "@/lib/data";
import adminApi from "@/lib/admin-api";
import type { AdminOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Package, Phone, User } from "lucide-react";

function formatAddress(order: AdminOrder): string {
  const a: any = (order as any).shippingAddress;
  if (a && a.address) {
    return [a.address, a.landmark, a.city, a.district, a.state, a.pinCode]
      .filter((p) => Boolean(p && String(p).trim()))
      .join(", ");
  }
  return order.address || "-";
}

export default function AdminOrderDetails() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/orders/:id");
  const orderId = params?.id;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await adminApi.get<AdminOrder>(`/admin/orders/${orderId}`);
      setOrder(response.data);
    } catch {
      toast({ title: "Unable to load order" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const firstItemTitle = useMemo(() => {
    if (!order?.items?.length) return "Order";
    return order.items[0]?.item?.title || "Order";
  }, [order]);

  const getNextStatus = (currentStatus: AdminOrder["status"]): { status: AdminOrder["status"]; label: string } | null => {
    switch (currentStatus) {
      case "orderPlaced":
        return { status: "orderConfirmed", label: "Confirm Order" };
      case "orderConfirmed":
        return { status: "orderDispatched", label: "Dispatch Order" };
      case "orderDispatched":
        return { status: "orderDelivered", label: "Mark Delivered" };
      case "orderDelivered":
        return null;
      default:
        return null;
    }
  };

  const handleStatusChange = async (status: AdminOrder["status"]) => {
    if (!order) return;
    try {
      await adminApi.patch(`/admin/orders/${order._id}/status`, { status });
      toast({ title: "Order status updated" });
      await fetchOrder();
    } catch {
      toast({ title: "Update failed" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">Order Details</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {firstItemTitle} • #{orderId?.slice(-8)}
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/admin/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {loading || !order ? (
          <Card className="p-6 rounded-2xl">
            <p className="text-muted-foreground">Loading...</p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.status === "orderDelivered" ? (
                      <Badge className="px-4 py-2 bg-green-600 text-white">
                        Completed
                      </Badge>
                    ) : (
                      (() => {
                        const nextStatus = getNextStatus(order.status);
                        return nextStatus ? (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(nextStatus.status)}
                            className="w-full sm:w-auto"
                          >
                            {nextStatus.label}
                          </Button>
                        ) : null;
                      })()
                    )}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-mono">{order.paymentMode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Placed on</p>
                    <p>
                      {new Date(order.createdAt || order.orderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p>{order.items.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-lg font-medium">Delivery Address</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{formatAddress(order)}</p>
                {(order as any).shippingAddress?.contactNumber && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Contact: {(order as any).shippingAddress.contactNumber}
                  </p>
                )}
              </Card>

              <Card className="p-6 rounded-2xl">
                <h3 className="font-serif text-lg font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items
                    .filter((orderItem: any) => orderItem.item != null)
                    .map((orderItem: any, idx: number) => (
                      <div key={`${order._id}-${idx}`} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <SafeImage
                            src={orderItem.item.images?.[0] || orderItem.item.image || ""}
                            alt={orderItem.item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{orderItem.item.title}</p>
                          <p className="text-sm text-muted-foreground">Qty: {orderItem.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(orderItem.price)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-lg font-medium">Customer</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.user?.name || order.customerName}</p>
                  {order.user?.phone && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.user.phone}
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6 rounded-2xl">
                <h3 className="font-serif text-lg font-medium mb-4">Quick actions</h3>
                <div className="flex flex-col gap-2">
                  <Link href="/tracking">
                    <Button variant="outline" className="w-full">Open tracking page</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

