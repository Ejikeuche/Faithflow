
import { getChurches } from "@/actions/church-actions";
import { DashboardClient } from "@/components/dashboard-client";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default async function DashboardPage() {
  let churches = [];
  let error = null;

  try {
    // This server action will now be called securely on the server
    // as part of the page render process.
    churches = await getChurches();
  } catch (e) {
    console.error("Failed to fetch dashboard data:", e);
    error = "Failed to load church data. Please try again later.";
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

  return <DashboardClient initialChurches={churches} />;
}
