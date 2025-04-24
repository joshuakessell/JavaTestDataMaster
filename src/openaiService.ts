import { JavaClass, OutputFormat } from './utils/types';
import { analyzeFieldSemantics } from './javaParser';
// Use global fetch instead of node-fetch to avoid ESM compatibility issues

/**
 * Generate fake data for a Java class using OpenAI's API
 * @param javaClass The Java class structure
 * @param count Number of records to generate
 * @param format Output format (JSON, Java, CSV)
 * @param apiKey OpenAI API Key
 * @returns Generated fake data as string
 */
export async function generateFakeData(
    javaClass: JavaClass,
    count: number,
    format: OutputFormat,
    apiKey: string
): Promise<string> {
    try {
        // Create field list with semantic hints
        const fieldList = javaClass.fields.map(field => {
            const semantics = analyzeFieldSemantics(field);
            return {
                name: field.name,
                type: field.type,
                annotations: field.annotations,
                semantics: semantics.length > 0 ? semantics : undefined
            };
        });

        // Prepare output format string
        let formatStr: string;
        switch (format) {
            case OutputFormat.JSON:
                formatStr = 'JSON format';
                break;
            case OutputFormat.JAVA:
                formatStr = 'Java code snippet that creates and initializes objects';
                break;
            case OutputFormat.CSV:
                formatStr = 'CSV format with a header row';
                break;
            default:
                formatStr = 'JSON format';
        }

        // Build the OpenAI API request
        const promptContent = buildPrompt(javaClass.name, fieldList, count, formatStr);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates realistic fake data for Java classes."
                    },
                    {
                        role: "user",
                        content: promptContent
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        const data = await response.json() as any;
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
        }

        return data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error('Error generating fake data:', error);
        throw new Error(`Failed to generate fake data: ${error.message || 'Unknown error'}`);
    }
}

/**
 * Build the prompt for OpenAI API
 * @param className Name of the Java class
 * @param fields List of fields with type information
 * @param count Number of records to generate
 * @param format Output format string
 * @returns Complete prompt as string
 */
function buildPrompt(
    className: string,
    fields: any[],
    count: number,
    format: string
): string {
    // Format the fields information
    const fieldListStr = fields.map(field => {
        let fieldStr = `- ${field.name} (${field.type})`;
        
        if (field.annotations && field.annotations.length > 0) {
            fieldStr += ` Annotations: ${field.annotations.join(', ')}`;
        }
        
        if (field.semantics && field.semantics.length > 0) {
            fieldStr += ` Semantic Type: ${field.semantics.join(', ')}`;
        }
        
        return fieldStr;
    }).join('\n');

    return `Generate ${count} realistic fake data objects for the Java class '${className}' with the following fields:

${fieldListStr}

Please generate the data in ${format}.

The generated data should be realistic, following conventions for field types. For example:
- Email fields should have valid email formats
- Date fields should have realistic dates
- Name fields should have realistic names
- Phone numbers should have realistic formats
- ID fields should follow appropriate patterns
- Price fields should have appropriate currency values

Please output ONLY the generated data, without any additional explanation or commentary.`;
}
