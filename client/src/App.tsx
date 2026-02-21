import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { AdminAuthProvider } from "@/lib/admin-auth";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Tracking from "@/pages/tracking";
import Profile from "@/pages/profile";
import ProductDetail from "@/pages/product-detail";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/admin-login";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminItems from "@/pages/admin/admin-items";
import AdminItemTypes from "@/pages/admin/admin-item-types";
import AdminFeedback from "@/pages/admin/admin-feedback";
import AdminUsers from "@/pages/admin/admin-users";
import AdminOrders from "@/pages/admin/admin-orders";
import AdminOrderDetails from "@/pages/admin/admin-order-details";
import { AdminRoute } from "@/pages/admin/admin-route";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/tracking" component={Tracking} />
      <Route path="/profile" component={Profile} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/items">
        <AdminRoute>
          <AdminItems />
        </AdminRoute>
      </Route>
      <Route path="/admin/item-types">
        <AdminRoute>
          <AdminItemTypes />
        </AdminRoute>
      </Route>
      <Route path="/admin/feedback">
        <AdminRoute>
          <AdminFeedback />
        </AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      </Route>
      <Route path="/admin/orders/:id">
        <AdminRoute>
          <AdminOrderDetails />
        </AdminRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AdminAuthProvider>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <ScrollToTop />
                <Toaster />
                <Router />
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
