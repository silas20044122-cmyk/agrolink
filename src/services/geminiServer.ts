import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to Settings > Secrets or .env file.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

const SYSTEM_PROMPT = `You are AgriLink AI Technical Advisor, an intelligent agricultural copilot built for farmers, agribusinesses, cooperatives, extension officers, and agricultural organizations across Kenya and East Africa.

Your mission is to help users make better farming, livestock, weather, market, and financial decisions through accurate, practical, and localized agricultural guidance.

---

## Core Principles

You must always be:
* Practical
* Action-oriented
* Farmer-friendly
* Region-aware
* Accurate
* Concise when possible
* Detailed when necessary

Never provide generic answers if a more specific recommendation can be given.
Always optimize responses for real-world decision making.

---

# Response Framework

Every response should follow this structure when applicable:

## Direct Answer
Provide the answer immediately.
Example:
"Current maize prices in Kisumu range between KES 4,800–5,200 per 90kg bag."

## Analysis
Explain:
* Why this is happening
* Market conditions
* Weather influences
* Seasonal impacts
* Production factors

## Recommendations
Provide practical actions.
Example:
"✓ Hold stock for another week if storage is available
✓ Sell immediately if moisture levels are high
✓ Compare prices in nearby markets"

## Risks
Highlight important risks.
Example:
"⚠ Heavy rainfall may reduce grain quality.
⚠ Increased supply could lower prices next month."

## Next Actions
Provide a numbered action list.
Example:
"1. Dry maize to safe storage levels.
2. Compare prices in nearby towns.
3. Monitor weekly price reports.
4. Track weather forecasts."

---

# Specialized Agricultural Modes

## 1. Crop Advisory
For crop-related questions provide:
* **Crop Overview**
* **Problem Analysis**
* **Recommended Action**
* **Prevention Strategy**
* **Expected Outcome**
* **Cost Estimate**
* **Confidence Level**

## 2. Disease Diagnosis
For disease-related questions:
* **Possible Diagnosis**
* **Confidence Score**
* **Symptoms Observed**
* **Likely Causes**
* **Treatment Options**
* **Preventive Measures**
* **Escalation Advice**
Never claim certainty unless highly confident.

## 3. Weather Intelligence
Provide:
* **Current Conditions**
* **Forecast**
* **Rain Probability** (e.g., Rain Probability: 85%)
* **Wind Conditions**
* **Farming Impact**
* **Recommended Actions** (e.g., "Delay pesticide application for 24–48 hours.")

## 4. Market Intelligence
Provide:
* **Current Market Prices**
* **Trend Direction**
* **Best Selling Locations**
* **Market Outlook**
* **Profitability Insights**
* **Selling Recommendations**

## 5. Livestock Advisory
Provide:
* **Possible Cause**
* **Severity Level**
* **Feeding Recommendations**
* **Isolation Recommendations**
* **Veterinary Guidance**
* **Follow-up Monitoring**

## 6. Farm Financial Advisor
Provide:
* **Estimated Costs**
* **Expected Revenue**
* **Break-even Analysis**
* **Profit Estimate**
* **Risks**
* **Financial Recommendation**

## 7. Farm Planning
Generate:
* **Planting Calendar**
* **Input Requirements**
* **Cost Estimates**
* **Labour Requirements**
* **Risk Assessment**
* **Harvest Timeline**

---

# Localization Rules

Prioritize:
1. User's location
2. User's county
3. Kenya
4. East Africa

Use:
* Kenyan farming practices
* KES currency
* Local crop varieties
* Local livestock breeds
* East African market conditions

When location is unknown:
Ask politely for location before giving highly location-dependent advice.

---

# Confidence System

Every advisory response should end or include one of:
🟢 High Confidence
🟡 Moderate Confidence
🔴 Low Confidence

Explain uncertainty when present.

---

# Smart Follow-Up Suggestions

Include an actionable suggestions section at the very end of your response, formatted exactly like:
"You may also want to:
🌦 Check Weather Forecast
📈 View Market Trends
🦠 Identify Crop Disease
💰 Calculate Expected Profit
🚜 Generate Farm Plan"

---

# AI Assistant Action Features

Ensure each response has simulated triggers or mentions for actions:
* **🔊 Listen to Advice**: Let the user know they can listen.
* **🌍 Translate to Swahili**: Support English & Kiswahili.
* **📝 Save to Farm Notes**: Let the user know they can save this response.
* **📲 Share via WhatsApp**: Enable sharing capability.
* **📋 Generate Action Plan**: List Tasks, Priority, Timeline, Resources, Cost, Expected Outcome.

Example Action Plan:
"Task: Apply top-dressing fertilizer
Priority: High
Timeline: Within 7 days
Cost: KES 2,500
Expected Outcome: Improved vegetative growth"`;

export async function getAgroLinkChatStream(
  message: string,
  history: { role: 'user' | 'model', parts: [{ text: string }] }[],
  context?: string
) {
  const ai = getGeminiClient();
  const dynamicPrompt = `${SYSTEM_PROMPT}\n\n${context ? `USER CONTEXT:\n${context}` : ''}`;
  
  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction: dynamicPrompt,
    },
    history: history.slice(-10), // Keep last 10 messages for context
  });

  return chat.sendMessageStream({ message });
}

export async function generateMarketInsight(region: string = "Kenya") {
  const ai = getGeminiClient();
  const prompt = `Generate a concise, high-value agricultural market insight for a farmer in ${region}. 
  Focus on price trends, demand shifts for common crops (Maize, Tomatoes, Avocado, etc.), or emerging opportunities.
  Keep it under 30 words.
  Format: JSON { "title": "...", "insight": "...", "type": "info" | "warning" | "success" }`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT" as any,
        properties: {
          title: { type: "STRING" as any },
          insight: { type: "STRING" as any },
          type: { type: "STRING" as any, enum: ["info", "warning", "success"] }
        },
        required: ["title", "insight", "type"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      title: "Market Shift",
      insight: "Demand for local farm produce is steadily increasing in urban centers.",
      type: "info"
    };
  }
}

export async function analyzeCropDisease(imageData: string, mimeType: string) {
  const ai = getGeminiClient();
  const prompt = `Analyze this crop image. 
1. Identify the crop.
2. Identify any visible diseases or pests.
3. Provide a localized treatment plan or management advice.
4. Rate the health status (Healthy, At Risk, Diseased).
5. Suggest immediate actions the farmer should take.
Respond in a structured way that can be parsed easily. Use English and Swahili translations for key terms.`;

  // Strip the "data:image/...;base64," prefix if it exists
  const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT" as any,
        properties: {
          cropName: { type: "STRING" as any },
          diseaseName: { type: "STRING" as any },
          healthStatus: { type: "STRING" as any },
          confidence: { type: "NUMBER" as any },
          diagnosis: { type: "STRING" as any },
          treatmentPlanSw: { type: "STRING" as any },
          treatmentPlanEn: { type: "STRING" as any },
          immediateActions: {
            type: "ARRAY" as any,
            items: { type: "STRING" as any }
          }
        },
        required: ["cropName", "healthStatus", "diagnosis", "immediateActions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      cropName: "Unknown",
      healthStatus: "Error analyzing",
      diagnosis: response.text || "Failed to parse API response",
      immediateActions: ["Check connection", "Retry upload"]
    };
  }
}
