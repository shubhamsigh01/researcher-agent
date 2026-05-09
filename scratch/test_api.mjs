import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const GEMINI_API_KEY = env.match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim();

const ai = new GoogleGenAI({ 
  apiKey: GEMINI_API_KEY || "",
  apiVersion: 'v1'
});

async function test() {
  console.log("Testing with v1 and gemini-1.5-flash...");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Who won the super bowl in 2025?',
    });
    console.log("Success! Response text:", response.text);
  } catch (err) {
    console.error("Test Failed!");
    console.error("Message:", err.message);
  }
}

test();
