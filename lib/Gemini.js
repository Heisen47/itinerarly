import { generateWithWebLLM } from "./webLLMClient";

export default async function Gemini(placeName, onProgress) {
  try {
    const prompt = `Return ONLY a valid JSON object with these keys: "bestTime", "attractions" (array of objects with "name" and "coordinates" [lat,lon]), "food" (array). 
Example: {"bestTime":"October to March","attractions":[{"name":"Red Fort","coordinates":[28.6562,77.2410]},{"name":"Qutub Minar","coordinates":[28.5244,77.1855]}],"food":["Chaat","Butter Chicken","Paratha"]} 
For the place: ${placeName}`;
    const result = await generateWithWebLLM(prompt, onProgress);
    return result || "Failed to generate content";
  } catch (error) {
    console.error("Unexpected error calling WebLLM API:", error);
    return "Unexpected error occurred.";
  }
}