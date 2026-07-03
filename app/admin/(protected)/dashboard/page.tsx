import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const cafeId = user.cafeId;

  if (!cafeId) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Platform Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform-level dashboard coming soon.
        </p>
      </div>
    );
  }

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const todayOrders = await db.order.findMany({
    where: {
      cafeId,
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  });

  const newCount = todayOrders.filter((o) => o.status === "NEW").length;
  const preparingCount = todayOrders.filter(
    (o) => o.status === "PREPARING"
  ).length;
  const readyCount = todayOrders.filter((o) => o.status === "READY").length;
  const completedCount = todayOrders.filter(
    (o) => o.status === "COMPLETED"
  ).length;
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus !== "UNPAID" || o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalCents, 0);

  const stats = [
    { label: "New Orders", value: newCount, href: "/admin/orders" },
    { label: "Preparing", value: preparingCount, href: "/admin/orders" },
    { label: "Ready", value: readyCount, href: "/admin/orders" },
    { label: "Completed Today", value: completedCount, href: "/admin/orders" },
    {
      label: "Today Revenue",
      value: `$${(todayRevenue / 100).toFixed(2)}`,
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/orders"
          className="border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors"
        >
          <p className="font-medium">View Orders</p>
        </Link>
        <Link
          href="/admin/menu"
          className="border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors"
        >
          <p className="font-medium">Manage Menu</p>
        </Link>
        <Link
          href="/admin/tables"
          className="border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors"
        >
          <p className="font-medium">Manage Tables</p>
        </Link>
      </div>
    </div>
  );
}
