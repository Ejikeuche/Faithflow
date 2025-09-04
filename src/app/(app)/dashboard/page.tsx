
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  // The DashboardClient component will now handle all data fetching on its own.
  // We pass an empty array for initialChurches as it will be fetched on the client.
  return <DashboardClient initialChurches={[]} />;
}
