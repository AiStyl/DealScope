'use client'

import { useState, useCallback } from 'react'
import type { AgentResponse, ConsensusResult } from '@/types'

// Hook for multi-agent analysis
export function useMultiAgentAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    type: 'single' | 'consensus'
    responses: AgentResponse[]
    consensus?: ConsensusResult
  } | null>(null)

  const analyze = useCallback(async (query: string, documentContent?: string, forceConsensus = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, documentContent, forceConsensus }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResult(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { analyze, isLoading, error, result }
}

// Hook for streaming responses
export function useStreamingResponse() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [tokens, setTokens] = useState<string>('')
  const [thinking, setThinking] = useState<string[]>([])
  const [metadata, setMetadata] = useState<{ tokens?: number; confidence?: number } | null>(null)

  const startStream = useCallback(async (query: string, model: string = 'claude') => {
    setIsStreaming(true)
    setTokens('')
    setThinking([])
    setMetadata(null)

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Stream failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n').filter(Boolean)

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            
            switch (data.type) {
              case 'thinking':
                setThinking(prev => [...prev, data.content])
                break
              case 'token':
                setTokens(prev => prev + data.content)
                break
              case 'complete':
                setMetadata(data.metadata)
                break
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err)
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const reset = useCallback(() => {
    setTokens('')
    setThinking([])
    setMetadata(null)
    setIsStreaming(false)
  }, [])

  return { startStream, reset, isStreaming, tokens, thinking, metadata }
}

// Hook for deals data
export function useDeals() {
  const [deals, setDeals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchDeals = useCallback(async () => {
    setIsLoading(true)
    try {
      // In production, this would fetch from Supabase
      // For demo, we use mock data
      const { MOCK_DEALS } = await import('@/lib/ai/mockData')
      setDeals(MOCK_DEALS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { deals, isLoading, fetchDeals }
}

// Hook for findings
export function useFindings(dealId?: string) {
  const [findings, setFindings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchFindings = useCallback(async () => {
    setIsLoading(true)
    try {
      // In production, this would fetch from Supabase
      const { MOCK_FINDINGS } = await import('@/lib/ai/mockData')
      setFindings(dealId ? MOCK_FINDINGS.filter(f => f.dealId === dealId) : MOCK_FINDINGS)
    } finally {
      setIsLoading(false)
    }
  }, [dealId])

  return { findings, isLoading, fetchFindings }
}
