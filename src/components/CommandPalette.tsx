import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Key, FolderGit2, FileCode, Zap, Code2, Network, HardDrive, Terminal, Monitor, LayoutTemplate, Layers, Settings, Database } from 'lucide-react';
import { ViewMode, ThemeId } from '../types';

interface Action {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  section: 'Projects' | 'Snippets' | 'Workflows' | 'Navigation' | 'Actions';
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: any[];
  aiPrompts?: any[];
  snippets?: any[];
  resources?: any[];
  workflows?: any[];
  onSelectProject?: (p: any) => void;
  onNavigate: (view: ViewMode) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  projects = [],
  snippets = [],
  workflows = [],
  onSelectProject,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic actions mapped from props
  const dynamicActions: Action[] = [
    ...projects.map(p => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: p.description || 'Project Workspace',
      icon: FolderGit2,
      section: 'Projects' as const,
      onSelect: () => {
        if (onSelectProject) onSelectProject(p);
      }
    })),
    ...snippets.map(s => ({
      id: `snip-${s.id}`,
      title: s.title,
      subtitle: `${s.language} snippet`,
      icon: Code2,
      section: 'Snippets' as const,
      onSelect: () => onNavigate('snippets')
    })),
    ...workflows.map(w => ({
      id: `flow-${w.id}`,
      title: w.name,
      subtitle: 'Automation Workflow',
      icon: Zap,
      section: 'Workflows' as const,
      onSelect: () => onNavigate('workflows')
    }))
  ];

  const staticActions: Action[] = [
    { id: 'nav-db', title: 'Database Studio', subtitle: 'SQL Editor & Explorer', icon: Database, section: 'Navigation', onSelect: () => onNavigate('database-studio') },
    { id: 'nav-instances', title: 'Instances', subtitle: 'Manage cloud instances', icon: Monitor, section: 'Navigation', onSelect: () => onNavigate('instances') },
    { id: 'nav-mesh', title: 'Mesh Topology', subtitle: 'View WireGuard network', icon: Network, section: 'Navigation', onSelect: () => onNavigate('mesh-topology') },
    { id: 'nav-storage', title: 'Mesh Storage', subtitle: 'Shared NAS files', icon: HardDrive, section: 'Navigation', onSelect: () => onNavigate('mesh-storage') },
    { id: 'nav-terminal', title: 'Terminal', subtitle: 'Command line interface', icon: Terminal, section: 'Navigation', onSelect: () => onNavigate('terminal') },
    { id: 'nav-cicd', title: 'CI/CD Pipelines', subtitle: 'View deployments', icon: Zap, section: 'Navigation', onSelect: () => onNavigate('pipelines') },
    { id: 'nav-api', title: 'API Manager', subtitle: 'Add and Replace API Endpoints', icon: Network, section: 'Navigation', onSelect: () => onNavigate('api-manager') },
    { id: 'nav-credential-clipboard', title: 'API Key Clipboard', subtitle: 'Quick access to API keys', icon: Key, section: 'Navigation', onSelect: () => onNavigate('credential-clipboard') },
    { id: 'nav-settings', title: 'Settings', subtitle: 'App configuration', icon: Settings, section: 'Navigation', onSelect: () => onNavigate('settings') },
  ];

  const allActions = [...dynamicActions, ...staticActions];

  const filteredActions = allActions.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.subtitle && a.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.section]) acc[action.section] = [];
    acc[action.section].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const flatFiltered = Object.values(groupedActions).flat();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatFiltered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatFiltered.length) % flatFiltered.length);
      } else if (e.key === 'Enter' && flatFiltered[selectedIndex]) {
        e.preventDefault();
        flatFiltered[selectedIndex].onSelect();
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatFiltered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full max-w-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-4 border-b border-zinc-800/50">
            <Search className="w-5 h-5 text-zinc-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, snippets, commands..."
              className="flex-1 bg-transparent text-lg text-zinc-100 placeholder-zinc-500 focus:outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-1.5 ml-3 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/30">
              <span className="text-xs font-medium text-zinc-400">ESC</span>
            </div>
          </div>

          <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
            {Object.keys(groupedActions).length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            ) : (
              Object.entries(groupedActions).map(([section, items]) => (
                <div key={section} className="mb-4 last:mb-0">
                  <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {section}
                  </div>
                  <div className="space-y-1">
                    {items.map((action) => {
                      const index = flatFiltered.findIndex(a => a.id === action.id);
                      const isSelected = index === selectedIndex;
                      const Icon = action.icon;
                      
                      return (
                        <button
                          key={action.id}
                          className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-colors text-left
                            ${isSelected 
                              ? 'bg-blue-600/20 text-blue-100 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)]' 
                              : 'text-zinc-300 hover:bg-zinc-800/50'
                            }`}
                          onClick={() => {
                            action.onSelect();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className={`p-1.5 rounded-lg mr-3 ${isSelected ? 'bg-blue-600/30 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{action.title}</div>
                            {action.subtitle && (
                              <div className={`text-xs ${isSelected ? 'text-blue-300/70' : 'text-zinc-500'}`}>
                                {action.subtitle}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 opacity-60">
                              <span className="text-[10px] uppercase font-bold tracking-wider">Enter</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-zinc-800/50 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/50 font-sans">↑</kbd>
                <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/50 font-sans">↓</kbd>
                <span className="ml-1">to navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/50 font-sans">↵</kbd>
                <span className="ml-1">to select</span>
              </div>
            </div>
            <div className="font-medium">DevDeck Omnibar</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
