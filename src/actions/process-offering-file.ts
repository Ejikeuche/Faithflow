
"use server";

import {
  parseOfferingData,
  type ParseOfferingDataInput,
} from "@/ai/flows/parse-offering-data";
import { z } from "zod";
import type { Offering } from "@/lib/types";
import { addBatchOfferings } from "./offering-actions";

const actionInputSchema = z.object({
  fileData: z.string(),
  fileType: z.enum(["csv", "excel"]),
});

type ProcessOfferingFileOutput = {
  success: boolean;
  message: string;
  addedCount: number;
};

export async function processOfferingFile(
  input: ParseOfferingDataInput
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
    const parsedDataResult = await parseOfferingData(parsedInput.data);

    if (Array.isArray(parsedDataResult.offerings) && parsedDataResult.offerings.length > 0) {
        const validatedParsedData: Omit<Offering, 'id' | 'createdAt'>[] = parsedDataResult.offerings.map(o => ({
            ...o,
            amount: Number(o.amount)
        }));

        await addBatchOfferings(validatedParsedData);

        return {
            success: true,
            message: "File parsed and offerings added successfully.",
            addedCount: validatedParsedData.length,
        };
    }

    return {
        success: false,
        message: "AI failed to parse the data from the file, or the file was empty. Please check the file for structural issues and try again.",
        addedCount: 0,
    }

  } catch (error) {
    console.error("Error processing offering data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: `An unexpected error occurred during processing: ${errorMessage}. The AI service might be unavailable or there's an issue with the database connection.`,
      addedCount: 0,
    };
  }
}
