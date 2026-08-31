import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Server,
  Cpu,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  X,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { OrganizationWorkspace } from '../types';

interface BillingUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: OrganizationWorkspace;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BillingUsageModal: React.FC<BillingUsageModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onShowToast,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [spendLimit, setSpendLimit] = useState(workspace.monthlyBudgetUsd || 500);

  if (!isOpen) return null;

  const usageMetrics = [
    {
      resource: 'NVIDIA H100 SXM5 80GB',
      hours: '142.5 hrs',
      rate: '$2.89/hr',
      total: '$411.82',
      pct: 68,
      color: 'bg-blue-500',
    },
    {
      resource: 'High-Frequency AMD EPYC Nodes',
      hours: '320.0 hrs',
      rate: '$0.38/hr',
      total: '$121.60',
      pct: 20,
      color: 'bg-sky-500',
    },
    {
      resource: 'NVMe Persistent Disk Volume (1.2TB)',
      hours: '720 hrs',
      rate: '$0.08/GB-mo',
      total: '$96.00',
      pct: 12,
      color: 'bg-emerald-500',
    },
  ];

  const invoices = [
    { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$629.42', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$548.10', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'INV-2026-06', date: 'Jun 01, 2026', amount: '$492.00', status: 'Paid', method: 'Visa •••• 4242' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-3xl bg-[#0d1017] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Enterprise Billing & Compute Quota
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {workspace.plan}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Organization: <strong className="text-slate-200">{workspace.name}</strong> • Real-time spend tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Usage Meter Card */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Current Billing Cycle (August 2026)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">
                    ${workspace.currentSpendUsd.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">of ${spendLimit} monthly budget limit</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Auto-sleep on budget threshold
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(workspace.currentSpendUsd / spendLimit) * 100 * 0.68}%` }}
                  title="GPU Spend"
                />
                <div
                  className="bg-sky-500 h-full transition-all"
                  style={{ width: `${(workspace.currentSpendUsd / spendLimit) * 100 * 0.2}%` }}
                  title="CPU Spend"
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(workspace.currentSpendUsd / spendLimit) * 100 * 0.12}%` }}
                  title="Storage Spend"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> GPU Compute (68%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> CPU Workspaces (20%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> NVMe Storage (12%)
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Compute & Hardware Breakdown
            </h3>
            <div className="space-y-2">
              {usageMetrics.map((item) => (
                <div
                  key={item.resource}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <div>
                      <span className="font-semibold text-slate-200">{item.resource}</span>
                      <span className="text-slate-400 block text-[11px] font-mono">
                        {item.hours} consumed @ {item.rate}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-white text-sm">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Plans */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Subscription Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'starter',
                  name: 'Starter Dev',
                  price: '$29',
                  period: '/seat/mo',
                  features: ['50 CPU CDE hrs', '1 Concurrent GPU instance', '100GB NVMe storage', 'Community Support'],
                },
                {
                  id: 'pro',
                  name: 'Pro CDE Team',
                  price: '$99',
                  period: '/seat/mo',
                  badge: 'Current Plan',
                  features: ['Unlimited CPU CDE', '4x H100 GPU Clusters', '1TB NVMe fast storage', 'Tailscale mesh peering'],
                },
                {
                  id: 'enterprise',
                  name: 'Enterprise Scale',
                  price: '$499',
                  period: '/cluster/mo',
                  features: ['Dedicated VPC / Cloud Connectors', 'Custom GPU Quota reservation', 'SOC2 / SAML SSO integration', '24/7 SLA Guarantee'],
                },
              ].map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id as any);
                    onShowToast('Selected Plan', `Switched view to ${plan.name}`, 'info');
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPlan === plan.id
                      ? 'bg-blue-950/30 border-blue-500/60 shadow-lg'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{plan.name}</span>
                      {plan.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-xl font-black text-white">{plan.price}</span>
                      <span className="text-[11px] text-slate-400">{plan.period}</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method & Invoices */}
          <div className="border-t border-white/[0.08] pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Invoices & Payment Method
              </h3>
              <button
                onClick={() => onShowToast('Receipts Downloaded', 'Exported 3 invoices as PDF bundle', 'success')}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export Receipts</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{inv.id}</span>
                    <span className="text-slate-500">{inv.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{inv.amount}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-black/40 border-t border-white/[0.08]">
          <span className="text-[11px] text-slate-400">
            Powered by Stripe Enterprise Billing & Cloud Spend Engine
          </span>
          <button
            onClick={() => {
              onShowToast('Plan Updated', `Saved quota settings for ${workspace.name}`, 'success');
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Save & Update Plan
          </button>
        </div>
      </motion.div>
    </div>
  );
};
