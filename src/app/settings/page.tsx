'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Cpu,
  Palette,
  Globe,
  Key,
  Mail,
  Building2,
  Save,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Sliders,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SettingSection {
  id: string
  name: string
  icon: React.ElementType
  description: string
}

const SECTIONS: SettingSection[] = [
  { id: 'profile', name: 'Profile', icon: User, description: 'Your account information' },
  { id: 'models', name: 'AI Models', icon: Cpu, description: 'Configure AI model preferences' },
  { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Email and alert settings' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Password and access' },
  { id: 'appearance', name: 'Appearance', icon: Palette, description: 'Theme and display' },
  { id: 'api', name: 'API Keys', icon: Key, description: 'Manage API credentials' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: 'John Smith',
    email: 'john.smith@company.com',
    company: 'Acme Capital Partners',
    role: 'Managing Director',
  })

  // AI Model settings
  const [modelSettings, setModelSettings] = useState({
    defaultModel: 'claude',
    enableGPT4: true,
    enableGemini: true,
    consensusThreshold: 0.7,
    maxTokens: 4096,
    temperature: 0.3,
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailDigest: true,
    analysisComplete: true,
    riskAlerts: true,
    weeklyReport: false,
  })

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    showModelBadges: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <MainLayout
      title="Settings"
      subtitle="Configure your DealScope preferences"
    >
      <div className="grid grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition',
                      activeSection === section.id
                        ? 'bg-teal-50 text-teal-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5',
                      activeSection === section.id ? 'text-teal-600' : 'text-gray-400'
                    )} />
                    <div>
                      <div className="font-medium text-sm">{section.name}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="col-span-3">
          {/* Profile */}
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* AI Models */}
          {activeSection === 'models' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Cpu className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">AI Model Configuration</h3>
                </div>

                <div className="space-y-6">
                  {/* Default Model */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Default Model</label>
                    <select
                      value={modelSettings.defaultModel}
                      onChange={(e) => setModelSettings(m => ({ ...m, defaultModel: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="claude">Claude (Anthropic) - Legal & Contract Analysis</option>
                      <option value="gpt-4">GPT-4 (OpenAI) - Financial & Valuation</option>
                      <option value="gemini">Gemini (Google) - Research & Context</option>
                    </select>
                  </div>

                  {/* Model Toggles */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">Enable Models for Multi-Model Analysis</label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">C</div>
                          <div>
                            <div className="font-medium text-gray-900">Claude (Anthropic)</div>
                            <div className="text-xs text-gray-500">Legal & Contract Analysis</div>
                          </div>
                        </div>
                        <Badge variant="success">Required</Badge>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">G</div>
                          <div>
                            <div className="font-medium text-gray-900">GPT-4 (OpenAI)</div>
                            <div className="text-xs text-gray-500">Financial & Valuation</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={modelSettings.enableGPT4}
                          onChange={(e) => setModelSettings(m => ({ ...m, enableGPT4: e.target.checked }))}
                          className="w-5 h-5 text-teal-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">G</div>
                          <div>
                            <div className="font-medium text-gray-900">Gemini (Google)</div>
                            <div className="text-xs text-gray-500">Research & Context</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={modelSettings.enableGemini}
                          onChange={(e) => setModelSettings(m => ({ ...m, enableGemini: e.target.checked }))}
                          className="w-5 h-5 text-teal-600 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 block mb-3">Advanced Settings</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Consensus Threshold</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="0.5"
                            max="0.95"
                            step="0.05"
                            value={modelSettings.consensusThreshold}
                            onChange={(e) => setModelSettings(m => ({ ...m, consensusThreshold: parseFloat(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">{(modelSettings.consensusThreshold * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Temperature</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={modelSettings.temperature}
                            onChange={(e) => setModelSettings(m => ({ ...m, temperature: parseFloat(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">{modelSettings.temperature.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailDigest', label: 'Daily Email Digest', description: 'Summary of all deal activity' },
                    { key: 'analysisComplete', label: 'Analysis Complete', description: 'When document analysis finishes' },
                    { key: 'riskAlerts', label: 'Risk Alerts', description: 'Critical findings that need attention' },
                    { key: 'weeklyReport', label: 'Weekly Report', description: 'Portfolio-wide summary report' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications(n => ({ ...n, [item.key]: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Security Settings</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Change Password</label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Two-Factor Authentication</span>
                    </div>
                    <p className="text-sm text-green-700">2FA is enabled on your account</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Active Sessions</label>
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Current Session</div>
                        <div className="text-xs text-gray-500">Chrome on Windows • Las Vegas, NV</div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Appearance Settings</h3>
                </div>

                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setAppearance(a => ({ ...a, theme: theme.value }))}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition',
                            appearance.theme === theme.value
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <theme.icon className={cn(
                            'w-6 h-6',
                            appearance.theme === theme.value ? 'text-teal-600' : 'text-gray-400'
                          )} />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">Compact Mode</div>
                        <div className="text-sm text-gray-500">Reduce spacing for more content</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearance.compactMode}
                        onChange={(e) => setAppearance(a => ({ ...a, compactMode: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">Show Model Badges</div>
                        <div className="text-sm text-gray-500">Display which AI model generated each finding</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearance.showModelBadges}
                        onChange={(e) => setAppearance(a => ({ ...a, showModelBadges: e.target.checked }))}
                        className="w-5 h-5 text-teal-600 rounded"
                      />
                    </label>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* API Keys */}
          {activeSection === 'api' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Key className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">API Configuration</h3>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-800">Enterprise Feature</div>
                      <p className="text-sm text-amber-700">
                        API key management is available on Enterprise plans. Contact sales@dealscope.ai for access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 opacity-50">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Anthropic API Key</label>
                    <input
                      type="password"
                      placeholder="sk-ant-..."
                      disabled
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">OpenAI API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      disabled
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Google AI API Key</label>
                    <input
                      type="password"
                      placeholder="AIza..."
                      disabled
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} className="gap-2">
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
