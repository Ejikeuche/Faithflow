
"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const toOfferingObject = (doc: any): Offering => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as Offering;
};

export default function OfferingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOfferings = async () => {
    setIsLoading(true);
    try {
      const offeringsCollection = collection(db, 'offerings');
      const q = query(offeringsCollection, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const fetchedOfferings = snapshot.docs.map(toOfferingObject);
      setOfferings(fetchedOfferings);
    } catch (error) {
      console.error("Failed to fetch offerings:", error);
      toast({ title: "Error", description: "Could not fetch offering records.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchOfferings();
    }
  }, [user]);

  const handleUploadSuccess = (addedCount: number) => {
    toast({
      title: "Offerings Added",
      description: `${addedCount} new offering records have been successfully added from the file.`
    });
    // Refetch the offerings to show the newly added ones
    fetchOfferings();
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
          {isLoading ? (
             <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <OfferingManager 
              offerings={offerings} 
              setOfferings={setOfferings} 
              refetchOfferings={fetchOfferings} 
            />
          )}
        </div>
        <div className="space-y-8">
          <OfferingValidator onUploadSuccess={handleUploadSuccess} />
            <Card>
                <CardHeader>
                    <CardTitle>File Upload Instructions</CardTitle>
                    <CardDescription>
                        Ensure your CSV file has a header row and the following columns (order does not matter):
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
