import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { callGeminiWithSimpleRetry } from "@/lib/geminiClient";
import { toHttpError, ApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const formData = body?.formData || body;

    const { month, people, days, budget } = formData;
    
    if (!month || !people || !days || !budget) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields. Please provide month, people, days, and budget.",
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
          contents: `Based on the month of ${month}, suggest the BEST destination in India to visit during this time and create a detailed ${days}-day itinerary for ${people} people with a ${budget} budget.

        Consider:
            - Weather conditions in ${month}
            - Seasonal attractions and festivals
            - Best places to visit during this specific month
            - Activities suitable for the weather

        Return the itinerary in this exact format, using "|||" as a delimiter between sections:
        Destination: <recommended destination name>
        Budget: <budget> per head
        Hotels: <hotel1>, <hotel2>, <hotel3>
        Restaurants: <restaurant1>, <restaurant2>, <restaurant3>
        Attractions: <attraction1>, <attraction2>, <attraction3>
        Day-wise Plan:
        Day 1: <activities>
        Day 2: <activities>
        Day 3: <activities>
        Why perfect for ${month}: <brief seasonal explanation>
        |||
        Example:
        Destination: Goa
        Budget: ₹20,000 - ₹25,000 per head
        Hotels: Taj Exotica, The Leela, Alila Diwa
        Restaurants: Thalassa, Gunpowder, Fisherman's Wharf
        Attractions: Baga Beach, Dudhsagar Falls, Old Goa Churches
        Day-wise Plan:
        Day 1: Baga Beach, Calangute Beach, Anjuna Market
        Day 2: Dudhsagar Falls, Spice Plantation Tour
        Day 3: Old Goa Churches, Fontainhas, River Cruise
        Why perfect for December: Pleasant weather, perfect beach conditions, Christmas celebrations
        |||
        
        Now generate for: Best destination for ${month}, ${people} people, ${days} days, budget: ${budget} per head. Return in 80 words or less.`,
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
    console.error("RandomItinerary POST error:", payload);
    return new Response(JSON.stringify({ error: payload }), { status });
  }
}