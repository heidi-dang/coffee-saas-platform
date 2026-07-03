import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("next-url") || "";

  if (user.cafeId) {
    if (pathname.startsWith("/admin/menu") && !["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
      redirect("/admin/orders");
    }
    if (pathname.startsWith("/admin/tables") && !["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
      redirect("/admin/orders");
    }
    if (pathname.startsWith("/admin/settings") && !["PLATFORM_ADMIN", "CAFE_OWNER"].includes(user.role)) {
      redirect("/admin/orders");
    }
  }

  let cafeName: string | null = null;
  if (user.cafeId) {
    const cafe = await db.cafe.findUnique({
      where: { id: user.cafeId },
      select: { name: true },
    });
    cafeName = cafe?.name ?? null;
  }

  return <AdminShell user={user} cafeName={cafeName}>{children}</AdminShell>;
}
