import { NextResponse } from 'next/server';

export const maxDuration = 60;

// ─── Groq Configuration (Primary) ───────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',   // Best quality, 70B parameter
  'llama-3.1-8b-instant',      // Fast fallback
  'mixtral-8x7b-32768',        // Good for longer outputs
];

// ─── Gemini Configuration (Fallback + Grounding) ────────────────────────────
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

// ─── Groq API Call ──────────────────────────────────────────────────────────
async function callGroq(
  systemPrompt: string,
  userMessage: string
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[Groq] Trying model: ${model}`);
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.2,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const status = res.status;
        console.error(`[Groq] ${model} failed (${status}):`, JSON.stringify(err).substring(0, 200));
        lastError = new Error(err?.error?.message || `Groq ${status}`);
        // Retry on rate limit or server errors
        if (status === 429 || status === 503) continue;
        break;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      if (text) {
        console.log(`[Groq] Success with model: ${model}`);
        return { text, model };
      }
    } catch (err: any) {
      console.error(`[Groq] ${model} exception:`, err.message?.substring(0, 200));
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq models failed');
}

// ─── Gemini API Call (Fallback) ─────────────────────────────────────────────
async function callGemini(
  systemPrompt: string,
  userMessage: string
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  // Dynamic import to avoid issues if package isn't available
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });

  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[Gemini Fallback] Trying model: ${model}`);
      const response = await client.models.generateContent({
        model,
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      const text = (response.text || '').replace(/```json\n?|```\n?/g, '').trim();
      if (text) {
        console.log(`[Gemini Fallback] Success with model: ${model}`);
        return { text, model };
      }
    } catch (err: any) {
      const status = err.status || err.error?.code || 0;
      console.error(`[Gemini] ${model} failed (${status}):`, err.message?.substring(0, 200));
      lastError = err;
      if (status !== 404 && status !== 429 && status !== 503) break;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// ─── Gemini Grounding (Optional, best-effort) ──────────────────────────────
async function getGroundingSources(query: string): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return [];

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Find the most relevant and recent web sources about: ${query}`,
      config: {
        tools: [{ googleSearch: {} }] as any,
        temperature: 0.1,
      },
    });

    const metadata = response.candidates?.[0]?.groundingMetadata;
    const sources = ((metadata as any)?.groundingChunks || [])
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => {
        let domain = '';
        try { domain = new URL(chunk.web.uri).hostname; } catch { domain = chunk.web.uri; }
        return { title: chunk.web.title, url: chunk.web.uri, domain, description: '' };
      });

    console.log(`[Grounding] Found ${sources.length} sources`);
    return sources;
  } catch (err: any) {
    console.warn('[Grounding] Failed (non-fatal):', err.message?.substring(0, 100));
    return [];
  }
}

// ─── Main Route Handler ─────────────────────────────────────────────────────
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

You MUST output valid JSON with this exact structure (no markdown, no code fences):
{
  "key_findings": ["finding 1", "finding 2", "finding 3"],
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
}`;

    console.log('Starting AI generation for query:', query);

    let responseText = '';
    let usedProvider = '';

    // ── Strategy: Groq first (primary), Gemini as fallback ──
    try {
      const result = await callGroq(systemInstruction, `Research this topic thoroughly: ${query}`);
      responseText = result.text.replace(/```json\n?|```\n?/g, '').trim();
      usedProvider = `Groq/${result.model}`;
    } catch (groqErr: any) {
      console.warn('[Primary] Groq failed, trying Gemini fallback:', groqErr.message?.substring(0, 100));

      try {
        const result = await callGemini(systemInstruction, `Research this topic thoroughly: ${query}`);
        responseText = result.text;
        usedProvider = `Gemini/${result.model}`;
      } catch (geminiErr: any) {
        console.error('[Fallback] Gemini also failed:', geminiErr.message?.substring(0, 200));
        return NextResponse.json({
          error: 'AI Generation Failed',
          details: `Primary (Groq): ${groqErr.message?.substring(0, 200)}. Fallback (Gemini): ${geminiErr.message?.substring(0, 200)}`,
          hint: 'Check your GROQ_API_KEY and GEMINI_API_KEY environment variables.'
        }, { status: 502 });
      }
    }

    console.log(`Generation complete via ${usedProvider}`);

    // ── Parse JSON response ──
    let reportData;
    try {
      reportData = JSON.parse(responseText);
    } catch {
      try {
        const fallbackMatch = responseText.match(/\{[\s\S]*\}/);
        if (!fallbackMatch) throw new Error('Regex extraction failed');
        reportData = JSON.parse(fallbackMatch[0]);
      } catch {
        return NextResponse.json(
          { error: 'Failed to process AI response structure', raw: responseText.substring(0, 500) },
          { status: 502 }
        );
      }
    }

    // ── Optional: Get grounded web sources via Gemini (best-effort) ──
    const sources = await getGroundingSources(query);

    return NextResponse.json({
      research: {
        title: `Research: ${query}`,
        summary: reportData.sections?.[0]?.content?.substring(0, 300) + '...' || 'No overview available.',
        sections: (reportData.sections || []).map((s: any) => ({
          heading: s.title || 'Section',
          content: s.content || ''
        })),
        keyFindings: reportData.key_findings || [],
        keyMetrics: reportData.key_metrics || [],
        comparisons: reportData.comparisons || [],
        sources,
        tags: [usedProvider, sources.length > 0 ? 'Web Grounded' : 'Knowledge-Based'],
        confidence: reportData.confidence_score >= 8 ? 'high' : reportData.confidence_score >= 5 ? 'medium' : 'low',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Research API Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}