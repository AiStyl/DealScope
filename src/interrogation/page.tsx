'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Send,
  FileText,
  Loader2,
  AlertTriangle,
  Quote,
  Lightbulb,
  ChevronDown,
  RefreshCw,
  X,
  Brain,
  BookOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Document {
  id: string
  name: string
  status: string
  created_at: string
}

interface Citation {
  text: string
  section?: string
  confidence: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  follow_up_questions?: string[]
  risk_flags?: string[]
  timestamp: Date
}

export default function InterrogationPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true)
      const response = await fetch('/api/upload')
      const data = await response.json()
      if (data.documents) {
        setDocuments(data.documents.filter((d: Document) => d.status === 'analyzed'))
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  // Fetch suggested questions when document selected
  const fetchSuggestions = useCallback(async (docId: string) => {
    try {
      const response = await fetch(`/api/interrogate?documentId=${docId}`)
      const data = await response.json()
      if (data.suggested_questions) {
        setSuggestedQuestions(data.suggested_questions)
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    if (selectedDoc) {
      fetchSuggestions(selectedDoc)
      setMessages([])
    }
  }, [selectedDoc, fetchSuggestions])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async (question?: string) => {
    const messageText = question || input.trim()
    if (!messageText || !selectedDoc) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // Build conversation history
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/interrogate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          question: messageText,
          conversationHistory,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response.answer,
          citations: data.response.citations,
          follow_up_questions: data.response.follow_up_questions,
          risk_flags: data.response.risk_flags,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        setError(data.error || 'Failed to get response')
      }
    } catch (err) {
      console.error('Interrogation error:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedDocument = documents.find((d) => d.id === selectedDoc)

  return (
    <MainLayout
      title="Document Interrogation"
      subtitle="Ask questions about your documents and get cited answers"
    >
      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Document Selector */}
        <div className="col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <Button variant="secondary" size="sm" onClick={fetchDocuments}>
                <RefreshCw className={cn('w-3 h-3', loadingDocs && 'animate-spin')} />
              </Button>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No analyzed documents</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload and analyze a document first
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition',
                      selectedDoc === doc.id
                        ? 'bg-teal-50 border-2 border-teal-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className={cn(
                        'w-4 h-4 mt-0.5',
                        selectedDoc === doc.id ? 'text-teal-600' : 'text-gray-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          selectedDoc === doc.id ? 'text-teal-900' : 'text-gray-900'
                        )}>
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Suggested Questions */}
          {selectedDoc && suggestedQuestions.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-gray-900">Suggested Questions</h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedQuestions.slice(0, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="w-full p-2 text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Chat Area */}
        <div className="col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            {selectedDocument && (
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-gray-900">
                    Interrogating: {selectedDocument.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ModelBadge model="claude" size="sm" showLabel />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedDoc ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Select a Document</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Choose an analyzed document from the left panel to start asking questions.
                      AI will provide answers with exact citations from the document.
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Start Interrogating</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Ask any question about this document. Claude will analyze the content
                      and provide answers with exact citations.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3',
                          message.role === 'user'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <ModelBadge model="claude" size="sm" />
                            <span className="text-xs text-gray-500">Claude</span>
                          </div>
                        )}

                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Quote className="w-3 h-3" />
                              Citations
                            </div>
                            {message.citations.map((citation, i) => (
                              <div
                                key={i}
                                className="p-2 bg-white rounded-lg text-xs border border-gray-200"
                              >
                                <p className="text-gray-700 italic">"{citation.text}"</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-500">
                                  {citation.section && <span>{citation.section}</span>}
                                  <span>Confidence: {(citation.confidence * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Risk Flags */}
                        {message.risk_flags && message.risk_flags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                              <AlertTriangle className="w-3 h-3" />
                              Risk Flags
                            </div>
                            <div className="space-y-1">
                              {message.risk_flags.map((flag, i) => (
                                <div
                                  key={i}
                                  className="p-2 bg-red-50 rounded text-xs text-red-700"
                                >
                                  {flag}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-2">Follow-up questions:</div>
                            <div className="flex flex-wrap gap-2">
                              {message.follow_up_questions.slice(0, 3).map((q, i) => (
                                <button
                                  key={i}
                                  onClick={() => sendMessage(q)}
                                  disabled={loading}
                                  className="px-2 py-1 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-full transition disabled:opacity-50"
                                >
                                  {q.length > 40 ? q.slice(0, 40) + '...' : q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-xs opacity-50">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ModelBadge model="claude" size="sm" />
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                  <button onClick={() => setError(null)}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      selectedDoc
                        ? 'Ask a question about this document...'
                        : 'Select a document first...'
                    }
                    disabled={!selectedDoc || loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={() => sendMessage()}
                  disabled={!selectedDoc || !input.trim() || loading}
                  className="h-12 w-12 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Answers are grounded in document content with exact citations
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
