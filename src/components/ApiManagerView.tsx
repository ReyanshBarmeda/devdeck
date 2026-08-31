import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, Edit2, Search, Save, X, Server } from 'lucide-react';

interface SavedApi {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  category: string;
  description: string;
}

const DEFAULT_APIS: SavedApi[] = [
  {
    id: '1',
    name: 'Fetch Users Profile',
    method: 'GET',
    url: 'https://api.example.com/v1/users/profile',
    category: 'Users',
    description: 'Retrieves the authenticated user profile data.'
  },
  {
    id: '2',
    name: 'Create New Order',
    method: 'POST',
    url: 'https://api.example.com/v1/orders',
    category: 'Billing',
    description: 'Creates a new billing order for the user.'
  }
];

interface ApiManagerViewProps {
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ApiManagerView: React.FC<ApiManagerViewProps> = ({ onShowToast }) => {
  const [apis, setApis] = useState<SavedApi[]>(() => {
    const saved = localStorage.getItem('devdeck_api_registry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_APIS;
      }
    }
    return DEFAULT_APIS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingApi, setEditingApi] = useState<SavedApi | null>(null);

  useEffect(() => {
    localStorage.setItem('devdeck_api_registry', JSON.stringify(apis));
  }, [apis]);

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'POST': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'PUT': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'DELETE': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'PATCH': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default: return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
    }
  };

  const handleSaveApi = () => {
    if (!editingApi || !editingApi.name || !editingApi.url) {
      if (onShowToast) onShowToast('Validation Error', 'Name and URL are required.', 'error');
      return;
    }

    const existingIndex = apis.findIndex(a => a.id === editingApi.id);
    if (existingIndex >= 0) {
      // Replace existing
      const nextApis = [...apis];
      nextApis[existingIndex] = editingApi;
      setApis(nextApis);
      if (onShowToast) onShowToast('API Updated', `Successfully replaced ${editingApi.name}`, 'success');
    } else {
      // Add new
      setApis([editingApi, ...apis]);
      if (onShowToast) onShowToast('API Added', `Successfully added ${editingApi.name}`, 'success');
    }
    setEditingApi(null);
  };

  const handleDeleteApi = (id: string, name: string) => {
    setApis(apis.filter(a => a.id !== id));
    if (editingApi?.id === id) setEditingApi(null);
    if (onShowToast) onShowToast('API Deleted', `Removed ${name}`, 'info');
  };

  const handleAddNew = () => {
    setEditingApi({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      method: 'GET',
      url: '',
      category: 'General',
      description: ''
    });
  };

  const filteredApis = apis.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-none flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-400" />
            API Registry Manager
          </h1>
          <p className="text-slate-400 mt-1">A centralized system to add, edit, and replace API endpoint configurations.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" /> Add New API
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left List Pane */}
        <div className="w-1/2 flex flex-col bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredApis.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No APIs found. Add a new API to get started.
              </div>
            ) : (
              filteredApis.map(api => (
                <div
                  key={api.id}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                    editingApi?.id === api.id 
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-inner' 
                      : 'bg-black/20 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setEditingApi({ ...api })}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${getMethodColor(api.method)}`}>
                        {api.method}
                      </span>
                      <span className="font-semibold text-zinc-200 text-sm">{api.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteApi(api.id, api.name); }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-xs text-zinc-500 truncate mb-2">{api.url}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 truncate pr-4">{api.description || 'No description provided.'}</span>
                    <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 font-medium whitespace-nowrap">{api.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Editor Pane */}
        <div className="w-1/2 flex flex-col bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
          {editingApi ? (
            <>
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/20">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  {apis.some(a => a.id === editingApi.id) ? 'Replace / Update API' : 'Add New API'}
                </h2>
                <button
                  onClick={() => setEditingApi(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Method</label>
                    <select
                      value={editingApi.method}
                      onChange={e => setEditingApi({ ...editingApi, method: e.target.value as any })}
                      className="w-full bg-black/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Category</label>
                    <input
                      type="text"
                      value={editingApi.category}
                      onChange={e => setEditingApi({ ...editingApi, category: e.target.value })}
                      placeholder="e.g. Authentication"
                      className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">API Name</label>
                  <input
                    type="text"
                    value={editingApi.name}
                    onChange={e => setEditingApi({ ...editingApi, name: e.target.value })}
                    placeholder="e.g. Fetch User Profile"
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Endpoint URL</label>
                  <input
                    type="text"
                    value={editingApi.url}
                    onChange={e => setEditingApi({ ...editingApi, url: e.target.value })}
                    placeholder="https://api.example.com/v1/..."
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea
                    value={editingApi.description}
                    onChange={e => setEditingApi({ ...editingApi, description: e.target.value })}
                    placeholder="Briefly describe what this API does..."
                    rows={3}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end border-t border-zinc-800">
                  <button
                    onClick={handleSaveApi}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Save className="w-4 h-4" />
                    {apis.some(a => a.id === editingApi.id) ? 'Save & Replace' : 'Add API'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
              <Server className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-zinc-300 mb-2">No API Selected</h3>
              <p className="text-sm max-w-sm">Select an API from the list to view and replace its configuration, or add a new one.</p>
              <button
                onClick={handleAddNew}
                className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors"
              >
                Create New API
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
