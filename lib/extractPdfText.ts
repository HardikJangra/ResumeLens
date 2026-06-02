/* eslint-disable @typescript-eslint/no-require-imports */

export async function extractResumeText(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    if (fileName.toLowerCase().endsWith(".docx")) {
      const mammoth = require("mammoth");
      const { value } = await mammoth.extractRawText({ buffer });
      return value || "";
    }

    // 🔥 IMPORTANT: import the internal parser, not the package root
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const data: { text: string } = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Resume text extraction failed:", error);
    throw new Error("Failed to extract text from resume file");
  }
}
