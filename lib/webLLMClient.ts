export let MODEL_ID = "Llama-3-8B-Instruct-q4f32_1-MLC"; // standard performant model

let engineInstance: any = null;
let initPromise: Promise<any> | null = null;
export let loadingProgress = "";

export async function setModelId(newModelId: string) {
  if (MODEL_ID === newModelId) return;
  MODEL_ID = newModelId;
  
  if (engineInstance) {
    try {
      if (typeof engineInstance.unload === 'function') {
        await engineInstance.unload();
      }
    } catch (e) {
      console.error("Error unloading WebLLM model", e);
    }
    engineInstance = null;
    initPromise = null;
    loadingProgress = "";
  }
}

// Provide an onProgress callback to receive load progress updates
export async function getWebLLMEngine(onProgress?: (text: string) => void) {
  if (typeof window === "undefined") {
    throw new Error("WebLLM can only run in the browser");
  }
  
  if (engineInstance) return engineInstance;
  
  if (!initPromise) {
    initPromise = (async () => {
      // Dynamically import to prevent Next.js SSR errors
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (progress: any) => {
          loadingProgress = progress.text;
          if (onProgress) onProgress(progress.text);
          console.log(progress.text);
        }
      });
      
      engineInstance = engine;
      return engine;
    })();
  }
  
  return initPromise;
}

export async function generateWithWebLLM(prompt: string, onProgress?: (text: string) => void): Promise<string> {
  const engine = await getWebLLMEngine(onProgress);
  const response = await engine.chat.completions.create({
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });
  
  return response.choices[0].message.content || "";
}
