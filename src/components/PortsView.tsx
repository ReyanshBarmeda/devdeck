import React, { useState } from 'react';
import {
  Network,
  Copy,
  ExternalLink,
  Zap,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Project } from '../types';

interface PortsViewProps {
  projects: Project[];
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

interface CustomPort {
  id: string;
  port: number;
  label: string;
  service: string;
  description: string;
}

const COMMON_DEV_PORTS = [
  { port: 3000, defaultService: 'Next.js / Express / React Dev Server' },
  { port: 5173, defaultService: 'Vite Development Server' },
  { port: 8000, defaultService: 'FastAPI / Django Backend' },
  { port: 8080, defaultService: 'Spring Boot / Go Gin Web Server' },
  { port: 5432, defaultService: 'PostgreSQL Database' },
  { port: 6379, defaultService: 'Redis In-Memory Cache' },
  { port: 6333, defaultService: 'Qdrant Vector Database' },
  { port: 11434, defaultService: 'Ollama Local LLM Inference Server' },
  { port: 27017, defaultService: 'MongoDB Database' },
];

export const PortsView: React.FC<PortsViewProps> = ({
  projects,
  onShowToast,
}) => {
  const [customPorts, setCustomPorts] = useState<CustomPort[]>([
    { id: 'cp-1', port: 11434, label: 'Ollama LLM Engine', service: 'Local AI', description: 'Local LLM inference for DeepSeek / Llama 3' },
    { id: 'cp-2', port: 6333, label: 'Qdrant Vector DB', service: 'Vector Search', description: 'High-speed embeddings retrieval' },
  ]);

  const [newPortNum, setNewPortNum] = useState('');
  const [newPortLabel, setNewPortLabel] = useState('');
  const [newPortService, setNewPortService] = useState('');

  // Combine project mapped ports and custom ports
  const projectPorts = projects
    .filter((p) => p.localPort)
    .map((p) => ({
      id: `proj-${p.id}`,
      port: p.localPort!,
      label: p.name,
      service: p.category.toUpperCase(),
      description: `Mapped to local path ${p.localPath || 'project'}`,
      isProject: true,
      projectId: p.id,
    }));

  const allMonitored = [
    ...projectPorts,
    ...customPorts.map((cp) => ({ ...cp, isProject: false, projectId: '' })),
  ];

  const handleAddCustomPort = (e: React.FormEvent) => {
    e.preventDefault();
    const port = parseInt(newPortNum, 10);
    if (!port || !newPortLabel.trim()) return;

    setCustomPorts([
      ...customPorts,
      {
        id: `cp-${Date.now()}`,
        port,
        label: newPortLabel.trim(),
        service: newPortService.trim() || 'Custom Dev Service',
        description: 'User-defined developer port reservation',
      },
    ]);

    setNewPortNum('');
    setNewPortLabel('');
    setNewPortService('');
    onShowToast('Port Registered', `localhost:${port}`, 'success');
  };

  const getKillCommand = (port: number, os: 'unix' | 'windows' = 'unix') => {
    if (os === 'windows') {
      return `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`;
    }
    return `lsof -ti :${port} | xargs kill -9`;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              Localhost Dev Environment
            </span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              Localhost Port Matrix & Process Terminus
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Track active local dev servers, avoid port collision conflicts, and instantly copy terminal kill commands for stuck processes.
            </p>
          </div>
        </div>
      </div>

      {/* Port Matrix Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Monitored Localhost Ports ({allMonitored.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMonitored.map((item) => {
            const unixKill = getKillCommand(item.port, 'unix');
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-base font-bold text-cyan-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                      :{item.port}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {item.service}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 truncate">{item.label}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <a
                      href={`http://localhost:${item.port}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Browser</span>
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(unixKill);
                        onShowToast('Copied Kill Command', unixKill, 'info');
                      }}
                      title="Copy kill command: lsof -ti :PORT | xargs kill -9"
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Kill</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register Custom Port */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Register Port Reservation</span>
        </h3>

        <form onSubmit={handleAddCustomPort} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="number"
            required
            value={newPortNum}
            onChange={(e) => setNewPortNum(e.target.value)}
            placeholder="Port (e.g. 5432)"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            required
            value={newPortLabel}
            onChange={(e) => setNewPortLabel(e.target.value)}
            placeholder="Label (e.g. PostgreSQL Primary)"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={newPortService}
            onChange={(e) => setNewPortService(e.target.value)}
            placeholder="Service (e.g. Database / AI)"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Port</span>
          </button>
        </form>
      </div>

      {/* Common Port Presets Cheatsheet */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Standard Developer Port Reference
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_DEV_PORTS.map((cp) => (
            <div
              key={cp.port}
              onClick={() => {
                const cmd = `lsof -ti :${cp.port} | xargs kill -9`;
                navigator.clipboard.writeText(cmd);
                onShowToast(`Copied Kill Command for :${cp.port}`, cmd, 'info');
              }}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="font-mono text-xs font-bold text-slate-200">:{cp.port}</span>
                <p className="text-[11px] text-slate-400">{cp.defaultService}</p>
              </div>
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
