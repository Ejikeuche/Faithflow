'use server';

/**
 * @fileOverview AI-powered tool to validate offering data uploaded from CSV or Excel files.
 *
 * - validateOfferingData - A function that validates the offering data.
 * - ValidateOfferingDataInput - The input type for the validateOfferingData function.
 * - ValidateOfferingDataOutput - The return type for the validateOfferingData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateOfferingDataInputSchema = z.object({
  fileData: z
    .string()
    .describe(
      'The offering data file content as a string, either CSV or Excel data in base64 format.'
    ),
  fileType: z.enum(['csv', 'excel']).describe('The type of the uploaded file.'),
});
export type ValidateOfferingDataInput = z.infer<typeof ValidateOfferingDataInputSchema>;

const ValidateOfferingDataOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the offering data is valid or not.'),
  errors: z
    .array(z.string())
    .describe('A list of potential data integrity issues found in the file.'),
  suggestions: z
    .array(z.string())
    .describe('Suggestions for correcting the identified issues.'),
});
export type ValidateOfferingDataOutput = z.infer<typeof ValidateOfferingDataOutputSchema>;

export async function validateOfferingData(
  input: ValidateOfferingDataInput
): Promise<ValidateOfferingDataOutput> {
  return validateOfferingDataFlow(input);
}

const validateOfferingDataPrompt = ai.definePrompt({
  name: 'validateOfferingDataPrompt',
  input: {schema: ValidateOfferingDataInputSchema},
  output: {schema: ValidateOfferingDataOutputSchema},
  prompt: `You are an expert data validator specializing in identifying inconsistencies
  and potential errors in financial data, specifically offering records from churches.

  You will receive offering data in either CSV or Excel format. Your task is to carefully
  analyze the data for any signs of inconsistency, errors, or potential fraud.

  Here are some key checks you should perform:
  - Check if all monetary values are valid numbers.
  - Look for any unusually large or small donations that might indicate errors.
  - Verify that dates are in a consistent format and within a reasonable range.
  - Identify any duplicate records.
  - Check for any missing fields or incomplete data.
  - **Crucially, use the member's email address from the file to identify the contributor. If an email is provided, verify it seems like a valid email. If an email is not present for a record, flag it as an error.**

  Based on your analysis, you will provide a summary of whether the data is valid or not, 
  a list of errors found (if any), and suggestions for correcting these errors.

  Data Type: {{{fileType}}}
  Data: {{{fileData}}}
  \n\n Output your response as a valid JSON conforming to the schema. Make sure the \"errors\" and \"suggestions\" fields are arrays of strings.`,
});

const validateOfferingDataFlow = ai.defineFlow(
  {
    name: 'validateOfferingDataFlow',
    inputSchema: ValidateOfferingDataInputSchema,
    outputSchema: ValidateOfferingDataOutputSchema,
  },
  async input => {
    const {output} = await validateOfferingDataPrompt(input);
    return output!;
  }
);
