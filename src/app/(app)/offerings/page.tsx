import { OfferingValidator } from "@/components/offering-validator";
import { OfferingManager } from "@/components/offering-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default function OfferingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Offerings</h1>
        <p className="text-muted-foreground">
          Manually record, upload, and validate offering records.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <OfferingManager />
        </div>
        <div className="space-y-8">
          <OfferingValidator />
            <Card>
                <CardHeader>
                    <CardTitle>File Upload Instructions</CardTitle>
                    <CardDescription>
                        Ensure your CSV or Excel file has the following columns in order:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        <li><code className="font-mono p-1 bg-muted rounded-sm">firstName</code>: The first name of the contributor.</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">lastName</code>: The last name of the contributor.</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">email</code>: The email address of the contributor.</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">amount</code>: The monetary value of the offering.</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">date</code>: The date of the offering (e.g., YYYY-MM-DD).</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
