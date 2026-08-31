import confetti from 'canvas-confetti';
import { Project, ProjectCategory, ProjectStatus, ProjectPriority } from '../types';

export const LOCAL_STORAGE_KEY = 'devdeck_workspace_v1';

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
    });
  } catch {
    // Ignore in unsupported environments
  }
}

export function getVSCodeUrl(localPath: string, editor: 'vscode' | 'cursor' | 'vscodium' = 'vscode'): string {
  if (!localPath) return '#';
  // Normalize ~ to user home notation or keep absolute path
  const path = localPath.trim();
  if (editor === 'cursor') {
    return `cursor://file/${encodeURIComponent(path)}`;
  }
  if (editor === 'vscodium') {
    return `vscodium://file/${encodeURIComponent(path)}`;
  }
  return `vscode://file/${encodeURIComponent(path)}`;
}

export function parseGitHubRepo(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const cleaned = url.replace(/\/$/, '').trim();
  const match = cleaned.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
  if (match && match[1] && match[2]) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  }
  return null;
}

export function getGitHubCloneCommands(githubUrl: string): { https: string; ssh: string; cli: string } {
  const repo = parseGitHubRepo(githubUrl);
  if (!repo) {
    return {
      https: `git clone ${githubUrl}`,
      ssh: `git clone git@github.com:developer/repo.git`,
      cli: `gh repo clone developer/repo`,
    };
  }
  return {
    https: `git clone https://github.com/${repo.owner}/${repo.repo}.git`,
    ssh: `git clone git@github.com:${repo.owner}/${repo.repo}.git`,
    cli: `gh repo clone ${repo.owner}/${repo.repo}`,
  };
}

export function getCategoryBadge(category: ProjectCategory): { label: string; color: string; border: string; bg: string } {
  switch (category) {
    case 'swift-app':
      return { label: 'Swift macOS / iOS', color: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/10' };
    case 'swift-server':
      return { label: 'Swift Server', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
    case 'ai':
      return { label: 'AI & ML', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
    case 'web':
      return { label: 'Web Application', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
    case 'backend':
      return { label: 'Backend API', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' };
    case 'mobile':
      return { label: 'Mobile', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
    case 'fullstack':
      return { label: 'Full Stack', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
    case 'library':
      return { label: 'SDK / Framework', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
    case 'cli':
      return { label: 'CLI Tool', color: 'text-slate-300', border: 'border-slate-500/20', bg: 'bg-slate-500/10' };
    case 'infra':
      return { label: 'Infra & Cloud', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
    case 'tool':
    default:
      return { label: 'Developer Tool', color: 'text-slate-300', border: 'border-slate-500/20', bg: 'bg-slate-500/10' };
  }
}

export function getStatusBadge(status: ProjectStatus): { label: string; color: string; bg: string; dot: string } {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' };
    case 'in_progress':
      return { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' };
    case 'review':
      return { label: 'Review', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' };
    case 'shipped':
      return { label: 'Shipped', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' };
    case 'paused':
      return { label: 'Paused', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-400' };
    case 'archived':
      return { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500' };
    default:
      return { label: status, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-400' };
  }
}

export function getPriorityBadge(priority: ProjectPriority): { label: string; color: string; bg: string } {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
    case 'high':
      return { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    case 'medium':
      return { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    case 'low':
      return { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700/40' };
  }
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return 'Never';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHrs > 0) return `${diffHrs}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
}
