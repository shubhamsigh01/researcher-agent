import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

// Models to try in order - cycling finds one that works with current quota
// Only includes verified, real Gemini model IDs
const MODEL_CANDIDATES = [
  'gemini-2.0-flash',       // Most reliable, generous free-tier quota
  'gemini-2.0-flash-lite',  // Lightweight fallback, fast and cheap
  'gemini-2.5-flash',       // More capable but tighter rate limits
  'gemini-1.5-flash',       // Stable fallback
];

let ai: GoogleGenAI;
function getAI() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '' });
  }
  return ai;
}

export async function POST(req: Request) {
  try {
    // We'll use the standard SDK as primary for better compatibility
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

    const { goal = 'Research', depth = 'Detailed', role = 'Analyst', mode = 'research' } = body;

    const rolePrompt =
      role === 'Teacher' ? 'You are an expert teacher who explains complex concepts simply and clearly, focusing on core understanding.' :
        role === 'Advisor' ? 'You are a strategic advisor providing actionable insights, practical steps, and strategic direction.' :
          'You are an expert analytical research assistant who conducts thorough data-driven research and synthesizes findings.';

    const depthPrompt =
      depth === 'Basic' ? 'Keep the analysis high-level, easy to digest, and brief.' :
        depth === 'Expert' ? 'Provide highly technical, deep, and nuanced analysis suitable for domain experts.' :
          'Provide a balanced, detailed, and comprehensive report.';

    const goalPrompt =
      goal === 'Learn' ? 'Your goal is to help the user learn and understand the topic from first principles.' :
        goal === 'Invest' ? 'Your goal is to analyze market trends, risks, and potential opportunities for investment.' :
          goal === 'Build' ? 'Your goal is to provide step-by-step guidance, tools, and technical architectures for building.' :
            'Your goal is to provide an objective, well-researched synthesis of the topic.';

    const systemInstruction = `${rolePrompt}
    ${goalPrompt}
    ${depthPrompt}
    ${mode === 'chat' ? 'Provide a fast, conversational response formatted cleanly.' : 'Conduct thorough research.'}

    Output your response in raw JSON format with the following structure. Do NOT wrap it in markdown blockquotes, just return the raw JSON:
    {
      "key_findings": ["finding 1", "finding 2"],
      "sections": [
        { "title": "Section Title", "content": "Detailed content..." }
      ],
      "key_metrics": [
        { "label": "Metric A", "value": 85 },
        { "label": "Metric B", "value": 42 }
      ],
      "comparisons": [
        { "feature": "Speed", "option_a": "Fast", "option_b": "Slow" }
      ],
      "confidence_score": 9
    }
    CRITICAL: You must escape any double quotes inside your text content using a backslash (\\") to ensure valid JSON. Do not use unescaped double quotes inside string values.`;

    console.log("Starting AI generation for query:", query);

    let responseText = "";
    let sources: any[] = [];
    let lastError: any = null;
    let successModel = "";

    const client = getAI();

    // Phase 1: Try plain generation WITHOUT googleSearch (uses much less quota)
    for (let i = 0; i < MODEL_CANDIDATES.length; i++) {
      const modelId = MODEL_CANDIDATES[i];
      try {
        console.log(`[Phase 1 - no grounding] Trying model: ${modelId}`);
        const response = await client.models.generateContent({
          model: modelId,
          contents: `Research this topic thoroughly using your training knowledge: ${query}`,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        responseText = (response.text || "").replace(/```json\n?|```\n?/g, '').trim();

        if (responseText) {
          successModel = modelId;
          console.log(`Phase 1 success with model: ${modelId}`);
          break;
        }
      } catch (err: any) {
        const status = err.status || (err.error?.code) || 0;
        const message = err.message || JSON.stringify(err);
        console.error(`Model ${modelId} failed (Status: ${status}):`, message.substring(0, 200));

        lastError = err;
        if (status !== 404 && status !== 429 && status !== 503) {
          break;
        }
        if (i < MODEL_CANDIDATES.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Phase 2: If we found a working model, try to get grounded sources (optional, best-effort)
    if (successModel) {
      try {
        console.log(`[Phase 2 - grounding] Trying googleSearch with: ${successModel}`);
        const groundedResponse = await client.models.generateContent({
          model: successModel,
          contents: `Find the most relevant and recent web sources about: ${query}. Return a brief summary.`,
          config: {
            tools: [{ googleSearch: {} }] as any,
            temperature: 0.1,
          },
        });

        const metadata = groundedResponse.candidates?.[0]?.groundingMetadata;
        sources = ((metadata as any)?.groundingChunks || [])
          .filter((chunk: any) => chunk.web)
          .map((chunk: any) => {
            let domain = "";
            try { domain = new URL(chunk.web.uri).hostname; } catch { domain = chunk.web.uri; }
            return { title: chunk.web.title, url: chunk.web.uri, domain, description: "" };
          });
        console.log(`Phase 2 grounding success: ${sources.length} sources found`);
      } catch (err: any) {
        // Grounding failed (likely quota) - continue without sources, this is non-fatal
        console.warn("Grounding failed (non-fatal), continuing without web sources:", err.message?.substring(0, 100));
      }
    }

    if (!responseText) {
      const errorMessage = lastError?.message || 'All models exhausted';
      const is429 = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate');
      return NextResponse.json({
        error: 'AI Generation Failed',
        details: is429
          ? 'API rate limit reached. Free-tier quota resets every minute — please wait a moment and try again.'
          : errorMessage.substring(0, 500),
        hint: 'If this persists, generate a new API key at https://aistudio.google.com/app/apikey'
      }, { status: 429 });
    }


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

    // Use sources from either SDK path
    const finalSources = sources;

    return NextResponse.json({
      research: {
        title: `Research: ${query}`,
        summary: reportData.sections?.[0]?.content?.substring(0, 300) + '...' || "No overview available.",
        sections: (reportData.sections || []).map((s: any) => ({
          heading: s.title || "Section",
          content: s.content || ""
        })),
        keyFindings: reportData.key_findings || [],
        keyMetrics: reportData.key_metrics || [],
        comparisons: reportData.comparisons || [],
        sources: finalSources,
        tags: ["Gemini 2.5", "Web Grounding"],
        confidence: reportData.confidence_score >= 8 ? "high" : reportData.confidence_score >= 5 ? "medium" : "low",
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("Research API Error:", error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}