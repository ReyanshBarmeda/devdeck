import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Code2,
  FolderGit2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  Copy,
  Terminal,
  Network,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Loader2,
  Edit,
  Star,
  FileText,
  Layers,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { Project, ProjectTask, EnvVariable, ProjectScript } from '../types';
import {
  getVSCodeUrl,
  getCategoryBadge,
  getStatusBadge,
  getPriorityBadge,
  getGitHubCloneCommands,
  triggerConfetti,
  formatTimeAgo,
} from '../utils/helpers';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
  onEditProject: (project: Project) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

type TabType = 'overview' | 'ai-architect' | 'scripts' | 'env' | 'notes';

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onEditProject,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // AI Architect State
  const [aiPromptType, setAiPromptType] = useState<'readme' | 'breakdown' | 'stack' | 'custom'>('breakdown');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // New task input inside modal
  const [newTaskText, setNewTaskText] = useState('');

  // Env variables local state for masking
  const [revealedEnvSecrets, setRevealedEnvSecrets] = useState<Record<string, boolean>>({});

  // New Env var inside modal
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newSecret, setNewSecret] = useState(false);

  // New Script inside modal
  const [newScriptLabel, setNewScriptLabel] = useState('');
  const [newScriptCmd, setNewScriptCmd] = useState('');

  // Notes state
  const [notesDraft, setNotesDraft] = useState('');

  React.useEffect(() => {
    if (project) {
      setNotesDraft(project.notes || '');
      setAiResult('');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const category = getCategoryBadge(project.category);
  const status = getStatusBadge(project.status);
  const priority = getPriorityBadge(project.priority);

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const cloneCmds = getGitHubCloneCommands(project.githubUrl);

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedProject = { ...project, tasks: updatedTasks, updatedAt: new Date().toISOString() };
    onUpdateProject(updatedProject);

    const isNowAllDone = updatedTasks.every((t) => t.completed) && updatedTasks.length > 0;
    if (isNowAllDone) {
      triggerConfetti();
      onShowToast('All Milestones Completed!', `Congratulations! All tasks done for ${project.name}`, 'success');
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: ProjectTask = {
      id: `t-${Date.now()}`,
      title: newTaskText.trim(),
      completed: false,
      priority: 'medium',
    };
    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
    setNewTaskText('');
    onShowToast('Milestone Added', newTask.title, 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedProject = {
      ...project,
      tasks: project.tasks.filter((t) => t.id !== taskId),
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
  };

  // Run AI Architect
  const handleRunAI = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const response = await fetch('/api/ai/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiCustomPrompt || `Analyze and generate output for project: ${project.name}`,
          type: aiPromptType,
          projectContext: {
            name: project.name,
            description: project.description,
            category: project.category,
            techStack: project.techStack,
            aiStack: project.aiStack,
            currentTasks: project.tasks.map((t) => t.title),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      setAiResult(data.result || 'No output received.');
      onShowToast('AI Blueprint Ready', `Generated response with Gemini 3.7 Flash`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('AI Error', err.message || 'Failed to generate response.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-import generated tasks from AI result
  const handleAutoImportAITasks = () => {
    if (!aiResult) return;
    // Extract bullet points or numbered lists
    const lines = aiResult.split('\n');
    const extracted: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^[-*•]|\d+\.\s+(.+)$/);
      if (match) {
        const clean = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^\[[\sx]\]\s*/, '');
        if (clean.length > 3 && clean.length < 120 && !clean.startsWith('**') && !clean.includes('```')) {
          extracted.push(clean);
        }
      }
    }

    if (extracted.length === 0) {
      onShowToast('No task list found', 'Could not parse bullet points from AI result.', 'info');
      return;
    }

    const newTasksToAdd: ProjectTask[] = extracted.slice(0, 10).map((title, idx) => ({
      id: `ai-t-${Date.now()}-${idx}`,
      title,
      completed: false,
      tag: 'AI Suggested',
      priority: 'medium',
    }));

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, ...newTasksToAdd],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
    triggerConfetti();
    onShowToast(`Imported ${newTasksToAdd.length} Tasks!`, 'Added directly into project milestones', 'success');
  };

  // Env vars actions
  const handleToggleEnvSecret = (id: string) => {
    setRevealedEnvSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddEnv = () => {
    if (!newKey.trim()) return;
    const newEnv: EnvVariable = {
      id: `env-${Date.now()}`,
      key: newKey.trim().toUpperCase(),
      value: newVal.trim(),
      isSecret: newSecret,
    };
    const updatedProject = {
      ...project,
      envVariables: [...project.envVariables, newEnv],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
    setNewKey('');
    setNewVal('');
    setNewSecret(false);
    onShowToast('Environment Variable Added', newEnv.key, 'success');
  };

  const handleDeleteEnv = (id: string) => {
    const updatedProject = {
      ...project,
      envVariables: project.envVariables.filter((e) => e.id !== id),
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
  };

  const handleExportEnv = (includeSecrets: boolean) => {
    const lines = project.envVariables.map((e) => {
      const val = e.isSecret && !includeSecrets ? 'your_secret_here' : e.value;
      return `${e.key}=${val}`;
    });
    const content = lines.join('\n');
    navigator.clipboard.writeText(content);
    onShowToast(
      includeSecrets ? 'Copied Full .env' : 'Copied .env.example Template',
      `${lines.length} variables copied to clipboard`,
      'success'
    );
  };

  // Scripts actions
  const handleAddScript = () => {
    if (!newScriptLabel.trim() || !newScriptCmd.trim()) return;
    const newScript: ProjectScript = {
      id: `scr-${Date.now()}`,
      label: newScriptLabel.trim(),
      command: newScriptCmd.trim(),
      category: 'dev',
    };
    const updatedProject = {
      ...project,
      scripts: [...project.scripts, newScript],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
    setNewScriptLabel('');
    setNewScriptCmd('');
    onShowToast('Script Added', newScript.label, 'success');
  };

  const handleDeleteScript = (id: string) => {
    const updatedProject = {
      ...project,
      scripts: project.scripts.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
  };

  // Notes save
  const handleSaveNotes = () => {
    const updatedProject = {
      ...project,
      notes: notesDraft,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updatedProject);
    onShowToast('Notes Saved', 'Project scratchpad updated', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Top Banner & Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${category.bg} ${category.color} ${category.border}`}>
                    {category.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${status.bg} ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${priority.bg} ${priority.color}`}>
                    {priority.label} Priority
                  </span>
                  {project.localPort && (
                    <span className="font-mono text-[11px] font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30 flex items-center gap-1">
                      <Network className="w-3 h-3" />
                      localhost:{project.localPort}
                    </span>
                  )}
                </div>

                <h1 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2 truncate">
                  {project.name}
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEditProject(project)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Direct Deep Link Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* VS Code */}
                {project.localPath && (
                  <a
                    href={getVSCodeUrl(project.localPath, 'vscode')}
                    className="px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open in VS Code</span>
                  </a>
                )}

                {/* Cursor */}
                {project.localPath && (
                  <a
                    href={getVSCodeUrl(project.localPath, 'cursor')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>Cursor</span>
                  </a>
                )}

                {/* GitHub */}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                    <span>GitHub Repo</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {/* Live URL */}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live App</span>
                  </a>
                )}
              </div>

              {/* Path & Clone Command */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cloneCmds.cli);
                    onShowToast('Copied GitHub CLI Clone', cloneCmds.cli, 'success');
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md flex items-center gap-1.5"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>gh repo clone</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 flex items-center gap-1 border-b border-slate-800/80 -mb-5 pb-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-300 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Overview & Tasks ({completedTasks}/{totalTasks})</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-architect')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'ai-architect'
                    ? 'border-blue-500 text-blue-300 bg-blue-500/5'
                    : 'border-transparent text-blue-400 hover:text-blue-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Architect & Planner</span>
              </button>

              <button
                onClick={() => setActiveTab('scripts')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'scripts'
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dev Scripts ({project.scripts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('env')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'env'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Environment .env ({project.envVariables.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'notes'
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Architecture Notes</span>
              </button>
            </div>
          </div>

          {/* Modal Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 text-xs">
            {/* 1. OVERVIEW & TASKS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Tech Stack & AI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Core Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
                    <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      AI Models & Vector Stacks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.aiStack && project.aiStack.length > 0 ? (
                        project.aiStack.map((ai) => (
                          <span
                            key={ai}
                            className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-200 border border-blue-500/30 font-mono text-[11px]"
                          >
                            {ai}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No specific AI engine configured.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestones & Task Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">
                        Milestones & Engineering Tasks
                      </h3>
                      <p className="text-xs text-slate-400">
                        Track progress, check off items, or generate new tasks with the AI Architect.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-blue-300 font-bold">
                        {completedTasks} / {totalTasks} Done ({progressPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Task List */}
                  <div className="space-y-2 mt-3">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                          task.completed
                            ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium truncate ${
                              task.completed ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.tag && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                              {task.tag}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {project.tasks.length === 0 && (
                      <div className="py-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                        <p>No tasks yet. Add a new milestone below or generate them with AI!</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Add Task Input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTask();
                        }
                      }}
                      placeholder="Add a new engineering task or milestone..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddTask}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. AI ARCHITECT & PLANNER */}
            {activeTab === 'ai-architect' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Gemini 3.7 Flash Project Assistant</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Use server-side AI to break down features, draft comprehensive README files, or plan architectural improvements for {project.name}.
                  </p>
                </div>

                {/* Prompt Type Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setAiPromptType('breakdown');
                      setAiCustomPrompt('Break down the next 5-8 engineering milestones and task checklist.');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
                      aiPromptType === 'breakdown'
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Break Down Milestones
                  </button>

                  <button
                    onClick={() => {
                      setAiPromptType('readme');
                      setAiCustomPrompt('Generate a comprehensive, production-grade README.md with badges, installation, and architecture.');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
                      aiPromptType === 'readme'
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Generate README.md
                  </button>

                  <button
                    onClick={() => {
                      setAiPromptType('stack');
                      setAiCustomPrompt('Recommend optimal architecture, caching layers, and VS Code extensions.');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
                      aiPromptType === 'stack'
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Stack & Extension Suggestions
                  </button>
                </div>

                {/* Prompt Box */}
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Enter custom prompt or task description for the AI architect..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleRunAI}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Generate with Gemini 3.7 Flash</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Result View */}
                {aiResult && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        AI Architect Output
                      </span>

                      <div className="flex items-center gap-2">
                        {aiPromptType === 'breakdown' && (
                          <button
                            onClick={handleAutoImportAITasks}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Import as Tasks
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiResult);
                            onShowToast('Copied AI Output', 'Result copied to clipboard', 'success');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                    </div>

                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                      {aiResult}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* 3. DEV SCRIPTS & TERMINAL */}
            {activeTab === 'scripts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Terminal & CLI Scripts</h3>
                    <p className="text-xs text-slate-400">
                      Quickly copy or run project commands (dev server, migrations, tests, docker).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.scripts.map((script) => (
                    <div
                      key={script.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 text-xs">{script.label}</p>
                        <p className="font-mono text-[11px] text-emerald-400 truncate mt-1">
                          $ {script.command}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(script.command);
                            onShowToast('Command Copied', script.command, 'success');
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteScript(script.id)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Script Row */}
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Add New Script
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newScriptLabel}
                      onChange={(e) => setNewScriptLabel(e.target.value)}
                      placeholder="Label (e.g. Run Tests)"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={newScriptCmd}
                      onChange={(e) => setNewScriptCmd(e.target.value)}
                      placeholder="Command (e.g. npm test)"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleAddScript}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Script</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ENVIRONMENT VARIABLES */}
            {activeTab === 'env' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Environment Configuration (.env)</h3>
                    <p className="text-xs text-slate-400">
                      Manage project environment keys with toggleable secret masking and export options.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportEnv(false)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Copy .env.example
                    </button>
                    <button
                      onClick={() => handleExportEnv(true)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Real .env
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {project.envVariables.map((env) => {
                    const isRevealed = revealedEnvSecrets[env.id];
                    return (
                      <div
                        key={env.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="font-bold text-blue-300 shrink-0">{env.key}</span>
                          <span className="text-slate-400">=</span>
                          <span className="text-slate-300 truncate">
                            {env.isSecret && !isRevealed ? '••••••••••••••••••••' : env.value}
                          </span>
                          {env.isSecret && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-sans">
                              Secret
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {env.isSecret && (
                            <button
                              onClick={() => handleToggleEnvSecret(env.id)}
                              className="text-slate-400 hover:text-slate-200 p-1"
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(env.value);
                              onShowToast('Copied Value', env.key, 'info');
                            }}
                            className="text-slate-400 hover:text-slate-200 p-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEnv(env.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {project.envVariables.length === 0 && (
                    <div className="py-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                      <p>No environment variables saved for this project.</p>
                    </div>
                  )}
                </div>

                {/* Add Env Variable */}
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Add Environment Variable
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="KEY (e.g. API_SECRET)"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      placeholder="VALUE"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <label className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSecret}
                        onChange={(e) => setNewSecret(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span className="text-xs">Mask Secret</span>
                    </label>
                    <button
                      onClick={handleAddEnv}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Variable</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. NOTES & SCRATCHPAD */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Architecture Scratchpad & Markdown</h3>
                    <p className="text-xs text-slate-400">
                      Keep track of technical decisions, database notes, and implementation plans.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Save Notes
                  </button>
                </div>

                <textarea
                  rows={12}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="# Project Architecture Notes&#10;- Schema design decisions&#10;- Key API endpoints&#10;- Deployment instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
