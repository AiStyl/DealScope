# DealScope Phase 2 - Multi-Model Intelligence

## What's Included

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-multi/route.ts   # 3-model parallel analysis with consensus
│   │   ├── debate/route.ts          # Adversarial Claude vs GPT-4 debate
│   │   └── interrogate/route.ts     # RAG Q&A with document citations
│   ├── (marketing)/
│   │   ├── layout.tsx               # Marketing pages layout
│   │   └── page.tsx                 # Landing page (light theme)
│   └── how-it-works/
│       └── page.tsx                 # Transparency page for enterprise trust
```

## PhD-Level Differentiators

### 1. Multi-Model Consensus (`/api/analyze-multi`)
- Claude, GPT-4, and Gemini analyze **in parallel** using `Promise.all()`
- Each model has **specialized system prompts** for their strengths
- Statistical consensus via **standard deviation** calculation
- Disagreement detection triggers **human review flags**
- Model attribution on **every finding**

### 2. Adversarial Debate (`/api/debate`)
- Claude argues **FOR** a position
- GPT-4 **SEES Claude's argument** and argues **AGAINST**
- **Sequential, not parallel** - real responsive debate
- Gemini judges based on **evidence quality and logic**
- 2-round structure with rebuttals

### 3. RAG Interrogation (`/api/interrogate`)
- Context-aware Q&A using document text
- **Citations** with exact quoted text
- Conversation history maintained
- Automatic **risk flag detection**
- Suggested follow-up questions

## Required Dependencies

```bash
npm install openai
```

Note: @anthropic-ai/sdk and @supabase/supabase-js should already be installed from Phase 1.

## Environment Variables

Already configured from Phase 1:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `ANTHROPIC_API_KEY` ✅
- `OPENAI_API_KEY` ✅

Additional required:
- `GOOGLE_AI_API_KEY` - Get from https://makersuite.google.com/app/apikey

### Add Google AI Key to Vercel

1. Go to: https://vercel.com/aistyl/deal-scope/settings/environment-variables
2. Add: `GOOGLE_AI_API_KEY` = your key
3. Redeploy

## Deployment Steps

```powershell
# 1. Extract Phase 2 files to your DealScope folder
Expand-Archive -Path "C:\Users\utrdsweaeqwvbgf\Downloads\dealscope-phase2-multi-model.zip" -DestinationPath "C:\Users\utrdsweaeqwvbgf\Documents\PROJECTS\DEALSCOPE" -Force

# 2. Install OpenAI SDK (if not already installed)
cd "C:\Users\utrdsweaeqwvbgf\Documents\PROJECTS\DEALSCOPE"
npm install openai

# 3. Push to GitHub
git add .
git commit -m "Phase 2: Multi-model consensus, agent debate, RAG interrogation"
git push origin main
```

## API Endpoints

### POST /api/analyze-multi
Run 3-model parallel analysis with consensus scoring.

```javascript
const response = await fetch('/api/analyze-multi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'uuid-from-upload'
  }),
})

// Returns:
{
  analysis: {
    model_results: {
      claude: { risk_score: 72, findings_count: 5, ... },
      gpt4: { risk_score: 68, findings_count: 4, ... },
      gemini: { risk_score: 75, findings_count: 6, ... }
    },
    consensus: {
      score: 89,           // 100 = perfect agreement
      risk_score: 72,      // Mean across models
      stddev: 3.5,         // Low = agreement
      agreement_level: 'strong',
      interpretation: '...'
    },
    findings: [...]        // Merged with model attribution
  }
}
```

### POST /api/debate
Run adversarial debate with AI models.

```javascript
const response = await fetch('/api/debate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'The MAC clause exclusions adequately protect the buyer',
    documentId: 'uuid-for-context',  // optional
    rounds: 2                         // 1-3 rounds
  }),
})

// Returns:
{
  debate: {
    rounds: [{
      for_argument: { model: 'Claude', argument: '...', key_points: [...] },
      against_argument: { model: 'GPT-4', argument: '...', key_points: [...] }
    }, ...],
    verdict: {
      winner: 'FOR' | 'AGAINST' | 'TIE',
      confidence: 0.85,
      reasoning: '...',
      recommendation: '...'
    }
  }
}
```

### POST /api/interrogate
Ask questions about documents with citations.

```javascript
const response = await fetch('/api/interrogate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'uuid',
    question: 'What is the indemnification cap?',
    conversationHistory: []  // Optional for follow-ups
  }),
})

// Returns:
{
  response: {
    answer: 'The indemnification cap is $25,000,000...',
    citations: [{ text: '"indemnification shall not exceed..."', confidence: 0.95 }],
    follow_up_questions: ['What are the exceptions to the cap?', ...],
    risk_flags: ['Cap is below market standard']
  }
}
```

## New Pages

### Landing Page
- URL: `/` (via route group)
- Light theme matching existing design
- Value prop focused on multi-model consensus
- "Not an API wrapper" messaging
- CTA to launch app

### How It Works
- URL: `/how-it-works`
- Full transparency about AI architecture
- Multi-model flow diagram
- Adversarial debate explanation
- "What we DON'T claim" section
- Security & compliance info

## Testing After Deploy

### 1. Test Multi-Model Analysis
```bash
# First upload a document (using existing /api/upload)
curl -X POST https://deal-scope-gamma.vercel.app/api/upload \
  -F "file=@your-document.pdf"

# Then run multi-model analysis
curl -X POST https://deal-scope-gamma.vercel.app/api/analyze-multi \
  -H "Content-Type: application/json" \
  -d '{"documentId": "uuid-from-upload"}'
```

### 2. Test Agent Debate
```bash
curl -X POST https://deal-scope-gamma.vercel.app/api/debate \
  -H "Content-Type: application/json" \
  -d '{"topic": "The indemnification cap is adequate", "rounds": 1}'
```

### 3. Test RAG Interrogation
```bash
curl -X POST https://deal-scope-gamma.vercel.app/api/interrogate \
  -H "Content-Type: application/json" \
  -d '{"documentId": "uuid", "question": "What is the purchase price?"}'
```

## Why This Is NOT An API Wrapper

1. **Multi-Model Consensus**: Statistical validation via standard deviation
2. **Specialized Prompts**: Each model has domain-specific instructions
3. **Adversarial Debate**: Models see and respond to each other's arguments
4. **Disagreement Detection**: High variance triggers human review flag
5. **Model Attribution**: Every finding tagged with source model
6. **Transparent Reasoning**: Full audit trail for SOC 2 compliance

## Next Steps After Phase 2

- Wire existing UI pages to new APIs
- Add streaming responses for real-time UX
- PDF report generation with jsPDF
- Supabase Auth for user management
- Demo video recording

---

Built by JJ (CloudSprint Labs) - Managing Director + AI Platform Builder
Target: Anthropic, OpenAI, Google, Microsoft, Amazon
