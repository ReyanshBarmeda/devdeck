import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Network,
  Share2,
  Globe,
  Smartphone,
  Laptop,
  Server,
  ShieldCheck,
  Zap,
  Activity,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Lock,
  Radio,
  Terminal,
  Cpu,
} from 'lucide-react';
import { RemoteDevice, CloudInstance } from '../types';

interface TunnelRoute {
  id: string;
  name: string;
  sourceDevice: string;
  localPort: number;
  publicHttpsUrl: string;
  protocol: 'https' | 'http' | 'tcp' | 'ws';
  status: 'active' | 'paused';
  authProtected: boolean;
  requestsTotal: number;
  avgLatencyMs: number;
}

const INITIAL_TUNNELS: TunnelRoute[] = [
  {
    id: 'tun-1',
    name: 'Frontend Next.js Dev Server',
    sourceDevice: 'MacBook Pro M3 Max',
    localPort: 3000,
    publicHttpsUrl: 'https://fe-dev-acme.devdeck.live',
    protocol: 'https',
    status: 'active',
    authProtected: true,
    requestsTotal: 1420,
    avgLatencyMs: 24,
  },
  {
    id: 'tun-2',
    name: 'PyTorch Model Inference Endpoint',
    sourceDevice: 'h100-fine-tune-us-east',
    localPort: 8000,
    publicHttpsUrl: 'https://h100-v1-api.devdeck.live',
    protocol: 'https',
    status: 'active',
    authProtected: false,
    requestsTotal: 8490,
    avgLatencyMs: 18,
  },
  {
    id: 'tun-3',
    name: 'Local Ollama LLM Bridge',
    sourceDevice: 'Ubuntu Workstation',
    localPort: 11434,
    publicHttpsUrl: 'https://ollama-mesh.devdeck.live',
    protocol: 'https',
    status: 'active',
    authProtected: true,
    requestsTotal: 310,
    avgLatencyMs: 12,
  },
];

interface MeshTopologyViewProps {
  devices: RemoteDevice[];
  instances: CloudInstance[];
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const MeshTopologyView: React.FC<MeshTopologyViewProps> = ({
  devices,
  instances,
  onShowToast,
}) => {
  const [tunnels, setTunnels] = useState<TunnelRoute[]>(INITIAL_TUNNELS);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreatingTunnel, setIsCreatingTunnel] = useState(false);
  const [newTunnelName, setNewTunnelName] = useState('');
  const [newTunnelPort, setNewTunnelPort] = useState(5173);
  const [newTunnelDevice, setNewTunnelDevice] = useState('MacBook Pro M3 Max');
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  // Mesh nodes
  const meshNodes = [
    {
      id: 'node-mbp',
      name: 'MacBook Pro M3 Max',
      type: 'laptop',
      ip: '100.84.19.4',
      os: 'macOS Sonoma',
      status: 'online',
      latency: '14ms',
      role: 'Local Workstation',
      x: 180,
      y: 120,
    },
    {
      id: 'node-iphone',
      name: 'iPhone 16 Pro (iOS)',
      type: 'phone',
      ip: '100.84.19.12',
      os: 'iOS 18.2',
      status: 'online',
      latency: '28ms',
      role: 'Mobile Companion',
      x: 160,
      y: 340,
    },
    {
      id: 'node-cde-h100',
      name: 'h100-fine-tune-us-east',
      type: 'server',
      ip: '100.64.0.88',
      os: 'Ubuntu 24.04 (CUDA)',
      status: 'online',
      latency: '18ms',
      role: 'Cloud CDE GPU Node',
      x: 520,
      y: 120,
    },
    {
      id: 'node-cde-epyc',
      name: 'amd-epyc-fullstack',
      type: 'server',
      ip: '100.64.0.92',
      os: 'Debian 12 Bookworm',
      status: 'online',
      latency: '22ms',
      role: 'Backend Cluster',
      x: 540,
      y: 340,
    },
    {
      id: 'node-gateway',
      name: 'Tailscale DERP-01 Gateway',
      type: 'relay',
      ip: '100.64.0.1',
      os: 'DevDeck Mesh Core',
      status: 'online',
      latency: '4ms',
      role: 'Direct WireGuard Hub',
      x: 350,
      y: 230,
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('Copied URL', text, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTunnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTunnelName.trim()) return;

    const slug = newTunnelName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newTun: TunnelRoute = {
      id: `tun-${Date.now()}`,
      name: newTunnelName,
      sourceDevice: newTunnelDevice,
      localPort: newTunnelPort,
      publicHttpsUrl: `https://${slug}.devdeck.live`,
      protocol: 'https',
      status: 'active',
      authProtected: true,
      requestsTotal: 0,
      avgLatencyMs: 16,
    };

    setTunnels([newTun, ...tunnels]);
    setIsCreatingTunnel(false);
    setNewTunnelName('');
    onShowToast('Public Tunnel Created', `${newTun.publicHttpsUrl} is now live with TLS 1.3`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090c10] text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              WireGuard / Tailscale Mesh Topology & Port Tunnels
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                P2P Encrypted Mesh
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Direct point-to-point WireGuard routing between laptops, mobile devices, and GPU cloud instances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingTunnel(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Public HTTPS Tunnel</span>
          </button>
        </div>
      </div>

      {/* Visual Mesh Topology Canvas */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Mesh Routing Map (DERP-01 Relay & Direct STUN)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 5 Active Peers Online
          </span>
        </div>

        {/* SVG Mesh Diagram */}
        <div className="relative w-full h-[460px] bg-black/40 border border-white/[0.04] rounded-xl overflow-hidden flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 460">
            {/* Grid pattern background */}
            <defs>
              <pattern id="meshGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#meshGrid)" />

            {/* Connecting lines from Gateway to Nodes */}
            <line x1="350" y1="230" x2="180" y2="120" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            <line x1="350" y1="230" x2="160" y2="340" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="350" y1="230" x2="520" y2="120" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="350" y1="230" x2="540" y2="340" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Direct P2P link between Mac and H100 */}
            <line x1="180" y1="120" x2="520" y2="120" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" />

            {/* Latency Labels */}
            <text x="250" y="160" fill="#60a5fa" fontSize="11" fontFamily="monospace" textAnchor="middle">14ms (P2P)</text>
            <text x="240" y="300" fill="#60a5fa" fontSize="11" fontFamily="monospace" textAnchor="middle">28ms</text>
            <text x="450" y="160" fill="#60a5fa" fontSize="11" fontFamily="monospace" textAnchor="middle">18ms (Direct)</text>
            <text x="460" y="300" fill="#34d399" fontSize="11" fontFamily="monospace" textAnchor="middle">22ms</text>
          </svg>

          {/* Interactive Node Cards positioned on SVG */}
          {meshNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{ left: `${(node.x / 700) * 100}%`, top: `${(node.y / 460) * 100}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border backdrop-blur-md cursor-pointer transition-all hover:scale-105 z-10 select-none ${
                node.type === 'relay'
                  ? 'bg-blue-950/80 border-blue-500/60 shadow-lg shadow-blue-950/50'
                  : node.type === 'server'
                  ? 'bg-blue-950/80 border-blue-500/50 shadow-lg'
                  : 'bg-zinc-900/90 border-white/[0.12] shadow-lg'
              }`}
            >
              <div className="flex items-center gap-2">
                {node.type === 'laptop' && <Laptop className="w-4 h-4 text-slate-300" />}
                {node.type === 'phone' && <Smartphone className="w-4 h-4 text-emerald-400" />}
                {node.type === 'server' && <Server className="w-4 h-4 text-blue-400" />}
                {node.type === 'relay' && <Network className="w-4 h-4 text-blue-300" />}

                <div>
                  <h4 className="text-xs font-bold text-white whitespace-nowrap">{node.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 block">{node.ip}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.08] text-[10px] font-mono">
                <span className="text-emerald-400">{node.latency}</span>
                <span className="text-slate-400">{node.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Public Port Tunnels Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Public Reverse-Proxy Tunnels (TLS 1.3)
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            {tunnels.length} Public Endpoints Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {tunnels.map((tun) => (
            <div
              key={tun.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white">{tun.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tun.sourceDevice} • Port {tun.localPort}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {tun.status.toUpperCase()}
                  </span>
                </div>

                {/* Public URL Box */}
                <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06] flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-blue-400 truncate">{tun.publicHttpsUrl}</span>
                  <button
                    onClick={() => handleCopy(tun.publicHttpsUrl, tun.id)}
                    className="p-1 hover:text-white text-slate-400 shrink-0 cursor-pointer"
                  >
                    {copiedId === tun.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>{tun.requestsTotal} requests</span>
                  <span className="text-emerald-400">{tun.avgLatencyMs}ms avg</span>
                </div>
              </div>

              {/* Action Strip */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => setQrModalUrl(tun.publicHttpsUrl)}
                  className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                  <span>QR Code</span>
                </button>

                <a
                  href={tun.publicHttpsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Tunnel Modal */}
      {isCreatingTunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0d1117] border border-white/[0.12] rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Create Public Reverse-Proxy Tunnel
              </h3>
              <button onClick={() => setIsCreatingTunnel(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateTunnel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tunnel Label / Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vite Web Client or FastAPI Server"
                  value={newTunnelName}
                  onChange={(e) => setNewTunnelName(e.target.value)}
                  className="w-full p-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Local Port</label>
                  <input
                    type="number"
                    value={newTunnelPort}
                    onChange={(e) => setNewTunnelPort(Number(e.target.value))}
                    className="w-full p-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Mesh Device</label>
                  <select
                    value={newTunnelDevice}
                    onChange={(e) => setNewTunnelDevice(e.target.value)}
                    className="w-full p-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="MacBook Pro M3 Max">MacBook Pro M3 Max</option>
                    <option value="h100-fine-tune-us-east">h100-fine-tune-us-east</option>
                    <option value="amd-epyc-fullstack">amd-epyc-fullstack</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTunnel(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Create & Bind Tunnel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d1117] border border-white/[0.12] rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Scan with Mobile Phone</h3>
            <div className="p-4 bg-white rounded-xl inline-block mx-auto">
              {/* Visual QR Code placeholder pattern */}
              <div className="w-36 h-36 border-4 border-black flex flex-col justify-between p-1 bg-white">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black" />
                  <div className="w-8 h-8 bg-black" />
                </div>
                <div className="flex items-center justify-center font-mono text-[9px] text-black font-black">
                  DEVDECK P2P
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black" />
                  <div className="w-4 h-4 bg-black" />
                </div>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-300 break-all">{qrModalUrl}</p>
            <button
              onClick={() => setQrModalUrl(null)}
              className="w-full py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
