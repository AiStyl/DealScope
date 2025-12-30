# DealScope Phase 1 - Functional APIs

## What's Included

```
src/
├── app/api/
│   ├── upload/route.ts    # POST: Upload documents to Supabase Storage
│   └── analyze/route.ts   # POST: Analyze with Claude, GET: Fetch findings
└── lib/
    ├── supabase.ts        # Supabase client & helper functions
    └── anthropic.ts       # Claude API integration & prompts
```

## Required Dependencies

Run this in your DEALSCOPE folder:

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js
```

## Required Environment Variables

Already configured in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `ANTHROPIC_API_KEY` ✅

Optional (for server-side storage access):
- `SUPABASE_SERVICE_ROLE_KEY` (get from Supabase dashboard → Settings → API)

## Supabase Storage Bucket

Create a storage bucket called `documents`:
1. Go to Supabase dashboard → Storage
2. Click "New bucket"
3. Name: `documents`
4. Public: Yes (for file access)
5. Click Create

## API Endpoints

### POST /api/upload
Upload a document for analysis.

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('dealId', 'optional-deal-id')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

### POST /api/analyze
Analyze a document with Claude.

```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'document-uuid',
    analysisType: 'contract' // or 'financial' or 'general'
  }),
})
```

### GET /api/analyze?documentId=xxx
Fetch analysis results for a document.

## Test Flow

1. Upload a PDF/TXT document via /api/upload
2. Get back document ID
3. Call /api/analyze with document ID
4. Claude analyzes and returns findings
5. Findings saved to Supabase `findings` table

## Architecture 404 Fix

The test case URL is incorrect:
- ❌ Wrong: `/arch/arch-01-dashboard.html`
- ✅ Correct: `/arch/arch-08-dashboard.html`

The file `arch-01-landing-page.html` exists but `arch-01-dashboard.html` does not.

## Next Steps

After deploying Phase 1:
1. Test upload endpoint with a real PDF
2. Verify Claude analysis returns findings
3. Check Supabase tables for saved data
4. Wire up Documents page UI to use these APIs
