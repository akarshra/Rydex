import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are a helpful AI assistant for Rydex, a ride-sharing app. 
Extract booking details from the user's natural language request. 
Return ONLY JSON matching the provided schema. 
If a location is not explicitly mentioned but implied (e.g. "take me home"), try to extract it, or leave it null.
Vehicle type should be one of: 'car', 'bike', 'auto', 'truck'. If not specified, default to 'car'.`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        pickup: {
          type: Type.STRING,
          description: "The pickup location. Example: 'Airport', 'My house'",
          nullable: true,
        },
        dropoff: {
          type: Type.STRING,
          description: "The drop-off destination. Example: 'Downtown', 'Train Station'",
          nullable: true,
        },
        vehicleType: {
          type: Type.STRING,
          description: "The requested vehicle type: car, bike, auto, truck.",
          nullable: true,
        }
      },
      required: ["pickup", "dropoff", "vehicleType"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const result = JSON.parse(response.text || "{}");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Extraction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
