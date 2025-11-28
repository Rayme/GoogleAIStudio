import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SalesDataSchema, ExtractedSalesData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Helper to retry functions with exponential backoff
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`API call failed, retrying... (${retries} attempts left). Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Helper to strip markdown code blocks from JSON strings
 */
const cleanJsonString = (str: string) => {
  if (!str) return "";
  return str.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
};

/**
 * Analyzes a screenshot of an Amazon Seller dashboard.
 * Uses gemini-3-pro-preview for complex visual reasoning.
 */
export const analyzeScreenshot = async (base64Image: string): Promise<{ data: ExtractedSalesData | null; advice: string }> => {
  return withRetry(async () => {
    try {
      // 1. Extract structured data
      const extractionResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          {
            text: "Extract key sales metrics from this Amazon Seller dashboard. If a metric is not visible, exclude it."
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: SalesDataSchema
        }
      });

      const dataText = extractionResponse.text;
      let extractedData: ExtractedSalesData | null = null;
      
      if (dataText) {
        try {
          extractedData = JSON.parse(cleanJsonString(dataText));
        } catch (e) {
          console.error("Failed to parse extracted JSON:", e);
        }
      }

      // 2. Generate advice based on the image
      const adviceResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          {
            text: "Analyze this seller dashboard screenshot. Identify critical issues (like low inventory, suppressed listings, or dropping sales) and provide 3 specific, actionable steps to improve performance immediately. Be professional and direct."
          }
        ]
      });

      return {
        data: extractedData,
        advice: adviceResponse.text || "Could not generate advice."
      };

    } catch (error) {
      console.error("Screenshot analysis failed:", error);
      throw error;
    }
  });
};

/**
 * Conducts market research using Google Search Grounding.
 * Uses gemini-2.5-flash for speed and tool capability.
 */
export const conductMarketResearch = async (query: string): Promise<AnalysisResult> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Perform market research for an Amazon seller regarding: ${query}. Focus on current trends, competitor strategies, and demand.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title)
        .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

      // Remove duplicate sources based on URI
      const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as { title: string; uri: string }[];

      return {
        markdown: response.text || "No insights found.",
        sources: uniqueSources,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error("Market research failed:", error);
      throw error;
    }
  });
};

/**
 * Generates a strategic action plan based on text input.
 * Uses gemini-3-pro-preview for deep reasoning.
 */
export const generateStrategy = async (context: string): Promise<string> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are an expert Amazon FBA consultant. Based on the following user situation, provide a detailed, step-by-step action plan to increase profitability and ranking.
        
        User Context: ${context}`,
        config: {
          thinkingConfig: { thinkingBudget: 1024 } // Enable some thinking for better strategy
        }
      });

      return response.text || "Unable to generate strategy.";
    } catch (error) {
      console.error("Strategy generation failed:", error);
      throw error;
    }
  });
};

/**
 * Identifies and analyzes top competitors using Google Search.
 */
export const analyzeCompetitors = async (product: string): Promise<AnalysisResult> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Identify the top 5 competitors on Amazon for: "${product}". 
        For each competitor, list:
        1. Average product rating
        2. Pricing strategy (e.g., premium, budget)
        3. Unique Selling Propositions (USPs) highlighted in their listings.
        
        Finally, suggest how I can differentiate my products or adjust my pricing based on this analysis.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title)
        .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

      const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as { title: string; uri: string }[];

      return {
        markdown: response.text || "No competitor data found.",
        sources: uniqueSources,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Competitor analysis failed:", error);
      throw error;
    }
  });
};

/**
 * Analyzes customer review sentiment and recurring themes.
 * Uses gemini-3-pro-preview for complex text analysis.
 */
export const analyzeReviews = async (reviewsText: string): Promise<string> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the sentiment of the following customer reviews for my products over the last 6 months.
        
        1. Categorize reviews into Positive, Negative, and Neutral.
        2. List the top 3 recurring complaints.
        3. List the top 3 recurring praises.
        4. Provide actionable recommendations for improving product quality or customer satisfaction based on this feedback.
        
        Reviews Data:
        ${reviewsText}`,
        config: {
          thinkingConfig: { thinkingBudget: 1024 }
        }
      });

      return response.text || "Unable to analyze reviews.";
    } catch (error) {
      console.error("Review analysis failed:", error);
      throw error;
    }
  });
};
