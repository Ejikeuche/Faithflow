
import { getChurches } from "@/actions/church-actions";
import { DashboardClient } from "@/components/dashboard-client";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from "@/lib/firebase";

export default async function DashboardPage() {
  let churches = [];
  let error = null;

  try {
    // This server action will be called securely on the server as part of the page render.
    // It will use the admin SDK, which has broader permissions.
    // We fetch this for all roles initially, though only the superuser will see the church list.
    // This pattern is more robust for Server Components.
    churches = await getChurches();
  } catch (e) {
    console.error("Failed to fetch dashboard data on server:", e);
    // This error will be shown if the server action fails, providing a clear indicator.
    error = "Failed to load initial church data. Please try again later.";
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Pass the server-fetched data to the client component.
  // The client component will then handle fetching user-specific data.
  return <DashboardClient initialChurches={churches} />;
}
