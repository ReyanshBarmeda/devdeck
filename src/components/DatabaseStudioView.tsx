import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Table as TableIcon, Play, Code2, Columns, Search, RefreshCw, Plus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface TableData {
  name: string;
  columns: Column[];
  rows: any[];
}

const MOCK_DB: Record<string, TableData> = {
  'users': {
    name: 'users',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'email', type: 'varchar(255)' },
      { name: 'role', type: 'varchar(50)' },
      { name: 'created_at', type: 'timestamp' }
    ],
    rows: [
      { id: '1a2b3c', email: 'admin@devdeck.io', role: 'admin', created_at: '2023-10-01 14:00' },
      { id: '4d5e6f', email: 'user@devdeck.io', role: 'user', created_at: '2023-10-02 09:30' },
      { id: '7g8h9i', email: 'guest@devdeck.io', role: 'guest', created_at: '2023-10-05 11:15' },
      { id: '9x8y7z', email: 'dev@devdeck.io', role: 'developer', created_at: '2023-10-10 16:45' },
    ]
  },
  'products': {
    name: 'products',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'name', type: 'varchar(100)' },
      { name: 'price', type: 'decimal(10,2)' },
      { name: 'stock', type: 'integer' }
    ],
    rows: [
      { id: 'p1', name: 'Cloud Instance X1', price: '49.99', stock: 150 },
      { id: 'p2', name: 'Object Storage 1TB', price: '19.99', stock: 500 },
      { id: 'p3', name: 'Managed Redis', price: '29.99', stock: 50 },
    ]
  },
  'orders': {
    name: 'orders',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'user_id', type: 'uuid' },
      { name: 'total', type: 'decimal(10,2)' },
      { name: 'status', type: 'varchar(50)' }
    ],
    rows: [
      { id: 'o1', user_id: '1a2b3c', total: '149.97', status: 'completed' },
      { id: 'o2', user_id: '4d5e6f', total: '29.99', status: 'pending' },
    ]
  }
};

interface DatabaseStudioViewProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const DatabaseStudioView: React.FC<DatabaseStudioViewProps> = ({ onShowToast }) => {
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [activeTab, setActiveTab] = useState<'data' | 'schema' | 'query'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Query Runner State
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users\nWHERE role = \'admin\';');
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);

  const currentTable = MOCK_DB[selectedTable];

  const handleRunQuery = () => {
    setIsQueryRunning(true);
    setQueryResult(null);
    
    // Simulate query execution delay
    setTimeout(() => {
      setIsQueryRunning(false);
      if (sqlQuery.toLowerCase().includes('select * from users')) {
        setQueryResult(MOCK_DB['users'].rows.filter(r => r.role === 'admin' || !sqlQuery.includes('role')));
        onShowToast('Query executed successfully (34ms)', 'success');
      } else {
        // Mock a general success for other queries
        setQueryResult([{ status: 'Success', affected_rows: 1, message: 'Query OK' }]);
        onShowToast('Query executed successfully', 'success');
      }
    }, 600);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Database Studio</h1>
            <p className="text-xs text-zinc-400">Production DB (PostgreSQL 15.3) • us-east-1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Database Objects */}
        <div className="w-64 flex-none border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col">
          <div className="p-3 border-b border-zinc-800/50">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter tables..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              public schemas
            </div>
            {Object.values(MOCK_DB).filter(t => t.name.includes(searchQuery.toLowerCase())).map(table => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedTable === table.name 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <TableIcon className="w-4 h-4 flex-none" />
                <span className="font-medium truncate">{table.name}</span>
                <span className="ml-auto text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                  {table.rows.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          {/* Tabs */}
          <div className="flex-none px-4 flex items-center gap-1 border-b border-zinc-800/50 bg-zinc-900/10 pt-2">
            {[
              { id: 'data', label: 'Data Browser', icon: TableIcon },
              { id: 'schema', label: 'Schema', icon: Columns },
              { id: 'query', label: 'SQL Query', icon: Code2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* DATA BROWSER TAB */}
            {activeTab === 'data' && (
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-none p-3 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
                  <div className="text-sm font-medium text-zinc-300">
                    Showing <span className="text-zinc-100">{currentTable.rows.length}</span> rows from <span className="text-blue-400 font-mono">{currentTable.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition-colors flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> New Row
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar bg-zinc-950">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-900/80 sticky top-0 z-10 shadow-[0_1px_0_rgba(39,39,42,1)]">
                      <tr>
                        <th className="w-10 px-4 py-3 text-center text-zinc-600 font-medium">#</th>
                        {currentTable.columns.map(col => (
                          <th key={col.name} className="px-4 py-3 font-medium text-zinc-300">
                            <div className="flex items-center gap-2">
                              {col.name}
                              {col.isPrimary && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1 rounded uppercase">PK</span>}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {currentTable.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-zinc-900/30 transition-colors group">
                          <td className="px-4 py-2.5 text-center text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">{i + 1}</td>
                          {currentTable.columns.map(col => (
                            <td key={col.name} className="px-4 py-2.5 text-zinc-300 font-mono text-xs">
                              {row[col.name]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCHEMA TAB */}
            {activeTab === 'schema' && (
              <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/50 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-3 font-medium text-zinc-400">Column Name</th>
                        <th className="px-6 py-3 font-medium text-zinc-400">Data Type</th>
                        <th className="px-6 py-3 font-medium text-zinc-400">Attributes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {currentTable.columns.map(col => (
                        <tr key={col.name} className="hover:bg-zinc-800/20">
                          <td className="px-6 py-4 font-medium text-zinc-200">{col.name}</td>
                          <td className="px-6 py-4 font-mono text-blue-400">{col.type}</td>
                          <td className="px-6 py-4">
                            {col.isPrimary ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
                                PRIMARY KEY
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-xs">Nullable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SQL QUERY TAB */}
            {activeTab === 'query' && (
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-none p-2 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-4 px-2">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">SQL Editor</span>
                  </div>
                  <button
                    onClick={handleRunQuery}
                    disabled={isQueryRunning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    {isQueryRunning ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isQueryRunning ? 'Running...' : 'Run Query (⌘ ↵)'}
                  </button>
                </div>
                
                {/* Editor Area */}
                <div className="flex-none h-64 border-b border-zinc-800 relative bg-[#1e1e1e]">
                  <textarea
                    value={sqlQuery}
                    onChange={e => setSqlQuery(e.target.value)}
                    className="w-full h-full p-4 bg-transparent text-blue-300 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                    spellCheck={false}
                  />
                  {/* Line numbers mock */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-900/50 border-r border-zinc-800 flex flex-col items-center py-4 text-xs font-mono text-zinc-600 pointer-events-none">
                    {sqlQuery.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 bg-zinc-950 overflow-auto custom-scrollbar">
                  {queryResult ? (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-zinc-900/80 sticky top-0">
                        <tr>
                          {Object.keys(queryResult[0]).map(key => (
                            <th key={key} className="px-4 py-3 font-medium text-zinc-400">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {queryResult.map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-900/30">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-2.5 text-zinc-300 font-mono text-xs">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                      <Code2 className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm">Write a SQL query and hit Run to see results.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
