'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Settings,
  Key,
  Brain,
  Bell,
  Shield,
  Users,
  CreditCard,
  Database,
  Globe,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
} from 'lucide-react'

const TABS = [
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'models', label: 'AI Models', icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <MainLayout
      title="Settings"
      subtitle="Configure API keys, AI models, and platform preferences"
    >
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <>
              <Card className="p-6">
                <h2 className="font-semibold text-gray-900 mb-1">API Keys</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Configure API keys for AI model providers and external services
                </p>

                <div className="space-y-4">
                  {/* Anthropic */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <span className="font-bold text-amber-700">C</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Anthropic (Claude)</h3>
                          <p className="text-xs text-gray-500">Claude 3.5 Sonnet for analysis</p>
                        </div>
                      </div>
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type={showKeys['anthropic'] ? 'text' : 'password'}
                        value="sk-ant-api03••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                      <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility('anthropic')}>
                        {showKeys['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* OpenAI */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <span className="font-bold text-emerald-700">G4</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">OpenAI (GPT-4)</h3>
                          <p className="text-xs text-gray-500">GPT-4 Turbo for validation</p>
                        </div>
                      </div>
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type={showKeys['openai'] ? 'text' : 'password'}
                        value="sk-proj-••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                      <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility('openai')}>
                        {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Google */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="font-bold text-blue-700">Ge</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Google (Gemini)</h3>
                          <p className="text-xs text-gray-500">Gemini Pro for search & research</p>
                        </div>
                      </div>
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type={showKeys['google'] ? 'text' : 'password'}
                        value="AIzaSy••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                      <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility('google')}>
                        {showKeys['google'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Supabase */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Database className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Supabase</h3>
                          <p className="text-xs text-gray-500">Database & vector storage</p>
                        </div>
                      </div>
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Project: <span className="font-mono">amzcrmxhryxmudovgzbp</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4">API Usage This Month</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700">$12.47</div>
                    <div className="text-sm text-amber-600">Claude API</div>
                    <div className="text-xs text-amber-500 mt-1">892K tokens</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">$8.32</div>
                    <div className="text-sm text-emerald-600">OpenAI API</div>
                    <div className="text-xs text-emerald-500 mt-1">645K tokens</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">$0.00</div>
                    <div className="text-sm text-blue-600">Google API</div>
                    <div className="text-xs text-blue-500 mt-1">Free tier</div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-1">AI Model Configuration</h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure which models handle which types of tasks
              </p>

              <div className="space-y-4">
                {[
                  { task: 'Contract Analysis', primary: 'claude', validator: 'gpt-4', description: 'Legal document review and clause extraction' },
                  { task: 'Financial Modeling', primary: 'gpt-4', validator: 'claude', description: 'Numerical calculations and valuations' },
                  { task: 'Document Search', primary: 'gemini', validator: null, description: 'Semantic search across deal documents' },
                  { task: 'Risk Assessment', primary: 'claude', validator: 'gpt-4', description: 'Identifying and scoring deal risks' },
                  { task: 'Report Generation', primary: 'claude', validator: 'gpt-4', description: 'Creating IC memos and summaries' },
                  { task: 'High-Stakes Decisions', primary: 'consensus', validator: null, description: 'All models vote on critical findings' },
                ].map((config) => (
                  <div key={config.task} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{config.task}</h3>
                        <p className="text-xs text-gray-500">{config.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">Primary:</div>
                        <Badge variant={
                          config.primary === 'claude' ? 'claude' :
                          config.primary === 'gpt-4' ? 'gpt4' :
                          config.primary === 'gemini' ? 'gemini' : 'consensus'
                        }>
                          {config.primary}
                        </Badge>
                        {config.validator && (
                          <>
                            <span className="text-gray-400">→</span>
                            <div className="text-sm text-gray-600">Validator:</div>
                            <Badge variant={
                              config.validator === 'claude' ? 'claude' :
                              config.validator === 'gpt-4' ? 'gpt4' : 'gemini'
                            }>
                              {config.validator}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Analysis Complete', description: 'When a document analysis finishes', enabled: true },
                  { label: 'Critical Risk Found', description: 'When a critical risk is detected', enabled: true },
                  { label: 'Report Ready', description: 'When a generated report is ready', enabled: true },
                  { label: 'Model Disagreement', description: 'When AI models have conflicting findings', enabled: false },
                  { label: 'Daily Summary', description: 'Daily digest of all deal activity', enabled: false },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{notif.label}</h3>
                      <p className="text-sm text-gray-500">{notif.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Other tabs - placeholder */}
          {(activeTab === 'security' || activeTab === 'team' || activeTab === 'billing') && (
            <Card className="p-6">
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Configure your {activeTab} preferences here.
                </p>
                <Button variant="secondary" className="mt-4">
                  Coming Soon
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
