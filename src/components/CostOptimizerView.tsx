import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingDown,
  DollarSign,
  Zap,
  Shield,
  Server,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Globe,
  Sparkles,
  Percent,
} from 'lucide-react';
import { CloudInstance } from '../types';

interface SpotOffer {
  id: string;
  provider: 'Lambda Labs' | 'RunPod' | 'AWS (us-east-1)' | 'GCP (us-central1)' | 'Hetzner Cloud' | 'Scaleway';
  region: string;
  gpuModel: string;
  vram: string;
  vcpu: number;
  ramGb: number;
  onDemandPrice: number;
  spotPrice: number;
  savingsPct: number;
  interruptionRisk: 'Low (<3%)' | 'Medium (~7%)' | 'High (>15%)';
  availability: 'High' | 'Medium' | 'Scarce';
  isLowestPrice?: boolean;
}

const SPOT_OFFERS: SpotOffer[] = [
  {
    id: 'spot-h100-runpod',
    provider: 'RunPod',
    region: 'US-East (Virginia)',
    gpuModel: 'NVIDIA H100 SXM5',
    vram: '80GB HBM3',
    vcpu: 16,
    ramGb: 128,
    onDemandPrice: 3.49,
    spotPrice: 2.19,
    savingsPct: 37,
    interruptionRisk: 'Low (<3%)',
    availability: 'High',
    isLowestPrice: true,
  },
  {
    id: 'spot-h100-lambda',
    provider: 'Lambda Labs',
    region: 'US-West (Utah)',
    gpuModel: 'NVIDIA H100 SXM5',
    vram: '80GB HBM3',
    vcpu: 16,
    ramGb: 128,
    onDemandPrice: 2.99,
    spotPrice: 2.39,
    savingsPct: 20,
    interruptionRisk: 'Medium (~7%)',
    availability: 'Medium',
  },
  {
    id: 'spot-h100-aws',
    provider: 'AWS (us-east-1)',
    region: 'p5.48xlarge slice',
    gpuModel: 'NVIDIA H100 SXM5',
    vram: '80GB HBM3',
    vcpu: 24,
    ramGb: 192,
    onDemandPrice: 4.85,
    spotPrice: 2.89,
    savingsPct: 40,
    interruptionRisk: 'High (>15%)',
    availability: 'High',
  },
  {
    id: 'spot-a100-runpod',
    provider: 'RunPod',
    region: 'EU-Central (Frankfurt)',
    gpuModel: 'NVIDIA A100 SXM4',
    vram: '80GB HBM2e',
    vcpu: 12,
    ramGb: 64,
    onDemandPrice: 1.89,
    spotPrice: 1.19,
    savingsPct: 37,
    interruptionRisk: 'Low (<3%)',
    availability: 'High',
    isLowestPrice: true,
  },
  {
    id: 'spot-l4-gcp',
    provider: 'GCP (us-central1)',
    region: 'g2-standard-8',
    gpuModel: 'NVIDIA L4 Tensor Core',
    vram: '24GB GDDR6',
    vcpu: 8,
    ramGb: 32,
    onDemandPrice: 0.84,
    spotPrice: 0.38,
    savingsPct: 55,
    interruptionRisk: 'Low (<3%)',
    availability: 'High',
    isLowestPrice: true,
  },
  {
    id: 'spot-4090-hetzner',
    provider: 'Hetzner Cloud',
    region: 'Falkenstein (DE)',
    gpuModel: 'NVIDIA RTX 4090',
    vram: '24GB GDDR6X',
    vcpu: 16,
    ramGb: 64,
    onDemandPrice: 0.79,
    spotPrice: 0.49,
    savingsPct: 38,
    interruptionRisk: 'Low (<3%)',
    availability: 'Medium',
  },
];

interface CostOptimizerViewProps {
  instances: CloudInstance[];
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onDeployInstance?: (hardwareTier: string, name: string) => void;
}

export const CostOptimizerView: React.FC<CostOptimizerViewProps> = ({
  instances,
  onShowToast,
  onDeployInstance,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'H100' | 'A100' | 'L4' | '4090'>('ALL');
  const [autoInterruptionShield, setAutoInterruptionShield] = useState(true);
  const [autoSnapshotMinutes, setAutoSnapshotMinutes] = useState(10);
  const [autoSleepThresholdHours, setAutoSleepThresholdHours] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOffers = SPOT_OFFERS.filter((offer) => {
    if (selectedFilter === 'ALL') return true;
    return offer.gpuModel.toUpperCase().includes(selectedFilter);
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast('Spot Prices Updated', 'Synced live price ticks across 6 cloud providers', 'info');
    }, 600);
  };

  const handleDeploy = (offer: SpotOffer) => {
    onShowToast(
      'Provisioning Spot Cluster',
      `Launching ${offer.gpuModel} on ${offer.provider} @ $${offer.spotPrice}/hr`,
      'success'
    );
    onDeployInstance?.(offer.gpuModel, `spot-${offer.provider.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090c10] text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Multi-Region Cloud Cost Optimizer & Spot GPU Hunter
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                Live Pricing Matrix
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Arbitrage compute spot rates across RunPod, Lambda Labs, AWS, GCP & Hetzner with zero downtime shields
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync Live Ticks</span>
          </button>
        </div>
      </div>

      {/* ROI & Savings Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-black border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Monthly Spot Savings</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-mono">$1,482.40</div>
          <p className="text-[11px] text-slate-400">42% average reduction vs on-demand rates</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Cheapest H100 SXM5</span>
            <Flame className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">$2.19<span className="text-xs text-slate-400 font-normal">/hr</span></div>
          <p className="text-[11px] text-emerald-400">RunPod US-East (Virginia)</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Cheapest L4 24GB</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">$0.38<span className="text-xs text-slate-400 font-normal">/hr</span></div>
          <p className="text-[11px] text-emerald-400">GCP us-central1 (55% off)</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Interruption Protection</span>
            <Shield className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">ACTIVE</div>
          <p className="text-[11px] text-slate-400">Warm standby fallback enabled</p>
        </div>
      </div>

      {/* Interruption Shield Configuration Strip */}
      <div className="p-4 rounded-2xl bg-[#0d1117] border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              Spot Interruption & Auto-Snapshot Shield
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                Self-Healing
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              When a cloud provider reclaims a spot VM, DevDeck automatically restores memory state onto the next cheapest provider in &lt;45s.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoInterruptionShield}
              onChange={(e) => {
                setAutoInterruptionShield(e.target.checked);
                onShowToast(
                  e.target.checked ? 'Interruption Shield Enabled' : 'Interruption Shield Disabled',
                  'State snapshotting updated',
                  'info'
                );
              }}
              className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-slate-300 font-sans text-xs">Auto-failover to standby</span>
          </label>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Snapshot interval:</span>
            <select
              value={autoSnapshotMinutes}
              onChange={(e) => setAutoSnapshotMinutes(Number(e.target.value))}
              className="bg-black/50 border border-white/[0.1] text-white px-2 py-1 rounded text-xs outline-none"
            >
              <option value={5}>Every 5 min</option>
              <option value={10}>Every 10 min</option>
              <option value={30}>Every 30 min</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spot GPU Pricing Matrix */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Spot Hardware Arbitrage Engine
            </h2>
          </div>

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1.5">
            {(['ALL', 'H100', 'A100', 'L4', '4090'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                offer.isLowestPrice
                  ? 'bg-[#0f1420] border-emerald-500/40 shadow-lg'
                  : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{offer.gpuModel}</span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-500" />
                      {offer.provider} • {offer.region}
                    </span>
                  </div>
                  {offer.isLowestPrice && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      CHEAPEST
                    </span>
                  )}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">VRAM</span>
                    <span className="font-bold text-white">{offer.vram}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">vCPU</span>
                    <span className="font-bold text-white">{offer.vcpu} Cores</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">RAM</span>
                    <span className="font-bold text-white">{offer.ramGb} GB</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white font-mono">${offer.spotPrice.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-mono">/hr</span>
                      <span className="text-xs line-through text-slate-500 font-mono ml-1.5">
                        ${offer.onDemandPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Save {offer.savingsPct}% with Spot
                    </span>
                  </div>

                  <div className="text-right text-[11px] font-mono">
                    <span className="text-slate-500 block text-[10px]">Interruption Risk</span>
                    <span
                      className={`font-semibold ${
                        offer.interruptionRisk.includes('Low')
                          ? 'text-emerald-400'
                          : offer.interruptionRisk.includes('Medium')
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {offer.interruptionRisk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleDeploy(offer)}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  offer.isLowestPrice
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Spot Node</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Idle Instances Auto-Pause Watchdog */}
      <div className="border-t border-white/[0.08] pt-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Instances & Idle Watchdog
        </h2>
        <div className="space-y-2">
          {instances.map((inst) => (
            <div
              key={inst.id}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    inst.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inst.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({inst.hardware.tier})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Current rate: ${inst.costPerHour}/hr • Uptime: {inst.telemetry.uptime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Auto-sleep in {inst.autoStopMinutes}m if inactive
                </span>
                <button
                  onClick={() => onShowToast('Instance Hibernated', `${inst.name} paused to prevent spend`, 'info')}
                  className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Hibernate Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
