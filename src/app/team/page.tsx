'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Users,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Search,
  Bell,
  MoreHorizontal,
  Send,
  AtSign,
  Paperclip,
  Brain,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Team members
const TEAM_MEMBERS = [
  { id: '1', name: 'JJ', initials: 'JJ', role: 'Deal Lead', status: 'online', color: 'bg-teal-500' },
  { id: '2', name: 'Sarah Chen', initials: 'SC', role: 'Financial Analyst', status: 'online', color: 'bg-purple-500' },
  { id: '3', name: 'Mike Ross', initials: 'MR', role: 'Legal Counsel', status: 'away', color: 'bg-blue-500' },
  { id: '4', name: 'Lisa Park', initials: 'LP', role: 'Due Diligence', status: 'offline', color: 'bg-amber-500' },
]

// Activity feed
const ACTIVITY_FEED = [
  {
    id: '1',
    user: 'JJ',
    action: 'uploaded',
    target: 'Merger Agreement v3.pdf',
    time: '5 min ago',
    type: 'document',
  },
  {
    id: '2',
    user: 'Sarah Chen',
    action: 'completed analysis on',
    target: 'Financial Statements',
    time: '12 min ago',
    type: 'analysis',
    aiModels: ['gpt-4'],
  },
  {
    id: '3',
    user: 'AI System',
    action: 'flagged critical risk in',
    target: 'MAC Clause Review',
    time: '18 min ago',
    type: 'alert',
    aiModels: ['claude', 'gpt-4'],
  },
  {
    id: '4',
    user: 'Mike Ross',
    action: 'commented on',
    target: 'Indemnification Section',
    time: '25 min ago',
    type: 'comment',
  },
  {
    id: '5',
    user: 'Lisa Park',
    action: 'generated report',
    target: 'DD Summary Report',
    time: '1 hour ago',
    type: 'report',
    aiModels: ['claude'],
  },
]

// Tasks
const TASKS = [
  { id: '1', title: 'Review MAC clause findings', assignee: 'JJ', status: 'in_progress', priority: 'high', dueDate: 'Today' },
  { id: '2', title: 'Validate financial projections', assignee: 'Sarah Chen', status: 'completed', priority: 'high', dueDate: 'Today' },
  { id: '3', title: 'Legal risk assessment', assignee: 'Mike Ross', status: 'pending', priority: 'medium', dueDate: 'Tomorrow' },
  { id: '4', title: 'Customer contract review', assignee: 'Lisa Park', status: 'pending', priority: 'low', dueDate: 'Dec 31' },
]

export default function TeamWorkspacePage() {
  const [message, setMessage] = useState('')

  return (
    <MainLayout
      title="Team Workspace"
      subtitle="Real-time collaboration on deal analysis and findings"
    >
      <div className="grid grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="col-span-3 space-y-6">
          {/* Deal Progress */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">TechCorp Acquisition</h2>
                <p className="text-sm text-gray-500">Due Diligence Progress</p>
              </div>
              <Badge variant="warning">In Progress</Badge>
            </div>
            <Progress value={68} size="lg" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>68% Complete</span>
              <span>Target Close: March 31, 2025</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">12</div>
                <div className="text-xs text-gray-500">Documents Analyzed</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-lg font-bold text-amber-600">3</div>
                <div className="text-xs text-gray-500">Critical Risks</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">28</div>
                <div className="text-xs text-gray-500">Total Findings</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">4</div>
                <div className="text-xs text-gray-500">Reports Generated</div>
              </div>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Activity Feed</h3>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {ACTIVITY_FEED.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium',
                      activity.user === 'AI System' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' :
                      activity.user === 'JJ' ? 'bg-teal-500' :
                      activity.user === 'Sarah Chen' ? 'bg-purple-500' :
                      activity.user === 'Mike Ross' ? 'bg-blue-500' : 'bg-amber-500'
                    )}>
                      {activity.user === 'AI System' ? (
                        <Brain className="w-4 h-4" />
                      ) : (
                        activity.user.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{activity.user}</span>
                        <span className="text-gray-600"> {activity.action} </span>
                        <span className="font-medium text-teal-600">{activity.target}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{activity.time}</span>
                        {activity.aiModels && (
                          <div className="flex items-center gap-1">
                            {activity.aiModels.map((model) => (
                              <div
                                key={model}
                                className={cn(
                                  'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold',
                                  model === 'claude' ? 'bg-amber-100 text-amber-700' :
                                  model === 'gpt-4' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-blue-100 text-blue-700'
                                )}
                              >
                                {model === 'claude' ? 'C' : model === 'gpt-4' ? 'G' : 'Ge'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {activity.type === 'alert' && (
                      <Badge variant="danger">Critical</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Team Chat */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Team Discussion</h3>
            </div>
            <div className="p-4 h-48 bg-gray-50">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  SC
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                  <p className="text-sm text-gray-900">
                    Just finished the financial analysis. GPT-4 flagged some concerns about the earnout achievability - 
                    only 68% probability based on historical growth rates.
                  </p>
                  <span className="text-xs text-gray-400">Sarah Chen • 12 min ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-medium">
                  JJ
                </div>
                <div className="bg-teal-500 text-white p-3 rounded-lg max-w-md">
                  <p className="text-sm">
                    Thanks Sarah. Let's discuss in the Agent Debate Arena - I want to see Claude's counterargument.
                  </p>
                  <span className="text-xs text-teal-100">JJ • 5 min ago</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Button variant="ghost" size="sm">
                  <AtSign className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Team Members */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Team Members</h3>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {TEAM_MEMBERS.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                      member.color
                    )}>
                      {member.initials}
                    </div>
                    <div className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                      member.status === 'online' ? 'bg-green-500' :
                      member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tasks */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Tasks</h3>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {TASKS.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    task.status === 'completed' ? 'bg-green-50 border-green-200' :
                    task.priority === 'high' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm',
                        task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{task.assignee}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900 text-sm">AI Activity Today</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Analyses Run</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Findings Generated</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consensus Achieved</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
