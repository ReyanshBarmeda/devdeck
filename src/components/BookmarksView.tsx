import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Layers,
  Cloud,
  Terminal,
  FolderGit2,
} from 'lucide-react';
import { DevBookmark } from '../types';

interface BookmarksViewProps {
  bookmarks: DevBookmark[];
  onAddBookmark: (bookmark: DevBookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New bookmark form
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<DevBookmark['category']>('ai');
  const [description, setDescription] = useState('');

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'ai', label: 'AI & LLM Docs' },
    { id: 'docs', label: 'Frameworks & Specs' },
    { id: 'tools', label: 'Dev Tools & Utilities' },
    { id: 'cloud', label: 'Cloud & Infrastructure' },
    { id: 'design', label: 'UI & Icons' },
  ];

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesCat = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const newBookmark: DevBookmark = {
      id: `bm-${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      category,
      description: description.trim() || 'Custom developer bookmark',
    };

    onAddBookmark(newBookmark);
    setShowAddModal(false);
    setTitle('');
    setUrl('');
    setDescription('');
    onShowToast('Resource Saved', newBookmark.title, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Knowledge & Fast Reference
            </span>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-400" />
              Developer Documentation & Tool Hub
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Instant access to AI SDKs, cloud consoles, vector database docs, and design component specs.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter bookmarks & docs..."
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 w-full sm:w-64"
        />
      </div>

      {/* Bookmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookmarks.map((bm) => (
          <a
            key={bm.id}
            href={bm.url}
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                  {bm.category}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteBookmark(bm.id);
                  }}
                  className="text-zinc-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-zinc-100 group-hover:text-blue-300 transition-colors mt-2 truncate">
                {bm.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{bm.description}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-800 text-xs">
              <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[200px]">
                {bm.url.replace(/^https?:\/\//, '')}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-300 shrink-0" />
            </div>
          </a>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono">Add Developer Resource</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Google Cloud Run Docs"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">URL *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://cloud.google.com/run/docs"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="ai">AI & LLM Docs</option>
                  <option value="docs">Frameworks & Specs</option>
                  <option value="tools">Dev Tools & Utilities</option>
                  <option value="cloud">Cloud & Infrastructure</option>
                  <option value="design">UI & Icons</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about this tool"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
