import { NextRequest } from 'next/server'
import type { ModelType } from '@/types'

// Streaming endpoint for real-time AI responses
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { query, model = 'claude' as ModelType, stream = true } = body

  if (!stream) {
    // Non-streaming response
    const response = await generateResponse(model, query)
    return Response.json(response)
  }

  // Streaming response using Server-Sent Events
  const encoder = new TextEncoder()
  
  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Send start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', model })}\n\n`))

        // Generate and stream the response
        const response = await generateStreamingResponse(model, query, (chunk) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`))
        })

        // Send completion event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete', 
          content: response.content,
          confidence: response.confidence,
          tokens: response.tokens
        })}\n\n`))

        controller.close()
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream error' })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function generateResponse(model: ModelType, query: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  return {
    model,
    content: `Analysis of "${query.slice(0, 50)}...":\n\nBased on the document review, I've identified key areas requiring attention. The primary considerations include risk assessment, valuation analysis, and contract terms review.`,
    confidence: 0.85 + Math.random() * 0.1,
    tokens: 250 + Math.floor(Math.random() * 150),
  }
}

async function generateStreamingResponse(
  model: ModelType, 
  query: string,
  onChunk: (chunk: string) => void
) {
  const fullResponse = `Based on my analysis of the query "${query.slice(0, 30)}...":\n\n**Key Findings:**\n\n1. The document contains standard M&A provisions with some notable variations from market terms.\n\n2. Risk assessment indicates moderate exposure in areas of customer concentration and IP ownership.\n\n3. Financial metrics show a premium valuation relative to comparable transactions.\n\n**Recommendations:**\n\n- Negotiate adjustment to indemnification cap\n- Require customer consent as closing condition\n- Conduct additional IP due diligence\n\n**Confidence Level:** High (based on comprehensive document analysis)`

  const words = fullResponse.split(' ')
  
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20))
    onChunk(word + ' ')
  }

  return {
    content: fullResponse,
    confidence: 0.89,
    tokens: words.length * 1.3,
  }
}
