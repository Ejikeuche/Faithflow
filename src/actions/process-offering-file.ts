"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  FileCheck2,
  AlertCircle,
  ListX,
} from "lucide-react";
import Papa from "papaparse";
import { z } from "zod";
import type { Offering } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";

interface OfferingValidatorProps {
    onUploadSuccess: (addedCount: number) => void;
}

interface ProcessError {
    row: number;
    message: string;
}

const offeringSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
  type: z.enum(["Tithe", "Personal", "Building", "Special"]),
});

async function addBatchOfferings(offeringsData: Omit<Offering, 'id' | 'createdAt'>[]): Promise<void> {
    const batch = writeBatch(db);
    const offeringsCollectionRef = collection(db, 'offerings');

    offeringsData.forEach(offering => {
        const docRef = doc(offeringsCollectionRef); // Create a new doc with a random ID
        batch.set(docRef, {
            ...offering,
            createdAt: serverTimestamp()
        });
    });

    await batch.commit();
}


export function OfferingValidator({ onUploadSuccess }: OfferingValidatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ProcessError[]>([]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setErrorMessage(null);
      setErrorDetails([]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      setErrorTitle("No File Selected");
      setErrorMessage("Please select a file first.");
      setStatus('error');
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setErrorTitle("Invalid File Type");
      setErrorMessage("Please upload a CSV file.");
      setStatus('error');
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setErrorDetails([]);

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim(),
        complete: async (results) => {
            if (results.errors.length > 0) {
                setStatus("error");
                setErrorTitle("Parsing Failed");
                setErrorMessage("Failed to parse CSV file. Please check the file format.");
                setErrorDetails(results.errors.map(e => ({ row: e.row, message: e.message })));
                return;
            }

            const validationErrors: { row: number; message: string }[] = [];
            const validOfferings: Omit<Offering, "id" | "createdAt">[] = [];

            for (const [index, row] of (results.data as any[]).entries()) {
                const result = offeringSchema.safeParse(row);
                if (result.success) {
                    validOfferings.push(result.data);
                } else {
                    const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                    validationErrors.push({ row: index + 2, message: errorMessage });
                }
            }
            
            if (validationErrors.length > 0) {
                setStatus("error");
                setErrorTitle("Validation Failed");
                setErrorMessage("Some rows had validation errors. Please fix them and try again.");
                setErrorDetails(validationErrors);
                return;
            }

            if (validOfferings.length > 0) {
                try {
                    await addBatchOfferings(validOfferings);
                    setStatus("success");
                    onUploadSuccess(validOfferings.length);
                    setFile(null); // Reset the file input
                    const fileInput = document.getElementById('offering-file') as HTMLInputElement;
                    if(fileInput) fileInput.value = "";
                } catch(e) {
                     const err = e instanceof Error ? e.message : "An unknown error occurred during database operation.";
                     setStatus("error");
                     setErrorTitle("Database Error");
                     setErrorMessage(err);
                }
            } else {
                setStatus("error");
                setErrorTitle("No Data");
                setErrorMessage("No valid offering records were found in the file.");
            }
        },
        error: (error) => {
             const err = error instanceof Error ? error.message : "An unknown error occurred during file parsing.";
             setStatus("error");
             setErrorTitle("Parsing Error");
             setErrorMessage(err);
        }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Offering Upload</CardTitle>
        <CardDescription>
          Upload a CSV file to add multiple offering records at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              id="offering-file"
              type="file"
              onChange={handleFileChange}
              accept=".csv"
            />
          </div>
          <Button onClick={handleProcessFile} disabled={!file || status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Process File
          </Button>
        </div>

        {status === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{errorTitle || 'Error'}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
            {errorDetails.length > 0 && (
                <div className="mt-4 text-xs">
                    <h4 className="font-bold mb-2">Error Details:</h4>
                    <ul className="space-y-1 max-h-24 overflow-y-auto">
                        {errorDetails.map((err, index) => (
                           <li key={index}><span className="font-semibold">Row {err.row}:</span> {err.message}</li> 
                        ))}
                    </ul>
                </div>
            )}
          </Alert>
        )}
        
        {status === "success" && (
            <Alert>
                <FileCheck2 className="h-4 w-4" />
                <AlertTitle>Processing Successful</AlertTitle>
                <AlertDescription>
                  The uploaded offering data has been processed and added to the records.
                </AlertDescription>
              </Alert>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center p-8 text-muted-foreground rounded-lg bg-secondary">
            <Loader2 className="h-8 w-8 animate-spin mr-4" />
            <span>Processing your file...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}