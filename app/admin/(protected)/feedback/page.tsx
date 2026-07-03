import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FeedbackClient } from "./feedback-client";

export default async function AdminFeedbackPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!user.cafeId || !["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
    redirect("/admin/orders");
  }
  return <FeedbackClient />;
}
