import { redirect } from "next/navigation";
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
