
"use client";

import { useState } from "react";
import { OfferingValidator } from "@/components/offering-validator";
import { OfferingManager } from "@/components/offering-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Offering } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const initialOfferings: Offering[] = [
  { id: "1", name: "John Doe", email: "john.d@example.com", amount: 150.00, date: "2024-07-21", type: "Tithe" },
  { id: "2", name: "Jane Smith", email: "jane.s@example.com", amount: 75.50, date: "2024-07-21", type: "Personal" },
  { id: "3", name: "Sam Wilson", email: "sam.w@example.com", amount: 500.00, date: "2024-07-20", type: "Building" },
  { id: "4", name: "Emily Brown", email: "emily.b@example.com", amount: 200.00, date: "2024-07-19", type: "Special" },
];


export default function OfferingsPage() {
  const { toast } = useToast();
  const [offerings, setOfferings] = useState<Offering[]>(initialOfferings);

  const addUploadedOfferings = (newOfferings: Omit<Offering, 'id'>[]) => {
    const offeringsToAdd = newOfferings.map((o, i) => ({
      ...o,
      id: `uploaded-${Date.now()}-${i}`,
    }))
    setOfferings(prev => [...prev, ...offeringsToAdd]);
    toast({
      title: "Offerings Added",
      description: `${newOfferings.length} new offering records have been successfully added from the file.`
    })
  }

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
          <OfferingManager offerings={offerings} setOfferings={setOfferings} toast={toast} />
        </div>
        <div className="space-y-8">
          <OfferingValidator onUploadSuccess={addUploadedOfferings} />
            <Card>
                <CardHeader>
                    <CardTitle>File Upload Instructions</CardTitle>
                    <CardDescription>
                        Ensure your CSV or Excel file has a header row and the following columns (order does not matter):
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        <li><code className="font-mono p-1 bg-muted rounded-sm">name</code>: The full name of the contributor.</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">email</code>: The email address of the contributor. (Used for matching)</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">amount</code>: The monetary value of the offering.</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">date</code>: The date of the offering (e.g., YYYY-MM-DD).</li>
                        <li><code className="font-mono p-1 bg-muted rounded-sm">type</code>: The offering type (e.g., Tithe, Personal, Building, Special).</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
