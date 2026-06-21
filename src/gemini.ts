// src/gemini.ts
import { GoogleGenAI } from "@google/genai";

// 讀取 Vite 前端的環境變數
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 初始化 Gemini 
export const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// 建立一個可以直接呼叫的對話功能
export async function askGemini(prompt: string) {
  if (!ai) {
    throw new Error("找不到 API Key，請檢查環境變數設定。");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: prompt,
  });
  
  return response.text; // 回傳 AI 的回答文字
}