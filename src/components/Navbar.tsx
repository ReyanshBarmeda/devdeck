import React, { useRef, useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Download,
  Upload,
  Terminal,
  Code2,
  Kanban,
  Globe,
  FolderGit2,
  Network,
  Zap,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Key,
  Server,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ViewMode, Project, UserProfile, AppSettings } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenCommandPalette: () => void;
  onNewProject: () => void;
  onOpenAIArchitect?: () => void;
  onExportWorkspace: () => void;
  onImportWorkspace: (e: React.ChangeEvent<HTMLInputElement>) => void;
  projects: Project[];
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenBillingModal?: () => void;
  onLogout: () => void;
  settings?: AppSettings;
  runningNodesCount?: number;
  connectedDevicesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCommandPalette,
  onNewProject,
  onExportWorkspace,
  onImportWorkspace,
  projects,
  currentUser,
  onOpenAuthModal,
  onOpenBillingModal,
  onLogout,
  runningNodesCount = 3,
  connectedDevicesCount = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());

  const activeProjectsCount = projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSoundToggle = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const handleNav = (v: ViewMode) => {
    sound.playClick(1000);
    onNavigate(v);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0d13] border-b border-zinc-800/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        {/* Left: Brand Identity & Status */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('instances')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Server className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5 font-mono">
                  DevDeck
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium">
                    CDE Platform
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden xl:flex items-center gap-2 ml-2 text-xs">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {runningNodesCount} GPU/CPU Nodes Active
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono text-[11px]">
              <FolderGit2 className="w-3 h-3 text-blue-400" />
              {activeProjectsCount} Repos
            </span>
          </div>
        </div>

        {/* Center: Search / Command Palette Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-colors group cursor-pointer font-mono"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span className="truncate text-zinc-400 font-normal font-sans">Quick open instances, SSH, ports, commits (⌘K)...</span>
            </div>
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Buttons, Terminal & User Auth */}
        <div className="flex items-center gap-2">
          {/* Cloud CDE Quick Switch */}
          <button
            onClick={() => handleNav('instances')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              currentView === 'instances'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Cloud Dev Environments"
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Cloud CDE</span>
          </button>

          {/* Connected PCs & Phones Quick Switch */}
          <button
            onClick={() => handleNav('devices')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              currentView === 'devices'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Connected PCs, Servers & Mobile Phones"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">PCs & Phones</span>
            <span className="hidden md:inline text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-300">
              {connectedDevicesCount}
            </span>
          </button>

          {/* Interactive Terminal Quick Switch */}
          <button
            onClick={() => handleNav('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              currentView === 'terminal'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="SSH Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Terminal</span>
          </button>

          {/* Tactile Audio Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Acoustic Sound FX: On (Click to mute)' : 'Acoustic Sound FX: Muted (Click to enable)'}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
              soundEnabled
                ? 'bg-blue-600/15 text-blue-400 border-blue-500/30 hover:bg-blue-600/25'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-zinc-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNav('settings')}
            title="Cloud & API Keys Settings"
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
              currentView === 'settings'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Import / Export Workspace */}
          <div className="hidden lg:flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={onExportWorkspace}
              title="Export workspace JSON"
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import workspace JSON"
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded text-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportWorkspace}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* User Auth Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer group"
              >
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email)}`}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-md bg-zinc-800 object-cover border border-zinc-700"
                />
                <span className="text-xs font-medium text-zinc-200 max-w-[80px] truncate hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d1117] border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email)}`}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-100 truncate flex items-center gap-1.5">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenBillingModal?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer text-left"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Billing & Compute Quota</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer text-left"
                  >
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span>API Keys & Cloud Credentials</span>
                  </button>

                  <div className="my-1 border-t border-zinc-800" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

