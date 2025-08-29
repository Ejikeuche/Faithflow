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
  FileWarning,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { validateOfferingFile } from "@/actions/validate-offering";
import type { ValidateOfferingDataOutput } from "@/ai/flows/validate-offering-data";

export function OfferingValidator() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [validationResult, setValidationResult] = useState<ValidateOfferingDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setValidationResult(null);
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

  const handleValidate = async () => {
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
    setValidationResult(null);
    setError(null);

    try {
      const fileData = await toBase64(file);
      const result = await validateOfferingFile({ fileData, fileType });
      setValidationResult(result);
      if (result.isValid) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (e) {
      const err =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(err);
      setStatus("idle");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Offering Validator</CardTitle>
        <CardDescription>
          Upload a CSV or Excel file to check for consistency and potential
          issues.
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
          <Button onClick={handleValidate} disabled={!file || status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Validate File
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center p-8 text-muted-foreground rounded-lg bg-secondary">
            <Loader2 className="h-8 w-8 animate-spin mr-4" />
            <span>Analyzing your file with AI...</span>
          </div>
        )}

        {validationResult && (
          <div className="space-y-4">
            {validationResult.isValid ? (
              <Alert>
                <FileCheck2 className="h-4 w-4" />
                <AlertTitle>Validation Passed</AlertTitle>
                <AlertDescription>
                  The uploaded offering data appears to be consistent and valid.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <FileWarning className="h-4 w-4" />
                <AlertTitle>Validation Issues Found</AlertTitle>
                <AlertDescription>
                  The AI found potential issues with your file. Please review the
                  errors and suggestions below.
                </AlertDescription>
              </Alert>
            )}

            {validationResult.errors && validationResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-lg">Identified Errors</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {validationResult.errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {validationResult.suggestions &&
              validationResult.suggestions.length > 0 && (
                <Card className="bg-accent/20 border-accent/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-accent-foreground" />
                      <CardTitle className="text-lg">AI Suggestions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {validationResult.suggestions.map((sug, index) => (
                        <li key={index}>{sug}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
