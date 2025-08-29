
"use server";

import { z } from "zod";
import type { Offering } from "@/lib/types";
import { addBatchOfferings } from "./offering-actions";
import Papa from "papaparse";

const offeringSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
  type: z.enum(["Tithe", "Personal", "Building", "Special"]),
});

const actionInputSchema = z.object({
  fileData: z.string(),
});

type ProcessOfferingFileOutput = {
  success: boolean;
  message: string;
  addedCount: number;
  errors?: { row: number; message: string }[];
};

export async function processOfferingFile(
  input: z.infer<typeof actionInputSchema>
): Promise<ProcessOfferingFileOutput> {
  const parsedInput = actionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      success: false,
      message: "Invalid input provided to processing action.",
      addedCount: 0,
    };
  }

  try {
    const parseResult = Papa.parse(parsedInput.data.fileData, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
       return {
        success: false,
        message: "Failed to parse CSV file. Please check the file format.",
        addedCount: 0,
        errors: parseResult.errors.map(e => ({ row: e.row, message: e.message }))
      };
    }
    
    const validationErrors: { row: number; message: string }[] = [];
    const validOfferings: Omit<Offering, "id" | "createdAt">[] = [];

    for (const [index, row] of parseResult.data.entries()) {
      const result = offeringSchema.safeParse(row);
      if (result.success) {
        validOfferings.push(result.data);
      } else {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        validationErrors.push({ row: index + 2, message: errorMessage });
      }
    }
    
    if (validationErrors.length > 0) {
       return {
        success: false,
        message: "Some rows had validation errors. Please fix them and try again.",
        addedCount: 0,
        errors: validationErrors
      };
    }

    if (validOfferings.length > 0) {
      await addBatchOfferings(validOfferings);
      return {
        success: true,
        message: "File parsed and offerings added successfully.",
        addedCount: validOfferings.length,
      };
    }

    return {
      success: false,
      message: "No valid offering records were found in the file.",
      addedCount: 0,
    };

  } catch (error) {
    console.error("Error processing offering data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: `An unexpected error occurred during processing: ${errorMessage}.`,
      addedCount: 0,
    };
  }
}
