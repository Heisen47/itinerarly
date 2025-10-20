import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { callGeminiWithSimpleRetry } from "@/lib/geminiClient";
import { toHttpError, ApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData = body?.formData;
    if (
      !formData ||
      typeof formData !== "object" ||
      typeof formData.destination !== "string" ||
      formData.destination.trim() === "" ||
      typeof formData.people !== "string" ||
      formData.people.trim() === "" ||
      typeof formData.days !== "string" ||
      formData.days.trim() === "" ||
      typeof formData.budget !== "string" ||
      formData.budget.trim() === ""
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid or missing formData. Please provide destination, people, days, and budget as non-empty strings.",
        }),
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Server misconfiguration: Gemini API key is missing.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let currentModelIndex = 0;

    const result = await callGeminiWithSimpleRetry(async () => {
      try {
        const response = await ai.models.generateContent({
          model: models[currentModelIndex],
          contents: `
              For "${formData.destination}" in India, return the itinerary in this format, using "|||" as a delimiter between sections:
              Destination: <destination>
              Budget: <budget> per head
              Hotels: <hotel1>, <hotel2>, <hotel3>
              Restaurants: <restaurant1>, <restaurant2>, <restaurant3>
              Attractions: <attraction1>, <attraction2>, <attraction3>
              Day-wise Plan:
              Day 1: <activities>
              Day 2: <activities>
              Day 3: <activities>
              |||
              Example:
              Destination: Delhi
              Budget: ₹15,000 - ₹20,000 per head
              Hotels: The Imperial, Taj Palace
              Restaurants: Karim's, Indian Accent
              Attractions: Red Fort, Qutub Minar, Lotus Temple
              Day-wise Plan:
              Day 1: Red Fort, Jama Masjid, Chandni Chowk
              Day 2: Qutub Minar, Lotus Temple, Hauz Khas Village
              Day 3: India Gate, Connaught Place, Dilli Haat
              |||
              If not a place in India, return: Error: Please search for a place in India.
              Now generate for: ${formData.destination}, ${formData.people} people, ${formData.days} days, budget: ${formData.budget} (INR and USD) per head. Return in 80 words or less.
            `,
        });
        const text = typeof response.text === "string" ? response.text.trim() : "";
        return text as unknown as string;
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
    console.error("itinerary POST error:", payload);
    return new Response(JSON.stringify({ error: payload }), { status });
  }
}
