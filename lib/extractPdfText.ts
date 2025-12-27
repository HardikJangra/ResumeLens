/* eslint-disable @typescript-eslint/no-require-imports */

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // 🔥 IMPORTANT: import the internal parser, not the package root
    const pdfParse = require("pdf-parse/lib/pdf-parse");

    const data: { text: string } = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
}
