import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LayoutDashboard, Package, Users, MessageSquare, ClipboardList, LogOut } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import logoImage from "@assets/logo.jpeg";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/items", label: "Items", icon: Package },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { logout } = useAdminAuth();

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[hsl(var(--logo-bg))] dark:bg-background border-r h-full sticky top-0">
        <div className="px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoImage} alt="Elorie Elegance" className="h-24 w-auto object-contain" />
            <div>
              <h1 className="font-serif text-xl">Elorie</h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 mt-auto">
          <Separator className="mb-3" />
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setLogoutConfirmOpen(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden px-4 pt-6">
          <Card className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Elorie Elegance" className="h-10 w-auto object-contain" />
              <div className="font-serif text-lg">Elorie Admin</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      size="icon"
                      variant={active ? "default" : "outline"}
                      className="w-full"
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="p-6 lg:p-10">{children}</div>
      </main>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to log out of the admin panel?
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
                setLocation("/admin/login");
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
