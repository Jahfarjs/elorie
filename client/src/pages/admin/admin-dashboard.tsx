import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Button } from "@/components/ui/button";
import adminApi from "@/lib/admin-api";
import type { PaginationResponse, Item, Feedback, AdminOrder, UserProfile } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  ArrowRight
} from "lucide-react";

interface AdminUser extends UserProfile {
  _id: string;
}

interface OrderStats {
  placed: number;
  confirmed: number;
  dispatched: number;
  delivered: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    items: 0,
    feedback: 0,
    users: 0,
    orders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    placed: 0,
    confirmed: 0,
    dispatched: 0,
    delivered: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch counts
        const [items, feedback, users, orders] = await Promise.all([
          adminApi.get<PaginationResponse<Item>>("/items", { params: { limit: 1 } }),
          adminApi.get<PaginationResponse<Feedback>>("/feedback", { params: { limit: 1 } }),
          adminApi.get<PaginationResponse<AdminUser>>("/admin/users", { params: { limit: 1 } }),
          adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", { params: { limit: 1 } }),
        ]);
        
        setStats({
          items: items.data.totalCount,
          feedback: feedback.data.totalCount,
          users: users.data.totalCount,
          orders: orders.data.totalCount,
        });

        // Fetch recent orders (5 most recent)
        const recentOrdersRes = await adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", { 
          params: { limit: 5, summary: "true" } 
        });
        setRecentOrders(recentOrdersRes.data.data);

        // Fetch recent items (5 most recent)
        const recentItemsRes = await adminApi.get<PaginationResponse<Item>>("/items", { 
          params: { limit: 5 } 
        });
        setRecentItems(recentItemsRes.data.data);

        // Fetch order stats by status
        const [placedRes, confirmedRes, dispatchedRes, deliveredRes] = await Promise.all([
          adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", { params: { limit: 1, status: "orderPlaced" } }),
          adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", { params: { limit: 1, status: "orderConfirmed" } }),
          adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", { params: { limit: 1, status: "orderDispatched" } }),
          adminApi.get<PaginationResponse<AdminOrder>>("/admin/orders", { params: { limit: 1, status: "orderDelivered" } }),
        ]);

        setOrderStats({
          placed: placedRes.data.totalCount,
          confirmed: confirmedRes.data.totalCount,
          dispatched: dispatchedRes.data.totalCount,
          delivered: deliveredRes.data.totalCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const getItemSummary = (order: AdminOrder) => {
    const titles = order.items
      .map((it: any) => it?.item?.title)
      .filter(Boolean) as string[];
    if (titles.length === 0) return "Items";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} +${titles.length - 1}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Quick overview of your store.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.items}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.orders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.users}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Feedback</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.feedback}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Order Status Tracking */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Order Status Tracking
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/orders")}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-muted-foreground">Placed</span>
              </div>
              <p className="text-2xl font-bold">{orderStats.placed}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground">Confirmed</span>
              </div>
              <p className="text-2xl font-bold">{orderStats.confirmed}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-muted-foreground">Dispatched</span>
              </div>
              <p className="text-2xl font-bold">{orderStats.dispatched}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-3 mb-2">
                <PackageCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-muted-foreground">Delivered</span>
              </div>
              <p className="text-2xl font-bold">{orderStats.delivered}</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-serif text-lg sm:text-xl">Recent Orders</h2>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/orders")}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-3 rounded-lg border hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/admin/orders/${order._id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm truncate flex-1">
                        {getItemSummary(order)}
                      </p>
                      <span className="text-xs font-mono text-muted-foreground ml-2">
                        #{order._id.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{order.user?.name || "Unknown"}</span>
                      <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Items */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-serif text-lg sm:text-xl">Recent Items Added</h2>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/items")}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {recentItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No items yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-lg border hover:bg-muted/20 cursor-pointer transition-colors flex items-center gap-3"
                    onClick={() => setLocation(`/admin/items/${item._id}`)}
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatPrice(item.ourAmount ?? 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
