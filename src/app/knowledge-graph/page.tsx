'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Network,
  Brain,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  RefreshCw,
  Building2,
  User,
  FileText,
  DollarSign,
  AlertTriangle,
  Link2,
  Eye,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Entity types
const ENTITY_TYPES = [
  { id: 'company', label: 'Companies', color: '#8b5cf6', count: 12 },
  { id: 'person', label: 'People', color: '#3b82f6', count: 24 },
  { id: 'document', label: 'Documents', color: '#10b981', count: 18 },
  { id: 'financial', label: 'Financial', color: '#f59e0b', count: 8 },
  { id: 'risk', label: 'Risks', color: '#ef4444', count: 6 },
]

// Mock entities for visualization
const ENTITIES = [
  { id: '1', name: 'TechCorp Inc.', type: 'company', x: 50, y: 40, size: 'lg', connections: 8 },
  { id: '2', name: 'AcquireCo LLC', type: 'company', x: 75, y: 35, size: 'lg', connections: 6 },
  { id: '3', name: 'John Smith (CEO)', type: 'person', x: 35, y: 55, size: 'md', connections: 4 },
  { id: '4', name: 'Jane Doe (CFO)', type: 'person', x: 60, y: 60, size: 'md', connections: 5 },
  { id: '5', name: 'Merger Agreement', type: 'document', x: 55, y: 25, size: 'md', connections: 7 },
  { id: '6', name: '$250M Purchase Price', type: 'financial', x: 80, y: 55, size: 'md', connections: 3 },
  { id: '7', name: 'MAC Clause Risk', type: 'risk', x: 40, y: 30, size: 'sm', connections: 2 },
  { id: '8', name: 'IP Portfolio', type: 'document', x: 25, y: 45, size: 'sm', connections: 3 },
  { id: '9', name: 'Board Member A', type: 'person', x: 20, y: 60, size: 'sm', connections: 2 },
  { id: '10', name: 'Earnout Terms', type: 'financial', x: 70, y: 70, size: 'sm', connections: 2 },
  { id: '11', name: 'Non-Compete', type: 'risk', x: 45, y: 70, size: 'sm', connections: 2 },
  { id: '12', name: 'Subsidiary A', type: 'company', x: 30, y: 35, size: 'sm', connections: 2 },
]

// Mock connections
const CONNECTIONS = [
  { from: '1', to: '2', label: 'acquiring' },
  { from: '1', to: '3', label: 'CEO of' },
  { from: '1', to: '4', label: 'CFO of' },
  { from: '5', to: '1', label: 'governs' },
  { from: '5', to: '2', label: 'governs' },
  { from: '6', to: '5', label: 'specified in' },
  { from: '7', to: '5', label: 'found in' },
  { from: '8', to: '1', label: 'owned by' },
  { from: '9', to: '1', label: 'board of' },
  { from: '10', to: '6', label: 'part of' },
  { from: '11', to: '3', label: 'applies to' },
  { from: '12', to: '1', label: 'subsidiary of' },
]

export default function KnowledgeGraphPage() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [visibleTypes, setVisibleTypes] = useState<string[]>(ENTITY_TYPES.map(t => t.id))
  const [zoom, setZoom] = useState(100)

  const toggleEntityType = (typeId: string) => {
    setVisibleTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  const selectedEntityData = ENTITIES.find(e => e.id === selectedEntity)

  const getEntityColor = (type: string) => {
    return ENTITY_TYPES.find(t => t.id === type)?.color || '#6b7280'
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'company': return Building2
      case 'person': return User
      case 'document': return FileText
      case 'financial': return DollarSign
      case 'risk': return AlertTriangle
      default: return Network
    }
  }

  return (
    <MainLayout
      title="Knowledge Graph"
      subtitle="Visual entity extraction and relationship mapping across deal documents"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Entity Type Filters */}
            <div className="flex items-center gap-2">
              {ENTITY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleEntityType(type.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    visibleTypes.includes(type.id)
                      ? 'bg-white border-2 shadow-sm'
                      : 'bg-gray-100 text-gray-400'
                  )}
                  style={{
                    borderColor: visibleTypes.includes(type.id) ? type.color : 'transparent',
                    color: visibleTypes.includes(type.id) ? type.color : undefined,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color, opacity: visibleTypes.includes(type.id) ? 1 : 0.3 }}
                  />
                  {type.label}
                  <span className="text-xs opacity-60">({type.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.max(50, z - 10))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.min(150, z + 10))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Re-extract
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Graph Visualization */}
          <Card className="col-span-3 p-0 overflow-hidden h-[600px]">
            <div
              className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
            >
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {CONNECTIONS.map((conn, i) => {
                  const fromEntity = ENTITIES.find(e => e.id === conn.from)
                  const toEntity = ENTITIES.find(e => e.id === conn.to)
                  if (!fromEntity || !toEntity) return null
                  if (!visibleTypes.includes(fromEntity.type) || !visibleTypes.includes(toEntity.type)) return null

                  return (
                    <g key={i}>
                      <line
                        x1={`${fromEntity.x}%`}
                        y1={`${fromEntity.y}%`}
                        x2={`${toEntity.x}%`}
                        y2={`${toEntity.y}%`}
                        stroke="#cbd5e1"
                        strokeWidth="2"
                        strokeDasharray={selectedEntity && (selectedEntity === conn.from || selectedEntity === conn.to) ? "0" : "4"}
                        opacity={selectedEntity && (selectedEntity === conn.from || selectedEntity === conn.to) ? 1 : 0.5}
                      />
                    </g>
                  )
                })}
              </svg>

              {/* Entity Nodes */}
              {ENTITIES.filter(e => visibleTypes.includes(e.type)).map((entity) => {
                const Icon = getEntityIcon(entity.type)
                const isSelected = selectedEntity === entity.id
                const size = entity.size === 'lg' ? 'w-16 h-16' : entity.size === 'md' ? 'w-12 h-12' : 'w-10 h-10'
                const iconSize = entity.size === 'lg' ? 'w-7 h-7' : entity.size === 'md' ? 'w-5 h-5' : 'w-4 h-4'

                return (
                  <motion.div
                    key={entity.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${entity.x}%`,
                      top: `${entity.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => setSelectedEntity(isSelected ? null : entity.id)}
                  >
                    <div
                      className={cn(
                        'rounded-full flex items-center justify-center transition-all shadow-lg',
                        size,
                        isSelected && 'ring-4 ring-offset-2 ring-teal-500'
                      )}
                      style={{
                        backgroundColor: getEntityColor(entity.type),
                      }}
                    >
                      <Icon className={cn(iconSize, 'text-white')} />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium bg-white shadow-sm border',
                        isSelected ? 'border-gray-400' : 'border-gray-200'
                      )}>
                        {entity.name}
                      </span>
                    </div>
                  </motion.div>
                )
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
                <div className="text-xs font-medium text-gray-700 mb-2">Entity Types</div>
                <div className="space-y-1">
                  {ENTITY_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                      {type.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Entity Details Sidebar */}
          <div className="space-y-4">
            {/* Selected Entity */}
            {selectedEntityData ? (
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getEntityColor(selectedEntityData.type) }}
                  >
                    {(() => {
                      const Icon = getEntityIcon(selectedEntityData.type)
                      return <Icon className="w-6 h-6 text-white" />
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedEntityData.name}</h3>
                    <Badge style={{ backgroundColor: `${getEntityColor(selectedEntityData.type)}20`, color: getEntityColor(selectedEntityData.type) }}>
                      {selectedEntityData.type}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Connections</span>
                    <span className="font-medium">{selectedEntityData.connections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Extracted by</span>
                    <Badge variant="claude">Claude</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Confidence</span>
                    <span className="font-medium text-green-600">94%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Related Entities</h4>
                  <div className="space-y-2">
                    {CONNECTIONS.filter(c => c.from === selectedEntityData.id || c.to === selectedEntityData.id)
                      .slice(0, 4)
                      .map((conn, i) => {
                        const relatedId = conn.from === selectedEntityData.id ? conn.to : conn.from
                        const related = ENTITIES.find(e => e.id === relatedId)
                        if (!related) return null
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Link2 className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{conn.label}</span>
                            <span className="font-medium text-gray-900">{related.name}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>

                <Button variant="secondary" size="sm" className="w-full mt-4">
                  <Eye className="w-4 h-4" />
                  View in Document
                </Button>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="text-center py-8 text-gray-500">
                  <Network className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Click an entity to see details</p>
                </div>
              </Card>
            )}

            {/* Extraction Stats */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Multi-Model Extraction</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">C</div>
                    <span className="font-medium text-amber-800">Claude</span>
                  </div>
                  <p className="text-xs text-amber-600">Extracted 45 entities from legal context</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">G4</div>
                    <span className="font-medium text-emerald-800">GPT-4</span>
                  </div>
                  <p className="text-xs text-emerald-600">Validated 42 entities, added 3 financial</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">Ge</div>
                    <span className="font-medium text-blue-800">Gemini</span>
                  </div>
                  <p className="text-xs text-blue-600">Cross-referenced with public data</p>
                </div>
              </div>
            </Card>

            {/* Stats Summary */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Graph Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">68</div>
                  <div className="text-xs text-gray-500">Entities</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">142</div>
                  <div className="text-xs text-gray-500">Relationships</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">5</div>
                  <div className="text-xs text-gray-500">Entity Types</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">94%</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
