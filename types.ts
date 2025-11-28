import { Type } from "@google/genai";

export enum AnalysisType {
  SALES = 'SALES',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  SCREENSHOT = 'SCREENSHOT',
  STRATEGY = 'STRATEGY',
  COMPETITORS = 'COMPETITORS',
  REVIEWS = 'REVIEWS'
}

export interface AnalysisResult {
  markdown: string;
  charts?: {
    name: string;
    value: number;
  }[];
  sources?: {
    title: string;
    uri: string;
  }[];
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Schema definition for structured data extraction from screenshots
export const SalesDataSchema = {
  type: Type.OBJECT,
  properties: {
    totalSales: { type: Type.NUMBER, description: "Total sales amount found in the image" },
    unitsSold: { type: Type.NUMBER, description: "Number of units sold" },
    conversionRate: { type: Type.NUMBER, description: "Conversion rate percentage (0-100)" },
    topProducts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          performance: { type: Type.STRING }
        }
      }
    },
    issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any warnings, alerts or negative trends identified"
    }
  }
};

export interface ExtractedSalesData {
  totalSales?: number;
  unitsSold?: number;
  conversionRate?: number;
  topProducts?: { name: string; performance: string }[];
  issues?: string[];
}