import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Zap,
  Play,
  Square,
  RotateCw,
  Terminal,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Plus,
  Search,
  Filter,
  Layers,
  Globe,
  HardDrive,
  Clock,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  GitBranch,
  Settings2,
  Trash2,
  Power,
  Flame,
  Activity,
} from 'lucide-react';
import { CloudInstance } from '../types';

interface CloudInstancesViewProps {
  instances: CloudInstance[];
  onUpdateInstance: (instance: CloudInstance) => void;
  onAddInstance: (instance: CloudInstance) => void;
  onDeleteInstance: (instanceId: string) => void;
  onOpenTerminal: (instanceId: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

export const CloudInstancesView: React.FC<CloudInstancesViewProps> = ({
  instances,
  onUpdateInstance,
  onAddInstance,
  onDeleteInstance,
  onOpenTerminal,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'running' | 'gpu' | 'cpu' | 'stopped'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<CloudInstance | null>(null);

  // New Instance Form State
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceType, setNewInstanceType] = useState<'gpu' | 'cpu'>('gpu');
  const [newGpuTier, setNewGpuTier] = useState('NVIDIA H100 SXM5 80GB');
  const [newCpuTier, setNewCpuTier] = useState('AMD EPYC (16 vCPU / 64GB)');
  const [newGitRepo, setNewGitRepo] = useState('https://github.com/developer/neuralpulse-copilot');
  const [newRegion, setNewRegion] = useState('us-east (Northern Virginia)');
  const [newAutoStop, setNewAutoStop] = useState(30);

  const copyToClipboard = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast(`Copied ${label}`, text, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleState = (instance: CloudInstance) => {
    const isRunning = instance.status === 'running';
    const updated: CloudInstance = {
      ...instance,
      status: isRunning ? 'stopped' : 'running',
      telemetry: isRunning
        ? { ...instance.telemetry, cpuPct: 0, ramPct: 0, vramPct: 0, uptime: 'Stopped' }
        : { ...instance.telemetry, cpuPct: Math.floor(Math.random() * 30) + 15, ramPct: 35, vramPct: instance.type === 'gpu' ? 45 : undefined, uptime: 'Just started' },
    };
    onUpdateInstance(updated);
    onShowToast(
      isRunning ? `Stopped ${instance.name}` : `Started ${instance.name}`,
      isRunning ? 'Compute billing paused' : 'Instance is live and ready for SSH / VS Code',
      'info'
    );
  };

  const handleReboot = (instance: CloudInstance) => {
    onShowToast(`Rebooting ${instance.name}...`, 'Refreshing SSH daemon and network routes', 'info');
    setTimeout(() => {
      onShowToast(`Rebooted ${instance.name}`, 'Instance is healthy', 'success');
    }, 1500);
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName.trim()) {
      onShowToast('Name required', 'Please provide a name for the instance', 'error');
      return;
    }

    const isGpu = newInstanceType === 'gpu';
    const newInst: CloudInstance = {
      id: `inst-${Date.now()}`,
      name: newInstanceName.trim().toLowerCase().replace(/\s+/g, '-'),
      slug: `brev-${newRegion.split(' ')[0]}-${Math.random().toString(36).substring(2, 6)}`,
      type: newInstanceType,
      hardware: isGpu
        ? {
            tier: newGpuTier,
            gpuModel: newGpuTier,
            vramGb: newGpuTier.includes('H100') ? 80 : newGpuTier.includes('L4') ? 24 : 80,
            vcpu: 16,
            ramGb: 120,
            diskGb: 500,
          }
        : {
            tier: newCpuTier,
            vcpu: 16,
            ramGb: 64,
            diskGb: 300,
          },
      status: 'running',
      ip: `34.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
      region: newRegion,
      sshCommand: `brev open ${newInstanceName.trim().toLowerCase().replace(/\s+/g, '-')}`,
      vscodeWebUrl: `https://vscode.dev/tunnel/${newInstanceName.trim()}`,
      vscodeDesktopUrl: `vscode://vscode-remote/ssh-remote+brev-${newInstanceName.trim()}/workspace`,
      cursorUrl: `cursor://vscode-remote/ssh-remote+brev-${newInstanceName.trim()}/workspace`,
      gitRepoUrl: newGitRepo.trim() || 'https://github.com/developer/workspace',
      gitBranch: 'main',
      ports: [
        { port: 3000, label: 'Web Service (HTTP)', url: `https://3000-${newInstanceName.trim()}.preview.brev.dev`, isPublic: true, protocol: 'http' },
        { port: 8000, label: 'API Microservice (HTTP)', url: `https://8000-${newInstanceName.trim()}.preview.brev.dev`, isPublic: true, protocol: 'http' },
      ],
      telemetry: {
        cpuPct: 15,
        ramPct: 22,
        vramPct: isGpu ? 30 : undefined,
        diskPct: 18,
        uptime: 'Just provisioned',
      },
      autoStopMinutes: newAutoStop,
      costPerHour: isGpu ? 2.89 : 0.42,
      createdAt: new Date().toISOString(),
    };

    onAddInstance(newInst);
    setIsProvisionOpen(false);
    setNewInstanceName('');
    onShowToast(`Provisioned ${newInst.name}`, 'Instance ready. Launching VS Code Server...', 'success');
  };

  const filteredInstances = instances.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.gitRepoUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.hardware.tier.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'running') return inst.status === 'running';
    if (filterType === 'gpu') return inst.type === 'gpu';
    if (filterType === 'cpu') return inst.type === 'cpu';
    if (filterType === 'stopped') return inst.status === 'stopped';
    return true;
  });

  const runningCount = instances.filter((i) => i.status === 'running').length;
  const totalCost = instances
    .filter((i) => i.status === 'running')
    .reduce((acc, curr) => acc + curr.costPerHour, 0);

  return (
    <div className="space-y-6">
      {/* Enterprise Control Plane Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0d1117] border border-zinc-800/80 rounded-xl p-5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Cloud Dev Environments (CDE)</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Brev.dev Engine Connected
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Instantly provision GPU/CPU cloud workspaces with 1-click VS Code, Cursor, and SSH integration.
              </p>
            </div>
          </div>
        </div>

        {/* Live Metrics Ribbon & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 px-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Running</span>
              <span className="font-semibold text-emerald-400">{runningCount} / {instances.length} Nodes</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Compute Spend</span>
              <span className="font-semibold text-zinc-200">${totalCost.toFixed(2)}/hr</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Auto-Stop</span>
              <span className="font-semibold text-blue-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Active
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsProvisionOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Provision Workspace
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instances, GPUs, repos, regions..."
            className="w-full bg-[#0d1117] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Instances' },
            { id: 'running', label: 'Running Nodes' },
            { id: 'gpu', label: 'GPU Clusters' },
            { id: 'cpu', label: 'CPU Workspaces' },
            { id: 'stopped', label: 'Stopped' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instance Cards Grid */}
      {filteredInstances.length === 0 ? (
        <div className="bg-[#0d1117] border border-zinc-800/80 rounded-2xl p-10 text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <Server className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">No Cloud Instances Found</h3>
            <p className="text-xs text-zinc-400">
              Provision a high-performance GPU or CPU cloud workspace with pre-configured CUDA, PyTorch, Docker, and 1-click VS Code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div
              onClick={() => {
                setNewInstanceType('gpu');
                setNewGpuTier('NVIDIA H100 SXM5 80GB');
                setNewInstanceName('h100-llm-fine-tune');
                setIsProvisionOpen(true);
              }}
              className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 cursor-pointer transition-all group"
            >
              <Flame className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">NVIDIA H100 (80GB)</h4>
              <p className="text-[11px] text-zinc-400">LoRA, DeepSeek & Llama fine-tuning @ $2.89/hr</p>
            </div>

            <div
              onClick={() => {
                setNewInstanceType('gpu');
                setNewGpuTier('NVIDIA L4 Tensor Core 24GB');
                setNewInstanceName('l4-inference-node');
                setIsProvisionOpen(true);
              }}
              className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 cursor-pointer transition-all group"
            >
              <Zap className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">NVIDIA L4 (24GB)</h4>
              <p className="text-[11px] text-zinc-400">Fast inference & multi-modal models @ $0.72/hr</p>
            </div>

            <div
              onClick={() => {
                setNewInstanceType('cpu');
                setNewInstanceName('fullstack-dev-cluster');
                setIsProvisionOpen(true);
              }}
              className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition-all group"
            >
              <Cpu className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white mb-1">AMD EPYC (16 vCPU)</h4>
              <p className="text-[11px] text-zinc-400">Fullstack Node, Go, Rust & Docker @ $0.38/hr</p>
            </div>
          </div>

          <button
            onClick={() => setIsProvisionOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Cloud Instance</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInstances.map((inst) => {
          const isRunning = inst.status === 'running';

          return (
            <div
              key={inst.id}
              className={`bg-[#0d1117] border transition-all rounded-xl p-5 shadow-lg ${
                isRunning ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-900 opacity-80'
              }`}
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                {/* Instance Title & Spec */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isRunning
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                        }`}
                      />
                      {isRunning ? 'RUNNING' : 'STOPPED'}
                    </span>

                    <h3 className="text-base font-bold text-zinc-100 font-mono tracking-tight flex items-center gap-2">
                      {inst.name}
                    </h3>

                    {inst.type === 'gpu' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-blue-400" />
                        {inst.hardware.gpuModel}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-blue-400" />
                        {inst.hardware.tier}
                      </span>
                    )}

                    <span className="text-xs text-zinc-500 font-mono">({inst.region})</span>
                  </div>

                  {/* Hardware & Git Subtitle */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-mono text-zinc-300">
                      <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                      {inst.hardware.vcpu} vCPU • {inst.hardware.ramGb}GB RAM • {inst.hardware.diskGb}GB NVMe
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                      <a
                        href={inst.gitRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-400 hover:underline"
                      >
                        {inst.gitRepoUrl.replace('https://github.com/', '')}
                      </a>
                      <span className="text-zinc-500 font-mono">[{inst.gitBranch}]</span>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" /> Uptime: {inst.telemetry.uptime}
                    </span>
                  </div>
                </div>

                {/* Quick IDE & SSH Action Bar (The Core Brev/VSCode feature) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0">
                  {/* Open in VS Code Web */}
                  <a
                    href={inst.vscodeWebUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isRunning
                        ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40 hover:border-blue-400'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 pointer-events-none'
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span>VS Code Web</span>
                    <ExternalLink className="w-3 h-3 text-blue-400/70" />
                  </a>

                  {/* Open in VS Code Desktop Deep Link */}
                  <a
                    href={inst.vscodeDesktopUrl}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isRunning
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 pointer-events-none'
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-zinc-400" />
                    <span>VS Code Desktop</span>
                  </a>

                  {/* Open in Cursor */}
                  <a
                    href={inst.cursorUrl}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isRunning
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 pointer-events-none'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Cursor</span>
                  </a>

                  {/* Web Terminal */}
                  <button
                    onClick={() => onOpenTerminal(inst.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Terminal</span>
                  </button>

                  {/* Lifecycle Controls */}
                  <div className="flex items-center gap-1 pl-1 border-l border-zinc-800">
                    <button
                      onClick={() => handleToggleState(inst)}
                      title={isRunning ? 'Stop Instance (Pause Spend)' : 'Start Instance'}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isRunning
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleReboot(inst)}
                      title="Reboot Instance"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteInstance(inst.id)}
                      title="Terminate Workspace"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Telemetry Meters & Forwarded Ingress Ports */}
              {isRunning && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                  {/* Telemetry Bars */}
                  <div className="space-y-2 lg:col-span-2">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-400" /> Live Resource Load
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        ${inst.costPerHour}/hr • Auto-stop in {inst.autoStopMinutes}m
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 border border-zinc-900 rounded-lg p-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-zinc-500 font-mono">CPU</span>
                          <span className="text-zinc-300 font-mono">{inst.telemetry.cpuPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${inst.telemetry.cpuPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-zinc-500 font-mono">RAM</span>
                          <span className="text-zinc-300 font-mono">{inst.telemetry.ramPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${inst.telemetry.ramPct}%` }}
                          />
                        </div>
                      </div>

                      {inst.telemetry.vramPct !== undefined && (
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-blue-400 font-mono">VRAM</span>
                            <span className="text-blue-300 font-mono">{inst.telemetry.vramPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${inst.telemetry.vramPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-zinc-500 font-mono">NVMe</span>
                          <span className="text-zinc-300 font-mono">{inst.telemetry.diskPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${inst.telemetry.diskPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Forwarded Ingress Ports */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" /> Ingress Tunnels
                      </span>
                      <button
                        onClick={() => copyToClipboard(inst.sshCommand, inst.id, 'SSH Command')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-sans cursor-pointer"
                      >
                        {copiedId === inst.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy SSH
                      </button>
                    </div>

                    <div className="space-y-1">
                      {inst.ports.map((port) => (
                        <div
                          key={port.port}
                          className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-950/80 border border-zinc-900 rounded-lg text-xs font-mono"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 font-bold">
                              :{port.port}
                            </span>
                            <span className="text-zinc-400 text-[11px] truncate">{port.label}</span>
                          </div>
                          <a
                            href={port.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 text-[11px] shrink-0"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* Provision Instance Modal */}
      {isProvisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1117] border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Provision Cloud Workspace</h2>
                  <p className="text-xs text-zinc-400">Spin up an enterprise Brev.dev GPU/CPU devcontainer</p>
                </div>
              </div>
              <button
                onClick={() => setIsProvisionOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Instance Hostname
                </label>
                <input
                  type="text"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  placeholder="e.g. gpu-llm-fine-tune or nextjs-frontend-node"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              {/* Instance Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Compute Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewInstanceType('gpu')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newInstanceType === 'gpu'
                        ? 'bg-blue-950/30 border-blue-500/50 text-blue-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Flame className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">NVIDIA GPU Accelerated</div>
                      <div className="text-[10px] text-zinc-500">PyTorch, CUDA, LLM training</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewInstanceType('cpu')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newInstanceType === 'cpu'
                        ? 'bg-blue-950/30 border-blue-500/50 text-blue-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Cpu className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">High-Performance CPU</div>
                      <div className="text-[10px] text-zinc-500">Fullstack Web, Microservices</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hardware Tier Selector */}
              {newInstanceType === 'gpu' ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    GPU Hardware Tier
                  </label>
                  <select
                    value={newGpuTier}
                    onChange={(e) => setNewGpuTier(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NVIDIA H100 SXM5 80GB">NVIDIA H100 SXM5 80GB ($2.89/hr) - 16 vCPU, 120GB RAM</option>
                    <option value="NVIDIA A100 SXM4 80GB">NVIDIA A100 SXM4 80GB ($1.89/hr) - 12 vCPU, 85GB RAM</option>
                    <option value="NVIDIA L4 Tensor Core 24GB">NVIDIA L4 24GB VRAM ($0.72/hr) - 8 vCPU, 32GB RAM</option>
                    <option value="NVIDIA T4 16GB">NVIDIA T4 16GB VRAM ($0.35/hr) - 4 vCPU, 16GB RAM</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    CPU Compute Spec
                  </label>
                  <select
                    value={newCpuTier}
                    onChange={(e) => setNewCpuTier(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="AMD EPYC (16 vCPU / 64GB)">AMD EPYC 7763 (16 vCPU, 64GB RAM, 300GB NVMe) - $0.38/hr</option>
                    <option value="High-Frequency Compute (32 vCPU / 128GB)">High-Frequency Compute (32 vCPU, 128GB RAM, 500GB NVMe) - $0.85/hr</option>
                    <option value="Standard Dev (8 vCPU / 32GB)">Standard Dev (8 vCPU, 32GB RAM, 150GB NVMe) - $0.19/hr</option>
                  </select>
                </div>
              )}

              {/* GitHub Repo to Auto-Clone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  GitHub Repository (Auto-clone into workspace)
                </label>
                <input
                  type="text"
                  value={newGitRepo}
                  onChange={(e) => setNewGitRepo(e.target.value)}
                  placeholder="https://github.com/developer/repo"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Cloud Region & Auto-stop */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cloud Region
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="us-east (Northern Virginia)">us-east (N. Virginia)</option>
                    <option value="us-central (Iowa)">us-central (Iowa)</option>
                    <option value="us-west (Oregon)">us-west (Oregon)</option>
                    <option value="europe-west (Frankfurt)">europe-west (Frankfurt)</option>
                    <option value="asia-east (Tokyo)">asia-east (Tokyo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Auto-Stop Idle Policy
                  </label>
                  <select
                    value={newAutoStop}
                    onChange={(e) => setNewAutoStop(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value={15}>15 minutes idle (recommended)</option>
                    <option value={30}>30 minutes idle</option>
                    <option value={60}>1 hour idle</option>
                    <option value={0}>Never stop (continuous)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  <Server className="w-4 h-4" />
                  Provision & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
