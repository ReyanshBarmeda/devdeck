import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Download,
  FolderGit2,
  ExternalLink,
  Settings,
  Puzzle,
  Play,
  Terminal,
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCode,
  FolderCode,
  Plus,
  Trash2,
  Sliders,
  Share2,
} from 'lucide-react';
import { Project } from '../types';
import { getVSCodeUrl } from '../utils/helpers';

interface VSCodeEnvViewProps {
  projects: Project[];
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
  onOpenProjectForm?: () => void;
}

export const VSCodeEnvView: React.FC<VSCodeEnvViewProps> = ({
  projects,
  onShowToast,
  onOpenProjectForm,
}) => {
  const [selectedEditor, setSelectedEditor] = useState<'vscode' | 'cursor' | 'vscodium'>('vscode');
  const [configType, setConfigType] = useState<'settings' | 'extensions' | 'launch' | 'workspace'>('workspace');

  // Config generator settings
  const [formatOnSave, setFormatOnSave] = useState(true);
  const [tabSize, setTabSize] = useState(2);
  const [autoSave, setAutoSave] = useState('onFocusChange');
  const [tailwindIntelliSense, setTailwindIntelliSense] = useState(true);
  const [eslintAutoFix, setEslintAutoFix] = useState(true);
  const [geminiCodeAssist, setGeminiCodeAssist] = useState(true);

  // Multi-folder workspace generator state
  const [workspaceName, setWorkspaceName] = useState('MyProject');
  const [customFolders, setCustomFolders] = useState<string[]>([
    'frontend',
    'backend',
    'packages/shared',
  ]);
  const [newFolderInput, setNewFolderInput] = useState('');

  const handleAddFolder = () => {
    const trimmed = newFolderInput.trim();
    if (trimmed && !customFolders.includes(trimmed)) {
      setCustomFolders([...customFolders, trimmed]);
      setNewFolderInput('');
    }
  };

  const handleRemoveFolder = (folder: string) => {
    setCustomFolders(customFolders.filter((f) => f !== folder));
  };

  // Generated Multi-Root .code-workspace JSON
  const getWorkspaceJson = () => {
    const foldersObj = customFolders.map((f) => ({
      name: f.replace(/^.*\//, '').toUpperCase(),
      path: f,
    }));

    return JSON.stringify(
      {
        folders: foldersObj.length > 0 ? foldersObj : [{ path: '.' }],
        settings: {
          'editor.formatOnSave': formatOnSave,
          'editor.tabSize': tabSize,
          'files.autoSave': autoSave,
          'editor.defaultFormatter': 'esbenp.prettier-vscode',
          'editor.codeActionsOnSave': {
            'source.fixAll.eslint': eslintAutoFix ? 'explicit' : 'never',
          },
          'tailwindCSS.experimental.classRegex': tailwindIntelliSense
            ? [['cva\\(([^)]*)\\)', '["\'`]([^"\'`]*).*?["\'`]'], ['cx\\(([^)]*)\\)', '["\'`]([^"\'`]*).*?["\'`]']]
            : [],
          'typescript.tsdk': 'node_modules/typescript/lib',
          'typescript.enablePromptUseWorkspaceTsdk': true,
          'terminal.integrated.defaultProfile.osx': 'zsh',
          'terminal.integrated.defaultProfile.linux': 'bash',
        },
        extensions: {
          recommendations: [
            'dbaeumer.vscode-eslint',
            'esbenp.prettier-vscode',
            'bradlc.vscode-tailwindcss',
            'googlecloudtools.cloudcode',
            'eamodio.gitlens',
            ...(geminiCodeAssist ? ['google.geminicodeassist'] : []),
          ],
        },
      },
      null,
      2
    );
  };

  // Generated JSON for tabs
  const getGeneratedConfig = () => {
    if (configType === 'workspace') {
      return getWorkspaceJson();
    }

    if (configType === 'settings') {
      return JSON.stringify(
        {
          'editor.formatOnSave': formatOnSave,
          'editor.tabSize': tabSize,
          'files.autoSave': autoSave,
          'editor.defaultFormatter': 'esbenp.prettier-vscode',
          'editor.codeActionsOnSave': {
            'source.fixAll.eslint': eslintAutoFix ? 'explicit' : 'never',
          },
          'tailwindCSS.experimental.classRegex': tailwindIntelliSense
            ? [['cva\\(([^)]*)\\)', '["\'`]([^"\'`]*).*?["\'`]'], ['cx\\(([^)]*)\\)', '["\'`]([^"\'`]*).*?["\'`]']]
            : [],
          'typescript.tsdk': 'node_modules/typescript/lib',
          'typescript.enablePromptUseWorkspaceTsdk': true,
          'terminal.integrated.fontFamily': 'JetBrains Mono, Fira Code, monospace',
        },
        null,
        2
      );
    }

    if (configType === 'extensions') {
      const recs = [
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'bradlc.vscode-tailwindcss',
        'googlecloudtools.cloudcode',
        'eamodio.gitlens',
        'ms-azuretools.vscode-docker',
      ];
      if (geminiCodeAssist) recs.push('google.geminicodeassist');
      return JSON.stringify(
        {
          recommendations: recs,
        },
        null,
        2
      );
    }

    if (configType === 'launch') {
      return JSON.stringify(
        {
          version: '0.2.0',
          configurations: [
            {
              type: 'node',
              request: 'launch',
              name: 'Debug Fullstack Dev Server',
              runtimeExecutable: 'npm',
              runtimeArgs: ['run', 'dev'],
              skipFiles: ['<node_internals>/**'],
              console: 'integratedTerminal',
              internalConsoleOptions: 'neverOpen',
            },
            {
              type: 'chrome',
              request: 'launch',
              name: 'Launch Chrome against localhost:3000',
              url: 'http://localhost:3000',
              webRoot: '${workspaceFolder}',
            },
          ],
        },
        null,
        2
      );
    }

    return '';
  };

  const handleDownloadFile = () => {
    let filename = `${workspaceName.toLowerCase().replace(/\s+/g, '-')}.code-workspace`;
    if (configType === 'settings') filename = 'settings.json';
    if (configType === 'extensions') filename = 'extensions.json';
    if (configType === 'launch') filename = 'launch.json';

    const content = getGeneratedConfig();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`Downloaded ${filename}`, 'Configuration saved to your computer', 'success');
  };

  const extensionPacks = [
    {
      title: 'Fullstack React & TypeScript Superpack',
      description: 'ESLint, Prettier, Tailwind IntelliSense, Pretty TypeScript Errors, ES7 Snippets, Auto Rename Tag.',
      cmd: 'code --install-extension dbaeumer.vscode-eslint --install-extension esbenp.prettier-vscode --install-extension bradlc.vscode-tailwindcss --install-extension yoavbls.pretty-ts-errors',
      tags: ['react', 'typescript', 'tailwind'],
    },
    {
      title: 'AI & Multi-Modal Cloud Suite',
      description: 'Gemini Code Assist, Google Cloud Code, GitHub Copilot, Continue.dev, Docker tooling.',
      cmd: 'code --install-extension google.geminicodeassist --install-extension googlecloudtools.cloudcode --install-extension ms-azuretools.vscode-docker',
      tags: ['ai', 'gemini', 'cloud'],
    },
    {
      title: 'Python & FastAPI High-Performance Pack',
      description: 'Python language server, Pylance, Ruff fast linter, Black Formatter, Jupyter notebooks.',
      cmd: 'code --install-extension ms-python.python --install-extension ms-python.vscode-pylance --install-extension charliermarsh.ruff',
      tags: ['python', 'fastapi', 'backend'],
    },
    {
      title: 'Git & Productivity Command Center',
      description: 'GitLens supercharged, Git History, Error Lens, Todo Tree, Path Intellisense, Peacock workspace colorizer.',
      cmd: 'code --install-extension eamodio.gitlens --install-extension usernamehw.errorlens --install-extension gruntfuggly.todo-tree --install-extension johnpapa.peacock',
      tags: ['git', 'productivity', 'dx'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-zinc-900 to-blue-950/40 border border-blue-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
              Local Dev & Workspace Orchestrator
            </span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" />
              VS Code Workspaces & Local Project Folders
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl">
              1-click open your local project directories, monorepo multi-roots, and <code className="text-blue-300 font-mono">.code-workspace</code> files in VS Code, Cursor, or VSCodium.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
              <button
                id="btn-switch-editor-vscode"
                onClick={() => setSelectedEditor('vscode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedEditor === 'vscode'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>VS Code</span>
              </button>
              <button
                id="btn-switch-editor-cursor"
                onClick={() => setSelectedEditor('cursor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedEditor === 'cursor'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Cursor</span>
              </button>
              <button
                id="btn-switch-editor-vscodium"
                onClick={() => setSelectedEditor('vscodium')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedEditor === 'vscodium'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>VSCodium</span>
              </button>
            </div>

            {onOpenProjectForm && (
              <button
                id="btn-add-workspace-folder"
                onClick={onOpenProjectForm}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Folder</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Linked Workspaces & Local Folders Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <FolderCode className="w-4 h-4 text-blue-400" />
            <span>Linked Local Workspaces ({projects.length})</span>
          </h3>
          <span className="text-xs text-zinc-400">
            Clicking opens the project folder or workspace directly in {selectedEditor.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => {
            const isWorkspaceFile = Boolean(project.workspaceFile || project.vscodeWorkspace?.endsWith('.code-workspace'));
            const isMultiRoot = project.workspaceType === 'multi-root' || Boolean(project.linkedFolders && project.linkedFolders.length > 0);
            
            const launchPath = project.workspaceFile 
              ? `${project.localPath}/${project.workspaceFile}` 
              : project.localPath;

            return (
              <div
                key={project.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="font-bold text-sm text-zinc-100 group-hover:text-blue-300 transition-colors truncate flex items-center gap-1.5">
                      {isWorkspaceFile ? (
                        <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : isMultiRoot ? (
                        <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <FolderCode className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </h4>
                    {project.localPort && (
                      <span className="font-mono text-[10px] text-cyan-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        :{project.localPort}
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-[11px] text-zinc-400 truncate bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 mb-2">
                    📁 {project.localPath || '~/projects/' + project.name.toLowerCase().replace(/\s+/g, '-')}
                  </p>

                  {/* Workspace / Multi-root subfolders indicators */}
                  {project.workspaceFile && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-blue-300 bg-blue-950/30 px-2 py-1 rounded border border-blue-500/20 mb-2">
                      <FileCode className="w-3 h-3 text-blue-400" />
                      <span className="truncate">{project.workspaceFile}</span>
                    </div>
                  )}

                  {project.linkedFolders && project.linkedFolders.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.linkedFolders.map((f) => (
                        <span key={f} className="text-[10px] bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800 font-mono">
                          /{f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tech stack / AI badges */}
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                    {project.tags && project.tags.slice(0, 2).map((tg) => (
                      <span key={tg} className="text-[10px] bg-blue-950/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                  <a
                    id={`btn-open-editor-${project.id}`}
                    href={getVSCodeUrl(launchPath, selectedEditor)}
                    className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open in {selectedEditor === 'cursor' ? 'Cursor' : 'VS Code'}</span>
                  </a>

                  <button
                    id={`btn-copy-cli-${project.id}`}
                    onClick={() => {
                      const terminalCmd = project.workspaceFile
                        ? `code "${project.localPath}/${project.workspaceFile}"`
                        : `cd "${project.localPath}" && code .`;
                      navigator.clipboard.writeText(terminalCmd);
                      onShowToast('Copied Terminal Launch Command', terminalCmd, 'info');
                    }}
                    title="Copy terminal command"
                    className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive VS Code Configuration & Multi-Root Workspace Builder */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" />
              <span>Workspace & .vscode Configuration Generator</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Build production-grade <code className="text-blue-300">.code-workspace</code> files, <code className="text-blue-300">settings.json</code>, <code className="text-blue-300">extensions.json</code>, and <code className="text-blue-300">launch.json</code>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setConfigType('workspace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                configType === 'workspace'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              .code-workspace
            </button>
            <button
              onClick={() => setConfigType('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                configType === 'settings'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              settings.json
            </button>
            <button
              onClick={() => setConfigType('extensions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                configType === 'extensions'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              extensions.json
            </button>
            <button
              onClick={() => setConfigType('launch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                configType === 'launch'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              launch.json
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Options & Settings Panel (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {configType === 'workspace' && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Multi-Root Workspace Folders
                </span>

                <div className="space-y-1.5">
                  {customFolders.map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                    >
                      <span>📁 {folder}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFolder(folder)}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderInput}
                    onChange={(e) => setNewFolderInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFolder();
                      }
                    }}
                    placeholder="e.g. apps/web, services/api..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFolder}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Workspace Preferences
              </p>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <span>Format on Save (Prettier)</span>
                <input
                  type="checkbox"
                  checked={formatOnSave}
                  onChange={(e) => setFormatOnSave(e.target.checked)}
                  className="rounded border-zinc-700 text-blue-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <span>ESLint Auto-Fix on Save</span>
                <input
                  type="checkbox"
                  checked={eslintAutoFix}
                  onChange={(e) => setEslintAutoFix(e.target.checked)}
                  className="rounded border-zinc-700 text-blue-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <span>Tailwind CSS Regex IntelliSense</span>
                <input
                  type="checkbox"
                  checked={tailwindIntelliSense}
                  onChange={(e) => setTailwindIntelliSense(e.target.checked)}
                  className="rounded border-zinc-700 text-blue-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <span>Google Cloud & Gemini Code Assist</span>
                <input
                  type="checkbox"
                  checked={geminiCodeAssist}
                  onChange={(e) => setGeminiCodeAssist(e.target.checked)}
                  className="rounded border-zinc-700 text-blue-500 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Generated Code Display (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                {configType === 'workspace'
                  ? `${workspaceName.toLowerCase().replace(/\s+/g, '-')}.code-workspace`
                  : `.vscode/${configType}.json`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-vscode-config"
                  onClick={() => {
                    navigator.clipboard.writeText(getGeneratedConfig());
                    onShowToast('Copied JSON to Clipboard', 'Configuration ready to paste', 'success');
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Copy JSON
                </button>

                <button
                  id="btn-download-vscode-config"
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download File
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-x-auto max-h-[380px]">
              <pre className="text-xs text-zinc-200 font-mono leading-relaxed">
                {getGeneratedConfig()}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Extension Packs */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
          Curated VS Code Extension Suites
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extensionPacks.map((pack) => (
            <div
              key={pack.title}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <Puzzle className="w-4 h-4 text-blue-400" />
                    <span>{pack.title}</span>
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{pack.description}</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {pack.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[240px]">
                  {pack.cmd}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pack.cmd);
                    onShowToast('Copied Terminal Command', 'Run in terminal to install all extensions', 'success');
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Install Cmd</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
