
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
} from "lucide-react";
import { processOfferingFile } from "@/actions/process-offering-file";
import type { Offering } from "@/lib/types";

interface OfferingValidatorProps {
    onUploadSuccess: (offerings: Omit<Offering, 'id'>[]) => void;
}

export function OfferingValidator({ onUploadSuccess }: OfferingValidatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setError(null);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleProcessFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const fileType = file.name.endsWith(".csv")
      ? "csv"
      : file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
      ? "excel"
      : null;
    if (!fileType) {
      setError("Invalid file type. Please upload a CSV or Excel file.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const fileData = await toBase64(file);
      const result = await processOfferingFile({ fileData, fileType });
      
      if (result.success && result.parsedData) {
        setStatus("success");
        onUploadSuccess(result.parsedData);
      } else {
        setStatus("error");
        setError(result.message);
      }
    } catch (e) {
      const err =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(err);
      setStatus("error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Offering Parser</CardTitle>
        <CardDescription>
          Upload a CSV or Excel file to add multiple offering records at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              id="offering-file"
              type="file"
              onChange={handleFileChange}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
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

        {status === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
            <span>Analyzing your file with AI...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
