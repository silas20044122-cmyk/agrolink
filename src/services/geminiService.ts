// Client-side Proxy service for AgriLink AI Technical Advisor
// All actual Gemini queries run securely on the server side to protect secrets and avoid CORS blocks.

export async function* getAgroLinkChatStream(
  message: string,
  history: { role: 'user' | 'model', parts: [{ text: string }] }[],
  context?: string
) {
  const response = await fetch("/api/gemini/chat-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history, context }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Translation or response streaming failed.");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming not supported in your browser.");
  }

  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const textChunk = decoder.decode(value, { stream: true });
      yield { text: textChunk };
    }
  } finally {
    reader.releaseLock();
  }
}

export async function generateMarketInsight(region: string = "Kenya") {
  const response = await fetch("/api/gemini/market-insight", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ region }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch market insights.");
  }

  return response.json();
}

export async function analyzeCropDisease(imageData: string, mimeType: string) {
  const response = await fetch("/api/gemini/analyze-crop-disease", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData, mimeType }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze crop photo.");
  }

  return response.json();
}
