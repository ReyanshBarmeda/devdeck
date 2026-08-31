import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Key,
  Code,
  Sliders,
  Palette,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Github,
  Terminal,
  Cpu,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  Radio,
  Send,
  Zap,
  Check,
  Folder,
  Layers,
  Laptop,
  Type,
  Maximize2,
  Box,
  Compass,
} from 'lucide-react';
import { AppSettings, UserProfile, Project, ThemeId } from '../types';
import { THEME_DEFINITIONS } from '../data/themesData';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  currentUser: UserProfile | null;
  projects: Project[];
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onOpenThemeStudio?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  currentUser,
  projects,
  onExportData,
  onImportData,
  onResetSampleData,
  onShowToast,
  onOpenThemeStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'apis' | 'editor' | 'appearance' | 'desktop' | 'backup'>('apis');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);

  // Testing states
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string; latency?: number } | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const handleSave = (updated?: AppSettings) => {
    const toSave = updated || formData;
    onUpdateSettings(toSave);
    onShowToast('Settings Saved', 'Your API keys and workspace preferences have been updated.', 'success');
  };

  const handleTestKey = async (provider: 'gemini' | 'github' | 'ollama' | 'openai' | 'anthropic') => {
    setTestingProvider(provider);
    setTestResult(null);

    let apiKey = '';
    let endpoint = '';
    let model = '';

    if (provider === 'gemini') {
      apiKey = formData.api.geminiApiKey;
      model = formData.api.geminiModel;
    } else if (provider === 'github') {
      apiKey = formData.api.githubToken;
    } else if (provider === 'ollama') {
      endpoint = formData.api.ollamaEndpoint;
      model = formData.api.ollamaModel;
    } else if (provider === 'openai') {
      apiKey = formData.api.openaiApiKey;
      endpoint = formData.api.openaiBaseUrl;
    } else if (provider === 'anthropic') {
      apiKey = formData.api.anthropicApiKey;
    }

    try {
      const res = await fetch('/api/config/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, endpoint, model }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          provider,
          success: true,
          message: data.message || `Successfully connected to ${provider.toUpperCase()}`,
          latency: data.latencyMs,
        });
        onShowToast('API Connection Verified', data.message || `${provider} connected`, 'success');
      } else {
        setTestResult({
          provider,
          success: false,
          message: data.error || `Failed to verify ${provider} connection`,
        });
        onShowToast('Connection Failed', data.error || 'Check your credentials and network', 'error');
      }
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err.message || 'Network request failed',
      });
      onShowToast('Connection Error', err.message || 'Could not reach server test endpoint', 'error');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleTestWebhook = async () => {
    if (!formData.api.webhookUrl) {
      onShowToast('Missing Webhook URL', 'Please enter a webhook URL first.', 'warning');
      return;
    }
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/config/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: formData.api.webhookUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onShowToast('Webhook Delivered', 'Test alert successfully posted to webhook URL.', 'success');
      } else {
        onShowToast('Webhook Failed', data.error || 'Webhook returned error.', 'error');
      }
    } catch (err: any) {
      onShowToast('Webhook Error', err.message, 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                Workspace Settings & Integrations
              </h1>
              <p className="text-xs text-zinc-400">
                Configure AI models, API keys, IDE launchers, theme aesthetics, and backups
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('apis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'apis'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-blue-400" />
          <span>API Keys & AI Providers</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'editor'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-sky-400" />
          <span>Editor & Workspaces</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'appearance'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span>Theme & UI Aesthetics</span>
        </button>

        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'desktop'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-emerald-400" />
          <span>Desktop Apps (.EXE / Mac / Linux)</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'backup'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Data Backup & Restore</span>
        </button>
      </div>

      {/* Test Status Banner if active */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{testResult.message}</span>
          </div>
          {testResult.latency && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              {testResult.latency}ms
            </span>
          )}
        </motion.div>
      )}

      {/* TAB 1: API KEYS & AI PROVIDERS */}
      {activeTab === 'apis' && (
        <div className="space-y-6">
          {/* Gemini API Key Configuration Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    Google Gemini API
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Primary Engine
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Powers AI Architecture breakdowns, README generators, Conventional Commits & Auto-Tagger
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTestKey('gemini')}
                disabled={testingProvider === 'gemini'}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {testingProvider === 'gemini' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Test Connection</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Gemini API Key (Overrides server default if specified)
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy... (leave blank to use environment default)"
                    value={formData.api.geminiApiKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api: { ...formData.api, geminiApiKey: e.target.value },
                      })
                    }
                    className="w-full pl-3 pr-10 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Default Model
                  </label>
                  <select
                    value={formData.api.geminiModel}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        api: { ...formData.api, geminiModel: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash (Fast & Recommended)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Code Reasoning)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Low Latency)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      Temperature ({formData.api.geminiTemperature})
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      {formData.api.geminiTemperature < 0.4 ? 'Deterministic' : 'Creative'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.api.geminiTemperature}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api: { ...formData.api, geminiTemperature: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Custom AI Developer Instructions (System Prompt Injection)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Always format code in modern TypeScript and enforce strict conventional commit standards."
                  value={formData.api.geminiCustomInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      api: { ...formData.api, geminiCustomInstructions: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* GitHub Personal Access Token (PAT) */}
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    GitHub Integration & Personal Access Token
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Fetch private repositories, latest commit SHAs, and synchronize remote metadata
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTestKey('github')}
                disabled={testingProvider === 'github'}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {testingProvider === 'github' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Test Token</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Personal Access Token (ghp_... or github_pat_...)
                </label>
                <div className="relative">
                  <input
                    type={showGithubToken ? 'text' : 'password'}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={formData.api.githubToken}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api: { ...formData.api, githubToken: e.target.value },
                      })
                    }
                    className="w-full pl-3 pr-10 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGithubToken(!showGithubToken)}
                    className="absolute right-3 top-2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Default GitHub Username / Org Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. torvalds or reyanshecom"
                  value={formData.api.githubDefaultUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      api: { ...formData.api, githubDefaultUsername: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Local LLM & Ollama Configuration */}
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Local LLM & Ollama Endpoint
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Connect local coding models (DeepSeek-Coder, Llama 3, Qwen) running on your local machine
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTestKey('ollama')}
                disabled={testingProvider === 'ollama'}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {testingProvider === 'ollama' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Ping Ollama</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Ollama Base Endpoint
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={formData.api.ollamaEndpoint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      api: { ...formData.api, ollamaEndpoint: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Target Local Model
                </label>
                <input
                  type="text"
                  placeholder="deepseek-coder:6.7b or llama3"
                  value={formData.api.ollamaModel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      api: { ...formData.api, ollamaModel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Webhooks & Alerts */}
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Discord / Slack / Custom Webhook Alerts
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Dispatch notifications when project tasks are completed, ports change, or milestones are shipped
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isTestingWebhook ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Send Test Alert</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Webhook URL
              </label>
              <input
                type="text"
                placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
                value={formData.api.webhookUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    api: { ...formData.api, webhookUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR & WORKSPACES */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Primary Code Editor & Protocol Launchers
                </h3>
                <p className="text-xs text-zinc-400">
                  Choose how project cards and deep links trigger local code editor sessions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Default Editor
                </label>
                <select
                  value={formData.editor.defaultEditor}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    let scheme = 'vscode://file';
                    if (val === 'cursor') scheme = 'cursor://file';
                    if (val === 'vscodium') scheme = 'vscodium://file';
                    if (val === 'sublime') scheme = 'subl://';
                    setFormData({
                      ...formData,
                      editor: { ...formData.editor, defaultEditor: val, customScheme: scheme },
                    });
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="vscode">Visual Studio Code (vscode://)</option>
                  <option value="cursor">Cursor AI Editor (cursor://)</option>
                  <option value="vscodium">VSCodium (vscodium://)</option>
                  <option value="sublime">Sublime Text (subl://)</option>
                  <option value="webstorm">JetBrains WebStorm</option>
                  <option value="custom">Custom Protocol Scheme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Deep Link Protocol URI Scheme
                </label>
                <input
                  type="text"
                  value={formData.editor.customScheme}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      editor: { ...formData.editor, customScheme: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Default Projects Root Directory
                </label>
                <div className="relative">
                  <Folder className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="~/Developer/Projects"
                    value={formData.editor.defaultBasePath}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        editor: { ...formData.editor, defaultBasePath: e.target.value },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Default Terminal Shell
                </label>
                <select
                  value={formData.editor.defaultShell}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      editor: { ...formData.editor, defaultShell: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="zsh">zsh (/bin/zsh)</option>
                  <option value="bash">bash (/bin/bash)</option>
                  <option value="fish">fish (/usr/local/bin/fish)</option>
                  <option value="powershell">powershell.exe</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.editor.openInNewWindow}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      editor: { ...formData.editor, openInNewWindow: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-zinc-300">
                  Open new window when launching workspace from DevDeck
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THEME & UI AESTHETICS */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Studio Launch Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">
                    UI Studio & Theme Switcher
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    34 Themes Available
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Browse dark archetypes, cyber neon, clean daylight, and retro themes with zero visual blots
                </p>
              </div>
            </div>

            {onOpenThemeStudio && (
              <button
                type="button"
                onClick={onOpenThemeStudio}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Theme Hub</span>
              </button>
            )}
          </div>

          {/* Theme Palette Gallery (34 Options) */}
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Select Active Theme ({THEME_DEFINITIONS.length} Options)
                </h3>
                <p className="text-xs text-zinc-400">
                  1-click instant live preview across all workspaces and modals
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {THEME_DEFINITIONS.map((themeOpt) => {
                const isSelected = formData.ui.theme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        ui: { ...formData.ui, theme: themeOpt.id },
                      };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-850 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                            style={{ backgroundColor: themeOpt.accentColor }}
                          />
                          <span className="text-xs font-semibold text-zinc-200">{themeOpt.name}</span>
                        </div>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-500 uppercase px-1 rounded bg-zinc-900 border border-zinc-800">
                            {themeOpt.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2.5">{themeOpt.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-800/80">
                      <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: themeOpt.bgHex }} title="Background" />
                      <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: themeOpt.cardHex }} title="Card Surface" />
                      <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: themeOpt.borderHex }} title="Border" />
                      <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: themeOpt.accentColor }} title="Accent" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Layout Controls */}
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">
              Typography, Spacing & Background Texture
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Font Family Pairing
                </label>
                <select
                  value={formData.ui.fontFamily || 'sans'}
                  onChange={(e: any) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, fontFamily: e.target.value },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="sans">SF Pro / System Modern (Default)</option>
                  <option value="mono">JetBrains Mono Pure (IDE Look)</option>
                  <option value="fira">Fira Code</option>
                  <option value="inter">Inter Clean Minimal</option>
                  <option value="serif">Editorial Serif + Mono</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Corner Geometry
                </label>
                <select
                  value={formData.ui.radius || 'modern'}
                  onChange={(e: any) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, radius: e.target.value },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="sharp">Sharp 0px (Brutalist Terminal)</option>
                  <option value="sleek">Sleek 6px (Linear Style)</option>
                  <option value="modern">Modern 12px (Standard)</option>
                  <option value="smooth">Smooth 16px (Fluid Cards)</option>
                  <option value="pill">Pill 24px (Rounded)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Blot-Free Canvas Pattern
                </label>
                <select
                  value={formData.ui.bgPattern || 'clean'}
                  onChange={(e: any) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, bgPattern: e.target.value },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="clean">Clean Pure (No Blots / Solid)</option>
                  <option value="dots">Architectural Dots</option>
                  <option value="grid">Technical Grid</option>
                  <option value="crosshair">Crosshair Blueprint</option>
                </select>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  UI Density
                </label>
                <select
                  value={formData.ui.density}
                  onChange={(e: any) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, density: e.target.value },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="compact">Compact</option>
                  <option value="comfortable">Standard</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Background Auto-Save Timer
                </label>
                <select
                  value={formData.ui.autoSaveIntervalSec}
                  onChange={(e) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, autoSaveIntervalSec: parseInt(e.target.value, 10) },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="15">Every 15 seconds</option>
                  <option value="30">Every 30 seconds (Recommended)</option>
                  <option value="60">Every 1 minute</option>
                  <option value="300">Every 5 minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ui.confettiEnabled}
                  onChange={(e) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, confettiEnabled: e.target.checked },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-zinc-300">
                  Celebrate milestone task completions with subtle confetti micro-animation
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ui.showSystemMetrics}
                  onChange={(e) => {
                    const updated = {
                      ...formData,
                      ui: { ...formData.ui, showSystemMetrics: e.target.checked },
                    };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-zinc-300">
                  Show live system status, port telemetry & memory widget in sidebar
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DESKTOP APPS & BINARIES */}
      {activeTab === 'desktop' && (
        <div className="space-y-6">
          <div className="bg-[#0c0f17] border border-white/[0.1] rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>DevDeck Standalone Desktop Binaries</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      v1.0.0 Stable
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Download and install DevDeck as a standalone desktop application for Windows, macOS, or Linux
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Download Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Windows */}
              <div className="p-5 bg-black/40 border border-white/[0.08] rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-blue-400" />
                      Windows 10 / 11
                    </span>
                    <span className="text-[10px] font-mono text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded">.EXE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Executable launcher with system tray runner and local dev server manager.
                  </p>
                </div>
                <a
                  href="/api/desktop/download/windows"
                  download
                  className="aesthetic-button-primary w-full py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .EXE</span>
                </a>
              </div>

              {/* macOS */}
              <div className="p-5 bg-black/40 border border-white/[0.08] rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-blue-400" />
                      macOS Universal
                    </span>
                    <span className="text-[10px] font-mono text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded">.DMG / App</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Universal package for Apple Silicon (M1-M4) and Intel Macs with spotlight integration.
                  </p>
                </div>
                <a
                  href="/api/desktop/download/mac"
                  download
                  className="aesthetic-button-secondary w-full py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download for Mac</span>
                </a>
              </div>

              {/* Linux */}
              <div className="p-5 bg-black/40 border border-white/[0.08] rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      Linux Universal
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded">.AppImage / .DEB</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Self-contained AppImage & Debian package for Ubuntu, Debian, Fedora, and Arch.
                  </p>
                </div>
                <a
                  href="/api/desktop/download/linux"
                  download
                  className="aesthetic-button-secondary w-full py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download for Linux</span>
                </a>
              </div>
            </div>

            {/* Terminal Command Quick Install */}
            <div className="p-4 bg-black/60 border border-white/[0.06] rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-300">Quick Command Line Installers:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 bg-black/80 rounded-lg border border-white/[0.05] text-blue-300">
                  <span className="text-slate-500 mr-2">Windows:</span>
                  irm https://devdeck.app/win.ps1 | iex
                </div>
                <div className="p-2.5 bg-black/80 rounded-lg border border-white/[0.05] text-pink-300">
                  <span className="text-slate-500 mr-2">macOS:</span>
                  brew install --cask devdeck
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Workspace Persistence & Backups
                </h3>
                <p className="text-xs text-zinc-400">
                  Export all projects, scripts, environment variables, and snippets to a single portable JSON file
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    Export Full Workspace Backup
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Download {projects.length} projects, environment secrets, and custom AI templates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportData}
                  className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-medium border border-zinc-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    Restore / Import Backup
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Upload a previously saved DevDeck JSON file to replace or merge your workspace.
                  </p>
                </div>
                <label className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-medium border border-zinc-700 flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div>
                  <h4 className="text-xs font-semibold text-red-300 flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Reset to Factory Sample Projects
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Clear custom projects and restore initial developer workspace templates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all projects to factory default sample projects?')) {
                      onResetSampleData();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer"
                >
                  Reset Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
