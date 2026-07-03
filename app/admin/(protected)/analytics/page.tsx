import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AnalyticsClient } from "./analytics-client";

export default async function AdminAnalyticsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!user.cafeId || !["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
    redirect("/admin/orders");
  }
  return <AnalyticsClient />;
}
