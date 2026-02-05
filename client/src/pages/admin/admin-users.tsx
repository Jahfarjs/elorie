import { useEffect, useState } from "react";
import { AdminLayout } from "@/pages/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import adminApi from "@/lib/admin-api";
import type { Address, PaginationResponse } from "@/lib/types";
import { Mail, Phone, MapPin } from "lucide-react";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  // Legacy single-line address (may be empty when addresses[] exists)
  address?: string;
  // New structured addresses
  addresses?: Address[];
  createdAt?: string;
}

const formatAddressLine = (addr?: Address | null, fallback?: string) => {
  if (addr) {
    return [
      addr.address,
      addr.landmark,
      addr.city,
      addr.district,
      addr.state,
      addr.pinCode,
    ]
      .filter((p) => Boolean(p && String(p).trim()))
      .join(", ");
  }
  return (fallback || "").trim();
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNumber = page) => {
    const response = await adminApi.get<PaginationResponse<AdminUser>>("/admin/users", {
      params: { page: pageNumber, limit: 10 },
    });
    setUsers(response.data.data);
    setTotalPages(response.data.totalPages);
    setPage(response.data.currentPage);
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">Users</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Customer list and contact details.</p>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-xl">Users List</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchUsers(Math.max(1, page - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchUsers(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No users found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {users.map((user) => (
                <Card key={user._id} className="p-4 sm:p-6">
                  <h3 className="font-medium text-base sm:text-lg mb-3 sm:mb-4">{user.name}</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm sm:text-base text-muted-foreground break-words">{user.email}</p>
                    </div>
                    {user.phone && String(user.phone).trim() && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm sm:text-base text-muted-foreground">{user.phone}</p>
                      </div>
                    )}
                    {(() => {
                      const addresses = Array.isArray(user.addresses) ? user.addresses : [];
                      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
                      const addressLine = formatAddressLine(defaultAddress, user.address);
                      if (!addressLine) return null;
                      return (
                        <div className="flex items-start gap-2 sm:gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-sm sm:text-base text-muted-foreground break-words">{addressLine}</p>
                        </div>
                      );
                    })()}
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
