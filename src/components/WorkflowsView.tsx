import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Workflow as WorkflowIcon,
  Play,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Terminal,
  Server,
  Globe,
  Rocket,
  Flame,
  Database,
  ArrowRight,
  Filter,
  Search,
  Copy,
  Trash2,
  Edit3,
  Star,
  RefreshCw,
  X,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Code2,
  Send,
} from 'lucide-react';
import {
  Workflow,
  WorkflowActionStep,
  WorkflowActionType,
  StepCondition,
  WorkflowExecutionRun,
} from '../types';
import { sound } from '../utils/audio';
import { runWorkflowSequence } from '../utils/workflowEngine';

interface WorkflowsViewProps {
  workflows: Workflow[];
  workflowRuns: WorkflowExecutionRun[];
  onSaveWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (id: string) => void;
  onToggleStarWorkflow: (id: string) => void;
  onAddRunRecord: (run: WorkflowExecutionRun) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onNavigateToCommandPalette?: () => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  workflowRuns,
  onSaveWorkflow,
  onDeleteWorkflow,
  onToggleStarWorkflow,
  onAddRunRecord,
  onShowToast,
  onNavigateToCommandPalette,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('all');

  // Active execution state
  const [activeRun, setActiveRun] = useState<WorkflowExecutionRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunningWorkflowId, setActiveRunningWorkflowId] = useState<string | null>(null);

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Filter workflows
  const allTags = Array.from(new Set(workflows.flatMap((w) => w.tags)));

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.actions.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'all' || w.tags.includes(selectedTag);
    const matchesTrigger = selectedTrigger === 'all' || w.trigger === selectedTrigger;
    return matchesSearch && matchesTag && matchesTrigger;
  });

  const handleRunWorkflow = async (workflow: Workflow) => {
    if (isRunning) {
      onShowToast('Workflow in Progress', 'Please wait for the active sequence to finish', 'warning');
      return;
    }

    sound.playClick(1100);
    setIsRunning(true);
    setActiveRunningWorkflowId(workflow.id);

    onShowToast(
      'Workflow Triggered',
      `Executing sequence: "${workflow.name}"`,
      'info'
    );

    try {
      const resultRun = await runWorkflowSequence(workflow, 'Workflows Engine Console', {
        onStepStart: (_idx, _step, currentRun) => {
          setActiveRun({ ...currentRun });
        },
        onStepLog: (_idx, _log, currentRun) => {
          setActiveRun({ ...currentRun });
        },
        onStepComplete: (_idx, _res, currentRun) => {
          setActiveRun({ ...currentRun });
        },
        onWorkflowComplete: (finalRun) => {
          setActiveRun({ ...finalRun });
          onAddRunRecord(finalRun);

          // Update workflow run stats
          const updated: Workflow = {
            ...workflow,
            lastRunAt: new Date().toISOString(),
            lastRunStatus: finalRun.status === 'passed' ? 'passed' : 'failed',
            lastRunDurationSec: finalRun.durationSec,
            totalRuns: workflow.totalRuns + 1,
            successRatePct:
              finalRun.status === 'passed'
                ? Math.min(100, Math.round(((workflow.totalRuns * (workflow.successRatePct / 100) + 1) / (workflow.totalRuns + 1)) * 100))
                : Math.round(((workflow.totalRuns * (workflow.successRatePct / 100)) / (workflow.totalRuns + 1)) * 100),
            updatedAt: new Date().toISOString(),
          };
          onSaveWorkflow(updated);

          onShowToast(
            'Sequence Completed',
            `All actions in "${workflow.name}" passed successfully (${finalRun.durationSec}s)`,
            'success'
          );
        },
      });

      setActiveRun(resultRun);
    } catch (e) {
      console.error('Workflow run error:', e);
      onShowToast('Workflow Execution Failed', String(e), 'error');
    } finally {
      setIsRunning(false);
      setActiveRunningWorkflowId(null);
    }
  };

  const handleOpenNewWorkflow = () => {
    sound.playClick(1200);
    const newWf: Workflow = {
      id: `wf-${Date.now().toString(36)}`,
      name: 'Trigger Pipeline -> Run Test Suite -> Deploy if Passed',
      description: 'Automated CI/CD validation chain with passing-test rollout gate.',
      icon: 'Zap',
      color: 'emerald',
      trigger: 'command_palette',
      tags: ['ci/cd', 'deploy', 'quick-trigger'],
      isStarred: false,
      totalRuns: 0,
      successRatePct: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          id: `act-${Date.now()}-1`,
          name: 'Trigger CI/CD Pipeline',
          type: 'trigger_pipeline',
          config: {
            targetProject: 'NeuralPulse AI Core',
            branch: 'main',
            targetEnvironment: 'staging-gpu-cluster',
            condition: 'always',
          },
        },
        {
          id: `act-${Date.now()}-2`,
          name: 'Run Full Test Suite',
          type: 'run_tests',
          config: {
            testRunner: 'vitest',
            command: 'npx vitest run --coverage',
            condition: 'if_passed',
            timeoutSec: 120,
          },
        },
        {
          id: `act-${Date.now()}-3`,
          name: 'Deploy if Passed',
          type: 'deploy',
          config: {
            targetEnvironment: 'production',
            condition: 'if_passed',
          },
        },
      ],
    };
    setEditingWorkflow(newWf);
    setIsEditorOpen(true);
  };

  const handleEditWorkflow = (wf: Workflow) => {
    sound.playClick(1050);
    setEditingWorkflow(JSON.parse(JSON.stringify(wf)));
    setIsEditorOpen(true);
  };

  const getActionIcon = (type: WorkflowActionType) => {
    switch (type) {
      case 'trigger_pipeline':
        return <WorkflowIcon className="w-4 h-4 text-blue-400" />;
      case 'run_tests':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'deploy':
        return <Rocket className="w-4 h-4 text-purple-400" />;
      case 'run_script':
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'http_request':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'ai_review':
        return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'provision_instance':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'notify_team':
        return <Send className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const getActionTypeLabel = (type: WorkflowActionType) => {
    switch (type) {
      case 'trigger_pipeline':
        return 'CI/CD Pipeline';
      case 'run_tests':
        return 'Test Suite';
      case 'deploy':
        return 'Deploy / Rollout';
      case 'run_script':
        return 'Shell Script';
      case 'http_request':
        return 'HTTP Webhook';
      case 'ai_review':
        return 'Gemini AI Review';
      case 'provision_instance':
        return 'GPU Compute Provision';
      case 'notify_team':
        return 'Team Broadcast';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="aesthetic-card rounded-2xl p-5 lg:p-6 relative overflow-hidden border border-white/[0.08]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <WorkflowIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Workflow Automation Engine
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ⌘K Trigger Ready
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Orchestrate multi-step pipelines: Trigger CI ➔ Run Test Suite ➔ Gate on Success ➔ Automated Zero-Downtime Deploy.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                const topWf = workflows[0];
                if (topWf) handleRunWorkflow(topWf);
              }}
              disabled={isRunning}
              className="aesthetic-button-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isRunning ? 'Executing Sequence...' : 'Run Pipeline ➔ Test ➔ Deploy'}</span>
            </button>

            <button
              onClick={handleOpenNewWorkflow}
              className="aesthetic-button-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              <span>New Workflow</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Configured Workflows</div>
            <div className="text-lg font-bold text-slate-200 mt-0.5 font-mono">{workflows.length} Sequences</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Overall Pass Rate</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">98.6% Passed</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Avg Execution Time</div>
            <div className="text-lg font-bold text-blue-400 mt-0.5 font-mono">38s / Run</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Command Palette</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono flex items-center gap-1">
              <span>⌘K Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Execution Drawer if active run exists */}
      <AnimatePresence>
        {activeRun && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="aesthetic-card rounded-2xl p-5 border-2 border-blue-500/40 bg-[#090d16] space-y-4 shadow-2xl shadow-blue-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : activeRun.status === 'passed' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <div>
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                    <span>Live Sequence Runner:</span>
                    <span className="text-blue-400 font-bold">{activeRun.workflowName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Triggered by: {activeRun.triggeredBy} • Status: <span className="uppercase font-mono font-semibold text-slate-300">{activeRun.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = activeRun.stepResults.flatMap((s) => s.logs).join('\n');
                    navigator.clipboard.writeText(text);
                    sound.playClick(1000);
                    onShowToast('Logs Copied', 'Copied full execution logs to clipboard', 'info');
                  }}
                  className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer border border-white/[0.06]"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Logs</span>
                </button>
                <button
                  onClick={() => setActiveRun(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Steps Timeline Progress Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {activeRun.stepResults.map((step, idx) => {
                const isCurrent = isRunning && activeRun.currentStepIndex === idx;
                const isPassed = step.status === 'passed';
                const isSkipped = step.status === 'skipped';
                return (
                  <div
                    key={step.stepId}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm shadow-amber-500/10'
                        : isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : isSkipped
                        ? 'bg-white/[0.02] border-white/[0.06] text-slate-500'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-semibold">Step {idx + 1}</span>
                      <span className="uppercase text-[9px] px-1.5 py-0.2 rounded font-bold bg-white/[0.06]">
                        {isCurrent ? 'Running...' : step.status}
                      </span>
                    </div>
                    <div className="font-medium text-xs text-slate-200 truncate">{step.stepName}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{getActionTypeLabel(step.type)}</span>
                      {step.durationSec > 0 && <span>{step.durationSec}s</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Terminal Output Console */}
            <div className="bg-[#05080e] rounded-xl p-3.5 border border-white/[0.08] font-mono text-[11px] space-y-1 max-h-56 overflow-y-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Console Stream (stdout / stderr)</span>
                {isRunning && <span className="text-amber-400 animate-pulse font-semibold">● Streaming Output</span>}
              </div>
              {activeRun.stepResults.flatMap((s) => s.logs).length > 0 ? (
                activeRun.stepResults.flatMap((s) => s.logs).map((log, lIdx) => (
                  <div key={lIdx} className="text-slate-300 leading-relaxed font-mono">
                    {log.includes('PASS') || log.includes('SUCCESS') || log.includes('✔') ? (
                      <span className="text-emerald-400">{log}</span>
                    ) : log.includes('FAIL') || log.includes('error') ? (
                      <span className="text-rose-400">{log}</span>
                    ) : log.includes('Evaluating') || log.includes('Initializing') || log.includes('Running') ? (
                      <span className="text-blue-300">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">Initializing runner process...</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="aesthetic-card rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows, pipelines, actions..."
              className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Trigger filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] text-slate-400 font-mono shrink-0">Trigger:</span>
            <select
              value={selectedTrigger}
              onChange={(e) => setSelectedTrigger(e.target.value)}
              className="bg-[#0e121a] border border-white/[0.08] rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
            >
              <option value="all">All Triggers</option>
              <option value="command_palette">⌘K Command Palette</option>
              <option value="git_push">Git Push / PR</option>
              <option value="cron_schedule">Cron Schedule</option>
              <option value="webhook">HTTP Webhook</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
        </div>

        {/* Tags pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/[0.06] pb-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
            }`}
          >
            All Sequences ({workflows.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Cards List */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => {
          const isThisRunning = isRunning && activeRunningWorkflowId === workflow.id;

          return (
            <div
              key={workflow.id}
              className="aesthetic-card rounded-2xl p-5 lg:p-6 border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-4 relative group"
            >
              {/* Header: Title, Description, Trigger Badge, Run CTA */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <WorkflowIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 truncate">{workflow.name}</h3>
                    <button
                      onClick={() => onToggleStarWorkflow(workflow.id)}
                      className="text-slate-400 hover:text-amber-400 cursor-pointer p-1"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          workflow.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                      Trigger: {workflow.trigger === 'command_palette' ? '⌘K Palette' : workflow.trigger}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{workflow.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRunWorkflow(workflow)}
                    disabled={isRunning}
                    className="aesthetic-button-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 text-white fill-white" />
                    <span>{isThisRunning ? 'Running...' : 'Run Workflow'}</span>
                  </button>

                  <button
                    onClick={() => handleEditWorkflow(workflow)}
                    className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/[0.06] border border-white/[0.06] cursor-pointer"
                    title="Edit Sequence"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete workflow "${workflow.name}"?`)) {
                        sound.playClick(900);
                        onDeleteWorkflow(workflow.id);
                        onShowToast('Workflow Deleted', workflow.name, 'info');
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/[0.06] border border-white/[0.06] cursor-pointer"
                    title="Delete Workflow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Action Sequence Flow Diagram */}
              <div className="bg-[#080c14] rounded-xl p-4 border border-white/[0.06] space-y-2">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                  <span>Action Sequence Flow</span>
                  <span className="text-slate-500 font-normal">{workflow.actions.length} Steps in Chain</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                  {workflow.actions.map((act, idx) => (
                    <React.Fragment key={act.id}>
                      <div className="p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl border border-white/[0.08] min-w-[200px] shrink-0 space-y-1.5 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
                              {getActionIcon(act.type)}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">
                              Step {idx + 1}
                            </span>
                          </div>
                          {act.config.condition && act.config.condition !== 'always' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {act.config.condition === 'if_passed' ? 'if passed' : 'if failed'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">{act.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {act.config.command || act.config.targetEnvironment || act.config.testRunner || getActionTypeLabel(act.type)}
                        </div>
                      </div>

                      {idx < workflow.actions.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Bottom Metadata: Tags, Stats, Last Run */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {workflow.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-white/[0.03] text-slate-400 font-mono text-[10px] border border-white/[0.05]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span>Pass Rate: <strong className="text-emerald-400">{workflow.successRatePct}%</strong></span>
                  <span>Total Runs: <strong className="text-slate-300">{workflow.totalRuns}</strong></span>
                  {workflow.lastRunAt && (
                    <span>Last Run: {new Date(workflow.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredWorkflows.length === 0 && (
          <div className="aesthetic-card p-12 text-center rounded-2xl border-dashed border-white/[0.1] space-y-3">
            <WorkflowIcon className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Workflows Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No automation workflows matched your search filters. Try clearing your search or add a new sequence.
            </p>
            <button
              onClick={handleOpenNewWorkflow}
              className="aesthetic-button-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Create New Workflow
            </button>
          </div>
        )}
      </div>

      {/* Interactive Workflow Editor & Visual Sequence Customizer Modal */}
      <AnimatePresence>
        {isEditorOpen && editingWorkflow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="aesthetic-card rounded-2xl p-6 w-full max-w-3xl border border-white/[0.12] bg-[#0c101a] shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <WorkflowIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Workflow Sequence Builder</h3>
                    <p className="text-xs text-slate-400">Chain automated actions with condition gates and triggers</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form fields: Name, Description, Trigger */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Workflow Title</label>
                  <input
                    type="text"
                    value={editingWorkflow.name}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    placeholder="e.g. Trigger Pipeline -> Run Test Suite -> Deploy if Passed"
                    className="w-full bg-[#070a12] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Mechanism</label>
                    <select
                      value={editingWorkflow.trigger}
                      onChange={(e) => setEditingWorkflow({ ...editingWorkflow, trigger: e.target.value as any })}
                      className="w-full bg-[#070a12] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="command_palette">⌘K Command Palette (Instant Run)</option>
                      <option value="git_push">Git Push / Pull Request Hook</option>
                      <option value="cron_schedule">Cron Schedule (Periodic)</option>
                      <option value="webhook">Inbound HTTP Webhook</option>
                      <option value="manual">Manual Execution</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editingWorkflow.tags.join(', ')}
                      onChange={(e) =>
                        setEditingWorkflow({
                          ...editingWorkflow,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="ci/cd, deploy, test-suite"
                      className="w-full bg-[#070a12] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingWorkflow.description}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                    placeholder="Brief description of what this workflow automates..."
                    className="w-full bg-[#070a12] border border-white/[0.08] rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Steps Reorderable List */}
              <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Sequence Steps ({editingWorkflow.actions.length})
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick(1150);
                      const newAct: WorkflowActionStep = {
                        id: `act-${Date.now().toString(36)}`,
                        name: 'Execute Step',
                        type: 'run_script',
                        config: {
                          command: 'echo "Running step..."',
                          condition: 'if_passed',
                        },
                      };
                      setEditingWorkflow({
                        ...editingWorkflow,
                        actions: [...editingWorkflow.actions, newAct],
                      });
                    }}
                    className="aesthetic-button-secondary text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {editingWorkflow.actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-[#070a12] rounded-xl border border-white/[0.08] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">{getActionTypeLabel(act.type)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Move up */}
                          <button
                            disabled={idx === 0}
                            onClick={() => {
                              const acts = [...editingWorkflow.actions];
                              const temp = acts[idx - 1];
                              acts[idx - 1] = acts[idx];
                              acts[idx] = temp;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move down */}
                          <button
                            disabled={idx === editingWorkflow.actions.length - 1}
                            onClick={() => {
                              const acts = [...editingWorkflow.actions];
                              const temp = acts[idx + 1];
                              acts[idx + 1] = acts[idx];
                              acts[idx] = temp;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete step */}
                          <button
                            onClick={() => {
                              setEditingWorkflow({
                                ...editingWorkflow,
                                actions: editingWorkflow.actions.filter((_, aIdx) => aIdx !== idx),
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-400 font-mono">Action Type</label>
                          <select
                            value={act.type}
                            onChange={(e) => {
                              const acts = [...editingWorkflow.actions];
                              acts[idx].type = e.target.value as WorkflowActionType;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer"
                          >
                            <option value="trigger_pipeline">Trigger CI/CD Pipeline</option>
                            <option value="run_tests">Run Test Suite</option>
                            <option value="deploy">Deploy / Rollout</option>
                            <option value="run_script">Execute Shell Script</option>
                            <option value="http_request">HTTP Webhook Request</option>
                            <option value="ai_review">Gemini AI Review</option>
                            <option value="provision_instance">Provision GPU Node</option>
                            <option value="notify_team">Team Notification</option>
                          </select>
                        </div>

                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-400 font-mono">Step Label</label>
                          <input
                            type="text"
                            value={act.name}
                            onChange={(e) => {
                              const acts = [...editingWorkflow.actions];
                              acts[idx].name = e.target.value;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            placeholder="Step name"
                            className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-400 font-mono">Execution Condition</label>
                          <select
                            value={act.config.condition || 'always'}
                            onChange={(e) => {
                              const acts = [...editingWorkflow.actions];
                              acts[idx].config.condition = e.target.value as StepCondition;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer"
                          >
                            <option value="always">Always Execute</option>
                            <option value="if_passed">Only if Previous Passed</option>
                            <option value="if_failed">Only if Previous Failed</option>
                          </select>
                        </div>
                      </div>

                      {/* Detail inputs according to type */}
                      {act.type === 'run_script' && (
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono">Command</label>
                          <input
                            type="text"
                            value={act.config.command || ''}
                            onChange={(e) => {
                              const acts = [...editingWorkflow.actions];
                              acts[idx].config.command = e.target.value;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            placeholder="npm run test && tsc --noEmit"
                            className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono"
                          />
                        </div>
                      )}

                      {act.type === 'deploy' && (
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono">Deploy Target Environment</label>
                          <select
                            value={act.config.targetEnvironment || 'production'}
                            onChange={(e) => {
                              const acts = [...editingWorkflow.actions];
                              acts[idx].config.targetEnvironment = e.target.value as any;
                              setEditingWorkflow({ ...editingWorkflow, actions: acts });
                            }}
                            className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer font-mono"
                          >
                            <option value="production">production (Production Live Fleet)</option>
                            <option value="staging-gpu-cluster">staging-gpu-cluster (Staging Cluster)</option>
                            <option value="preview-pr">preview-pr (PR Preview Sandbox)</option>
                            <option value="dev-sandbox">dev-sandbox (Development Sandbox)</option>
                          </select>
                        </div>
                      )}

                      {act.type === 'run_tests' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono">Test Runner</label>
                            <select
                              value={act.config.testRunner || 'vitest'}
                              onChange={(e) => {
                                const acts = [...editingWorkflow.actions];
                                acts[idx].config.testRunner = e.target.value as any;
                                setEditingWorkflow({ ...editingWorkflow, actions: acts });
                              }}
                              className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer font-mono"
                            >
                              <option value="vitest">Vitest</option>
                              <option value="jest">Jest</option>
                              <option value="pytest">PyTest</option>
                              <option value="cargo">Cargo Test</option>
                              <option value="playwright">Playwright E2E</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono">Timeout (seconds)</label>
                            <input
                              type="number"
                              value={act.config.timeoutSec || 60}
                              onChange={(e) => {
                                const acts = [...editingWorkflow.actions];
                                acts[idx].config.timeoutSec = Number(e.target.value);
                                setEditingWorkflow({ ...editingWorkflow, actions: acts });
                              }}
                              className="w-full bg-[#0d121e] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="aesthetic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sound.playSuccess();
                    onSaveWorkflow(editingWorkflow);
                    setIsEditorOpen(false);
                    onShowToast('Workflow Saved', editingWorkflow.name, 'success');
                  }}
                  className="aesthetic-button-primary px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Sequence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
