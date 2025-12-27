import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeResume(text: string) {
  console.log("🔑 GEMINI KEY PRESENT:", !!process.env.GEMINI_API_KEY);

  // ✅ CORRECT: Using Gemini 2.5 Flash (latest stable model)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Stable GA model (no suffix needed)
  });

  const prompt = `
Analyze the resume below and return ONLY valid JSON.

JSON format:
{
  "atsScore": number,
  "skillsMatched": string[],
  "skillsMissing": string[],
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[]
}

Resume:
${text}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("🚀 Gemini API called successfully");

    // Clean the response (remove markdown code blocks if present)
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("❌ Gemini Analysis Error:", error);
    throw error;
  }
}