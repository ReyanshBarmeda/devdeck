import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Play,
  Pause,
  Trash2,
  Download,
  Search,
  Filter,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Clock,
  Server,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Code2,
  Flame,
} from 'lucide-react';
import { CloudInstance } from '../types';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  sourceType: 'cde-node' | 'microservice' | 'pipeline' | 'ingress';
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  traceId: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-101',
    timestamp: '09:41:02.104',
    source: 'h100-fine-tune-us-east',
    sourceType: 'cde-node',
    level: 'INFO',
    message: '[PyTorch CUDA 12.4] Initializing DistributedDataParallel (DDP) on 8x H100 SXM5 GPUs. Rank 0 active.',
    traceId: 'tr-992a-88f1',
    metadata: { rank: 0, world_size: 8, vram_allocated_gb: 72.4, cuda_device: 'cuda:0' },
  },
  {
    id: 'log-102',
    timestamp: '09:41:02.320',
    source: 'api-gateway',
    sourceType: 'microservice',
    level: 'INFO',
    message: 'POST /v1/chat/completions HTTP/1.1 200 OK - 142ms - 192.168.1.102:443',
    traceId: 'tr-992a-88f1',
    durationMs: 142,
    metadata: { status: 200, client_ip: '100.64.0.12', model: 'llama-3.3-70b-instruct' },
  },
  {
    id: 'log-103',
    timestamp: '09:41:03.450',
    source: 'auth-service',
    sourceType: 'microservice',
    level: 'DEBUG',
    message: 'JWT token validated for subject user_091823a8 (Team: Acme AI Engineering). Scope: [cde:admin, gpu:write]',
    traceId: 'tr-441f-1102',
    metadata: { exp: 1788102830, org: 'acme-corp' },
  },
  {
    id: 'log-104',
    timestamp: '09:41:04.112',
    source: 'vector-db-pgvector',
    sourceType: 'microservice',
    level: 'WARN',
    message: 'HNSW Index high memory usage: 84.2% (13.4GB / 16GB). Consider vacuuming partition partition_2026_q3.',
    traceId: 'tr-8890-4491',
    metadata: { memory_pct: 84.2, index_name: 'hnsw_embedding_idx_cosine' },
  },
  {
    id: 'log-105',
    timestamp: '09:41:05.789',
    source: 'ingress-tailscale-mesh',
    sourceType: 'ingress',
    level: 'INFO',
    message: 'Peer handshake established with device MacBook-Pro-M3 (100.82.19.4) via direct WireGuard DERP-01 (18ms).',
    traceId: 'tr-2384-9901',
    metadata: { protocol: 'wireguard', latency_ms: 18, bytes_rx: 948192, bytes_tx: 1048576 },
  },
  {
    id: 'log-106',
    timestamp: '09:41:06.012',
    source: 'amd-epyc-fullstack',
    sourceType: 'cde-node',
    level: 'ERROR',
    message: 'ECONNREFUSED: Connection refused at 127.0.0.1:5432 (PostgreSQL). Retrying in 1500ms (attempt 2/5)...',
    traceId: 'tr-1102-3392',
    metadata: { host: '127.0.0.1', port: 5432, err_code: 'ECONNREFUSED', stack: 'Error: Connection refused\n    at Socket.connect (/node_modules/pg/lib/connection.js:84:14)' },
  },
  {
    id: 'log-107',
    timestamp: '09:41:07.520',
    source: 'amd-epyc-fullstack',
    sourceType: 'cde-node',
    level: 'INFO',
    message: 'PostgreSQL connection successfully established on unix:/var/run/postgresql/.s.PGSQL.5432.',
    traceId: 'tr-1102-3392',
  },
  {
    id: 'log-108',
    timestamp: '09:41:08.910',
    source: 'ci-runner-arm64',
    sourceType: 'pipeline',
    level: 'INFO',
    message: '[Pipeline #1402] Step "Build Docker Multi-arch Image" finished in 18.4s. Pushed to registry.devdeck.internal/app:sha-88fa90',
    traceId: 'tr-7711-2294',
    metadata: { exit_code: 0, digest: 'sha256:88fa909819283719' },
  },
];

interface ObservabilityViewProps {
  instances: CloudInstance[];
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ObservabilityView: React.FC<ObservabilityViewProps> = ({ instances, onShowToast }) => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  // Live log simulation engine
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const mockSources = [
        'h100-fine-tune-us-east',
        'api-gateway',
        'auth-service',
        'vector-db-pgvector',
        'ingress-tailscale-mesh',
        'amd-epyc-fullstack',
        'ci-runner-arm64',
      ];
      const mockLevels: Array<'INFO' | 'WARN' | 'ERROR' | 'DEBUG'> = ['INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR', 'INFO'];
      const mockMessages = [
        'GET /api/v2/metrics HTTP/1.1 200 OK - 24ms',
        'Worker thread #4 checkpoint saved to /mnt/nvme/checkpoints/step-14500.pt (1.8GB)',
        'Egress bandwidth: 48.2 MB/s to CDN edge frankfurt-01',
        'Garbage collection completed: reclaimed 420MB VRAM in 12ms',
        'Health check ping from loadbalancer: status 200 (healthy)',
        'Redis cache hit ratio: 94.8% on hot key session:user_9921',
        'WebSocket client connected: session_id ws_98812a (Heartbeat 30s)',
      ];

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const randomSrc = mockSources[Math.floor(Math.random() * mockSources.length)];
      const randomLvl = mockLevels[Math.floor(Math.random() * mockLevels.length)];
      const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];

      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timeStr,
        source: randomSrc,
        sourceType: randomSrc.includes('h100') || randomSrc.includes('epyc') ? 'cde-node' : randomSrc.includes('runner') ? 'pipeline' : randomSrc.includes('ingress') ? 'ingress' : 'microservice',
        level: randomLvl,
        message: randomMsg,
        traceId: `tr-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
        durationMs: Math.floor(Math.random() * 180) + 12,
        metadata: { client_os: 'Linux x86_64', pid: 14092, cpu_core: 4 },
      };

      setLogs((prev) => [...prev.slice(-300), newLog]);
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (autoScroll && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (activeTraceId && log.traceId !== activeTraceId) return false;
    if (selectedLevel !== 'ALL' && log.level !== selectedLevel) return false;
    if (selectedSource !== 'ALL' && log.source !== selectedSource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const levelCounts = {
    ALL: logs.length,
    ERROR: logs.filter((l) => l.level === 'ERROR').length,
    WARN: logs.filter((l) => l.level === 'WARN').length,
    INFO: logs.filter((l) => l.level === 'INFO').length,
    DEBUG: logs.filter((l) => l.level === 'DEBUG').length,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('Copied to Clipboard', text.substring(0, 40) + '...', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devdeck-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Logs Exported', `Saved ${filteredLogs.length} entries as JSON dump`, 'success');
  };

  const allSources = Array.from(new Set(logs.map((l) => l.source)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090c10] text-slate-100">
      {/* Top Banner / Header */}
      <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0d1117] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Distributed Observability & Live Log Streamer
              {isStreaming ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE TAIL
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PAUSED
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Aggregated real-time stdout/stderr from CDE nodes, containers, and ingress mesh
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isStreaming
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume Live'}</span>
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              autoScroll
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <ChevronRight className={`w-3.5 h-3.5 rotate-90 ${autoScroll ? 'text-blue-400' : ''}`} />
            <span>Auto-Scroll</span>
          </button>

          <button
            onClick={() => {
              setLogs([]);
              onShowToast('Logs Cleared', 'Buffer reset to 0 entries', 'info');
            }}
            className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="px-6 py-2.5 border-b border-white/[0.06] bg-[#0c0f14] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs by keyword, regex, or trace ID (e.g. ECONNREFUSED, DDP, tr-992a)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/[0.08] focus:border-cyan-500/60 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none font-mono"
            />
          </div>

          {activeTraceId && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg font-mono text-[11px]">
              <span>Trace: {activeTraceId}</span>
              <button
                onClick={() => setActiveTraceId(null)}
                className="hover:text-white ml-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1">
          {(['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const).map((lvl) => {
            const isActive = selectedLevel === lvl;
            const count = levelCounts[lvl];
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? lvl === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                      : lvl === 'WARN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : lvl === 'INFO'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : lvl === 'DEBUG'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                      : 'bg-white/[0.12] text-white border border-white/[0.2]'
                    : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <span>{lvl}</span>
                <span className="text-[9px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Source Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono text-[11px]">Source:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-black/40 border border-white/[0.08] text-slate-300 rounded-md px-2 py-1 text-xs outline-none font-mono cursor-pointer"
          >
            <option value="ALL">All Sources ({allSources.length})</option>
            {allSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Terminal-Style Logs Body & Trace Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Log Viewer Pane */}
        <div className="flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed p-4 space-y-1 bg-[#06080c] select-text">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <Terminal className="w-8 h-8 mx-auto text-slate-600" />
              <p>No log records match the current filter criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`group flex items-start gap-3 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border border-blue-500/40'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>

                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      log.level === 'ERROR'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : log.level === 'WARN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : log.level === 'INFO'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {log.level}
                  </span>

                  <span className="text-cyan-400 font-semibold shrink-0 max-w-[180px] truncate text-[11px]">
                    [{log.source}]
                  </span>

                  <span
                    className={`flex-1 break-all ${
                      log.level === 'ERROR'
                        ? 'text-rose-200'
                        : log.level === 'WARN'
                        ? 'text-amber-100'
                        : log.level === 'DEBUG'
                        ? 'text-slate-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {log.message}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTraceId(log.traceId);
                        onShowToast('Filtered by Trace', `Showing span ${log.traceId}`, 'info');
                      }}
                      className="px-1.5 py-0.5 bg-white/[0.06] hover:bg-white/[0.12] rounded text-[10px] text-blue-300"
                      title="Filter by Trace ID"
                    >
                      trace:{log.traceId.slice(0, 7)}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(log.message, log.id);
                      }}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollBottomRef} />
        </div>

        {/* Structured Log Payload & Trace Inspector Drawer */}
        {selectedLog && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-96 border-l border-white/[0.08] bg-[#0c0f15] p-5 overflow-y-auto flex flex-col justify-between shrink-0"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Log Payload Detail</span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Attributes List */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[11px]">Timestamp:</span>
                  <p className="text-slate-200 font-semibold">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Level:</span>
                  <p className="text-white font-bold">{selectedLog.level}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Source Node:</span>
                  <p className="text-cyan-300 font-semibold">{selectedLog.source}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Trace ID:</span>
                  <div className="flex items-center justify-between">
                    <p className="text-blue-400 font-bold">{selectedLog.traceId}</p>
                    <button
                      onClick={() => setActiveTraceId(selectedLog.traceId)}
                      className="text-[10px] text-blue-300 underline hover:text-blue-200"
                    >
                      Filter Span
                    </button>
                  </div>
                </div>
                {selectedLog.durationMs && (
                  <div>
                    <span className="text-slate-500 text-[11px]">Execution Latency:</span>
                    <p className="text-emerald-400 font-bold">{selectedLog.durationMs} ms</p>
                  </div>
                )}
              </div>

              {/* JSON Metadata Payload */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Raw JSON Context:</span>
                <pre className="p-3 bg-black/60 border border-white/[0.08] rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {JSON.stringify(
                    {
                      id: selectedLog.id,
                      source: selectedLog.source,
                      level: selectedLog.level,
                      traceId: selectedLog.traceId,
                      ...selectedLog.metadata,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), selectedLog.id)}
                className="flex-1 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Record JSON</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
