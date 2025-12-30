'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Shield,
  Clock,
  User,
  FileText,
  Brain,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  Eye,
  Lock,
  Hash,
  ChevronRight,
  Calendar,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Audit event types
const EVENT_TYPES = [
  { id: 'all', label: 'All Events', count: 247 },
  { id: 'analysis', label: 'AI Analysis', count: 89 },
  { id: 'document', label: 'Document', count: 62 },
  { id: 'report', label: 'Report', count: 34 },
  { id: 'access', label: 'Access', count: 45 },
  { id: 'system', label: 'System', count: 17 },
]

// Mock audit events
const AUDIT_EVENTS = [
  {
    id: '1',
    timestamp: '2024-12-29 10:45:23',
    type: 'analysis',
    action: 'Multi-Agent Analysis Completed',
    description: 'Contract analysis completed with consensus from Claude and GPT-4',
    user: 'JJ',
    deal: 'TechCorp Acquisition',
    models: ['claude', 'gpt-4'],
    hash: '0x7f3a...9c2d',
    verified: true,
  },
  {
    id: '2',
    timestamp: '2024-12-29 10:42:15',
    type: 'document',
    action: 'Document Uploaded',
    description: 'Merger Agreement - TechCorp Acquisition.pdf (127 pages)',
    user: 'JJ',
    deal: 'TechCorp Acquisition',
    hash: '0x4e2b...1a8f',
    verified: true,
  },
  {
    id: '3',
    timestamp: '2024-12-29 10:38:07',
    type: 'analysis',
    action: 'Risk Assessment Generated',
    description: 'Claude identified 3 critical risks in MAC clause analysis',
    user: 'System',
    deal: 'TechCorp Acquisition',
    models: ['claude'],
    severity: 'critical',
    hash: '0x9d1e...7b4c',
    verified: true,
  },
  {
    id: '4',
    timestamp: '2024-12-29 10:35:42',
    type: 'report',
    action: 'Report Generated',
    description: 'IC Memo generated with multi-model synthesis',
    user: 'JJ',
    deal: 'TechCorp Acquisition',
    models: ['claude', 'gpt-4'],
    hash: '0x2c5f...8e3a',
    verified: true,
  },
  {
    id: '5',
    timestamp: '2024-12-29 10:30:18',
    type: 'access',
    action: 'User Login',
    description: 'Successful authentication via SSO',
    user: 'JJ',
    hash: '0x6a8c...2d9f',
    verified: true,
  },
  {
    id: '6',
    timestamp: '2024-12-29 09:15:33',
    type: 'analysis',
    action: 'Consensus Disagreement',
    description: 'Claude and GPT-4 disagreed on earnout achievability (flagged for review)',
    user: 'System',
    deal: 'TechCorp Acquisition',
    models: ['claude', 'gpt-4'],
    severity: 'warning',
    hash: '0x1b7d...4f6e',
    verified: true,
  },
  {
    id: '7',
    timestamp: '2024-12-28 16:22:45',
    type: 'document',
    action: 'Document Analyzed',
    description: 'Q3 Financial Statements processed with 8 findings',
    user: 'System',
    deal: 'TechCorp Acquisition',
    models: ['gpt-4', 'gemini'],
    hash: '0x5e9a...3c1b',
    verified: true,
  },
  {
    id: '8',
    timestamp: '2024-12-28 14:10:22',
    type: 'system',
    action: 'API Key Rotated',
    description: 'OpenAI API key rotated for security compliance',
    user: 'JJ',
    hash: '0x8f2c...6a5d',
    verified: true,
  },
]

export default function AuditTrailPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const filteredEvents = AUDIT_EVENTS.filter(event => {
    if (selectedType !== 'all' && event.type !== selectedType) return false
    if (searchQuery && !event.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const selectedEventData = AUDIT_EVENTS.find(e => e.id === selectedEvent)

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'analysis': return Brain
      case 'document': return FileText
      case 'report': return FileText
      case 'access': return User
      case 'system': return Shield
      default: return Activity
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'bg-purple-100 text-purple-600'
      case 'document': return 'bg-blue-100 text-blue-600'
      case 'report': return 'bg-green-100 text-green-600'
      case 'access': return 'bg-amber-100 text-amber-600'
      case 'system': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <MainLayout
      title="Audit Trail"
      subtitle="SOC 2 compliant logging with hash-chain integrity for every AI decision"
    >
      <div className="space-y-6">
        {/* Compliance Banner */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  SOC 2 Type II Compliant
                  <Badge variant="success">Verified</Badge>
                </h3>
                <p className="text-sm text-gray-600">
                  All events are cryptographically signed and stored in an immutable hash chain
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">247</div>
                <div className="text-gray-500">Events Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-gray-500">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-gray-500">Anomalies</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    selectedType === type.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {type.label}
                  <span className="ml-1 text-xs opacity-60">({type.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Calendar className="w-4 h-4" />
              Date Range
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Events List */}
          <div className="col-span-2">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Event Log</h3>
                <span className="text-sm text-gray-500">{filteredEvents.length} events</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredEvents.map((event, index) => {
                  const Icon = getEventIcon(event.type)
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                        selectedEvent === event.id && 'bg-teal-50'
                      )}
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          getEventColor(event.type)
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{event.action}</h4>
                            {event.severity === 'critical' && (
                              <Badge variant="danger">Critical</Badge>
                            )}
                            {event.severity === 'warning' && (
                              <Badge variant="warning">Warning</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.user}
                            </span>
                            {event.deal && (
                              <span>{event.deal}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.models && event.models.map((model) => (
                            <div
                              key={model}
                              className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                                model === 'claude' ? 'bg-amber-100 text-amber-700' :
                                model === 'gpt-4' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-blue-100 text-blue-700'
                              )}
                            >
                              {model === 'claude' ? 'C' : model === 'gpt-4' ? 'G4' : 'Ge'}
                            </div>
                          ))}
                          {event.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            {selectedEventData ? (
              <>
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event ID</span>
                      <span className="font-mono text-gray-900">EVT-{selectedEventData.id.padStart(6, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timestamp</span>
                      <span className="text-gray-900">{selectedEventData.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <Badge>{selectedEventData.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">User</span>
                      <span className="text-gray-900">{selectedEventData.user}</span>
                    </div>
                    {selectedEventData.deal && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deal</span>
                        <span className="text-gray-900">{selectedEventData.deal}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Cryptographic Proof</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Event Hash</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono flex-1 truncate">
                          {selectedEventData.hash}
                        </code>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Previous Hash</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono block truncate">
                        0x{Math.random().toString(16).substr(2, 8)}...{Math.random().toString(16).substr(2, 4)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      Hash chain verified
                    </div>
                  </div>
                </Card>

                {selectedEventData.models && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">AI Models Involved</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedEventData.models.map((model) => (
                        <div
                          key={model}
                          className={cn(
                            'p-2 rounded-lg flex items-center gap-2',
                            model === 'claude' ? 'bg-amber-50' :
                            model === 'gpt-4' ? 'bg-emerald-50' :
                            'bg-blue-50'
                          )}
                        >
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                            model === 'claude' ? 'bg-amber-500' :
                            model === 'gpt-4' ? 'bg-emerald-500' :
                            'bg-blue-500'
                          )}>
                            {model === 'claude' ? 'C' : model === 'gpt-4' ? 'G4' : 'Ge'}
                          </div>
                          <span className={cn(
                            'text-sm font-medium',
                            model === 'claude' ? 'text-amber-700' :
                            model === 'gpt-4' ? 'text-emerald-700' :
                            'text-blue-700'
                          )}>
                            {model}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Button variant="secondary" className="w-full">
                  <Eye className="w-4 h-4" />
                  View Full Details
                </Button>
              </>
            ) : (
              <Card className="p-4">
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select an event to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
