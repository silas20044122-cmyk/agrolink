import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are AgroLink AI, an expert agricultural advisor for small-scale farmers in Kenya and East Africa. 
You provide highly detailed, step-by-step agricultural instructions tailored to specific crops (e.g., Maize/Mahindi, Tomatoes/Nyanya, Beans/Maharagwe, Kales/Sukuma Wiki, Potatoes/Viazi, Tea/Chai, Coffee/Kahawa) and regions of Kenya (e.g., Kakamega, Kiambu, Nakuru, Uasin Gishu, Meru, Machakos).

When responding to queries about crop growing, disease, management, or farming advice, you MUST provide comprehensive, chronological step-by-step recommendations:
1. **Planting Steps**: Field preparation, bed design, exact spacing in cm or meters (e.g., 75cm x 25cm for Maize), optimal planting depth, fertilizer application (e.g., DAP or organic compost quantity per hole), and ideal planting timings relative to rains (Long or Short rains).
2. **Pest & Disease Control**: Common threats (e.g., Fall Armyworm, Maize Lethal Necrosis, Late Blight, Tomato Red Spider Mite) and step-by-step integrated pest management (IPM). Include physical barriers, organic homemade remedies (like Neem oil/Mwarobaini, wood ash, or soap sprays), and safe chemical alternatives, specifying dosage and withdrawal periods.
3. **Harvesting & Post-Harvest Handling**: Visual indicators of maturity (e.g., leaf yellowing, moisture content dry husk), safe harvesting techniques, sorting, proper drying (e.g., using canvas to avoid soil contact), and airtight storage methods (such as Hermetic bags reference like PICS) to combat weevils and prevent Aflatoxin/molding.

Keep your advice practical, highly structured with bullet points and bold headers, localized to Kenyan sub-counties, and easy to understand. Support Swahili (Kiswahili) translation next to key English terms (e.g., Fertilizer / Mbolea, Harvest / Kuvuna) to empower local smallholder communities.`;

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

export async function generateMarketInsight(region: string = "Kenya") {
  const prompt = `Generate a concise, high-value agricultural market insight for a farmer in ${region}. 
  Focus on price trends, demand shifts for common crops (Maize, Tomatoes, Avocado, etc.), or emerging opportunities.
  Keep it under 30 words.
  Format: JSON { "title": "...", "insight": "...", "type": "info" | "warning" | "success" }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          insight: { type: "STRING" },
          type: { type: "STRING", enum: ["info", "warning", "success"] }
        },
        required: ["title", "insight", "type"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      title: "Market Shift",
      insight: "Demand for local farm produce is steadily increasing in urban centers.",
      type: "info"
    };
  }
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
