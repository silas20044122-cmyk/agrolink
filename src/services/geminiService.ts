import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are AgroLink AI, an expert agricultural advisor for small-scale farmers in Kenya and Africa. 
You provide advice on crop management, disease control, pest management, soil health, and market strategies.
Keep your advice practical, localized to East African conditions, and easy to understand for non-technical users.
Support Swahili (Kiswahili) if the user speaks it.
Current context: Kenyan Agriculture, Kakamega region focus.`;

export async function getAgroLinkChatStream(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[], context?: string) {
  const dynamicPrompt = `${SYSTEM_PROMPT}\n\n${context ? `USER CONTEXT:\n${context}` : ''}`;
  
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: dynamicPrompt,
    },
    history: history.slice(-10), // Keep last 10 messages for context
  });

  return chat.sendMessageStream({ message });
}

export async function analyzeCropDisease(imageData: string, mimeType: string) {
  const prompt = `Analyze this crop image. 
1. Identify the crop.
2. Identify any visible diseases or pests.
3. Provide a localized treatment plan or management advice.
4. Rate the health status (Healthy, At Risk, Diseased).
5. Suggest immediate actions the farmer should take.
Respond in a structured way that can be parsed easily. Use English and Swahili translations for key terms.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: imageData.split(',')[1], mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          cropName: { type: "STRING" },
          diseaseName: { type: "STRING" },
          healthStatus: { type: "STRING" },
          confidence: { type: "NUMBER" },
          diagnosis: { type: "STRING" },
          treatmentPlanSw: { type: "STRING" },
          treatmentPlanEn: { type: "STRING" },
          immediateActions: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["cropName", "healthStatus", "diagnosis", "immediateActions"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      cropName: "Unknown",
      healthStatus: "Error analyzing",
      diagnosis: response.text,
      immediateActions: ["Check connection", "Retry upload"]
    };
  }
}
