/**
 * Local Ollama AI Client
 * Runs 100% locally and offline without external internet or API keys.
 * Default URL: http://localhost:11434 (override via process.env.OLLAMA_BASE_URL)
 * Default Model: llama3.2-vision (override via process.env.OLLAMA_MODEL, e.g. llava, llama3.2-vision)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2-vision";

export async function generateWithOllama({
  prompt,
  imageBase64 = null,
  format = "json",
  model = DEFAULT_MODEL,
}) {
  try {
    const body = {
      model,
      prompt,
      stream: false,
      format,
    };

    if (imageBase64) {
      body.images = [imageBase64];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for local inference

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      // If the specified model isn't pulled yet, try fallback to llava or return clear message
      if (response.status === 404 && model !== "llava") {
        return generateWithOllama({ prompt, imageBase64, format, model: "llava" });
      }
      return {
        success: false,
        error: `Ollama error (${response.status}): ${errorText}. Make sure model '${model}' is pulled (e.g. 'ollama pull ${model}').`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      text: data.response,
    };
  } catch (error) {
    if (
      error.name === "AbortError" ||
      error.code === "ECONNREFUSED" ||
      error.cause?.code === "ECONNREFUSED" ||
      error.message?.includes("fetch failed")
    ) {
      return {
        success: false,
        error:
          "Ollama is not running locally. Please start Ollama at http://localhost:11434 (run 'ollama serve' or open the Ollama application).",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to communicate with Ollama",
    };
  }
}
