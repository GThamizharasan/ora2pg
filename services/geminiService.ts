import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION } from "../constants";
import { MigrationType } from "../types";

// Initialize Gemini Client
// IMPORTANT: The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateCode = async (
  oracleCode: string,
  migrationType: MigrationType
): Promise<string> => {
  try {
    const prompt = `
      MIGRATION TYPE: ${migrationType}
      
      SOURCE ORACLE CODE:
      ${oracleCode}
      
      -- END SOURCE CODE --
      
      Please convert the above code to PostgreSQL. 
      Ensure high fidelity and best practices for Postgres 15+.
      Return only the raw code without markdown formatting.
    `;

    // Using gemini-3-pro-preview with a thinking budget for complex translation logic
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 2048, // Allocate thinking tokens for complex logic mapping
        },
        responseMimeType: "text/plain",
      },
    });

    let text = response.text || "";

    // Cleanup logic in case model wraps in markdown despite instructions
    text = text.replace(/^```sql\n/i, "").replace(/^```postgresql\n/i, "").replace(/^```\n/i, "").replace(/```$/, "");

    return text.trim();
  } catch (error) {
    console.error("Migration failed:", error);
    throw new Error("Failed to translate code. Please check the input and try again.");
  }
};

/**
 * Generates a quick explanation/analysis of the migration plan
 * Used for the "Explain" feature
 */
export const explainMigration = async (oracleCode: string, postgresCode: string): Promise<string> => {
  try {
    const prompt = `
      Compare the following Oracle code and the converted PostgreSQL code.
      Explain the key changes made, specifically highlighting data type changes, function mappings, and any potential performance implications.
      Keep it concise (bullet points).

      ORACLE:
      ${oracleCode.substring(0, 1000)}...

      POSTGRES:
      ${postgresCode.substring(0, 1000)}...
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use flash for quick text generation
      contents: prompt,
    });

    return response.text || "No explanation available.";
  } catch (error) {
    return "Could not generate explanation.";
  }
};