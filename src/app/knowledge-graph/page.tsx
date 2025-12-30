'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Network,
  FileText,
  Loader2,
  AlertTriangle,
  Building2,
  User,
  FileCheck,
  DollarSign,
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  Tag,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Node {
  id: string
  label: string
  type: string
  description: string
  importance: 'high' | 'medium' | 'low'
}

interface Edge {
  id: string
  source: string
  target: string
  label: string
  description: string
  weight: number
}

interface GraphMetrics {
  total_entities: number
  total_relationships: number
  entity_distribution: Record<string, number>
  relationship_types: Record<string, number>
  central_entities: Array<{ entity: string; connections: number }>
  graph_density: number
}

interface KnowledgeGraphResult {
  document_name: string
  graph: {
    nodes: Node[]
    edges: Edge[]
  }
  summary: string
  key_insights: string[]
  metrics: GraphMetrics
}

interface Document {
  id: string
  name: string
  status: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  company: { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
  person: { icon: User, color: 'text-purple-600', bg: 'bg-purple-100' },
  contract: { icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-100' },
  financial: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  date: { icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
  location: { icon: MapPin, color: 'text-red-600', bg: 'bg-red-100' },
  asset: { icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  liability: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  term: { icon: Tag, color: 'text-amber-600', bg: 'bg-amber-100' },
}

export default function KnowledgeGraphPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [result, setResult] = useState<KnowledgeGraphResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)

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

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const extractGraph = async () => {
    if (!selectedDoc) {
      setError('Please select a document')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)

    try {
      const response = await fetch('/api/knowledge-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDoc }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.knowledge_graph)
      } else {
        setError(data.error || 'Extraction failed')
      }
    } catch (err) {
      console.error('Graph error:', err)
      setError('Failed to extract knowledge graph. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get connected nodes and edges for a selected node
  const getConnections = (nodeId: string) => {
    if (!result) return { nodes: [], edges: [] }
    
    const connectedEdges = result.graph.edges.filter(
      e => e.source === nodeId || e.target === nodeId
    )
    const connectedNodeIds = new Set(
      connectedEdges.flatMap(e => [e.source, e.target])
    )
    const connectedNodes = result.graph.nodes.filter(n => connectedNodeIds.has(n.id))
    
    return { nodes: connectedNodes, edges: connectedEdges }
  }

  // Simple force-directed positioning (pre-calculated for display)
  const getNodePositions = (nodes: Node[]) => {
    const positions: Record<string, { x: number; y: number }> = {}
    const centerX = 400
    const centerY = 300
    const radius = 200

    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length
      const r = radius * (node.importance === 'high' ? 0.6 : node.importance === 'medium' ? 0.85 : 1)
      positions[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      }
    })

    return positions
  }

  const positions = result ? getNodePositions(result.graph.nodes) : {}

  return (
    <MainLayout
      title="Knowledge Graph"
      subtitle="Visual entity extraction and relationship mapping"
    >
      <div className="grid grid-cols-4 gap-6">
        {/* Left Panel - Controls & Info */}
        <div className="col-span-1 space-y-4">
          {/* Document Selection */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Select Document</h3>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={cn(
                      'w-full p-2 rounded-lg text-left text-sm transition',
                      selectedDoc === doc.id
                        ? 'bg-purple-50 border border-purple-300'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    )}
                  >
                    {doc.name.slice(0, 35)}
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={extractGraph}
              disabled={loading || !selectedDoc}
              className="w-full mt-3 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Network className="w-4 h-4" />
                  Extract Graph
                </>
              )}
            </Button>
          </Card>

          {/* Entity Legend */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Entity Types</h3>
            <div className="space-y-2">
              {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                const Icon = config.icon
                const count = result?.metrics.entity_distribution[type] || 0
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-6 h-6 rounded flex items-center justify-center', config.bg)}>
                        <Icon className={cn('w-3 h-3', config.color)} />
                      </div>
                      <span className="text-gray-600 capitalize">{type}</span>
                    </div>
                    {result && <Badge variant="default">{count}</Badge>}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Graph Metrics */}
          {result && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Graph Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Entities</span>
                  <span className="font-medium">{result.metrics.total_entities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Relationships</span>
                  <span className="font-medium">{result.metrics.total_relationships}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Density</span>
                  <span className="font-medium">{(result.metrics.graph_density * 100).toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Main Graph Area */}
        <div className="col-span-3 space-y-4">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Graph Visualization */}
          <Card className="p-4 min-h-[500px] relative overflow-hidden">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setZoom(1)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
                    <Network className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Extracting Knowledge Graph</h3>
                  <p className="text-sm text-gray-500">AI is identifying entities and relationships...</p>
                </div>
              </div>
            ) : !result ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Network className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Knowledge Graph Extraction</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Select a document and click "Extract Graph" to visualize entities
                    and their relationships.
                  </p>
                </div>
              </div>
            ) : (
              <div 
                className="relative w-full h-[500px]"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              >
                {/* SVG for edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {result.graph.edges.map((edge) => {
                    const sourcePos = positions[edge.source]
                    const targetPos = positions[edge.target]
                    if (!sourcePos || !targetPos) return null

                    const isHighlighted = selectedNode && 
                      (edge.source === selectedNode.id || edge.target === selectedNode.id)

                    return (
                      <g key={edge.id}>
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={isHighlighted ? '#0d9488' : '#e5e7eb'}
                          strokeWidth={isHighlighted ? 2 : 1}
                          strokeOpacity={isHighlighted ? 1 : 0.6}
                        />
                        {isHighlighted && (
                          <text
                            x={(sourcePos.x + targetPos.x) / 2}
                            y={(sourcePos.y + targetPos.y) / 2 - 5}
                            className="text-[10px] fill-teal-700"
                            textAnchor="middle"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>

                {/* Nodes */}
                {result.graph.nodes.map((node) => {
                  const pos = positions[node.id]
                  if (!pos) return null

                  const config = TYPE_CONFIG[node.type] || TYPE_CONFIG.term
                  const Icon = config.icon
                  const isSelected = selectedNode?.id === node.id
                  const isConnected = selectedNode && 
                    result.graph.edges.some(e => 
                      (e.source === selectedNode.id && e.target === node.id) ||
                      (e.target === selectedNode.id && e.source === node.id)
                    )

                  return (
                    <motion.div
                      key={node.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all',
                        'flex flex-col items-center gap-1',
                        selectedNode && !isSelected && !isConnected && 'opacity-30'
                      )}
                      style={{ left: pos.x, top: pos.y }}
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                    >
                      <div
                        className={cn(
                          'rounded-full flex items-center justify-center transition-all',
                          config.bg,
                          isSelected ? 'ring-4 ring-teal-400' : '',
                          node.importance === 'high' ? 'w-12 h-12' :
                          node.importance === 'medium' ? 'w-10 h-10' : 'w-8 h-8'
                        )}
                      >
                        <Icon className={cn(
                          config.color,
                          node.importance === 'high' ? 'w-6 h-6' :
                          node.importance === 'medium' ? 'w-5 h-5' : 'w-4 h-4'
                        )} />
                      </div>
                      <span className={cn(
                        'text-xs text-center max-w-20 truncate',
                        isSelected ? 'font-semibold text-teal-700' : 'text-gray-600'
                      )}>
                        {node.label}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Selected Node Details */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      TYPE_CONFIG[selectedNode.type]?.bg || 'bg-gray-100'
                    )}>
                      {(() => {
                        const Icon = TYPE_CONFIG[selectedNode.type]?.icon || Tag
                        return <Icon className={cn('w-6 h-6', TYPE_CONFIG[selectedNode.type]?.color || 'text-gray-600')} />
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{selectedNode.label}</h3>
                        <Badge variant={
                          selectedNode.importance === 'high' ? 'danger' :
                          selectedNode.importance === 'medium' ? 'warning' : 'default'
                        }>
                          {selectedNode.importance}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{selectedNode.description}</p>
                      
                      {/* Connections */}
                      {result && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 mb-2">Connections</h4>
                          <div className="flex flex-wrap gap-2">
                            {getConnections(selectedNode.id).edges.map(edge => {
                              const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source
                              const otherNode = result.graph.nodes.find(n => n.id === otherNodeId)
                              return (
                                <button
                                  key={edge.id}
                                  onClick={() => otherNode && setSelectedNode(otherNode)}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition"
                                >
                                  <span className="text-gray-500">{edge.label}</span>
                                  <ChevronRight className="w-3 h-3 text-gray-400" />
                                  <span className="font-medium">{otherNode?.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insights */}
          {result && result.key_insights.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Key Insights</h3>
              </div>
              <div className="space-y-2">
                {result.key_insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-teal-600">•</span>
                    {insight}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
