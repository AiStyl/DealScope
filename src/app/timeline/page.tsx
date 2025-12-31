'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Circle,
  ChevronRight,
  Edit2,
  Trash2,
  Flag,
  Target,
  FileText,
  DollarSign,
  Scale,
  Users,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Milestone {
  id: string
  name: string
  description: string
  date: string
  status: 'complete' | 'in_progress' | 'upcoming' | 'delayed'
  category: 'legal' | 'financial' | 'regulatory' | 'operational' | 'closing'
  owner?: string
  dependencies?: string[]
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: 'Letter of Intent Signed',
    description: 'Non-binding LOI executed between parties',
    date: '2024-01-15',
    status: 'complete',
    category: 'legal',
    owner: 'Legal Team',
  },
  {
    id: 'm2',
    name: 'Due Diligence Start',
    description: 'Formal due diligence process begins',
    date: '2024-01-22',
    status: 'complete',
    category: 'operational',
    owner: 'Deal Team',
  },
  {
    id: 'm3',
    name: 'Management Presentations',
    description: 'Key management meetings with buyer',
    date: '2024-02-05',
    status: 'complete',
    category: 'operational',
    owner: 'Executive Team',
  },
  {
    id: 'm4',
    name: 'Financial Due Diligence Complete',
    description: 'Quality of earnings report finalized',
    date: '2024-02-28',
    status: 'in_progress',
    category: 'financial',
    owner: 'Finance Team',
  },
  {
    id: 'm5',
    name: 'Legal Due Diligence Complete',
    description: 'All legal reviews and disclosures finalized',
    date: '2024-03-10',
    status: 'upcoming',
    category: 'legal',
    owner: 'Legal Team',
  },
  {
    id: 'm6',
    name: 'HSR Filing',
    description: 'Hart-Scott-Rodino antitrust filing',
    date: '2024-03-15',
    status: 'upcoming',
    category: 'regulatory',
    owner: 'Legal Team',
    dependencies: ['m5'],
  },
  {
    id: 'm7',
    name: 'Definitive Agreement',
    description: 'Final purchase agreement negotiation and signing',
    date: '2024-04-01',
    status: 'upcoming',
    category: 'legal',
    owner: 'Legal Team',
    dependencies: ['m4', 'm5'],
  },
  {
    id: 'm8',
    name: 'Regulatory Approval',
    description: 'All required regulatory approvals obtained',
    date: '2024-04-30',
    status: 'upcoming',
    category: 'regulatory',
    owner: 'Legal Team',
    dependencies: ['m6'],
  },
  {
    id: 'm9',
    name: 'Closing',
    description: 'Transaction closes, funds transfer',
    date: '2024-05-15',
    status: 'upcoming',
    category: 'closing',
    owner: 'Deal Team',
    dependencies: ['m7', 'm8'],
  },
]

const STATUS_CONFIG = {
  complete: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', line: 'bg-green-500' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', line: 'bg-blue-500' },
  upcoming: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100', line: 'bg-gray-300' },
  delayed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', line: 'bg-red-500' },
}

const CATEGORY_CONFIG = {
  legal: { icon: Scale, color: 'text-purple-600', bg: 'bg-purple-100' },
  financial: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  regulatory: { icon: Flag, color: 'text-red-600', bg: 'bg-red-100' },
  operational: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  closing: { icon: Target, color: 'text-amber-600', bg: 'bg-amber-100' },
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newMilestone, setNewMilestone] = useState<{
    name: string
    description: string
    date: string
    category: Milestone['category']
  }>({
    name: '',
    description: '',
    date: '',
    category: 'operational',
  })

  // FIXED: Use useMemo to properly sort milestones by date
  const sortedMilestones = useMemo(() => {
    let filtered = filterCategory
      ? milestones.filter(m => m.category === filterCategory)
      : milestones
    
    // Sort by date (ascending - earliest first)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  }, [milestones, filterCategory])

  const updateStatus = (id: string, status: Milestone['status']) => {
    setMilestones(prev =>
      prev.map(m => m.id === id ? { ...m, status } : m)
    )
  }

  const addMilestone = () => {
    if (!newMilestone.name || !newMilestone.date) return

    const milestone: Milestone = {
      id: `m_${Date.now()}`,
      ...newMilestone,
      status: 'upcoming',
    }

    // Add to list - sorting is handled by useMemo
    setMilestones(prev => [...prev, milestone])
    setIsAddingNew(false)
    setNewMilestone({ name: '', description: '', date: '', category: 'operational' })
  }

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
    setSelectedMilestone(null)
  }

  const getProgress = () => {
    const completed = milestones.filter(m => m.status === 'complete').length
    return Math.round((completed / milestones.length) * 100)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Find the closing date for header
  const closingMilestone = milestones.find(m => m.category === 'closing')

  return (
    <MainLayout
      title="Deal Timeline"
      subtitle="Track milestones and critical dates"
    >
      <div className="grid grid-cols-4 gap-6">
        {/* Left Panel */}
        <div className="col-span-1 space-y-4">
          {/* Progress */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Overall Progress</h3>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Milestones Complete</span>
                <span className="font-medium">{getProgress()}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600">
                  {milestones.filter(m => m.status === 'complete').length}
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-bold text-blue-600">
                  {milestones.filter(m => m.status === 'in_progress').length}
                </div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-600">
                  {milestones.filter(m => m.status === 'upcoming').length}
                </div>
                <div className="text-xs text-gray-500">Upcoming</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-bold text-red-600">
                  {milestones.filter(m => m.status === 'delayed').length}
                </div>
                <div className="text-xs text-gray-500">Delayed</div>
              </div>
            </div>
          </Card>

          {/* Filter */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Filter by Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilterCategory(null)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm text-left transition',
                  !filterCategory ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'
                )}
              >
                All Categories
              </button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const Icon = config.icon
                const count = milestones.filter(m => m.category === key).length
                return (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-sm text-left transition flex items-center justify-between',
                      filterCategory === key ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', config.color)} />
                      <span className="capitalize">{key}</span>
                    </div>
                    <Badge variant="default">{count}</Badge>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Add New */}
          <Card className="p-4">
            <Button
              onClick={() => setIsAddingNew(true)}
              className="w-full gap-2"
              variant="secondary"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </Button>
          </Card>
        </div>

        {/* Timeline */}
        <div className="col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Deal Timeline</h3>
                <Badge variant="default" className="ml-2">
                  {sortedMilestones.length} milestones
                </Badge>
              </div>
              {closingMilestone && (
                <div className="text-sm text-gray-500">
                  Target Closing: <span className="font-medium text-gray-900">{formatDate(closingMilestone.date)}</span>
                </div>
              )}
            </div>

            {/* Timeline View */}
            <div className="relative">
              {sortedMilestones.map((milestone, i) => {
                const statusConfig = STATUS_CONFIG[milestone.status]
                const categoryConfig = CATEGORY_CONFIG[milestone.category]
                const StatusIcon = statusConfig.icon
                const CategoryIcon = categoryConfig.icon
                const daysUntil = getDaysUntil(milestone.date)
                const isSelected = selectedMilestone?.id === milestone.id

                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-8 pb-8 last:pb-0"
                  >
                    {/* Vertical line */}
                    {i < sortedMilestones.length - 1 && (
                      <div className={cn(
                        'absolute left-[11px] top-8 w-0.5 h-full',
                        statusConfig.line
                      )} />
                    )}

                    {/* Status dot */}
                    <div className={cn(
                      'absolute left-0 w-6 h-6 rounded-full flex items-center justify-center',
                      statusConfig.bg
                    )}>
                      <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
                    </div>

                    {/* Content */}
                    <div
                      onClick={() => setSelectedMilestone(isSelected ? null : milestone)}
                      className={cn(
                        'ml-4 p-4 rounded-lg border cursor-pointer transition',
                        isSelected
                          ? 'bg-teal-50 border-teal-300'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                            <Badge variant="default" className={cn(categoryConfig.bg, categoryConfig.color, 'text-xs')}>
                              {milestone.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{milestone.description}</p>
                          
                          {/* Expanded details */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 pt-3 border-t border-gray-200"
                              >
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {milestone.owner && (
                                    <div>
                                      <span className="text-gray-500">Owner:</span>
                                      <span className="ml-2 font-medium">{milestone.owner}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500">Status:</span>
                                    <select
                                      value={milestone.status}
                                      onChange={(e) => updateStatus(milestone.id, e.target.value as Milestone['status'])}
                                      onClick={(e) => e.stopPropagation()}
                                      className="ml-2 px-2 py-1 border rounded text-xs"
                                    >
                                      <option value="complete">Complete</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="upcoming">Upcoming</option>
                                      <option value="delayed">Delayed</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteMilestone(milestone.id)
                                    }}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Date */}
                        <div className="text-right ml-4">
                          <div className="font-medium text-gray-900">{formatDate(milestone.date)}</div>
                          <div className={cn(
                            'text-xs',
                            daysUntil < 0 ? 'text-red-600' :
                            daysUntil === 0 ? 'text-amber-600' :
                            daysUntil <= 7 ? 'text-blue-600' : 'text-gray-500'
                          )}>
                            {milestone.status === 'complete' ? 'Completed' :
                             daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                             daysUntil === 0 ? 'Due today' :
                             `${daysUntil} days`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>

          {/* Add New Modal */}
          <AnimatePresence>
            {isAddingNew && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setIsAddingNew(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Add Milestone</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="Milestone name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                        rows={2}
                        placeholder="Brief description"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={newMilestone.category}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, category: e.target.value as Milestone['category'] }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        {Object.keys(CATEGORY_CONFIG).map(cat => (
                          <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={addMilestone} className="flex-1">
                        Add Milestone
                      </Button>
                      <Button variant="secondary" onClick={() => setIsAddingNew(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  )
}
