'use client'

import { useState, useCallback, useRef } from 'react'
import type { ModelType } from '@/types'

interface StreamingState {
  isStreaming: boolean
  content: string
  error: string | null
  model: ModelType | null
  tokens: number
  confidence: number | null
}

interface UseStreamingOptions {
  onStart?: (model: ModelType) => void
  onToken?: (token: string) => void
  onComplete?: (result: { content: string; confidence: number; tokens: number }) => void
  onError?: (error: string) => void
}

export function useStreaming(options: UseStreamingOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    content: '',
    error: null,
    model: null,
    tokens: 0,
    confidence: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const startStreaming = useCallback(async (
    query: string,
    model: ModelType = 'claude'
  ) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setState({
      isStreaming: true,
      content: '',
      error: null,
      model,
      tokens: 0,
      confidence: null,
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model, stream: true }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Stream request failed')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'start') {
                options.onStart?.(data.model)
              } else if (data.type === 'token') {
                fullContent += data.content
                setState(prev => ({ ...prev, content: fullContent }))
                options.onToken?.(data.content)
              } else if (data.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  isStreaming: false,
                  content: data.content,
                  tokens: data.tokens,
                  confidence: data.confidence,
                }))
                options.onComplete?.({
                  content: data.content,
                  confidence: data.confidence,
                  tokens: data.tokens,
                })
              } else if (data.type === 'error') {
                throw new Error(data.message)
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return // Intentional abort
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }))
      options.onError?.(errorMessage)
    }
  }, [options])

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState(prev => ({ ...prev, isStreaming: false }))
  }, [])

  const reset = useCallback(() => {
    stopStreaming()
    setState({
      isStreaming: false,
      content: '',
      error: null,
      model: null,
      tokens: 0,
      confidence: null,
    })
  }, [stopStreaming])

  return {
    ...state,
    startStreaming,
    stopStreaming,
    reset,
  }
}

// Hook for multi-model streaming (all 3 models at once)
export function useMultiModelStreaming() {
  const [streams, setStreams] = useState<Record<ModelType, StreamingState>>({
    claude: { isStreaming: false, content: '', error: null, model: 'claude', tokens: 0, confidence: null },
    'gpt-4': { isStreaming: false, content: '', error: null, model: 'gpt-4', tokens: 0, confidence: null },
    gemini: { isStreaming: false, content: '', error: null, model: 'gemini', tokens: 0, confidence: null },
  })

  const startAllStreams = useCallback(async (query: string) => {
    const models: ModelType[] = ['claude', 'gpt-4', 'gemini']

    // Reset all streams
    setStreams(prev => {
      const newState = { ...prev }
      models.forEach(m => {
        newState[m] = { ...newState[m], isStreaming: true, content: '', error: null }
      })
      return newState
    })

    // Start all streams in parallel
    await Promise.all(
      models.map(async (model) => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, model, stream: true }),
          })

          const reader = response.body?.getReader()
          if (!reader) return

          const decoder = new TextDecoder()
          let fullContent = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === 'token') {
                    fullContent += data.content
                    setStreams(prev => ({
                      ...prev,
                      [model]: { ...prev[model], content: fullContent }
                    }))
                  } else if (data.type === 'complete') {
                    setStreams(prev => ({
                      ...prev,
                      [model]: {
                        ...prev[model],
                        isStreaming: false,
                        content: data.content,
                        tokens: data.tokens,
                        confidence: data.confidence,
                      }
                    }))
                  }
                } catch (e) {}
              }
            }
          }
        } catch (error) {
          setStreams(prev => ({
            ...prev,
            [model]: { ...prev[model], isStreaming: false, error: 'Stream failed' }
          }))
        }
      })
    )
  }, [])

  const reset = useCallback(() => {
    setStreams({
      claude: { isStreaming: false, content: '', error: null, model: 'claude', tokens: 0, confidence: null },
      'gpt-4': { isStreaming: false, content: '', error: null, model: 'gpt-4', tokens: 0, confidence: null },
      gemini: { isStreaming: false, content: '', error: null, model: 'gemini', tokens: 0, confidence: null },
    })
  }, [])

  return {
    streams,
    startAllStreams,
    reset,
    isAnyStreaming: Object.values(streams).some(s => s.isStreaming),
    allComplete: Object.values(streams).every(s => !s.isStreaming && (s.content || s.error)),
  }
}
