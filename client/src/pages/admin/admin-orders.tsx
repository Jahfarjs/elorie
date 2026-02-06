import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/data";
import adminApi from "@/lib/admin-api";
import type { AdminOrder, PaginationResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Package, User, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTab = "pendingPayment" | "orderPlaced" | "orderConfirmed" | "orderDispatched" | "orderDelivered" | "cancelled";

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: "pendingPayment", label: "Pending Payment" },
  { value: "orderPlaced", label: "Placed" },
  { value: "orderConfirmed", label: "Confirmed" },
  { value: "orderDispatched", label: "Dispatched" },
  { value: "orderDelivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<StatusTab>("orderPlaced");

  const activeParams = useMemo(() => {
    const params: Record<string, string | number> = { 
      page, 
      limit: 10, 
      summary: "true",
      status: activeTab 
    };
    return params;
  }, [page, activeTab]);

  const fetchOrders = async (pageNumber = page) => {
    const response = await adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", {
      params: { ...activeParams, page: pageNumber },
    });
    setOrders(response.data.data);
    setTotalPages(response.data.totalPages);
    setPage(response.data.currentPage);
  };

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleStatusChange = async (orderId: string, status: AdminOrder["status"]) => {
    try {
      await adminApi.patch(`/admin/orders/${orderId}/status`, { status });
      toast({ title: "Order status updated" });
      fetchOrders(page);
    } catch (error) {
      toast({ title: "Update failed" });
    }
  };

  const openOrder = (id: string) => {
    setLocation(`/admin/orders/${id}`);
  };

  const getItemSummary = (order: AdminOrder) => {
    const titles = order.items
      .map((it: any) => it?.item?.title)
      .filter(Boolean) as string[];
    if (titles.length === 0) return "Items";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} + ${titles.length - 1} more`;
  };

  const getNextStatus = (currentStatus: AdminOrder["status"]): { status: AdminOrder["status"]; label: string } | null => {
    switch (currentStatus) {
      case "orderPlaced":
        return { status: "orderConfirmed", label: "Confirm Order" };
      case "orderConfirmed":
        return { status: "orderDispatched", label: "Dispatch Order" };
      case "orderDispatched":
        return { status: "orderDelivered", label: "Mark Delivered" };
      case "orderDelivered":
      case "pendingPayment":
      case "cancelled":
        return null;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage order fulfillment and status.</p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 sm:flex-none",
                activeTab === tab.value && "shadow-md"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-xl">
              {statusTabs.find(t => t.value === activeTab)?.label} Orders
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchOrders(Math.max(1, page - 1))} 
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchOrders(Math.min(totalPages, page + 1))} 
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No {statusTabs.find(t => t.value === activeTab)?.label.toLowerCase()} orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order._id}
                  className="p-4 sm:p-6 cursor-pointer hover:bg-muted/20 transition-colors border-l-4"
                  style={{
                    borderLeftColor: 
                      activeTab === "orderPlaced" ? "#f59e0b" :
                      activeTab === "orderConfirmed" ? "#3b82f6" :
                      activeTab === "orderDispatched" ? "#8b5cf6" :
                      "#10b981"
                  }}
                  onClick={() => openOrder(order._id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm sm:text-base">
                          {getItemSummary(order)}
                        </p>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{order._id.slice(-8)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                        {order.user?.name && (
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {order.user.name}
                          </span>
                        )}
                        {order.user?.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {order.user.phone}
                          </span>
                        )}
                        <span>
                          Total: <span className="font-semibold text-foreground">{formatPrice(order.totalAmount)}</span>
                        </span>
                        <span>Payment: {order.paymentMode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {order.status === "orderDelivered" ? (
                        <Badge className="px-4 py-2 bg-green-600 text-white">
                          Completed
                        </Badge>
                      ) : order.status === "cancelled" ? (
                        <Badge variant="secondary" className="px-4 py-2">
                          Cancelled
                        </Badge>
                      ) : order.status === "pendingPayment" ? (
                        <Badge className="px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending Payment
                        </Badge>
                      ) : (
                        (() => {
                          const nextStatus = getNextStatus(order.status);
                          return nextStatus ? (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(order._id, nextStatus.status)}
                              className="w-full sm:w-auto"
                            >
                              {nextStatus.label}
                            </Button>
                          ) : null;
                        })()
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
