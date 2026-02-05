import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import adminApi from "@/lib/admin-api";

interface AdminAuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("elorie_admin_token"));

  const login = async (username: string, password: string) => {
    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Username:", username);
      console.log("API Base URL:", import.meta.env.VITE_API_URL);
      
      const response = await adminApi.post("/admin/login", { username, password });
      
      console.log("=== RESPONSE RECEIVED ===");
      console.log("Full Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.log("Response Data Type:", typeof response.data);
      console.log("Token Value:", response.data?.token);
      
      const newToken = response.data.token;
      
      if (!newToken) {
        console.error("=== NO TOKEN FOUND ===");
        console.error("Response data:", JSON.stringify(response.data));
        throw new Error("No token received from server");
      }
      
      console.log("=== LOGIN SUCCESS ===");
      console.log("Token received:", newToken.substring(0, 20) + "...");
      
      localStorage.setItem("elorie_admin_token", newToken);
      setToken(newToken);
    } catch (error: any) {
      console.error("=== LOGIN ERROR ===");
      console.error("Error:", error);
      console.error("Error Message:", error.message);
      console.error("Error Response:", error.response);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("elorie_admin_token");
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
    }),
    [token]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
