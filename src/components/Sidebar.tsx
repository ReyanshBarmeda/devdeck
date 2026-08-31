import React from 'react';
import {
  Server,
  FolderGit2,
  Kanban,
  Globe,
  KeyRound,
  Sparkles,
  Code2,
  Terminal,
  Network,
  BarChart3,
  GitBranch,
  GitCommit,
  Settings,
  User,
  Star,
  Smartphone,
  Radio,
  Workflow,
  Users,
  Building2,
  Activity,
  TrendingDown,
  Share2,
  FileCode2,
  Disc,
  Layers,
  Zap,
  Database,
} from 'lucide-react';
import { ViewMode, Project, UserProfile } from '../types';
import { sound } from '../utils/audio';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (mode: ViewMode) => void;
  projects: Project[];
  starredOnly: boolean;
  onToggleStarredOnly: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  showMetrics?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  projects,
  starredOnly,
  onToggleStarredOnly,
  currentUser,
  onOpenAuthModal,
}) => {
  const totalProjects = projects.length;
  const starredCount = projects.filter((p) => p.isStarred).length;

  const handleItemClick = (id: ViewMode) => {
    sound.playClick(1050);
    onNavigate(id);
  };

  const handleStarClick = () => {
    sound.playToggle(!starredOnly);
    onToggleStarredOnly();
  };

  const workspaceNav = [
    {
      id: 'instances' as ViewMode,
      label: 'Compute Instances (CDE)',
      icon: Server,
      badge: 'Live',
    },
    {
      id: 'devices' as ViewMode,
      label: 'Mesh Device Network',
      icon: Smartphone,
      badge: 'Mesh',
    },
    {
      id: 'mesh-topology' as ViewMode,
      label: 'Mesh Topology & Tunnels',
      icon: Network,
      badge: 'P2P',
    },
    {
      id: 'mesh-storage' as ViewMode,
      label: 'Shared Mesh Storage',
      icon: Database,
      badge: 'NAS',
    },
    {
      id: 'database-studio' as ViewMode,
      label: 'Database Studio',
      icon: Database,
      badge: 'SQL',
    },
    {
      id: 'projects' as ViewMode,
      label: 'Projects & Workspaces',
      icon: FolderGit2,
      badge: totalProjects,
    },
    {
      id: 'workflows' as ViewMode,
      label: 'Automation Workflows',
      icon: Zap,
      badge: '⌘K',
    },
    {
      id: 'pipelines' as ViewMode,
      label: 'CI/CD & Deployments',
      icon: Workflow,
      badge: 'Builds',
    },
    {
      id: 'team' as ViewMode,
      label: 'Organization & RBAC',
      icon: Users,
      badge: 'Org',
    },
    {
      id: 'vscode-env' as ViewMode,
      label: 'DevContainers & IDE',
      icon: Code2,
    },
    {
      id: 'kanban' as ViewMode,
      label: 'Sprint Milestones',
      icon: Kanban,
    },
  ];

  const toolsNav = [
    {
      id: 'terminal' as ViewMode,
      label: 'SSH Interactive Terminal',
      icon: Terminal,
      badge: 'SSH',
    },
    {
      id: 'pair-programming' as ViewMode,
      label: 'Collaborative Live Pairing',
      icon: Users,
      badge: 'Pair',
    },
    {
      id: 'observability' as ViewMode,
      label: 'Live Log Streamer',
      icon: Activity,
      badge: 'Tail',
    },
    {
      id: 'cost-optimizer' as ViewMode,
      label: 'Spot GPU Cost Optimizer',
      icon: TrendingDown,
      badge: 'Spot',
    },
    {
      id: 'iac-generator' as ViewMode,
      label: 'IaC & DevContainer Gen',
      icon: FileCode2,
      badge: 'IaC',
    },
    {
      id: 'ports' as ViewMode,
      label: 'Port Forwarding & Ingress',
      icon: Network,
      badge: 'Tunnel',
    },
    {
      id: 'env-vault' as ViewMode,
      label: 'Environment Secrets (.env)',
      icon: KeyRound,
      badge: 'Vault',
    },
    {
      id: 'api-manager' as ViewMode,
      label: 'API & Webhook Client',
      icon: Globe,
      badge: 'HTTP',
    },
    {
      id: 'credential-clipboard' as ViewMode,
      label: 'API Key Clipboard',
      icon: KeyRound,
      badge: 'Vault',
    },
    {
      id: 'git-workbench' as ViewMode,
      label: 'Git Commit Studio',
      icon: GitCommit,
    },
    {
      id: 'github' as ViewMode,
      label: 'Repositories & PRs',
      icon: GitBranch,
    },
    {
      id: 'ai-studio' as ViewMode,
      label: 'Code Generation Assistant',
      icon: Code2,
    },
  ];

  const systemNav = [
    {
      id: 'stats' as ViewMode,
      label: 'Compute Spend & Metrics',
      icon: BarChart3,
    },
    {
      id: 'settings' as ViewMode,
      label: 'Enterprise Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-zinc-800/80 bg-[#0a0d13] p-3 select-none">
      <div className="space-y-5">
        {/* Section 1: Workspaces */}
        <div>
          <div className="px-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Cloud Workspaces</span>
          </div>
          <nav className="space-y-0.5">
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700/70 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isActive
                          ? 'bg-zinc-700 text-zinc-200'
                          : 'bg-zinc-850 text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Developer Tools */}
        <div>
          <div className="px-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Cloud Dev Tools
          </div>
          <nav className="space-y-0.5">
            {toolsNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700/70 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isActive
                          ? 'bg-zinc-700 text-zinc-200'
                          : 'bg-zinc-850 text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 3: System & Preferences */}
        <div>
          <div className="px-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Management
          </div>
          <nav className="space-y-0.5">
            {systemNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700/70 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Starred Filter */}
        <div className="pt-2 border-t border-zinc-800/80">
          <button
            onClick={handleStarClick}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              starredOnly
                ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className={`w-4 h-4 ${starredOnly ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
              <span>Starred Workspaces</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
              {starredCount}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Area: User Card */}
      <div className="pt-3 border-t border-zinc-800/80">
        {currentUser ? (
          <div 
            onClick={() => onNavigate('settings')}
            className="p-2 bg-zinc-900/60 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email)}`}
                alt={currentUser.name}
                className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 shrink-0"
              />
              <div className="truncate text-left">
                <div className="text-xs font-medium text-zinc-200 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">{currentUser.email}</div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Enterprise Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};

