import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Plus, Trash2, Search, Eye, EyeOff, ShieldCheck, Tag } from 'lucide-react';

interface Credential {
  id: string;
  label: string;
  value: string;
  createdAt: string;
}

interface CredentialClipboardViewProps {
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CredentialClipboardView: React.FC<CredentialClipboardViewProps> = ({ onShowToast }) => {
  const [credentials, setCredentials] = useState<Credential[]>(() => {
    const saved = localStorage.getItem('devdeck_credential_clipboard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: '1', label: 'OpenAI API Key (Dev)', value: 'sk-proj-abc123456789', createdAt: new Date().toISOString() },
      { id: '2', label: 'AWS Access Key', value: 'AKIAIOSFODNN7EXAMPLE', createdAt: new Date().toISOString() }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    localStorage.setItem('devdeck_credential_clipboard', JSON.stringify(credentials));
  }, [credentials]);

  const handleCopy = (id: string, value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    if (onShowToast) onShowToast('Credential Copied', `Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    const next = new Set(visibleIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setVisibleIds(next);
  };

  const handleDelete = (id: string, label: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
    if (onShowToast) onShowToast('Credential Removed', `Deleted ${label}`, 'info');
  };

  const handleSaveNew = () => {
    if (!newLabel.trim() || !newValue.trim()) {
      if (onShowToast) onShowToast('Validation Error', 'Label and API Key are required.', 'error');
      return;
    }

    const newCred: Credential = {
      id: Math.random().toString(36).substr(2, 9),
      label: newLabel.trim(),
      value: newValue.trim(),
      createdAt: new Date().toISOString()
    };

    setCredentials([newCred, ...credentials]);
    if (onShowToast) onShowToast('Credential Added', `Successfully added ${newLabel}`, 'success');
    
    // Reset form
    setNewLabel('');
    setNewValue('');
    setIsAdding(false);
  };

  const filteredCredentials = credentials.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-none flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            API Key Clipboard
          </h1>
          <p className="text-slate-400 mt-1">A secure, persistent vault to store and copy your API keys instantly.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg ${
            isAdding 
              ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
          }`}
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add API Key</>}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {isAdding && (
          <div className="p-6 bg-zinc-950/80 border-b border-zinc-800 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> Add New Credential
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Label / Name</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="e.g. Stripe Secret Key (Prod)"
                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">API Key / Token</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="Paste your key here..."
                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-zinc-700 rounded-xl text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveNew}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                Save Credential
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-b border-zinc-800 bg-black/20">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your API keys..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredCredentials.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
              No credentials found. Add a new API key to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredCredentials.map(cred => {
                const isVisible = visibleIds.has(cred.id);
                const isCopied = copiedId === cred.id;
                
                return (
                  <div key={cred.id} className="group p-4 bg-black/40 border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-200 mb-1 flex items-center gap-2">
                        {cred.label}
                      </h4>
                      <div className="flex items-center gap-3">
                        <code className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 truncate max-w-[200px] sm:max-w-xs">
                          {isVisible ? cred.value : '••••••••••••••••••••••••'}
                        </code>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          Added {new Date(cred.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleVisibility(cred.id)}
                        className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                        title={isVisible ? "Hide Key" : "Reveal Key"}
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(cred.id, cred.value, cred.label)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                          isCopied 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-transparent'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {isCopied ? 'Copied!' : 'Copy Key'}
                      </button>
                      <button
                        onClick={() => handleDelete(cred.id, cred.label)}
                        className="p-2 text-zinc-500 hover:text-rose-400 bg-transparent hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Credential"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
