'use client'

import { useState, useRef, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Send,
  Brain,
  FileText,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ModelType = 'claude' | 'gpt-4' | 'gemini' | 'consensus'

interface Citation {
  id: string
  document: string
  page: number
  text: string
  relevance: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: ModelType
  citations?: Citation[]
  reasoning?: string[]
  timestamp: Date
  confidence?: number
  processingTime?: number
}

// Mock conversation
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'What are the key termination triggers in the merger agreement?',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    role: 'assistant',
    content: `Based on my analysis of the Merger Agreement, I've identified **5 key termination triggers**:

1. **Material Adverse Change (MAC)** - Either party may terminate if a MAC occurs affecting the target company. The definition on page 12 is notably broad and missing standard carve-outs for market conditions.

2. **Regulatory Disapproval** - Termination permitted if antitrust approval is denied or conditioned on unacceptable divestitures (Section 7.1.b).

3. **Breach of Representations** - Material breach of reps & warranties that isn't cured within 30 days allows termination with $15M breakup fee.

4. **Financing Failure** - If buyer fails to secure committed financing by closing date, seller may terminate and retain $25M deposit.

5. **Outside Date** - Automatic termination if closing doesn't occur by March 31, 2025, subject to 60-day extension for regulatory delays.

⚠️ **Risk Flag**: The MAC clause definition is unusually broad. I recommend negotiating additional carve-outs before signing.`,
    model: 'claude',
    citations: [
      { id: 'c1', document: 'Merger Agreement', page: 12, text: 'Material Adverse Change shall mean any event...', relevance: 0.96 },
      { id: 'c2', document: 'Merger Agreement', page: 45, text: 'Section 7.1 Termination Rights...', relevance: 0.94 },
      { id: 'c3', document: 'Merger Agreement', page: 52, text: 'Breakup Fee and Deposit Terms...', relevance: 0.89 },
    ],
    reasoning: [
      'Searching document_chunks for "termination" and "terminate"...',
      'Found 23 relevant sections across 127 pages',
      'Clustering by termination type: MAC, regulatory, breach, financing, date',
      'Cross-referencing with standard M&A termination provisions',
      'Flagging MAC clause as non-standard based on missing carve-outs',
    ],
    timestamp: new Date(Date.now() - 290000),
    confidence: 0.94,
    processingTime: 3.2,
  },
]

const SUGGESTED_QUESTIONS = [
  'What is the total consideration and how is it structured?',
  'Are there any change of control provisions that could trigger debt acceleration?',
  'What are the key conditions to closing?',
  'Summarize the indemnification provisions',
  'What intellectual property is being transferred?',
]

export default function InterrogationPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelType>('claude')
  const [showReasoning, setShowReasoning] = useState(true)
  const [expandedCitations, setExpandedCitations] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed the relevant documents to answer your question about "${input}".

Based on my review of the merger agreement and supporting documents, here's what I found:

**Key Finding**: The documents contain relevant provisions that address your query. I've identified 3 primary sections and 2 supporting clauses that are directly applicable.

The analysis suggests a moderate level of risk in this area. I recommend reviewing the cited sections in detail with legal counsel before proceeding.

Would you like me to elaborate on any specific aspect of this analysis?`,
        model: selectedModel,
        citations: [
          { id: 'cx1', document: 'Merger Agreement', page: 34, text: 'Relevant clause text...', relevance: 0.92 },
          { id: 'cx2', document: 'Financial Statements', page: 12, text: 'Supporting financial data...', relevance: 0.87 },
        ],
        reasoning: [
          `Query embedding generated using text-embedding-3`,
          `Searching ${Math.floor(Math.random() * 500 + 200)} document chunks...`,
          `Retrieved top 5 relevant passages (similarity > 0.85)`,
          `Generating response with ${selectedModel}...`,
          `Cross-validating findings against financial data`,
        ],
        timestamp: new Date(),
        confidence: 0.89,
        processingTime: 2.8,
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 3000)
  }

  return (
    <MainLayout
      title="Deal Interrogation"
      subtitle="Ask questions about your deal documents using natural language — powered by RAG"
    >
      <div className="h-[calc(100vh-180px)] flex gap-6">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Model Selector */}
          <Card className="p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Response Model:</span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {(['claude', 'gpt-4', 'gemini', 'consensus'] as ModelType[]).map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        selectedModel === model
                          ? model === 'claude' ? 'bg-amber-100 text-amber-700' :
                            model === 'gpt-4' ? 'bg-emerald-100 text-emerald-700' :
                            model === 'gemini' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          : 'text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      {model === 'consensus' ? '✨ Consensus' : model}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showReasoning}
                    onChange={(e) => setShowReasoning(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  Show reasoning
                </label>
              </div>
            </div>
          </Card>

          {/* Messages */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      message.model === 'claude' ? 'bg-amber-100' :
                      message.model === 'gpt-4' ? 'bg-emerald-100' :
                      message.model === 'gemini' ? 'bg-blue-100' :
                      'bg-purple-100'
                    )}>
                      <Brain className={cn(
                        'w-5 h-5',
                        message.model === 'claude' ? 'text-amber-600' :
                        message.model === 'gpt-4' ? 'text-emerald-600' :
                        message.model === 'gemini' ? 'text-blue-600' :
                        'text-purple-600'
                      )} />
                    </div>
                  )}
                  
                  <div className={cn(
                    'max-w-[80%] space-y-3',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    {/* Message Content */}
                    <div className={cn(
                      'rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>

                    {/* Assistant metadata */}
                    {message.role === 'assistant' && (
                      <>
                        {/* Reasoning Steps */}
                        {showReasoning && message.reasoning && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-3 h-3 text-teal-600" />
                              <span className="text-xs font-medium text-gray-600">Reasoning Steps</span>
                            </div>
                            <div className="space-y-1">
                              {message.reasoning.map((step, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-600">
                                {message.citations.length} Citations
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation) => (
                                <button
                                  key={citation.id}
                                  onClick={() => setExpandedCitations(
                                    expandedCitations === citation.id ? null : citation.id
                                  )}
                                  className={cn(
                                    'px-2 py-1 rounded text-xs transition-colors',
                                    expandedCitations === citation.id
                                      ? 'bg-teal-100 text-teal-700'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  )}
                                >
                                  📄 {citation.document}, p.{citation.page}
                                </button>
                              ))}
                            </div>
                            <AnimatePresence>
                              {expandedCitations && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                                >
                                  <p className="text-xs text-blue-800 italic">
                                    "{message.citations.find(c => c.id === expandedCitations)?.text}"
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <Badge variant={message.model === 'claude' ? 'claude' : message.model === 'gpt-4' ? 'gpt4' : 'gemini'}>
                            {message.model}
                          </Badge>
                          {message.confidence && (
                            <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
                          )}
                          {message.processingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {message.processingTime}s
                            </span>
                          )}
                          <button className="hover:text-gray-600">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button className="hover:text-green-600">
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button className="hover:text-red-600">
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                      JJ
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    selectedModel === 'claude' ? 'bg-amber-100' :
                    selectedModel === 'gpt-4' ? 'bg-emerald-100' :
                    selectedModel === 'gemini' ? 'bg-blue-100' :
                    'bg-purple-100'
                  )}>
                    <Brain className={cn(
                      'w-5 h-5 animate-pulse',
                      selectedModel === 'claude' ? 'text-amber-600' :
                      selectedModel === 'gpt-4' ? 'text-emerald-600' :
                      selectedModel === 'gemini' ? 'text-blue-600' :
                      'text-purple-600'
                    )} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedModel === 'consensus' ? 'Querying all models...' : `${selectedModel} is analyzing...`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Ask anything about your deal documents..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="h-12 w-12 rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Document Context */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Active Documents</h3>
            </div>
            <div className="space-y-2">
              {['Merger Agreement', 'Q3 Financials', 'DD Checklist'].map((doc) => (
                <div key={doc} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700 truncate">{doc}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3">
              + Add Documents
            </Button>
          </Card>

          {/* Suggested Questions */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Suggested Questions</h3>
            </div>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-2 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors line-clamp-2"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>

          {/* RAG Pipeline Status */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="font-semibold text-gray-900 text-sm">RAG Pipeline</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Documents Indexed</span>
                <span className="font-medium text-gray-900">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Chunks</span>
                <span className="font-medium text-gray-900">847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Embedding Model</span>
                <span className="font-mono text-gray-900">text-embedding-3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Vector Store</span>
                <span className="font-mono text-gray-900">pgvector</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 mt-2">
                <CheckCircle className="w-3 h-3" />
                <span>Pipeline healthy</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
