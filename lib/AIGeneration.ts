import { generateWithWebLLM } from "./webLLMClient";

export async function generateStateDetails(placeName: string, onProgress?: (txt: string) => void): Promise<string> {
  const prompt = `Return ONLY a valid JSON object with these exact keys:
          
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
          Return raw JSON only, no markdown, no code blocks, no backticks.`;
          
  return await generateWithWebLLM(prompt, onProgress);
}

export async function generateRandomItinerary(monthData: any, onProgress?: (txt: string) => void): Promise<string> {
  const { month, people, days, budget } = monthData;
  const prompt = `Based on the month of ${month}, suggest the BEST destination in India to visit during this time and create a detailed ${days}-day itinerary for ${people} people with a ${budget} budget.

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
        
        Now generate for: Best destination for ${month}, ${people} people, ${days} days, budget: ${budget} per head. Return in 80 words or less.`;
        
  return await generateWithWebLLM(prompt, onProgress);
}
