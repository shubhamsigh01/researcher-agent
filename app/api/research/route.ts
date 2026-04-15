import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const query = [
      body.query,
      body.question,
      body.prompt,
      body.input,
      body.message,
      body.messages?.at(-1)?.content
    ].find(Boolean);

    if (!query) {
      return NextResponse.json({ error: 'Missing research query in payload' }, { status: 400 });
    }

    const systemInstruction = `You are an expert research assistant. Conduct thorough research and synthesize the findings into a comprehensive report.
    Output your response in raw JSON format with the following structure. Do NOT wrap it in markdown blockquotes, just return the raw JSON:
    {
      "key_findings": ["finding 1", "finding 2"],
      "sections": [
        { "title": "Section Title", "content": "Detailed content..." }
      ],
      "confidence_score": 9
    }
    CRITICAL: You must escape any double quotes inside your text content using a backslash (\\") to ensure valid JSON. Do not use unescaped double quotes inside string values.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Research this topic: ${query}`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const responseText = (response.text || "").replace(/```json\n?|```\n?/g, '').trim();
    
    let reportData;
    
    try {
      reportData = JSON.parse(responseText);
    } catch {
      try {
        const fallbackMatch = responseText.match(/\{[\s\S]*\}/);
        if (!fallbackMatch) throw new Error("Regex extraction failed");
        reportData = JSON.parse(fallbackMatch[0]);
      } catch {
        return NextResponse.json(
          { error: 'Failed to process AI response structure' },
          { status: 502 }
        );
      }
    }

    const metadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (metadata?.groundingChunks || [])
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => {
        let domain = "";
        try { 
          domain = new URL(chunk.web.uri).hostname; 
        } catch {
           domain = chunk.web.uri;
        }
        
        return { 
          title: chunk.web.title, 
          url: chunk.web.uri, 
          domain,
          description: "" 
        };
      });

    return NextResponse.json({ 
      research: {
        title: `Research: ${query}`,
        summary: reportData.sections?.[0]?.content?.substring(0, 300) + '...' || "No overview available.",
        sections: (reportData.sections || []).map((s: any) => ({
          heading: s.title || "Section",
          content: s.content || ""
        })),
        keyFindings: reportData.key_findings || [],
        sources,
        tags: ["Gemini 2.5", "Web Grounding"],
        confidence: reportData.confidence_score >= 8 ? "high" : reportData.confidence_score >= 5 ? "medium" : "low",
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}