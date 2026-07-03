"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import type { SessionUser } from "@/lib/auth";

interface AdminShellProps {
  user: SessionUser;
  cafeName: string | null;
  children: React.ReactNode;
}

export function AdminShell({ user, cafeName, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block">
        <AdminSidebar
          cafeName={cafeName}
          userName={user.name || user.email}
          userRole={user.role}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative">
            <AdminSidebar
              cafeName={cafeName}
              userName={user.name || user.email}
              userRole={user.role}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
