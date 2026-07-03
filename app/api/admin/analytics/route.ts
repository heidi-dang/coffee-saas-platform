import { requireCafeOwnerOrManager } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ok, handleAuthError } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const user = await requireCafeOwnerOrManager();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";

    const now = new Date();
    const cutoff = new Date(now);
    if (period === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (period === "90d") cutoff.setDate(cutoff.getDate() - 90);
    else cutoff.setDate(cutoff.getDate() - 7);

    const orders = await db.order.findMany({
      where: {
        cafeId: user.cafeId,
        createdAt: { gte: cutoff },
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // --- Summary stats ---
    const totalRevenueCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
    const totalOrders = orders.length;
    const avgOrderValueCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

    // --- Order type breakdown ---
    const ordersByType: Record<string, number> = {};
    for (const o of orders) {
      ordersByType[o.type] = (ordersByType[o.type] || 0) + 1;
    }

    // --- Top items ---
    const itemCounts: Record<string, { name: string; qty: number; revenueCents: number }> = {};
    for (const o of orders) {
      for (const item of o.items) {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.itemNameSnapshot,
            qty: 0,
            revenueCents: 0,
          };
        }
        itemCounts[item.menuItemId].qty += item.quantity;
        itemCounts[item.menuItemId].revenueCents += item.totalCents;
      }
    }
    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // --- Daily revenue trend ---
    const dailyMap: Record<string, { date: string; revenueCents: number; orders: number }> = {};
    for (const o of orders) {
      const dateKey = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, revenueCents: 0, orders: 0 };
      }
      dailyMap[dateKey].revenueCents += o.totalCents;
      dailyMap[dateKey].orders += 1;
    }
    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // --- Peak hour analysis ---
    const hourCounts: Record<number, number> = {};
    for (const o of orders) {
      const hour = new Date(o.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const peakHours = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      orders: hourCounts[h] || 0,
    }));

    return ok({
      summary: {
        totalRevenueCents,
        totalOrders,
        avgOrderValueCents,
      },
      ordersByType,
      topItems,
      dailyTrend,
      peakHours,
      period,
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
