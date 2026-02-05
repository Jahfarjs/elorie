import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/lib/api";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    address: {
      label?: string;
      address: string;
      city: string;
      district: string;
      state: string;
      landmark?: string;
      contactNumber: string;
      pinCode: string;
    };
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("elorie_user");
    return stored ? (JSON.parse(stored) as UserProfile) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("elorie_token"));
  const [loading, setLoading] = useState(true);

  const persistAuth = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("elorie_token", newToken);
    localStorage.setItem("elorie_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const refreshProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get<UserProfile>("/auth/me");
      localStorage.setItem("elorie_user", JSON.stringify(response.data));
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    persistAuth(response.data.token, response.data.user);
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    address: {
      label?: string;
      address: string;
      city: string;
      district: string;
      state: string;
      landmark?: string;
      contactNumber: string;
      pinCode: string;
    };
    password: string;
  }) => {
    const response = await api.post("/auth/register", payload);
    persistAuth(response.data.token, response.data.user);
  };

  const logout = () => {
    localStorage.removeItem("elorie_token");
    localStorage.removeItem("elorie_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
