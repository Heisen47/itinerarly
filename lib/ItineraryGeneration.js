import { generateWithWebLLM } from "./webLLMClient";

export default async function ItineraryGeneration(formData, onProgress) {
  try {
    const prompt = `
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
    `;
    const result = await generateWithWebLLM(prompt, onProgress);
    return result || "Failed to generate content";
  } catch (error) {
    console.error("Unexpected error calling WebLLM for itinerary:", error);
    return `Request error: ${error.message || "Failed to initialize or generate AI content."}`;
  }
}