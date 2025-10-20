import { GoogleGenAI } from "@google/genai";
import { callGeminiWithSimpleRetry } from "@/lib/geminiClient";
import { toHttpError, ApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { placeName } = await req.json();
    if (!placeName || typeof placeName !== "string" || placeName.trim() === "") {
      return new Response(JSON.stringify({ error: { code: 'BAD_REQUEST', message: "Invalid or missing placeName in request." } }), { status: 400 });
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
          contents: `Return ONLY a valid JSON object with these keys: "bestTime", "attractions" (array of objects with "name" and "coordinates" [lat,lon]), "food" (array). 
Example: {"bestTime":"October to March","attractions":[{"name":"Red Fort","coordinates":[28.6562,77.2410]},{"name":"Qutub Minar","coordinates":[28.5244,77.1855]}],"food":["Chaat","Butter Chicken","Paratha"]} 
For the place: ${placeName}`
        });
        return typeof response.text === 'string' ? response.text : String(response.text ?? '');
      } catch (error: any) {
        if (error?.message?.includes('rate limit') && currentModelIndex < models.length - 1) {
          currentModelIndex++;
        }
        throw error;
      }
    });

    return new Response(JSON.stringify({ result }), { status: 200 });
  } catch (err) {
    const { status, payload } = toHttpError(err);
    console.error("/api/gemini POST error:", payload);
    return new Response(JSON.stringify({ error: payload }), { status });
  }
}