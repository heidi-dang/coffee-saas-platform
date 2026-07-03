import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CustomersClient } from "./customers-client";

export default async function AdminCustomersPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!user.cafeId || !["PLATFORM_ADMIN", "CAFE_OWNER", "CAFE_MANAGER"].includes(user.role)) {
    redirect("/admin/orders");
  }
  return <CustomersClient />;
}
