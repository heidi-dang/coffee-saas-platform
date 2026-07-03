"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Menu,
  QrCode,
  Settings,
  Palette,
  LogOut,
  Users,
} from "lucide-react";
import { canManageMenu, canManageTables, canManageSettings, canManageDesignStudio } from "@/lib/permissions";

interface AdminSidebarProps {
  cafeName: string | null;
  userName: string;
  userRole: string;
}

export function AdminSidebar({ cafeName, userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = { role: userRole, cafeId: null } as any;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/customers", label: "Customers", icon: Users },
    ...(canManageMenu(user)
      ? [{ href: "/admin/menu", label: "Menu", icon: Menu }]
      : []),
    ...(canManageTables(user)
      ? [{ href: "/admin/tables", label: "Tables / QR", icon: QrCode }]
      : []),
    ...(canManageSettings(user)
      ? [{ href: "/admin/settings", label: "Settings", icon: Settings }]
      : []),
    ...(canManageDesignStudio(user)
      ? [{ href: "/admin/design-studio", label: "Design Studio", icon: Palette }]
      : []),
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard" className="font-bold text-lg block">
          CoffeeQR
        </Link>
        {cafeName && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {cafeName}
          </p>
        )}
      </div>
      <div className="px-4 py-2 border-b">
        <p className="text-sm font-medium truncate">{userName}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {userRole.replace(/_/g, " ").toLowerCase()}
        </p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
