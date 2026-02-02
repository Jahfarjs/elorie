import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/lib/admin-auth";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { token } = useAdminAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!token) {
      console.log("No admin token found, redirecting to login");
      setLocation("/admin/login");
    }
  }, [token, setLocation]);

  // Prevent rendering protected content without token
  if (!token) {
    return null;
  }

  // Prevent rendering on login page if already authenticated
  if (location === "/admin/login" && token) {
    setLocation("/admin");
    return null;
  }

  return <>{children}</>;
}
