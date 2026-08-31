import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Code2,
  FolderGit2,
  Sparkles,
  Terminal,
  Lock,
  Eye,
  EyeOff,
  Check,
  Tag,
  Loader2,
  ExternalLink,
  Layers,
  FolderCode,
  FileCode,
  Github,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectPriority,
  EnvVariable,
  ProjectScript,
  ProjectTask,
} from '../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialProject?: Project | null;
}

const COMMON_TAG_PRESETS = [
  'python',
  'react',
  'machine-learning',
  'backend',
  'frontend',
  'fastapi',
  'typescript',
  'tailwind',
  'docker',
  'gemini',
  'nextjs',
  'fullstack',
  'nodejs',
  'postgresql',
  'graphql',
  'devops',
];

const COMMON_TECH_SUGGESTIONS = [
  'React 19',
  'Next.js 15',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'Python 3.12',
  'FastAPI',
  'PostgreSQL',
  'Docker',
  'Rust',
  'Go',
  'Vite',
  'GraphQL',
  'Prisma',
  'Drizzle ORM',
];

const COMMON_AI_SUGGESTIONS = [
  'Gemini 3.7 Flash',
  'Google GenAI SDK',
  'LangChain',
  'LlamaIndex',
  'ChromaDB',
  'Qdrant',
  'Ollama / Local LLM',
  'Hugging Face',
  'Claude Sonnet',
  'DeepSeek R1',
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const isEditing = Boolean(initialProject);

  const [name, setName] = useState(initialProject?.name || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [category, setCategory] = useState<ProjectCategory>(initialProject?.category || 'web');
  const [status, setStatus] = useState<ProjectStatus>(initialProject?.status || 'active');
  const [priority, setPriority] = useState<ProjectPriority>(initialProject?.priority || 'medium');
  const [localPath, setLocalPath] = useState(initialProject?.localPath || '~/projects/');
  const [workspaceType, setWorkspaceType] = useState<'folder' | 'code-workspace' | 'multi-root'>(
    initialProject?.workspaceType || (initialProject?.vscodeWorkspace?.endsWith('.code-workspace') ? 'code-workspace' : 'folder')
  );
  const [workspaceFile, setWorkspaceFile] = useState(initialProject?.workspaceFile || initialProject?.vscodeWorkspace || '');
  const [linkedFolders, setLinkedFolders] = useState<string[]>(initialProject?.linkedFolders || []);
  const [newLinkedFolderInput, setNewLinkedFolderInput] = useState('');
  
  const [githubUrl, setGithubUrl] = useState(initialProject?.githubUrl || '');
  const [defaultBranch, setDefaultBranch] = useState(initialProject?.defaultBranch || 'main');
  const [liveUrl, setLiveUrl] = useState(initialProject?.liveUrl || '');
  const [localPort, setLocalPort] = useState<string>(initialProject?.localPort ? String(initialProject.localPort) : '');
  const [notes, setNotes] = useState(initialProject?.notes || '');

  // AI-powered tags & stack
  const [tags, setTags] = useState<string[]>(
    initialProject?.tags || (initialProject?.techStack ? initialProject.techStack.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '-')) : ['react', 'typescript', 'tailwind'])
  );
  const [newTagInput, setNewTagInput] = useState('');

  // Tech stack
  const [techStack, setTechStack] = useState<string[]>(initialProject?.techStack || ['React 19', 'TypeScript', 'Tailwind CSS']);
  const [newTechInput, setNewTechInput] = useState('');

  // AI stack
  const [aiStack, setAiStack] = useState<string[]>(initialProject?.aiStack || ['Gemini 3.7 Flash']);
  const [newAiInput, setNewAiInput] = useState('');

  // AI Tagging State & Code snippet analyzer
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeSnippetBox, setShowCodeSnippetBox] = useState(false);
  const [aiTagResult, setAiTagResult] = useState<{
    suggestedTags: string[];
    techStack: string[];
    aiStack: string[];
    recommendedCategory?: ProjectCategory;
    rationale?: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<ProjectTask[]>(
    initialProject?.tasks || [
      { id: 't-1', title: 'Initialize repository and configure development workspace', completed: true, tag: 'Setup' },
      { id: 't-2', title: 'Implement core functionality & API routes', completed: false, tag: 'Feature' },
    ]
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Env Variables
  const [envVars, setEnvVars] = useState<EnvVariable[]>(
    initialProject?.envVariables || [
      { id: 'e-1', key: 'PORT', value: '3000', isSecret: false, description: 'Dev server port' },
    ]
  );
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [newEnvSecret, setNewEnvSecret] = useState(false);

  // Scripts
  const [scripts, setScripts] = useState<ProjectScript[]>(
    initialProject?.scripts || [
      { id: 's-1', label: 'Dev Server', command: 'npm run dev', category: 'dev' },
    ]
  );
  const [newScriptLabel, setNewScriptLabel] = useState('');
  const [newScriptCmd, setNewScriptCmd] = useState('');

  // Reset or initialize when initialProject changes
  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description);
      setCategory(initialProject.category);
      setStatus(initialProject.status);
      setPriority(initialProject.priority);
      setLocalPath(initialProject.localPath);
      setWorkspaceType(initialProject.workspaceType || (initialProject.vscodeWorkspace?.endsWith('.code-workspace') ? 'code-workspace' : 'folder'));
      setWorkspaceFile(initialProject.workspaceFile || initialProject.vscodeWorkspace || '');
      setLinkedFolders(initialProject.linkedFolders || []);
      setGithubUrl(initialProject.githubUrl);
      setDefaultBranch(initialProject.defaultBranch || 'main');
      setLiveUrl(initialProject.liveUrl || '');
      setLocalPort(initialProject.localPort ? String(initialProject.localPort) : '');
      setNotes(initialProject.notes || '');
      setTags(initialProject.tags || initialProject.techStack.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '-')));
      setTechStack(initialProject.techStack || []);
      setAiStack(initialProject.aiStack || []);
      setTasks(initialProject.tasks || []);
      setEnvVars(initialProject.envVariables || []);
      setScripts(initialProject.scripts || []);
    }
  }, [initialProject]);

  if (!isOpen) return null;

  // Tag Handlers
  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // AI Tag Suggestion Trigger
  const handleTriggerAITagging = async () => {
    setIsSuggestingTags(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Untitled Project',
          description: description || 'Developer project',
          category,
          codeSnippet: codeSnippet.trim() || undefined,
          existingTags: tags,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI tagging returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiTagResult(data);

      // If user hasn't added tags yet, auto-merge top suggestions
      if (Array.isArray(data.suggestedTags)) {
        const merged = Array.from(new Set([...tags, ...data.suggestedTags.map((t: string) => t.toLowerCase())]));
        setTags(merged);
      }
      if (Array.isArray(data.techStack) && techStack.length === 0) {
        setTechStack(data.techStack);
      }
      if (Array.isArray(data.aiStack) && data.aiStack.length > 0 && aiStack.length === 0) {
        setAiStack(data.aiStack);
      }
      if (data.recommendedCategory && (!category || category === 'web')) {
        setCategory(data.recommendedCategory);
      }
    } catch (err: any) {
      console.error('AI Tagging failed:', err);
      setAiError(err.message || 'Failed to auto-suggest tags with AI');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleApplyAllAI = () => {
    if (!aiTagResult) return;
    if (aiTagResult.suggestedTags) {
      setTags(Array.from(new Set([...tags, ...aiTagResult.suggestedTags.map(t => t.toLowerCase())])));
    }
    if (aiTagResult.techStack && aiTagResult.techStack.length > 0) {
      setTechStack(Array.from(new Set([...techStack, ...aiTagResult.techStack])));
    }
    if (aiTagResult.aiStack && aiTagResult.aiStack.length > 0) {
      setAiStack(Array.from(new Set([...aiStack, ...aiTagResult.aiStack])));
    }
    if (aiTagResult.recommendedCategory) {
      setCategory(aiTagResult.recommendedCategory);
    }
  };

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setNewTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleAddAi = (ai: string) => {
    const trimmed = ai.trim();
    if (trimmed && !aiStack.includes(trimmed)) {
      setAiStack([...aiStack, trimmed]);
      setNewAiInput('');
    }
  };

  const handleRemoveAi = (ai: string) => {
    setAiStack(aiStack.filter((a) => a !== ai));
  };

  const handleAddLinkedFolder = () => {
    const trimmed = newLinkedFolderInput.trim();
    if (trimmed && !linkedFolders.includes(trimmed)) {
      setLinkedFolders([...linkedFolders, trimmed]);
      setNewLinkedFolderInput('');
    }
  };

  const handleRemoveLinkedFolder = (folder: string) => {
    setLinkedFolders(linkedFolders.filter((f) => f !== folder));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: `t-${Date.now()}`,
        title: newTaskTitle.trim(),
        completed: false,
        priority: 'medium',
      },
    ]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddEnv = () => {
    if (!newEnvKey.trim()) return;
    setEnvVars([
      ...envVars,
      {
        id: `e-${Date.now()}`,
        key: newEnvKey.trim().toUpperCase(),
        value: newEnvVal.trim(),
        isSecret: newEnvSecret,
      },
    ]);
    setNewEnvKey('');
    setNewEnvVal('');
    setNewEnvSecret(false);
  };

  const handleRemoveEnv = (id: string) => {
    setEnvVars(envVars.filter((e) => e.id !== id));
  };

  const handleAddScript = () => {
    if (!newScriptLabel.trim() || !newScriptCmd.trim()) return;
    setScripts([
      ...scripts,
      {
        id: `s-${Date.now()}`,
        label: newScriptLabel.trim(),
        command: newScriptCmd.trim(),
        category: 'dev',
      },
    ]);
    setNewScriptLabel('');
    setNewScriptCmd('');
  };

  const handleRemoveScript = (id: string) => {
    setScripts(scripts.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectToSave: Project = {
      id: initialProject?.id || `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      category,
      status,
      priority,
      localPath: localPath.trim(),
      workspaceType,
      workspaceFile: workspaceFile.trim() || undefined,
      vscodeWorkspace: workspaceFile.trim() || undefined,
      linkedFolders: linkedFolders.length > 0 ? linkedFolders : undefined,
      githubUrl: githubUrl.trim(),
      defaultBranch: defaultBranch.trim() || 'main',
      liveUrl: liveUrl.trim() || undefined,
      localPort: localPort.trim() ? parseInt(localPort.trim(), 10) : undefined,
      tags,
      techStack,
      aiStack,
      envVariables: envVars,
      scripts,
      tasks,
      notes: notes.trim(),
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: initialProject?.isStarred || false,
      color: initialProject?.color || '#6366f1',
    };

    onSave(projectToSave);
  };

  return (
    <AnimatePresence>
      <div
        id="project-form-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="project-form-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl my-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">
                  {isEditing ? `Edit ${initialProject?.name}` : 'New Dev Project & Workspace'}
                </h2>
                <p className="text-xs text-zinc-400">
                  Organize code folders, VS Code workspaces, GitHub repos, and AI tags.
                </p>
              </div>
            </div>
            <button
              id="btn-close-form"
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-200">
            {/* Primary Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Project Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-project-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NeuralPulse Copilot, OmniVault Engine"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-300 font-semibold">
                    Description & Mission
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCodeSnippetBox(!showCodeSnippetBox)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <FileCode className="w-3 h-3" />
                    {showCodeSnippetBox ? 'Hide Code Context' : '+ Add Code / README for AI Tagging'}
                  </button>
                </div>
                <textarea
                  id="input-project-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project building, its purpose, and core dev workflows?"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Optional Code Snippet / README box for deep AI extraction */}
              {showCodeSnippetBox && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-zinc-950 border border-blue-500/20 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      Code Snippet or package.json Context for AI Taxonomist
                    </span>
                    <span className="text-[10px] text-zinc-500">Gemini 3.7 Flash analyzes imports & logic</span>
                  </div>
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste package.json, requirements.txt, imports, or README excerpt here..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Category</label>
                  <select
                    id="select-project-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="swift-app">Swift macOS / iOS (Apple Native)</option>
                    <option value="swift-server">Swift Server / Vapor</option>
                    <option value="web">Web App</option>
                    <option value="fullstack">Fullstack</option>
                    <option value="backend">Backend / API</option>
                    <option value="ai">AI / ML System</option>
                    <option value="mobile">Mobile App</option>
                    <option value="library">Library / SDK</option>
                    <option value="cli">CLI Tool</option>
                    <option value="infra">DevOps / Infra</option>
                    <option value="tool">Developer Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Status</label>
                  <select
                    id="select-project-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Active (Building)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review / Testing</option>
                    <option value="shipped">Shipped (Production)</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Priority</label>
                  <select
                    id="select-project-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI-POWERED TAGGING & TAXONOMY SECTION */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    AI-Powered Project Tags & Filtering
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Organize and quickly filter projects across DevDeck by tech keywords (e.g. 'python', 'react', 'machine-learning').
                  </p>
                </div>

                <button
                  id="btn-ai-suggest-tags"
                  type="button"
                  onClick={handleTriggerAITagging}
                  disabled={isSuggestingTags}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {isSuggestingTags ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Auto-Tag with AI
                    </>
                  )}
                </button>
              </div>

              {/* AI Tag Result Notification Banner */}
              {aiTagResult && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      AI Taxonomy Recommendations:
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyAllAI}
                      className="text-[11px] text-blue-300 hover:text-white underline font-medium"
                    >
                      Apply All AI Suggestions
                    </button>
                  </div>
                  {aiTagResult.rationale && (
                    <p className="text-[11px] text-zinc-300 italic">
                      "{aiTagResult.rationale}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiTagResult.suggestedTags?.map((sTag) => {
                      const isAdded = tags.includes(sTag.toLowerCase());
                      return (
                        <button
                          key={sTag}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              handleRemoveTag(sTag.toLowerCase());
                            } else {
                              handleAddTag(sTag.toLowerCase());
                            }
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all flex items-center gap-1 ${
                            isAdded
                              ? 'bg-blue-600 text-white border border-blue-400'
                              : 'bg-zinc-900 text-blue-300 hover:bg-zinc-800 border border-blue-800/60'
                          }`}
                        >
                          {isAdded ? <Check className="w-3 h-3" /> : '+'} #{sTag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {aiError && (
                <p className="text-[11px] text-rose-400">{aiError}</p>
              )}

              {/* Active Tags Chips */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-zinc-950 border border-zinc-800 rounded-xl items-center">
                  {tags.length === 0 ? (
                    <span className="text-zinc-500 text-[11px] italic px-1">
                      No tags yet. Add tags below or click 'Auto-Tag with AI'.
                    </span>
                  ) : (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-200 border border-blue-500/30 flex items-center gap-1.5 font-mono text-[11px]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-400 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Manual tag input */}
                <div className="flex gap-2">
                  <input
                    id="input-manual-tag"
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag(newTagInput);
                      }
                    }}
                    placeholder="Add custom tag (press Enter or comma, e.g. python, backend)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-zinc-500 mr-1">Popular:</span>
                  {COMMON_TAG_PRESETS.filter((p) => !tags.includes(p)).slice(0, 10).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddTag(preset)}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-950 text-zinc-400 hover:text-blue-300 hover:bg-blue-950/40 border border-zinc-800 transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* VS CODE WORKSPACE & LOCAL DIRECTORY LINKING */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderCode className="w-3.5 h-3.5 text-blue-400" />
                  VS Code Workspaces & Local Project Folders
                </p>
                <p className="text-[11px] text-zinc-400">
                  Link local project paths, `.code-workspace` files, or multi-root folders for 1-click launch in VS Code / Cursor.
                </p>
              </div>

              {/* Workspace Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkspaceType('folder')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workspaceType === 'folder'
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <FolderCode className="w-3.5 h-3.5" /> Single Folder
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">Direct project directory</p>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceType('code-workspace')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workspaceType === 'code-workspace'
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> .code-workspace
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">VS Code workspace file</p>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceType('multi-root')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workspaceType === 'multi-root'
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Multi-Root Repo
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">Monorepo sub-folders</p>
                </button>
              </div>

              {/* Local Directory Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Local Folder Path <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-local-path"
                    type="text"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    placeholder="e.g. ~/projects/my-app or /Users/alex/dev/app"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="text-[10px] text-zinc-500">Quick path:</span>
                    {['~/projects/', '~/work/', '~/Developer/', 'C:/Dev/'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLocalPath(`${preset}${name.toLowerCase().replace(/[\s_]+/g, '-')}`)}
                        className="text-[10px] text-zinc-400 hover:text-blue-300 underline"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {workspaceType === 'code-workspace'
                      ? 'Workspace File (.code-workspace)'
                      : 'Workspace File (optional)'}
                  </label>
                  <input
                    id="input-workspace-file"
                    type="text"
                    value={workspaceFile}
                    onChange={(e) => setWorkspaceFile(e.target.value)}
                    placeholder="e.g. neuralpulse.code-workspace"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Launches with <code className="text-blue-300">code {workspaceFile || localPath}</code>
                  </span>
                </div>
              </div>

              {/* Multi-root linked sub-folders (if multi-root) */}
              {workspaceType === 'multi-root' && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-300">
                    Linked Monorepo Sub-Folders ({linkedFolders.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedFolders.map((folder) => (
                      <span
                        key={folder}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5"
                      >
                        📁 {folder}
                        <button
                          type="button"
                          onClick={() => handleRemoveLinkedFolder(folder)}
                          className="text-zinc-400 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLinkedFolderInput}
                      onChange={(e) => setNewLinkedFolderInput(e.target.value)}
                      placeholder="e.g. frontend, backend, packages/ui..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddLinkedFolder}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium"
                    >
                      Add Sub-Folder
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* GITHUB REPOSITORY & PORT LINKS */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-zinc-200" />
                GitHub Repository & Network Ports
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    id="input-github-url"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      if (!name && e.target.value) {
                        const parts = e.target.value.split('/');
                        const repo = parts[parts.length - 1]?.replace('.git', '');
                        if (repo) setName(repo);
                      }
                    }}
                    placeholder="https://github.com/developer/my-repo"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Default Branch
                  </label>
                  <input
                    id="input-default-branch"
                    type="text"
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Local Dev Port (e.g. 3000, 5173, 8000)
                  </label>
                  <input
                    id="input-local-port"
                    type="number"
                    value={localPort}
                    onChange={(e) => setLocalPort(e.target.value)}
                    placeholder="3000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Live Production URL (optional)
                  </label>
                  <input
                    id="input-live-url"
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://my-app.dev"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* TECH STACK & AI ENGINE DETAILS */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                Tech Stack & AI SDKs
              </p>

              {/* Tech stack */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Tech Stack Frameworks</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 font-mono text-[11px]"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="text-zinc-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech(newTechInput);
                      }
                    }}
                    placeholder="Type tech and press Enter (e.g. Next.js, Redis)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTech(newTechInput)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* AI stack */}
              <div>
                <label className="block text-blue-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  AI Models & Vector DB Stacks
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {aiStack.map((ai) => (
                    <span
                      key={ai}
                      className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-200 border border-blue-500/30 flex items-center gap-1.5 font-mono text-[11px]"
                    >
                      {ai}
                      <button
                        type="button"
                        onClick={() => handleRemoveAi(ai)}
                        className="text-blue-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAiInput}
                    onChange={(e) => setNewAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAi(newAiInput);
                      }
                    }}
                    placeholder="Type AI tool and press Enter (e.g. Gemini 3.7 Flash, LangChain)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAi(newAiInput)}
                    className="px-3 py-1.5 bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 border border-blue-500/30 rounded-xl font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Milestones & Tasks */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                Checklist & Milestones ({tasks.length})
              </p>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-zinc-200 text-xs truncate">{task.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(task.id)}
                      className="text-zinc-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                  placeholder="Add a new milestone or task..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium"
                >
                  Add Task
                </button>
              </div>
            </div>

            {/* Terminal Scripts */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                CLI Scripts ({scripts.length})
              </p>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-zinc-200 text-xs">{script.label}</span>
                      <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        {script.command}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveScript(script.id)}
                      className="text-zinc-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newScriptLabel}
                  onChange={(e) => setNewScriptLabel(e.target.value)}
                  placeholder="Script label (e.g. Start Dev)"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newScriptCmd}
                    onChange={(e) => setNewScriptCmd(e.target.value)}
                    placeholder="Command (e.g. npm run dev)"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddScript}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <label className="block text-zinc-300 font-semibold">
                Architecture Notes & Scratchpad (Markdown)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write architectural decisions, API endpoints, credentials notes, or schema thoughts..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </form>

          {/* Footer CTAs */}
          <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-project"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-project"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
