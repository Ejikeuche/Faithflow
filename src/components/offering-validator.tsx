
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
import { processOfferingFile } from "@/actions/process-offering-file";

interface OfferingValidatorProps {
    onUploadSuccess: (addedCount: number) => void;
}

interface ProcessError {
    row: number;
    message: string;
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

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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

    try {
      const fileData = await readFileAsText(file);
      const result = await processOfferingFile({ fileData });
      
      if (result.success) {
        setStatus("success");
        onUploadSuccess(result.addedCount);
        setFile(null); // Reset the file input
        const fileInput = document.getElementById('offering-file') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
      } else {
        setStatus("error");
        setErrorTitle("Processing Failed");
        setErrorMessage(result.message);
        if (result.errors) {
            setErrorDetails(result.errors);
        }
      }
    } catch (e) {
      const err =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setErrorMessage(err);
      setErrorTitle("An Unexpected Error Occurred");
      setStatus("error");
    }
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
