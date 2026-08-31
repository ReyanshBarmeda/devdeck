import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  CreditCard,
  Building2,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Lock,
  Mail,
  UserPlus,
  Flame,
  Activity,
  ChevronDown,
  Clock,
  Zap,
} from 'lucide-react';
import {
  OrganizationWorkspace,
  TeamMember,
  CloudProviderConnector,
  AuditLogEntry,
  TeamRole,
} from '../types';

interface TeamWorkspaceViewProps {
  workspace: OrganizationWorkspace;
  members: TeamMember[];
  connectors: CloudProviderConnector[];
  auditLogs: AuditLogEntry[];
  onUpdateMemberRole: (memberId: string, newRole: TeamRole) => void;
  onUpdateMemberQuota: (memberId: string, newQuota: number) => void;
  onInviteMember: (name: string, email: string, role: TeamRole, quotaHours: number) => void;
  onSyncConnector: (connectorId: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const TeamWorkspaceView: React.FC<TeamWorkspaceViewProps> = ({
  workspace,
  members,
  connectors,
  auditLogs,
  onUpdateMemberRole,
  onUpdateMemberQuota,
  onInviteMember,
  onSyncConnector,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'connectors' | 'audit'>('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Fullstack Dev');
  const [inviteQuota, setInviteQuota] = useState(150);
  const [searchMember, setSearchMember] = useState('');

  const spendPercent = Math.min(100, Math.round((workspace.currentSpendUsd / workspace.monthlyBudgetUsd) * 100));

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    onInviteMember(inviteName, inviteEmail, inviteRole, inviteQuota);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    onShowToast('Invitation Sent', `Sent workspace invite to ${inviteEmail}`, 'success');
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.email.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.role.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Organization Header & Spend Budget Tracker */}
      <div className="bg-[#0a0d14] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-zinc-100 font-mono tracking-tight">
                  {workspace.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {workspace.plan}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Multi-Tenant RBAC Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Organization Slug: <strong>{workspace.slug}</strong> • Region: {workspace.defaultRegion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Team Member</span>
            </button>
          </div>
        </div>

        {/* Spend & Quota Banner */}
        <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Monthly GPU & Cloud Spend</span>
              <span className="text-zinc-200 font-bold">
                ${workspace.currentSpendUsd.toLocaleString()} / ${workspace.monthlyBudgetUsd.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  spendPercent > 85 ? 'bg-red-500' : spendPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${spendPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-zinc-500 text-right">{spendPercent}% of monthly cap used</div>
          </div>

          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Active GPU Nodes Pool</div>
              <div className="text-emerald-400 font-bold text-base mt-0.5">{workspace.gpuClustersCount} Instances</div>
            </div>
            <Flame className="w-6 h-6 text-blue-400/60" />
          </div>

          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Team Engineers & Staff</div>
              <div className="text-zinc-100 font-bold text-base mt-0.5">{members.length} Members</div>
            </div>
            <Users className="w-6 h-6 text-blue-400/60" />
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (Members / Cloud Connectors / Security Audit) */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Members & Roles ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('connectors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
            activeTab === 'connectors'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud Connectors & Keys ({connectors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* 3. Tab Content: Team Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full bg-[#0a0d14] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-zinc-500 text-[11px] font-mono">
              Role permissions strictly enforced on terminal SSH and compute creation.
            </div>
          </div>

          <div className="bg-[#0a0d14] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
                    <th className="py-3 px-4">Engineer / Member</th>
                    <th className="py-3 px-4">RBAC Role</th>
                    <th className="py-3 px-4">GPU Quota Usage</th>
                    <th className="py-3 px-4">Active Nodes</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                          />
                          <div>
                            <div className="font-semibold text-zinc-100">{member.name}</div>
                            <div className="text-[11px] text-zinc-500">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={member.role}
                          onChange={(e) => onUpdateMemberRole(member.id, e.target.value as TeamRole)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Owner">Owner</option>
                          <option value="Staff AI Engineer">Staff AI Engineer</option>
                          <option value="DevOps / SRE">DevOps / SRE</option>
                          <option value="Fullstack Dev">Fullstack Dev</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>{member.gpuHoursUsed}h used</span>
                            <span>{member.gpuQuotaHoursPerMonth}h limit</span>
                          </div>
                          <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, (member.gpuHoursUsed / member.gpuQuotaHoursPerMonth) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {member.activeInstancesCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {member.activeInstancesCount} running
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            const newCap = prompt(`Set new monthly GPU quota for ${member.name} (in hours):`, member.gpuQuotaHoursPerMonth.toString());
                            if (newCap && !isNaN(Number(newCap))) {
                              onUpdateMemberQuota(member.id, Number(newCap));
                              onShowToast('Quota Updated', `Updated quota for ${member.name} to ${newCap}h`, 'success');
                            }
                          }}
                          className="px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 cursor-pointer"
                        >
                          Edit Quota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab Content: Cloud Provider Connectors */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-400">
            Connect your cloud provider accounts to dynamically provision NVIDIA H100, L4, and RTX 4090 clusters across AWS, GCP, RunPod, and Lambda Labs.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map((conn) => (
              <div
                key={conn.id}
                className="bg-[#0a0d14] border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold font-mono text-xs">
                      {conn.provider.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-100 font-mono">{conn.name}</div>
                      <div className="text-[11px] text-zinc-500">{conn.accountOrProjectId}</div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>Quota:</span>
                    <span className="text-zinc-200">{conn.availableGpuQuota}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>Secret Key:</span>
                    <span className="text-zinc-500">{conn.maskedSecretKey}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>Synced:</span>
                    <span className="text-zinc-400">{conn.lastSyncedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {conn.activeNodes} Active Cluster Nodes
                  </span>
                  <button
                    onClick={() => onSyncConnector(conn.id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono rounded-lg border border-zinc-800 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3 text-blue-400" />
                    <span>Sync Quota</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tab Content: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-400 font-mono">
            Immutable SOC2 & ISO 27001 compliant audit log of all SSH attachments, container deploys, and secret decryption events.
          </div>

          <div className="bg-[#0a0d14] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Event Action</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Source IP</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 text-zinc-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-200">
                        {log.actorName} ({log.actorRole})
                      </td>
                      <td className="py-3 px-4 text-blue-400 font-bold">{log.action}</td>
                      <td className="py-3 px-4 text-zinc-400">{log.target}</td>
                      <td className="py-3 px-4 text-zinc-500">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0d14] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-zinc-100 font-mono text-sm">
                <UserPlus className="w-4 h-4 text-blue-400" />
                Invite Engineer to Workspace
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jordan@apex.ai"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Workspace RBAC Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Staff AI Engineer">Staff AI Engineer (GPU & Model deploy)</option>
                  <option value="DevOps / SRE">DevOps / SRE (Cluster & Ingress admin)</option>
                  <option value="Fullstack Dev">Fullstack Dev (Standard CDE)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Monthly GPU Quota (Hours)</label>
                <input
                  type="number"
                  value={inviteQuota}
                  onChange={(e) => setInviteQuota(Number(e.target.value))}
                  min={10}
                  max={1000}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md cursor-pointer hover:opacity-90"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
