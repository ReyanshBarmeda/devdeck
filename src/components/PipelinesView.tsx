import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  GitCommit,
  GitBranch,
  Layers,
  Terminal,
  ExternalLink,
  Shield,
  Zap,
  Sparkles,
  Search,
  Filter,
  Check,
  Copy,
  Download,
  Flame,
  ArrowRight,
  RefreshCw,
  Box,
  Server,
  Activity,
  AlertCircle,
  Workflow,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { PipelineRun, PipelineStage, PipelineStep, PipelineStatus } from '../types';

interface PipelinesViewProps {
  pipelines: PipelineRun[];
  onTriggerPipeline: (projectName: string, branch: string, env: PipelineRun['environment']) => void;
  onRollback: (pipelineId: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PipelinesView: React.FC<PipelinesViewProps> = ({
  pipelines,
  onTriggerPipeline,
  onRollback,
  onShowToast,
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(pipelines[0]?.id || '');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [filterEnv, setFilterEnv] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New run trigger form
  const [newRunProject, setNewRunProject] = useState('NeuralPulse AI Core');
  const [newRunBranch, setNewRunBranch] = useState('main');
  const [newRunEnv, setNewRunEnv] = useState<PipelineRun['environment']>('staging-gpu-cluster');

  const selectedRun = pipelines.find((p) => p.id === selectedRunId) || pipelines[0];

  // Stage selection fallback
  const currentStage =
    selectedRun?.stages.find((s) => s.id === selectedStageId) || selectedRun?.stages[0];

  const filteredPipelines = pipelines.filter((pipe) => {
    const matchesSearch =
      pipe.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipe.commitMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipe.commitHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipe.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = filterEnv === 'all' || pipe.environment === filterEnv;
    return matchesSearch && matchesEnv;
  });

  const getStatusBadge = (status: PipelineStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Passed
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            Running
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case 'queued':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Clock className="w-3.5 h-3.5" />
            Queued
          </span>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    onShowToast('Copied to Clipboard', text, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleStartManualPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerPipeline(newRunProject, newRunBranch, newRunEnv);
    setIsTriggerModalOpen(false);
    onShowToast('Pipeline Dispatched', `Triggered ${newRunProject} on ${newRunBranch} (${newRunEnv})`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#0a0d14] border border-zinc-800/90 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shadow-blue-500/10">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-zinc-100 font-mono tracking-tight">
                CI/CD Pipelines & Automated Deployments
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">
                GHCR & Docker Edge
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Hopper CUDA Verified
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated multi-stage test suites, PyTorch CUDA tensor benchmarks, container builds, and zero-downtime cluster rollouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Dispatch Pipeline</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commits, branches, authors, sha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d14] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Environments' },
            { id: 'production', label: 'Production' },
            { id: 'staging-gpu-cluster', label: 'Staging GPU' },
            { id: 'preview-pr', label: 'Preview PR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterEnv(tab.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterEnv === tab.id
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-[#0a0d14] text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Split View: Runs List & Detailed Stage Execution Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Recent Pipeline Runs (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1 flex items-center justify-between">
            <span>Execution History ({filteredPipelines.length})</span>
            <span className="font-mono text-[10px]">Real-Time Webhooks</span>
          </div>

          <div className="space-y-2.5">
            {filteredPipelines.map((run) => {
              const isSelected = run.id === selectedRunId;
              return (
                <div
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0e121d] border-blue-500/60 shadow-lg shadow-blue-950/20'
                      : 'bg-[#0a0d14] border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-100">
                          {run.projectName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {run.environment}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium line-clamp-1 mt-1">
                        {run.commitMessage}
                      </p>
                    </div>
                    {getStatusBadge(run.status)}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-blue-400">
                        <GitBranch className="w-3 h-3" />
                        {run.branch}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500">#{run.commitHash}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{run.durationSec}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Run Stages & Live Terminal Logs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedRun && (
            <div className="bg-[#0a0d14] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
              {/* Active Run Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      {selectedRun.projectName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {selectedRun.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <span>Triggered by <strong>{selectedRun.author}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-blue-400">{selectedRun.branch} ({selectedRun.commitHash})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedRun.status === 'passed' && (
                    <button
                      onClick={() => onRollback(selectedRun.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3 text-amber-400" />
                      <span>Rollback Here</span>
                    </button>
                  )}

                  {selectedRun.dockerImageTag && (
                    <button
                      onClick={() => copyToClipboard(selectedRun.dockerImageTag!, 'docker')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                      title="Copy Docker Image Tag"
                    >
                      {copiedText === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                      <span>Image Tag</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-Stage Visual Pipeline Flow */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
                  Pipeline Stages ({selectedRun.stages.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {selectedRun.stages.map((stg, idx) => {
                    const isStageActive = currentStage?.id === stg.id;
                    return (
                      <div
                        key={stg.id}
                        onClick={() => setSelectedStageId(stg.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isStageActive
                            ? 'bg-blue-600/15 border-blue-500/60 shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>0{idx + 1}</span>
                          {stg.status === 'passed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {stg.status === 'running' && <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                          {stg.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          {stg.status === 'queued' && <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                        </div>
                        <div className="font-semibold text-xs text-zinc-200 mt-2 line-clamp-1">
                          {stg.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                          {stg.steps.length} {stg.steps.length === 1 ? 'task' : 'tasks'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Stage Steps & Terminal Execution Logs */}
              {currentStage && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200 font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Stage Logs: {currentStage.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Exit Code: 0 (Success)
                    </span>
                  </div>

                  <div className="bg-[#05070a] border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
                    {currentStage.steps.map((step) => (
                      <div key={step.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-900">
                          <div className="flex items-center gap-2">
                            {step.status === 'passed' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            {step.status === 'running' && <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                            {step.status === 'queued' && <Clock className="w-3.5 h-3.5 text-zinc-600" />}
                            <span className="text-zinc-200 font-semibold">{step.name}</span>
                          </div>
                          <span className="text-zinc-500 text-[10px]">{step.durationSec}s</span>
                        </div>

                        <div className="pl-4 space-y-0.5 text-[11px] text-zinc-400 leading-relaxed">
                          {step.logs.map((log, lidx) => (
                            <div key={lidx} className="hover:text-zinc-200 transition-colors">
                              <span className="text-zinc-600 mr-2">$</span>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Trigger Pipeline Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0d14] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-zinc-100 font-mono text-sm">
                <Workflow className="w-4 h-4 text-blue-400" />
                Dispatch Manual CI/CD Pipeline
              </div>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartManualPipeline} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Project</label>
                <select
                  value={newRunProject}
                  onChange={(e) => setNewRunProject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="NeuralPulse AI Core">NeuralPulse AI Core</option>
                  <option value="DevDeck Cloud Control Plane">DevDeck Cloud Control Plane</option>
                  <option value="VectorSync Postgres Extension">VectorSync Postgres Extension</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Git Branch</label>
                <input
                  type="text"
                  value={newRunBranch}
                  onChange={(e) => setNewRunBranch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="main, feature/branch"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Environment</label>
                <select
                  value={newRunEnv}
                  onChange={(e) => setNewRunEnv(e.target.value as PipelineRun['environment'])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="staging-gpu-cluster">Staging GPU Cluster (NVIDIA H100)</option>
                  <option value="production">Production Cloud Run + CDN</option>
                  <option value="preview-pr">Ephemeral Preview PR Container</option>
                  <option value="dev-sandbox">Dev Sandbox VM</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsTriggerModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md cursor-pointer hover:opacity-90"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Build</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
