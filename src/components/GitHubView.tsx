import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Sparkles,
  Copy,
  ExternalLink,
  Loader2,
  Terminal,
  Zap,
  CheckCircle2,
  AlertCircle,
  Star,
  GitFork,
  Search,
  Plus,
  RefreshCw,
  UserCheck,
  Key,
  Layers,
  ArrowRight,
  Clock,
  CircleDot,
  Filter,
} from 'lucide-react';
import { Project, GitHubRepoItem, GitHubAccountInfo } from '../types';
import { getGitHubCloneCommands, parseGitHubRepo } from '../utils/helpers';

interface GitHubViewProps {
  projects: Project[];
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
  onImportProject?: (project: Project) => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({
  projects,
  onShowToast,
  onImportProject,
}) => {
  // Connected account state
  const [account, setAccount] = useState<GitHubAccountInfo | null>(() => {
    const saved = localStorage.getItem('devdeck_github_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return {
      username: 'developer',
      name: 'Developer Workspace',
      bio: 'Fullstack & AI Engineer organizing repos on DevDeck',
      public_repos: 18,
      followers: 142,
    };
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Live Repositories State
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [repoSortBy, setRepoSortBy] = useState<'stars' | 'updated' | 'forks' | 'name'>('updated');

  // AI Commit Generator state
  const [diffSummary, setDiffSummary] = useState('');
  const [diffSnippet, setDiffSnippet] = useState('');
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitOutput, setCommitOutput] = useState('');

  // Fallback demo repos if network is offline or no user connected
  const getFallbackRepos = (): GitHubRepoItem[] => [
    {
      id: 101,
      name: 'neuralpulse-copilot',
      full_name: `${account?.username || 'developer'}/neuralpulse-copilot`,
      description: 'Real-time multi-modal AI coding assistant & developer analytics with Gemini 3.7 Flash and Live API streaming.',
      html_url: `https://github.com/${account?.username || 'developer'}/neuralpulse-copilot`,
      clone_url: `https://github.com/${account?.username || 'developer'}/neuralpulse-copilot.git`,
      ssh_url: `git@github.com:${account?.username || 'developer'}/neuralpulse-copilot.git`,
      stargazers_count: 1420,
      forks_count: 215,
      open_issues_count: 7,
      language: 'TypeScript',
      topics: ['react', 'gemini', 'websockets', 'tailwind', 'machine-learning'],
      default_branch: 'main',
      pushed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      private: false,
      lastCommit: {
        message: 'feat: add streaming audio token buffer for Gemini Live API',
        author: account?.username || 'alex-dev',
        date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        sha: 'a89f3c1',
      },
    },
    {
      id: 102,
      name: 'omnivault-engine',
      full_name: `${account?.username || 'developer'}/omnivault-engine`,
      description: 'End-to-end encrypted distributed state synchronization engine & developer secret vault.',
      html_url: `https://github.com/${account?.username || 'developer'}/omnivault-engine`,
      clone_url: `https://github.com/${account?.username || 'developer'}/omnivault-engine.git`,
      ssh_url: `git@github.com:${account?.username || 'developer'}/omnivault-engine.git`,
      stargazers_count: 864,
      forks_count: 112,
      open_issues_count: 3,
      language: 'Go',
      topics: ['backend', 'security', 'grpc', 'postgresql', 'docker'],
      default_branch: 'main',
      pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      private: false,
      lastCommit: {
        message: 'fix: patch AES-GCM nonce collision boundary condition',
        author: 'sarah-crypto',
        date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        sha: '7e2c91b',
      },
    },
    {
      id: 103,
      name: 'aether-ui',
      full_name: `${account?.username || 'developer'}/aether-ui`,
      description: 'High-density, WCAG AA compliant headless UI component library with Framer Motion primitives.',
      html_url: `https://github.com/${account?.username || 'developer'}/aether-ui`,
      clone_url: `https://github.com/${account?.username || 'developer'}/aether-ui.git`,
      ssh_url: `git@github.com:${account?.username || 'developer'}/aether-ui.git`,
      stargazers_count: 3250,
      forks_count: 490,
      open_issues_count: 12,
      language: 'TypeScript',
      topics: ['react', 'tailwind', 'design-system', 'storybook'],
      default_branch: 'main',
      pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      private: false,
      lastCommit: {
        message: 'release: publish v2.4.0 with Bento Grid layouts & Command Palette',
        author: 'elena-ui',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        sha: '4d10f8a',
      },
    },
    {
      id: 104,
      name: 'fastrag-python',
      full_name: `${account?.username || 'developer'}/fastrag-python`,
      description: 'High-throughput document chunking, hybrid BM25 + dense neural embedding retriever with Gemini grounding.',
      html_url: `https://github.com/${account?.username || 'developer'}/fastrag-python`,
      clone_url: `https://github.com/${account?.username || 'developer'}/fastrag-python.git`,
      ssh_url: `git@github.com:${account?.username || 'developer'}/fastrag-python.git`,
      stargazers_count: 1890,
      forks_count: 240,
      open_issues_count: 5,
      language: 'Python',
      topics: ['python', 'fastapi', 'machine-learning', 'rag', 'gemini'],
      default_branch: 'main',
      pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      private: false,
      lastCommit: {
        message: 'perf: accelerate DuckDB hybrid BM25 vector index joins',
        author: 'rachel-ai',
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        sha: '3b8110e',
      },
    },
  ];

  // Fetch Repositories
  const fetchGitHubData = async (targetUsername?: string, targetToken?: string) => {
    const user = targetUsername || account?.username;
    if (!user && !targetToken) {
      setRepos(getFallbackRepos());
      return;
    }

    setIsLoadingRepos(true);
    try {
      let url = `/api/github/user-repos?username=${encodeURIComponent(user || '')}`;
      if (targetToken) {
        url += `&token=${encodeURIComponent(targetToken)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRepos(data);
          onShowToast('GitHub Repos Synced', `Loaded ${data.length} repositories for ${user || 'account'}`, 'success');
          return;
        }
      }
      // Fallback
      setRepos(getFallbackRepos());
    } catch (err) {
      console.warn('Error fetching GitHub repos, using fallback:', err);
      setRepos(getFallbackRepos());
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, [account?.username]);

  // Connect Account Handler
  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    if (!cleanUser && !tokenInput.trim()) return;

    setIsConnecting(true);
    try {
      let url = `/api/github/user-profile?username=${encodeURIComponent(cleanUser)}`;
      if (tokenInput.trim()) {
        url += `&token=${encodeURIComponent(tokenInput.trim())}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const prof = await res.json();
        const newAcc: GitHubAccountInfo = {
          username: prof.login || cleanUser,
          name: prof.name || prof.login || cleanUser,
          avatar_url: prof.avatar_url,
          bio: prof.bio || 'Connected GitHub developer',
          public_repos: prof.public_repos || 0,
          followers: prof.followers || 0,
          html_url: prof.html_url,
          token: tokenInput.trim() || undefined,
          connectedAt: new Date().toISOString(),
        };

        setAccount(newAcc);
        localStorage.setItem('devdeck_github_account', JSON.stringify(newAcc));
        setShowConnectModal(false);
        setUsernameInput('');
        setTokenInput('');
        fetchGitHubData(newAcc.username, newAcc.token);
        onShowToast('GitHub Account Linked', `@${newAcc.username} successfully connected`, 'success');
      } else {
        // Simple profile fallback
        const newAcc: GitHubAccountInfo = {
          username: cleanUser,
          name: cleanUser,
          bio: 'Connected GitHub profile',
          public_repos: 12,
          followers: 40,
        };
        setAccount(newAcc);
        localStorage.setItem('devdeck_github_account', JSON.stringify(newAcc));
        setShowConnectModal(false);
        fetchGitHubData(cleanUser);
        onShowToast('GitHub Account Linked', `@${cleanUser} connected`, 'info');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast('Connection Failed', err.message || 'Could not connect to GitHub API', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Import Repo into DevDeck as Project
  const handleImportRepo = (repo: GitHubRepoItem) => {
    if (!onImportProject) return;

    // Detect category based on language/topics
    let category: any = 'web';
    const lang = (repo.language || '').toLowerCase();
    const topics = repo.topics || [];

    if (topics.includes('machine-learning') || topics.includes('ai') || topics.includes('gemini') || topics.includes('rag')) {
      category = 'ai';
    } else if (lang.includes('python') || lang.includes('go') || lang.includes('rust') || topics.includes('backend')) {
      category = 'backend';
    } else if (topics.includes('cli') || topics.includes('terminal')) {
      category = 'cli';
    } else if (topics.includes('design-system') || topics.includes('library') || topics.includes('ui')) {
      category = 'library';
    }

    const newProj: Project = {
      id: `proj-gh-${repo.id || Date.now()}`,
      name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: repo.description || `GitHub repository ${repo.full_name}`,
      category,
      status: 'active',
      priority: 'medium',
      localPath: `~/projects/${repo.name}`,
      githubUrl: repo.html_url,
      defaultBranch: repo.default_branch || 'main',
      tags: repo.topics.length > 0 ? repo.topics : [lang || 'dev'],
      techStack: [repo.language || 'TypeScript', 'Git'],
      aiStack: category === 'ai' ? ['Gemini 3.7 Flash'] : [],
      githubStars: repo.stargazers_count,
      githubForks: repo.forks_count,
      githubOpenIssues: repo.open_issues_count,
      githubLastCommit: repo.lastCommit,
      envVariables: [],
      scripts: [
        { id: 'scr-1', label: 'Dev Server', command: 'npm run dev', category: 'dev' },
        { id: 'scr-2', label: 'Run Tests', command: 'npm test', category: 'test' },
      ],
      tasks: [
        { id: 'tsk-1', title: 'Review open pull requests & issues', completed: false, priority: 'high' },
        { id: 'tsk-2', title: 'Configure local environment and dependencies', completed: true, priority: 'medium' },
      ],
      notes: `Imported from GitHub repo: ${repo.html_url}\nLast commit: ${repo.lastCommit?.message || 'Initial commit'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: false,
      color: '#6366f1',
    };

    onImportProject(newProj);
    onShowToast('Imported to DevDeck', `Created project "${newProj.name}" from GitHub`, 'success');
  };

  // AI Conventional Commit Crafter
  const handleGenerateCommit = async () => {
    if (!diffSummary.trim() && !diffSnippet.trim()) return;
    setCommitLoading(true);
    setCommitOutput('');

    try {
      const response = await fetch('/api/ai/commit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: diffSummary,
          diff: diffSnippet,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate commit messages');
      }

      setCommitOutput(data.result || '');
      onShowToast('Commit Messages Ready', 'Generated Conventional Commits with Gemini 3.7 Flash', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('Commit AI Error', err.message, 'error');
    } finally {
      setCommitLoading(false);
    }
  };

  // Languages for filter
  const allLanguages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean) as string[])
  );

  // Filtered & Sorted Repos
  const filteredRepos = repos
    .filter((repo) => {
      const q = repoSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        repo.name.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q)) ||
        repo.topics.some((t) => t.toLowerCase().includes(q));

      const matchesLang = selectedLanguage === 'all' || repo.language === selectedLanguage;

      return matchesQuery && matchesLang;
    })
    .sort((a, b) => {
      if (repoSortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (repoSortBy === 'forks') return b.forks_count - a.forks_count;
      if (repoSortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
    });

  const getLanguageColor = (lang: string | null) => {
    switch (lang?.toLowerCase()) {
      case 'typescript':
        return 'bg-blue-400';
      case 'javascript':
        return 'bg-yellow-400';
      case 'python':
        return 'bg-emerald-400';
      case 'go':
        return 'bg-cyan-400';
      case 'rust':
        return 'bg-amber-600';
      case 'html':
      case 'css':
        return 'bg-rose-400';
      default:
        return 'bg-blue-400';
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'recently';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const gitWorkflows = [
    {
      title: 'Undo Last Commit (Keep Modified Files)',
      command: 'git reset --soft HEAD~1',
      description: 'Rewinds commit without losing any changes in your staging area.',
    },
    {
      title: 'Squash Last 3 Commits into One',
      command: 'git reset --soft HEAD~3 && git commit -m "feat: consolidated features"',
      description: 'Combines multiple noisy development commits into one clean release commit.',
    },
    {
      title: 'Rename Current Local Branch',
      command: 'git branch -m new-branch-name',
      description: 'Renames the checked-out branch locally.',
    },
    {
      title: 'Stash Working Tree with Descriptive Name',
      command: 'git stash save "wip: experimental api changes"',
      description: 'Safely shelves modified files with a recognizable message.',
    },
    {
      title: 'Discard All Local Uncommitted Changes',
      command: 'git reset --hard HEAD && git clean -fd',
      description: 'Completely restores working tree to match the latest HEAD commit.',
    },
    {
      title: 'Create & Switch to New Feature Branch',
      command: 'git checkout -b feat/my-new-feature',
      description: 'Starts a clean isolated branch off the current HEAD.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Connected GitHub Profile */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-blue-950/40 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                GitHub Repositories & Git Hub
              </span>
              {account && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  @{account.username} connected
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              GitHub Repository Sync & Commit Crafter
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl">
              Connect your GitHub account to explore repositories, inspect live stars and last commits, 1-click import projects to DevDeck, and generate Conventional Commits with Gemini 3.7 Flash.
            </p>
          </div>

          {/* Account Card / Switch Button */}
          <div className="flex items-center gap-3 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 shrink-0">
            {account?.avatar_url ? (
              <img
                src={account.avatar_url}
                alt={account.username}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono">
                {account?.username?.[0]?.toUpperCase() || 'GH'}
              </div>
            )}

            <div className="text-xs">
              <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{account?.name || account?.username || 'GitHub User'}</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {account?.public_repos || repos.length} repos · {account?.followers || 0} followers
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
              <button
                id="btn-refresh-github-repos"
                onClick={() => fetchGitHubData()}
                disabled={isLoadingRepos}
                title="Refresh Repositories"
                className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRepos ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              <button
                id="btn-open-connect-modal"
                onClick={() => setShowConnectModal(true)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONNECT ACCOUNT MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Link GitHub Account
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter any GitHub username to view public repositories, stars, and commits. Optionally add a Personal Access Token (PAT) for private repositories and higher rate limits.
            </p>

            <form onSubmit={handleConnectAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">GitHub Username</label>
                <input
                  id="input-github-username"
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. torvalds, octocat, your-username"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Personal Access Token (optional)
                </label>
                <input
                  id="input-github-token"
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Preset Accounts */}
              <div className="pt-2">
                <span className="text-[10px] text-zinc-500 block mb-1">Quick Demo Accounts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['octocat', 'torvalds', 'vercel', 'facebook'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUsernameInput(u)}
                      className="px-2 py-0.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 rounded text-[11px] border border-zinc-800"
                    >
                      @{u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-3.5 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-link-github"
                  type="submit"
                  disabled={isConnecting || (!usernameInput.trim() && !tokenInput.trim())}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPOSITORIES EXPLORER (With Stars & Last Commit Details) */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-zinc-100 font-mono">
                Repositories for @{account?.username || 'developer'} ({filteredRepos.length})
              </h3>
            </div>

            {/* Search and Filter bar */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Search repos & topics..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {allLanguages.length > 0 && (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Languages</option>
                  {allLanguages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={repoSortBy}
                onChange={(e) => setRepoSortBy(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars ⭐</option>
                <option value="forks">Most Forks 🍴</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map((repo) => {
            const cloneCmds = getGitHubCloneCommands(repo.html_url);
            const isAlreadyTracked = projects.some(
              (p) => p.githubUrl && p.githubUrl.toLowerCase().includes(repo.name.toLowerCase())
            );

            return (
              <div
                key={repo.id || repo.name}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm space-y-3"
              >
                <div className="space-y-2">
                  {/* Title & Stats */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-500">{repo.full_name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-mono font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-lg text-xs font-mono">
                        <GitFork className="w-3 h-3" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {repo.description || 'No description provided.'}
                  </p>

                  {/* Language and Topics */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {repo.language && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                        <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                        {repo.language}
                      </span>
                    )}

                    {repo.topics?.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] font-mono bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800/80"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>

                  {/* LAST COMMIT CARD */}
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/90 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono">
                        <GitCommit className="w-3.5 h-3.5 text-blue-400" />
                        Latest Commit
                      </span>
                      {repo.lastCommit?.sha ? (
                        <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          {repo.lastCommit.sha}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {formatTimeAgo(repo.pushed_at)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 font-mono truncate">
                      "{repo.lastCommit?.message || 'Updated repository files'}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                      <span>by {repo.lastCommit?.author || account?.username || 'committer'}</span>
                      <span>{formatTimeAgo(repo.lastCommit?.date || repo.pushed_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Clone */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {onImportProject && (
                      <button
                        id={`btn-import-repo-${repo.name}`}
                        onClick={() => handleImportRepo(repo)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isAlreadyTracked
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                        }`}
                      >
                        {isAlreadyTracked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tracked in DevDeck</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Import to DevDeck</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cloneCmds.cli);
                        onShowToast('Copied GitHub CLI Clone', cloneCmds.cli, 'success');
                      }}
                      title="Copy GitHub CLI clone command"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>CLI Clone</span>
                    </button>

                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      title="Open on GitHub"
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Conventional Commit Crafter */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Conventional Commit Crafter</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paste what you changed or a diff snippet to generate standardized <code className="text-blue-300 font-mono">feat:</code>, <code className="text-blue-300 font-mono">fix:</code>, and <code className="text-blue-300 font-mono">refactor:</code> messages with Gemini 3.7 Flash.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Short Summary of Changes
            </label>
            <input
              id="input-diff-summary"
              type="text"
              value={diffSummary}
              onChange={(e) => setDiffSummary(e.target.value)}
              placeholder="e.g. Added WebSocket Live API streaming and fixed disconnect crash"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Diff Snippet / Modified Code (Optional)
            </label>
            <textarea
              id="input-diff-snippet"
              rows={2}
              value={diffSnippet}
              onChange={(e) => setDiffSnippet(e.target.value)}
              placeholder="+ const ws = new WebSocket(...)&#10;- const oldPolling = setInterval(...)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            id="btn-generate-commit"
            onClick={handleGenerateCommit}
            disabled={commitLoading || (!diffSummary.trim() && !diffSnippet.trim())}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {commitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Commit Messages...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Generate Conventional Commits</span>
              </>
            )}
          </button>
        </div>

        {commitOutput && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-blue-300">Generated Commit Messages:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(commitOutput);
                  onShowToast('Copied Commit Messages', 'Result copied to clipboard', 'success');
                }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <pre className="text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {commitOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Git Workflow Cheat-Sheets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
          Essential Git Command Cheat-Sheet
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gitWorkflows.map((flow) => (
            <div
              key={flow.title}
              onClick={() => {
                navigator.clipboard.writeText(flow.command);
                onShowToast('Copied Command', flow.command, 'success');
              }}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <p className="font-semibold text-xs text-zinc-200">{flow.title}</p>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{flow.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="font-mono text-[11px] text-emerald-400 truncate max-w-[200px]">
                  $ {flow.command}
                </span>
                <span className="text-[10px] text-zinc-500 group-hover:text-emerald-300">Click to Copy</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
