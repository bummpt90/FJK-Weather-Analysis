
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDataScientistCommentary = async (step: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a senior data scientist at a weather firm. 
      Analyze the current step of the weather analysis workflow: ${step}.
      Context: ${context}
      Provide a brief, professional, and insightful commentary (2-3 sentences) on what this step reveals about JFK's weather or the model's health. 
      Avoid generic fluff.`,
    });
    return response.text || "Insight pending data analysis...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error fetching AI insights. Please check your connection.";
  }
};
