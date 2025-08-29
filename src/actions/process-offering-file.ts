
"use server";

import {
  validateOfferingData,
  type ValidateOfferingDataInput,
  type ValidateOfferingDataOutput,
} from "@/ai/flows/validate-offering-data";
import {
  parseOfferingData,
  type ParseOfferingDataInput,
  type ParseOfferingDataOutput,
} from "@/ai/flows/parse-offering-data";
import { z } from "zod";
import type { Offering } from "@/lib/types";

const actionInputSchema = z.object({
  fileData: z.string(),
  fileType: z.enum(["csv", "excel"]),
});

type ProcessOfferingFileOutput = {
  validation: ValidateOfferingDataOutput;
  parsedData: Omit<Offering, 'id'>[] | null;
};

export async function processOfferingFile(
  input: ValidateOfferingDataInput
): Promise<ProcessOfferingFileOutput> {
  const parsedInput = actionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      validation: {
        isValid: false,
        errors: ["Invalid input provided to processing action."],
        suggestions: [],
      },
      parsedData: null,
    };
  }

  try {
    const validationResult = await validateOfferingData(parsedInput.data);

    if (!validationResult.isValid) {
      return {
        validation: validationResult,
        parsedData: null,
      };
    }

    // If validation is successful, proceed to parse the data
    const parsedDataResult = await parseOfferingData(parsedInput.data);

    // The AI might still fail to parse, so we check for a valid array
    if (Array.isArray(parsedDataResult.offerings)) {
        const validatedParsedData = parsedDataResult.offerings.map(o => ({
            ...o,
            amount: Number(o.amount)
        }));

        return {
            validation: validationResult,
            parsedData: validatedParsedData,
        };
    }

    // If parsing fails, return a validation error
    return {
        validation: {
            isValid: false,
            errors: ["AI failed to parse the data from the file even after initial validation."],
            suggestions: ["Please check the file for structural issues and try again."],
        },
        parsedData: null,
    }


  } catch (error) {
    console.error("Error processing offering data:", error);
    return {
      validation: {
        isValid: false,
        errors: [
          "An unexpected error occurred during processing. The AI service might be unavailable.",
        ],
        suggestions: ["Please try again later."],
      },
      parsedData: null,
    };
  }
}
