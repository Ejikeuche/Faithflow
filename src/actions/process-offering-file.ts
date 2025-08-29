
"use server";

import {
  parseOfferingData,
  type ParseOfferingDataInput,
} from "@/ai/flows/parse-offering-data";
import { z } from "zod";
import type { Offering } from "@/lib/types";

const actionInputSchema = z.object({
  fileData: z.string(),
  fileType: z.enum(["csv", "excel"]),
});

type ProcessOfferingFileOutput = {
  success: boolean;
  message: string;
  parsedData: Omit<Offering, 'id'>[] | null;
};

export async function processOfferingFile(
  input: ParseOfferingDataInput
): Promise<ProcessOfferingFileOutput> {
  const parsedInput = actionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      success: false,
      message: "Invalid input provided to processing action.",
      parsedData: null,
    };
  }

  try {
    // Directly parse the data without validation
    const parsedDataResult = await parseOfferingData(parsedInput.data);

    // The AI might still fail to parse, so we check for a valid array
    if (Array.isArray(parsedDataResult.offerings)) {
        const validatedParsedData = parsedDataResult.offerings.map(o => ({
            ...o,
            amount: Number(o.amount)
        }));

        return {
            success: true,
            message: "File parsed successfully.",
            parsedData: validatedParsedData,
        };
    }

    // If parsing fails, return an error
    return {
        success: false,
        message: "AI failed to parse the data from the file. Please check the file for structural issues and try again.",
        parsedData: null,
    }

  } catch (error) {
    console.error("Error processing offering data:", error);
    return {
      success: false,
      message: "An unexpected error occurred during processing. The AI service might be unavailable.",
      parsedData: null,
    };
  }
}
