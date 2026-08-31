import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Copy,
  Check,
  Terminal,
  Sparkles,
  Layers,
  Code2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const GitWorkbenchView: React.FC = () => {
  // Conventional Commit Form
  const [commitType, setCommitType] = useState('feat');
  const [commitScope, setCommitScope] = useState('auth');
  const [commitDescription, setCommitDescription] = useState('implement OAuth token refresh middleware');
  const [isBreaking, setIsBreaking] = useState(false);
  const [commitBody, setCommitBody] = useState('Closes #412. Add automatic expiration detection.');

  // Branch Name Builder
  const [branchType, setBranchType] = useState('feature');
  const [branchTicket, setBranchTicket] = useState('DEV-1042');
  const [branchSlug, setBranchSlug] = useState('add-postman-api-tester');

  const [copiedCommit, setCopiedCommit] = useState(false);
  const [copiedBranch, setCopiedBranch] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Generated Outputs
  const generatedCommitMessage = `${commitType}${commitScope ? `(${commitScope})` : ''}${
    isBreaking ? '!' : ''
  }: ${commitDescription}${commitBody ? `\n\n${commitBody}` : ''}`;

  const generatedBranchName = `${branchType}/${branchTicket ? `${branchTicket.toLowerCase()}-` : ''}${branchSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')}`;

  const handleCopyCommit = () => {
    navigator.clipboard.writeText(generatedCommitMessage);
    setCopiedCommit(true);
    setTimeout(() => setCopiedCommit(false), 2000);
  };

  const handleCopyBranch = () => {
    navigator.clipboard.writeText(`git checkout -b ${generatedBranchName}`);
    setCopiedBranch(true);
    setTimeout(() => setCopiedBranch(false), 2000);
  };

  const copyCommandText = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const commitTypes = [
    { type: 'feat', desc: 'A new feature or capability for the user' },
    { type: 'fix', desc: 'A bug fix or error correction' },
    { type: 'refactor', desc: 'Code change that neither fixes a bug nor adds a feature' },
    { type: 'perf', desc: 'A code change that improves runtime performance' },
    { type: 'docs', desc: 'Documentation changes only' },
    { type: 'chore', desc: 'Changes to build process, auxiliary tools, libraries' },
    { type: 'test', desc: 'Adding missing unit or end-to-end tests' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0e121a]/80 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/25">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Git Workbench & Commit Studio
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                Conventional Commits 1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Standardize semantic commit messages, generate clean branch names, and access essential git workflows
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conventional Commit Builder */}
        <div className="lg:col-span-7 bg-[#0b0e14]/90 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-orange-400" />
              Conventional Commit Generator
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Semantic Versioning</span>
          </div>

          {/* Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Commit Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {commitTypes.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setCommitType(t.type)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    commitType === t.type
                      ? 'bg-orange-500/20 border-orange-500/50 text-white shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-slate-400'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-orange-300">{t.type}</div>
                  <div className="text-[10px] text-slate-400 truncate">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scope & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Scope</label>
              <input
                type="text"
                value={commitScope}
                onChange={(e) => setCommitScope(e.target.value)}
                placeholder="e.g. auth, api, ui"
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Short Description</label>
              <input
                type="text"
                value={commitDescription}
                onChange={(e) => setCommitDescription(e.target.value)}
                placeholder="Imperative short summary..."
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Breaking Change & Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Extended Body / Issue References</label>
              <label className="flex items-center gap-1.5 text-xs text-rose-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded bg-black/40 border-white/[0.1]"
                />
                <span>Breaking Change (!)</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={commitBody}
              onChange={(e) => setCommitBody(e.target.value)}
              placeholder="Detailed explanation, migration notes, or Closes #issue..."
              className="w-full bg-black/40 border border-white/[0.1] rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-black/60 border border-white/[0.08] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Generated Commit:</span>
              <button
                onClick={handleCopyCommit}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedCommit ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommit ? 'Copied' : 'Copy Commit'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-orange-300 whitespace-pre-wrap leading-relaxed">
              {generatedCommitMessage}
            </pre>
          </div>
        </div>

        {/* Right Column: Branch Name Builder & Quick Git Commands */}
        <div className="lg:col-span-5 space-y-6">
          {/* Branch Builder */}
          <div className="bg-[#0b0e14]/90 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <GitPullRequest className="w-4 h-4 text-blue-400" />
              Branch Name Standardizer
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Prefix</label>
                <select
                  value={branchType}
                  onChange={(e) => setBranchType(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="feature">feature/</option>
                  <option value="fix">fix/</option>
                  <option value="hotfix">hotfix/</option>
                  <option value="refactor">refactor/</option>
                  <option value="release">release/</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Ticket ID</label>
                <input
                  type="text"
                  value={branchTicket}
                  onChange={(e) => setBranchTicket(e.target.value)}
                  placeholder="e.g. DEV-1042"
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Slug / Topic</label>
              <input
                type="text"
                value={branchSlug}
                onChange={(e) => setBranchSlug(e.target.value)}
                placeholder="e.g. user-auth-flow"
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div className="bg-black/60 border border-white/[0.08] p-3 rounded-xl flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-blue-300 truncate">{generatedBranchName}</span>
              <button
                onClick={handleCopyBranch}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedBranch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Checkout</span>
              </button>
            </div>
          </div>

          {/* Quick Git Cheat-Sheet Commands */}
          <div className="bg-[#0b0e14]/90 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Quick Git Shortcuts
            </h3>
            <div className="space-y-2 text-xs font-mono">
              {[
                { id: 'undo', label: 'Undo Last Commit (Soft)', cmd: 'git reset --soft HEAD~1' },
                { id: 'stash', label: 'Stash With Name', cmd: 'git stash save "WIP: feature"' },
                { id: 'clean', label: 'Clean Untracked Files', cmd: 'git clean -fd' },
                { id: 'log', label: 'One-line Tree Graph', cmd: 'git log --oneline --graph --decorate -n 10' },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                >
                  <div>
                    <div className="text-[10px] text-slate-400">{item.label}</div>
                    <div className="text-slate-200">{item.cmd}</div>
                  </div>
                  <button
                    onClick={() => copyCommandText(item.cmd, item.id)}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedCommand === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
