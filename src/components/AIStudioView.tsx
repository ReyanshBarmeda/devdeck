import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Plus,
  Play,
  Zap,
  Loader2,
  Trash2,
  Star,
  Check,
  Code2,
  Bot,
  Filter,
  Wand2,
} from 'lucide-react';
import { AIPrompt, Project } from '../types';

interface AIStudioViewProps {
  prompts: AIPrompt[];
  projects: Project[];
  onAddPrompt: (prompt: AIPrompt) => void;
  onDeletePrompt: (id: string) => void;
  onToggleFavoritePrompt: (id: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AIStudioView: React.FC<AIStudioViewProps> = ({
  prompts,
  projects,
  onAddPrompt,
  onDeletePrompt,
  onToggleFavoritePrompt,
  onShowToast,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt>(prompts[0] || null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Runner state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState('');

  // Prompt Optimizer state
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [rawPromptInput, setRawPromptInput] = useState('');
  const [optimizerRole, setOptimizerRole] = useState('Senior Fullstack Engineer');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState('');

  // Add Prompt Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AIPrompt['category']>('coding');
  const [newModel, setNewModel] = useState('Gemini 3.7 Flash');
  const [newSystemPrompt, setNewSystemPrompt] = useState('');
  const [newUserTemplate, setNewUserTemplate] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('');

  const categories = [
    { id: 'all', label: 'All Prompts' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'coding', label: 'Coding & Refactor' },
    { id: 'review', label: 'Code Review' },
    { id: 'testing', label: 'Testing & QA' },
    { id: 'documentation', label: 'Docs & README' },
    { id: 'debugging', label: 'Debugging' },
  ];

  const filteredPrompts = prompts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Run prompt with Gemini 3.7 Flash
  const handleExecutePrompt = async () => {
    if (!selectedPrompt) return;
    setIsRunning(true);
    setRunResult('');

    // Interpolate variables
    let finalUserMessage = selectedPrompt.userTemplate;
    Object.entries(variableValues).forEach(([key, val]) => {
      finalUserMessage = finalUserMessage.replaceAll(`{{${key}}}`, val || `[${key}]`);
    });

    try {
      const response = await fetch('/api/ai/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalUserMessage,
          type: 'custom',
          projectContext: {
            systemInstruction: selectedPrompt.systemPrompt,
            model: selectedPrompt.modelTarget,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      setRunResult(data.result || 'No response generated.');
      onShowToast('Prompt Executed', `Generated output with ${selectedPrompt.modelTarget}`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('AI Execution Error', err.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Run Prompt Optimizer
  const handleOptimizePrompt = async () => {
    if (!rawPromptInput.trim()) return;
    setIsOptimizing(true);
    setOptimizedResult('');

    try {
      const response = await fetch('/api/ai/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: rawPromptInput,
          targetRole: optimizerRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed');
      }

      setOptimizedResult(data.result || '');
      onShowToast('Prompt Optimized!', 'Elevated with Gemini 3.7 Flash', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('Optimization Failed', err.message, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Create custom prompt
  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSystemPrompt.trim()) return;

    // Detect variables inside template (e.g. {{var}})
    const detectedVars: string[] = [];
    const matches = newUserTemplate.matchAll(/\{\{([^}]+)\}\}/g);
    for (const match of matches) {
      if (match[1] && !detectedVars.includes(match[1].trim())) {
        detectedVars.push(match[1].trim());
      }
    }

    const created: AIPrompt = {
      id: `prm-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      modelTarget: newModel,
      systemPrompt: newSystemPrompt.trim(),
      userTemplate: newUserTemplate.trim() || 'Execute the instructions for {{code}}',
      tags: newTagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      isFavorite: false,
      variables: detectedVars.length > 0 ? detectedVars : ['input'],
    };

    onAddPrompt(created);
    setSelectedPrompt(created);
    setShowAddModal(false);
    setNewTitle('');
    setNewSystemPrompt('');
    setNewUserTemplate('');
    setNewTagsInput('');
    onShowToast('Prompt Saved', created.title, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-sky-950/40 to-slate-900 border border-blue-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
              Gemini 3.7 Flash Powered
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            AI & Developer System Prompts Studio
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Curated library of high-precision coding prompts, architecture blueprints, unit test generators, and an interactive prompt sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowOptimizer(!showOptimizer)}
            className="px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900/80 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Wand2 className="w-4 h-4 text-blue-300" />
            <span>Prompt Optimizer</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Prompt</span>
          </button>
        </div>
      </div>

      {/* Prompt Optimizer Drawer / Card */}
      {showOptimizer && (
        <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-blue-200">
                AI Prompt Optimizer & Enhancer
              </h3>
            </div>
            <button
              onClick={() => setShowOptimizer(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Rough Prompt
              </label>
              <textarea
                rows={3}
                value={rawPromptInput}
                onChange={(e) => setRawPromptInput(e.target.value)}
                placeholder="e.g. Write a prompt that reviews my React code and points out bugs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Persona
                </label>
                <input
                  type="text"
                  value={optimizerRole}
                  onChange={(e) => setOptimizerRole(e.target.value)}
                  placeholder="e.g. Senior Security Auditor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !rawPromptInput.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Optimize with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {optimizedResult && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300">Optimized Prompt Result:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(optimizedResult);
                    onShowToast('Copied to Clipboard', 'Optimized prompt copied', 'success');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {optimizedResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter prompts & templates..."
          className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 max-w-xs"
        />
      </div>

      {/* Two Column Layout: Prompts List + Interactive Runner Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Prompt Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredPrompts.map((prompt) => {
            const isSelected = selectedPrompt?.id === prompt.id;
            return (
              <div
                key={prompt.id}
                onClick={() => {
                  setSelectedPrompt(prompt);
                  setRunResult('');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-500/30">
                        {prompt.modelTarget}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {prompt.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 truncate">
                      {prompt.title}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoritePrompt(prompt.id);
                    }}
                    className="text-slate-400 hover:text-amber-400 p-1"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        prompt.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-2 font-mono text-[11px] leading-relaxed">
                  {prompt.systemPrompt}
                </p>

                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/60">
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                    <span>Test in Sandbox</span>
                    <Zap className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Sandbox / Runner Panel (7 cols) */}
        <div className="lg:col-span-7 sticky top-20">
          {selectedPrompt ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">
                      {selectedPrompt.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Model: <span className="font-mono text-blue-300">{selectedPrompt.modelTarget}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPrompt.systemPrompt);
                    onShowToast('System Prompt Copied', selectedPrompt.title, 'success');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy System Prompt</span>
                </button>
              </div>

              {/* System Prompt View */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  System Instruction
                </label>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedPrompt.systemPrompt}
                </div>
              </div>

              {/* Variable inputs */}
              {selectedPrompt.variables.length > 0 && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wider">
                    Template Variables
                  </label>
                  <div className="space-y-2">
                    {selectedPrompt.variables.map((v) => (
                      <div key={v}>
                        <span className="block text-[11px] font-mono text-slate-400 mb-1">
                          {`{{${v}}}`}
                        </span>
                        <input
                          type="text"
                          value={variableValues[v] || ''}
                          onChange={(e) =>
                            setVariableValues({ ...variableValues, [v]: e.target.value })
                          }
                          placeholder={`Value for ${v}...`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Run CTA */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleExecutePrompt}
                  disabled={isRunning}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing with Gemini 3.7 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Test Prompt with Live Gemini</span>
                    </>
                  )}
                </button>
              </div>

              {/* Run Result Output */}
              {runResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Live Model Output
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(runResult);
                        onShowToast('Copied Result', 'Output copied to clipboard', 'success');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto p-2 bg-slate-900/60 rounded-lg">
                    {runResult}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
              <Bot className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p>Select a prompt from the list to test in the interactive sandbox.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono">Create Custom AI Prompt</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrompt} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Rust Microservice Concurrency Auditor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="coding">Coding & Implementation</option>
                    <option value="architecture">Architecture & System Design</option>
                    <option value="review">Code Review & Security</option>
                    <option value="testing">Testing & QA</option>
                    <option value="documentation">Documentation</option>
                    <option value="debugging">Debugging & Profiling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Model</label>
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Gemini 3.7 Flash">Gemini 3.7 Flash</option>
                    <option value="Gemini 3.1 Pro">Gemini 3.1 Pro</option>
                    <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="DeepSeek R1">DeepSeek R1</option>
                    <option value="Ollama Local LLM">Ollama Local LLM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Prompt *</label>
                <textarea
                  rows={4}
                  required
                  value={newSystemPrompt}
                  onChange={(e) => setNewSystemPrompt(e.target.value)}
                  placeholder="You are an expert developer specializing in..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  User Template (use <code className="text-blue-300 font-mono">{'{{var_name}}'}</code> for variables)
                </label>
                <textarea
                  rows={2}
                  value={newUserTemplate}
                  onChange={(e) => setNewUserTemplate(e.target.value)}
                  placeholder="Review this code for project {{project_name}}: {{code}}"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTagsInput}
                  onChange={(e) => setNewTagsInput(e.target.value)}
                  placeholder="React, Performance, Security"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
