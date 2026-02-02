import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const { login, token } = useAdminAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      setLocation("/admin");
    }
  }, [token, setLocation]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!form.username || !form.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await login(form.username, form.password);
      toast({
        title: "Login successful",
        description: "Redirecting to admin dashboard...",
      });
      // Small delay to show success message
      setTimeout(() => {
        setLocation("/admin");
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error?.response?.status === 401) {
        errorMessage = "Invalid username or password. Please check your credentials.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message === "No token received from server") {
        errorMessage = "Server error: Login response was invalid. Please contact support.";
      } else if (!error?.response) {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="font-serif text-2xl mb-2">Admin Sign In</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Access Elorie administrative dashboard
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
