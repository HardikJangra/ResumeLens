import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in Gemini response");
  return JSON.parse(match[0]);
}

export async function analyzeResume(text: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an ATS system.

Return ONLY valid JSON. Do NOT add explanations, markdown, or text.

JSON schema:
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

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  return extractJson(raw);
}
