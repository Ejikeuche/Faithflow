
'use server';

/**
 * @fileOverview AI-powered tool to parse offering data from CSV or Excel files into structured JSON.
 *
 * - parseOfferingData - A function that parses the offering data.
 * - ParseOfferingDataInput - The input type for the parseOfferingData function.
 * - ParseOfferingDataOutput - The return type for the parseOfferingData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseOfferingDataInputSchema = z.object({
  fileData: z
    .string()
    .describe(
      'The validated offering data file content as a string, either CSV or Excel data in base64 format.'
    ),
  fileType: z.enum(['csv', 'excel']).describe('The type of the uploaded file.'),
});
export type ParseOfferingDataInput = z.infer<typeof ParseOfferingDataInputSchema>;

const ParseOfferingDataOutputSchema = z.object({
  offerings: z.array(z.object({
    name: z.string().describe("The contributor's full name."),
    email: z.string().describe("The contributor's email address."),
    amount: z.number().describe("The offering amount as a number."),
    date: z.string().describe("The date of the offering in YYYY-MM-DD format."),
    type: z.enum(["Tithe", "Personal", "Building", "Special"]).describe("The type of offering."),
  })),
});
export type ParseOfferingDataOutput = z.infer<typeof ParseOfferingDataOutputSchema>;

export async function parseOfferingData(
  input: ParseOfferingDataInput
): Promise<ParseOfferingDataOutput> {
  return parseOfferingDataFlow(input);
}

const parseOfferingDataPrompt = ai.definePrompt({
  name: 'parseOfferingDataPrompt',
  input: {schema: ParseOfferingDataInputSchema},
  output: {schema: ParseOfferingDataOutputSchema},
  prompt: `You are a data extraction expert. You will receive data from a CSV or Excel file that has already been validated for data integrity.

Your task is to parse this data and convert it into a structured JSON array of offering objects.

The file contains the following columns, though the order may vary: 'name', 'email', 'amount', 'date', and 'type'.

- Ensure the 'amount' field is converted to a number.
- Ensure the 'date' field is formatted as YYYY-MM-DD.
- Ensure the 'type' field is one of the allowed values.

Data Type: {{{fileType}}}
Data: {{{fileData}}}

Output your response as a valid JSON object conforming to the schema, with the key "offerings" containing the array of parsed records.`,
});

const parseOfferingDataFlow = ai.defineFlow(
  {
    name: 'parseOfferingDataFlow',
    inputSchema: ParseOfferingDataInputSchema,
    outputSchema: ParseOfferingDataOutputSchema,
  },
  async input => {
    const {output} = await parseOfferingDataPrompt(input);
    return output!;
  }
);
