# DealScope Phase 1 - Functional APIs

## What's Included

```
src/
├── app/api/
│   ├── upload/route.ts         # POST: Upload documents to Supabase Storage
│   ├── analyze/route.ts        # POST: Analyze with Claude, GET: Fetch findings
│   └── documents/[id]/route.ts # GET: Document + signed URL, DELETE: Remove doc
└── lib/
    ├── supabase.ts             # Supabase client & helper functions
    └── anthropic.ts            # Claude API integration & prompts
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

Optional (recommended for server-side storage access):
- `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase dashboard → Settings → API → service_role key

## Supabase Storage Bucket ✅ DONE

You've created a PRIVATE `documents` bucket - this is correct for M&A confidentiality.

**How it works:**
- Files are NOT publicly accessible
- API generates **signed URLs** (temporary links that expire)
- Default expiry: 7 days for uploads, 1 hour for viewing

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
// Returns: { document: {..., signed_url: "..."}, success: true }
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
// Returns: { analysis: {...}, findings: [...] }
```

### GET /api/documents/[id]
Get document details with fresh signed URL.

```javascript
const response = await fetch('/api/documents/abc-123')
// Returns: { document: {..., signed_url: "fresh-url"}, findings: [...] }
```

### DELETE /api/documents/[id]
Delete a document and its findings.

## Test Flow

1. Upload a PDF/TXT via /api/upload → Get document ID + signed URL
2. Call /api/analyze with document ID → Claude analyzes
3. Findings saved to Supabase `findings` table
4. Call /api/documents/[id] to get fresh signed URL when needed

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
