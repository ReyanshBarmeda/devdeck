import React, { useState } from 'react';
import {
  Code2,
  FolderGit2,
  ExternalLink,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  Circle,
  Copy,
  Star,
  Terminal,
  Network,
  Trash2,
  Edit,
  ArrowUpRight,
  GitBranch,
  FileCode,
  Layers,
  FolderCode,
  Tag,
  GitCommit,
} from 'lucide-react';
import { Project } from '../types';
import { sound } from '../utils/audio';
import {
  getVSCodeUrl,
  getCategoryBadge,
  getStatusBadge,
  getPriorityBadge,
  getGitHubCloneCommands,
  formatTimeAgo,
  triggerConfetti,
} from '../utils/helpers';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
  onOpenAIArchitectForProject: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
  onToggleStar,
  onToggleTask,
  onShowToast,
  onOpenAIArchitectForProject,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const category = getCategoryBadge(project.category);
  const status = getStatusBadge(project.status);
  const priority = getPriorityBadge(project.priority);

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const cloneCmds = getGitHubCloneCommands(project.githubUrl);

  const isWorkspaceFile = Boolean(project.workspaceFile || project.vscodeWorkspace?.endsWith('.code-workspace'));
  const isMultiRoot = project.workspaceType === 'multi-root' || Boolean(project.linkedFolders && project.linkedFolders.length > 0);
  const launchPath = project.workspaceFile
    ? `${project.localPath}/${project.workspaceFile}`
    : project.localPath;

  const handleCopyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick(1000);
    navigator.clipboard.writeText(cloneCmds.cli);
    onShowToast('GitHub CLI Clone Copied', cloneCmds.cli, 'success');
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick(1000);
    navigator.clipboard.writeText(project.localPath);
    onShowToast('Local Path Copied', project.localPath, 'info');
  };

  const handleStarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playToggle(!project.isStarred);
    onToggleStar(project.id);
  };

  const handleTaskToggle = (e: React.MouseEvent, taskId: string, currentlyCompleted: boolean) => {
    e.stopPropagation();
    sound.playToggle(!currentlyCompleted);
    onToggleTask(project.id, taskId);
    if (!currentlyCompleted && completedTasks + 1 === totalTasks) {
      triggerConfetti();
      onShowToast('All Milestones Completed!', `All ${totalTasks} tasks finished for ${project.name}`, 'success');
    }
  };

  const handleCardClick = () => {
    sound.playClick(1150);
    onSelect(project);
  };

  return (
    <div
      onClick={handleCardClick}
      className="aesthetic-card-interactive p-5 cursor-pointer flex flex-col justify-between group relative select-none rounded-xl hover:border-zinc-700/80 transition-all"
    >
      {/* Top Row: Category, Status, Star & More Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category Tag */}
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${category.bg} ${category.color} ${category.border}`}
            >
              {category.label}
            </span>

            {/* Status Tag */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${status.bg} ${status.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>

            {/* Workspace Type Badge */}
            {isWorkspaceFile && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <FileCode className="w-2.5 h-2.5" />
                workspace
              </span>
            )}

            {/* Priority if urgent/high */}
            {(project.priority === 'urgent' || project.priority === 'high') && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${priority.bg} ${priority.color}`}
              >
                {priority.label}
              </span>
            )}
          </div>

          {/* Star & Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleStarToggle}
              title={project.isStarred ? 'Unstar project' : 'Star project'}
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  project.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                }`}
              />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-white/[0.06] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-[#18181b] border border-white/[0.1] rounded-xl shadow-xl py-1 z-30 text-xs"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenAIArchitectForProject(project);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>AI Architecture Assist</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(project);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Project</span>
                  </button>

                  <button
                    onClick={handleCopyPath}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Local Path</span>
                  </button>

                  {project.githubUrl && (
                    <button
                      onClick={handleCopyClone}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Copy Git Clone</span>
                    </button>
                  )}

                  <div className="border-t border-white/[0.08] my-1" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(project.id);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Name & Description */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            {project.localPort && (
              <span className="font-mono text-[10px] font-medium text-slate-300 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08] flex items-center gap-1">
                <Network className="w-2.5 h-2.5 text-blue-400" />
                :{project.localPort}
              </span>
            )}
            {project.githubStars !== undefined && project.githubStars > 0 && (
              <span className="font-mono text-[10px] font-medium text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {project.githubStars}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tags & Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags && project.tags.slice(0, 3).map((tg) => (
            <span
              key={tg}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]"
            >
              {tg}
            </span>
          ))}

          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Milestone checklist snippet */}
        {project.tasks.length > 0 && (
          <div className="mb-3.5 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Milestones ({completedTasks}/{totalTasks})</span>
              <span className="font-mono text-slate-300 font-medium">{taskProgress}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white/[0.08] rounded-full h-1 overflow-hidden mb-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${taskProgress}%` }}
              />
            </div>

            {/* Tasks with toggle */}
            <div className="space-y-1">
              {project.tasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskToggle(e, task.id, task.completed)}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer group/task transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-500 group-hover/task:text-blue-400 shrink-0" />
                  )}
                  <span className={`truncate text-[11px] ${task.completed ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Ribbon */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Open in VS Code */}
          {project.localPath && (
            <a
              href={getVSCodeUrl(launchPath, 'vscode')}
              onClick={(e) => e.stopPropagation()}
              title="Open in Visual Studio Code"
              className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>VS Code</span>
            </a>
          )}

          {/* GitHub Repo */}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open GitHub Repository"
              className="p-1.5 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-md transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Live Deployment */}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open Live Deployment"
              className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Updated Timestamp */}
        <span className="text-[10px] text-slate-500 font-mono">
          {formatTimeAgo(project.updatedAt)}
        </span>
      </div>
    </div>
  );
};
