'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Code,
  Play,
  Copy,
  Check,
  ChevronRight,
  Terminal,
  Key,
  Clock,
  Zap,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { motion } from 'framer-motion'

const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/analyze',
    description: 'Run multi-agent analysis on a document',
    category: 'Analysis',
  },
  {
    method: 'POST',
    path: '/api/v1/debate',
    description: 'Start an agent debate session',
    category: 'Debate',
  },
  {
    method: 'GET',
    path: '/api/v1/deals/{id}',
    description: 'Get deal details and findings',
    category: 'Deals',
  },
  {
    method: 'POST',
    path: '/api/v1/documents/upload',
    description: 'Upload a document for analysis',
    category: 'Documents',
  },
  {
    method: 'POST',
    path: '/api/v1/reports/generate',
    description: 'Generate an AI report',
    category: 'Reports',
  },
  {
    method: 'GET',
    path: '/api/v1/audit-trail',
    description: 'Retrieve audit events',
    category: 'Compliance',
  },
]

const EXAMPLE_REQUEST = `{
  "document_id": "doc_abc123",
  "models": ["claude", "gpt-4"],
  "analysis_type": "contract",
  "options": {
    "extract_clauses": true,
    "identify_risks": true,
    "build_consensus": true
  }
}`

const EXAMPLE_RESPONSE = `{
  "analysis_id": "anl_xyz789",
  "status": "completed",
  "models_used": ["claude", "gpt-4"],
  "consensus_score": 0.94,
  "findings": [
    {
      "type": "risk",
      "severity": "critical",
      "title": "MAC Clause",
      "description": "Broad definition...",
      "page": 12,
      "confidence": 0.96,
      "agreed_by": ["claude", "gpt-4"]
    }
  ],
  "processing_time_ms": 3247
}`

export default function ApiConsolePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0])
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [response, setResponse] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const runRequest = () => {
    setIsRunning(true)
    setResponse(null)
    setTimeout(() => {
      setResponse(EXAMPLE_RESPONSE)
      setIsRunning(false)
    }, 1500)
  }

  return (
    <MainLayout
      title="API Console"
      subtitle="Integrate DealScope's multi-model AI into your applications"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-xs text-gray-500">API Uptime</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">~3s</div>
                <div className="text-xs text-gray-500">Avg Response Time</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Code className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-500">API Endpoints</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Active</div>
                <div className="text-xs text-gray-500">API Key Status</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Endpoints List */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Endpoints</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {API_ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.path}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-gray-50 transition-colors',
                    selectedEndpoint.path === endpoint.path && 'bg-teal-50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      endpoint.method === 'GET' ? 'success' :
                      endpoint.method === 'POST' ? 'info' :
                      endpoint.method === 'PUT' ? 'warning' : 'danger'
                    }>
                      {endpoint.method}
                    </Badge>
                    <code className="text-xs text-gray-700">{endpoint.path}</code>
                  </div>
                  <p className="text-xs text-gray-500">{endpoint.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Request Builder */}
          <div className="col-span-2 space-y-4">
            {/* Selected Endpoint */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    selectedEndpoint.method === 'GET' ? 'success' :
                    selectedEndpoint.method === 'POST' ? 'info' : 'warning'
                  } className="text-sm">
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    https://api.dealscope.ai{selectedEndpoint.path}
                  </code>
                </div>
                <Button onClick={runRequest} disabled={isRunning} className="gap-2">
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-600">{selectedEndpoint.description}</p>
            </Card>

            {/* Request Body */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Request Body</span>
                </div>
                <button
                  onClick={() => copyCode(EXAMPLE_REQUEST)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-900 text-gray-100 text-sm font-mono overflow-x-auto">
                <code>{EXAMPLE_REQUEST}</code>
              </pre>
            </Card>

            {/* Response */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Response</span>
                  {response && (
                    <Badge variant="success" className="text-xs">200 OK</Badge>
                  )}
                </div>
              </div>
              <pre className={cn(
                'p-4 bg-gray-900 text-sm font-mono overflow-x-auto min-h-[200px]',
                response ? 'text-green-400' : 'text-gray-500'
              )}>
                <code>{response || '// Response will appear here after sending request'}</code>
              </pre>
            </Card>
          </div>
        </div>

        {/* Code Examples */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">Quick Start Examples</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Full Documentation
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Python */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="px-3 py-2 bg-blue-50 border-b border-gray-200">
                <span className="text-sm font-medium text-blue-700">Python</span>
              </div>
              <pre className="p-3 bg-gray-50 text-xs font-mono overflow-x-auto">
{`import dealscope

client = dealscope.Client(
    api_key="your_api_key"
)

analysis = client.analyze(
    document_id="doc_abc123",
    models=["claude", "gpt-4"],
    build_consensus=True
)

print(analysis.findings)`}
              </pre>
            </div>

            {/* JavaScript */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="px-3 py-2 bg-yellow-50 border-b border-gray-200">
                <span className="text-sm font-medium text-yellow-700">JavaScript</span>
              </div>
              <pre className="p-3 bg-gray-50 text-xs font-mono overflow-x-auto">
{`import { DealScope } from 'dealscope';

const client = new DealScope({
  apiKey: 'your_api_key'
});

const analysis = await client.analyze({
  documentId: 'doc_abc123',
  models: ['claude', 'gpt-4'],
  buildConsensus: true
});

console.log(analysis.findings);`}
              </pre>
            </div>

            {/* cURL */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">cURL</span>
              </div>
              <pre className="p-3 bg-gray-50 text-xs font-mono overflow-x-auto">
{`curl -X POST \\
  https://api.dealscope.ai/v1/analyze \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "document_id": "doc_abc123",
    "models": ["claude", "gpt-4"],
    "build_consensus": true
  }'`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Rate Limits */}
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rate Limits</h3>
                <p className="text-sm text-gray-600">
                  Free tier: 100 requests/day | Pro: 10,000 requests/day | Enterprise: Unlimited
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-700">87 / 100</div>
              <div className="text-xs text-amber-600">requests today</div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
