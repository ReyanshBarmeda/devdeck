import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Plus,
  Trash2,
  Tag,
  Search,
  Check,
  Code2,
} from 'lucide-react';
import { DevSnippet } from '../types';

interface SnippetsViewProps {
  snippets: DevSnippet[];
  onAddSnippet: (snippet: DevSnippet) => void;
  onDeleteSnippet: (id: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

export const SnippetsView: React.FC<SnippetsViewProps> = ({
  snippets,
  onAddSnippet,
  onDeleteSnippet,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Snippet form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DevSnippet['category']>('docker');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const categories = [
    { id: 'all', label: 'All Snippets' },
    { id: 'swift', label: 'Swift & macOS' },
    { id: 'docker', label: 'Docker & Containers' },
    { id: 'git', label: 'Git & GitHub' },
    { id: 'npm', label: 'Node & NPM' },
    { id: 'python', label: 'Python & AI' },
    { id: 'ports', label: 'Linux & Ports' },
    { id: 'database', label: 'Database & SQL' },
    { id: 'vscode', label: 'VS Code & CLI' },
  ];

  const filteredSnippets = snippets.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    const newSnippet: DevSnippet = {
      id: `snp-${Date.now()}`,
      title: title.trim(),
      category,
      code: code.trim(),
      command: code.trim(),
      description: description.trim() || 'Custom developer snippet',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };

    onAddSnippet(newSnippet);
    setShowAddModal(false);
    setTitle('');
    setCode('');
    setDescription('');
    setTagsInput('');
    onShowToast('Snippet Created', newSnippet.title, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              Terminal & CLI Arsenal
            </span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Developer Terminal & Tool Snippets
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Curated, battle-tested terminal commands for Docker compose, stuck ports, Git rebases, Node caches, and DB migrations with 1-click copy.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Snippet</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands & tags..."
            className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Snippet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSnippets.map((snp) => {
          const isSwift = snp.category === 'swift' || snp.tags.some(t => t.toLowerCase().includes('swift') || t.toLowerCase().includes('macos'));
          return (
            <div
              key={snp.id}
              className={`p-4 rounded-2xl transition-all flex flex-col justify-between group shadow-lg ${
                isSwift 
                  ? 'bg-gradient-to-b from-orange-950/20 via-slate-900/90 to-slate-900/95 border border-orange-500/30 hover:border-orange-400/50 backdrop-blur-xl shadow-orange-950/20' 
                  : 'bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 backdrop-blur-md'
              }`}
            >
              <div>
                {/* macOS Window Controls Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
                  </div>
                  {isSwift && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <span>🐦 Swift 6 / macOS</span>
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{snp.title}</h4>
                  <button
                    onClick={() => onDeleteSnippet(snp.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{snp.description}</p>
              </div>

              <div className="space-y-3 mt-3">
                {/* Code Box */}
                <div className="relative p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre className="whitespace-pre font-mono text-[11px] leading-relaxed">
                    <code>{snp.code}</code>
                  </pre>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1">
                    {snp.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          t.toLowerCase().includes('swift') || t.toLowerCase().includes('liquid') || t.toLowerCase().includes('macos')
                            ? 'bg-orange-950/40 text-orange-300 border border-orange-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(snp.code);
                      onShowToast('Copied to Clipboard', snp.code, 'success');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                      isSwift
                        ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono">Create Terminal Snippet</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Snippet Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Restart Docker Engine & Prune"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="swift">Swift & macOS (Apple Native)</option>
                  <option value="docker">Docker & Containers</option>
                  <option value="git">Git & GitHub</option>
                  <option value="npm">Node & NPM</option>
                  <option value="python">Python & AI</option>
                  <option value="ports">Linux & Ports</option>
                  <option value="database">Database & SQL</option>
                  <option value="vscode">VS Code & CLI</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Command / Script *</label>
                <textarea
                  rows={3}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="docker compose down && docker compose up -d"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about when to use this command"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="docker, prune, clean"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
