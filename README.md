# Autonomous Research Agent

A specialized Next.js web application utilizing **Google Gemini 2.5 Flash** with native **Google Search Grounding** to perform fully autonomous internet research and synthesize facts into beautiful, highly-cited reports.

This project orchestrates complex LLM pipelines while delivering real-time responsive visualizations using Framer Motion and an advanced dark-mode aesthetic.

## Features

- **Live Google Search Grounding:** Bypasses LLM knowledge cutoffs by actively retrieving real-time data from the web using Google Search tool native integration.
- **Complex JSON Synthesizer:** Forces Gemini to output rigorous nested JSON (Key Findings, Detailed Sections, Confidence Scores, Live Metadata).
- **Cited Sources:** Dynamically extracts the parsed URLs and domains used by Gemini and renders them as clickable reference cards in the UI.
- **Dynamic Animations:** Real-time staggered loading stages via `framer-motion` (`motion/react`) alongside floating ambient particles.
- **Tailwind UI Component System:** Integrated Shadcn-like CSS structure powered by raw OKLCH definitions for pure, performant color gradients.

## Tech Stack Overview

- **Framework:** Next.js 14 (App Router)
- **AI SDK:** `@google/genai` (Gemini SDK)
- **Styling:** Tailwind CSS v3.4 
- **Icons:** `lucide-react`
- **Animations:** `motion` (React Framer-Motion v12)

## Environment Configuration

Create a `.env` file in the root of the project with the following:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Running the Application

1. Install all dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Project Structure

```
├── app/
│   ├── api/research/route.ts   # Core Gemini grounding & robust JSON parsing loop
│   ├── page.tsx                # Main App Router interface and state orchestrator
│   ├── globals.css             # Tailwind imports & OKLCH color palettes
│   └── layout.tsx              # Root HTML wrapper
├── components/                 
│   ├── AILogo.tsx              # SVG logo and pulsing animations
│   ├── FloatingParticles.tsx   # Ambient background decoration
│   ├── ResearchInput.tsx       # Textarea input block
│   ├── ResearchProgress.tsx    # Staggered loading components
│   ├── ResearchResults.tsx     # The primary report renderer
│   ├── Sidebar.tsx             # History navigation mapping
│   ├── SourceCard.tsx          # Real-time search reference mapper
│   └── ui/                     # Auxiliary Shadcn-like foundation pieces
└── tailwind.config.js          # Customized standard variable maps
```

## Troubleshooting

- **Payload Extraction Issues:** The backend API handles any key variation (`question`, `query`, `prompt`, `input`) robustly.
- **JSON Parsing Errors:** The API uses a dual-layer strategy—prompt injection (`CRITICAL: Use \"...`) combined with a Regex fallback parsing script to ensure that standard Markdown wrapper bugs don't crash the Node JSON decoder. 
