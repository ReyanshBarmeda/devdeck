import React from 'react';
import {
  BarChart3,
  TrendingUp,
  FolderGit2,
  Code2,
  Sparkles,
  CheckCircle2,
  Download,
  Upload,
  Layers,
  Zap,
} from 'lucide-react';
import { Project, AIPrompt, DevSnippet, DevBookmark } from '../types';

interface StatsViewProps {
  projects: Project[];
  prompts: AIPrompt[];
  snippets: DevSnippet[];
  bookmarks: DevBookmark[];
  onImportData: (data: any) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  projects,
  prompts,
  snippets,
  bookmarks,
  onImportData,
  onShowToast,
}) => {
  // Aggregate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const shippedProjects = projects.filter((p) => p.status === 'shipped').length;
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress').length;

  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
    0
  );
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tech frequency
  const techCounts: Record<string, number> = {};
  projects.forEach((p) => {
    p.techStack.forEach((t) => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });
  const topTech = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // AI stack frequency
  const aiCounts: Record<string, number> = {};
  projects.forEach((p) => {
    (p.aiStack || []).forEach((a) => {
      aiCounts[a] = (aiCounts[a] || 0) + 1;
    });
  });
  const topAI = Object.entries(aiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  projects.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // Export all workspace JSON
  const handleExportWorkspace = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects,
      prompts,
      snippets,
      bookmarks,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdeck-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Workspace Exported', 'Full JSON backup downloaded', 'success');
  };

  // Import JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.projects && Array.isArray(parsed.projects)) {
          onImportData(parsed);
          onShowToast('Workspace Imported', `Restored ${parsed.projects.length} projects`, 'success');
        } else {
          throw new Error('Invalid workspace structure');
        }
      } catch (err: any) {
        onShowToast('Import Failed', err.message || 'Invalid JSON file', 'info');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-blue-950/40 border border-blue-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
              Engineering Velocity & Workspace Health
            </span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Developer Productivity & Ecosystem Analytics
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Real-time milestone completion metrics, tech stack distribution, AI model usage, and complete workspace backup & migration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleExportWorkspace}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Projects
          </span>
          <p className="text-2xl font-bold text-slate-100 font-mono">{totalProjects}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <span className="text-emerald-400 font-semibold">{shippedProjects} Shipped</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{activeProjects} Active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Milestone Velocity
          </span>
          <p className="text-2xl font-bold text-blue-400 font-mono">
            {completedTasks}/{totalTasks}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            <span className="text-blue-300 font-semibold">{taskCompletionRate}%</span> Overall completion rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            AI Studio Prompts
          </span>
          <p className="text-2xl font-bold text-blue-400 font-mono">{prompts.length}</p>
          <p className="text-[11px] text-slate-400 pt-1">
            <span className="text-blue-300 font-semibold">Gemini 3.7 Flash</span> calibrated
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            CLI & Knowledge Tools
          </span>
          <p className="text-2xl font-bold text-cyan-400 font-mono">
            {snippets.length + bookmarks.length}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            {snippets.length} Snippets • {bookmarks.length} Bookmarks
          </p>
        </div>
      </div>

      {/* Tech Stack Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tech Languages & Frameworks */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Tech Stack Frequency</span>
          </h3>

          <div className="space-y-3">
            {topTech.map(([tech, count]) => {
              const pct = Math.round((count / totalProjects) * 100);
              return (
                <div key={tech} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300 font-semibold">{tech}</span>
                    <span className="text-slate-400">{count} repo{count > 1 ? 's' : ''} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI & Vector DB Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Models & Vector DB Integration</span>
          </h3>

          <div className="space-y-3">
            {topAI.map(([ai, count]) => {
              const pct = Math.round((count / totalProjects) * 100);
              return (
                <div key={ai} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-blue-200 font-semibold">{ai}</span>
                    <span className="text-slate-400">{count} project{count > 1 ? 's' : ''} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
