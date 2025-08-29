"use server";

import {
  validateOfferingData,
  type ValidateOfferingDataInput,
  type ValidateOfferingDataOutput,
} from "@/ai/flows/validate-offering-data";
import { z } from "zod";

const actionInputSchema = z.object({
  fileData: z.string(),
  fileType: z.enum(["csv", "excel"]),
});

export async function validateOfferingFile(
  input: ValidateOfferingDataInput
): Promise<ValidateOfferingDataOutput> {
  const parsedInput = actionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      isValid: false,
      errors: ["Invalid input provided to validation action."],
      suggestions: [],
    };
  }

  try {
    const result = await validateOfferingData(parsedInput.data);
    return result;
  } catch (error) {
    console.error("Error validating offering data:", error);
    return {
      isValid: false,
      errors: [
        "An unexpected error occurred during validation. The AI service might be unavailable.",
      ],
      suggestions: ["Please try again later."],
    };
  }
}
