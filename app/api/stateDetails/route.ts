import { GoogleGenAI } from "@google/genai";
import { callGeminiWithSimpleRetry } from "@/lib/geminiClient";
import { toHttpError, ApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { placeName } = await req.json();
    if (!placeName || typeof placeName !== "string" || placeName.trim() === "") {
      return new Response(
        JSON.stringify({ error: { code: 'BAD_REQUEST', message: "Invalid or missing placeName in request." } }),
        { status: 400 }
      );
    }
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, 'CONFIG_ERROR', 'Server misconfiguration: Gemini API key is missing.');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let currentModelIndex = 0;

    const result = await callGeminiWithSimpleRetry(async () => {
      try {
        const response = await ai.models.generateContent({
          model: models[currentModelIndex],
          contents: `Return ONLY a valid JSON object with these exact keys:
          
          - "attractions": array of objects with each having "name" (string), "description" (string), and "maps_link" (string with Google Maps URL)
          - "hidden_gems": array of objects with each having "name" (string), "description" (string), and "maps_link" (string with Google Maps URL)
          - "footfall": object with "domestic" and "international" numbers
          - "best_time": string
          - "avoid": object with "places" array and "food" array
          - "safety_security": number from 1-5 based on tourist safety
          - "info": string with general travel advice

          Focus on ${placeName} and include:
          1. Top 5 tourist attractions with exact Google Maps links
          2. Top 3 non-touristy hidden gems that locals love
          3. Current tourist footfall estimates
          4. Best time to visit
          5. Places and foods to avoid
          6. Safety rating (1-5)
          7. Additional travel information

          Format maps links as proper Google Maps URLs (https://maps.google.com/?q=...).
          Return raw JSON only, no markdown, no code blocks, no backticks.`,
        });
        return typeof response.text === 'string' ? response.text : String(response.text ?? '');
      } catch (error: any) {
        if (error?.message?.includes("rate limit") && currentModelIndex < models.length - 1) {
          currentModelIndex++;
        }
        throw error;
      }
    });

    return new Response(JSON.stringify({ result }), { status: 200 });
  } catch (err) {
    const { status, payload } = toHttpError(err);
    console.error("/api/stateDetails POST error:", payload);
    return new Response(JSON.stringify({ error: payload }), {
      status,
    });
  }
}