import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Laptop,
  Smartphone,
  Server,
  Tablet,
  Monitor,
  Wifi,
  QrCode,
  Terminal,
  Code2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Radio,
  Send,
  Battery,
  BatteryCharging,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  Play,
  RotateCw,
  X,
  Globe,
  KeyRound,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { RemoteDevice, DeviceType, ConnectionProtocol, P2PClipItem, ViewMode } from '../types';

interface RemoteDevicesViewProps {
  devices: RemoteDevice[];
  onUpdateDevice: (device: RemoteDevice) => void;
  onCreateDevice: (device: RemoteDevice) => void;
  onDeleteDevice: (deviceId: string) => void;
  onConnectSSH: (device: RemoteDevice) => void;
  onNavigate: (mode: ViewMode) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const RemoteDevicesView: React.FC<RemoteDevicesViewProps> = ({
  devices,
  onUpdateDevice,
  onCreateDevice,
  onDeleteDevice,
  onConnectSSH,
  onNavigate,
  onShowToast,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Modals & Panels
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [pairTab, setPairTab] = useState<'phone' | 'pc' | 'tailscale'>('phone');
  const [selectedDeviceForQr, setSelectedDeviceForQr] = useState<RemoteDevice | null>(null);
  const [selectedDeviceForSimulator, setSelectedDeviceForSimulator] = useState<RemoteDevice | null>(null);
  const [isClipboardDrawerOpen, setIsClipboardDrawerOpen] = useState(false);
  
  // P2P Quick Send State
  const [clipboardItems, setClipboardItems] = useState<P2PClipItem[]>([
    {
      id: 'clip-1',
      senderDeviceId: 'local-host',
      senderDeviceName: 'Current Console',
      targetDeviceId: 'all',
      contentType: 'url',
      content: window.location.href,
      timestamp: 'Just now',
    },
    {
      id: 'clip-2',
      senderDeviceId: 'dev-homelab-gpu',
      senderDeviceName: 'Homelab RTX 4090',
      targetDeviceId: 'dev-macbook-pro',
      contentType: 'env_snippet',
      content: 'OLLAMA_HOST=http://100.99.14.88:11434\nMODEL=deepseek-r1:70b-q4_K_M',
      timestamp: '15 mins ago',
    },
  ]);
  const [newClipContent, setNewClipContent] = useState('');
  const [targetDeviceForClip, setTargetDeviceForClip] = useState<string>('all');

  // New PC Manual Form State
  const [newPcForm, setNewPcForm] = useState({
    name: '',
    type: 'laptop' as DeviceType,
    os: 'macos' as 'macos' | 'windows' | 'linux',
    ipOrHost: '',
    sshPort: 22,
    sshUser: 'developer',
    modelName: '',
    protocol: 'tailscale' as ConnectionProtocol,
    tags: 'Workstation, Remote SSH',
  });

  // Simulator orientation & device frame state
  const [simulatorOrientation, setSimulatorOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [simulatorUrl, setSimulatorUrl] = useState<string>(window.location.origin);

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
    onShowToast('Copied to Clipboard', label || text, 'success');
  };

  const handleSendP2PClip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClipContent.trim()) return;

    const targetDev = devices.find((d) => d.id === targetDeviceForClip);
    const targetName = targetDev ? targetDev.name : 'All Connected Devices';

    const newClip: P2PClipItem = {
      id: `clip-${Date.now()}`,
      senderDeviceId: 'local-console',
      senderDeviceName: 'DevDeck Hub',
      targetDeviceId: targetDeviceForClip,
      contentType: newClipContent.startsWith('http') ? 'url' : 'text',
      content: newClipContent.trim(),
      timestamp: 'Just now',
    };

    setClipboardItems((prev) => [newClip, ...prev]);
    setNewClipContent('');
    onShowToast('Sent to ' + targetName, 'P2P clipboard packet delivered successfully.', 'success');
  };

  const handlePingDevice = (device: RemoteDevice) => {
    const randomLatency = Math.floor(Math.random() * 18) + 6;
    const updated: RemoteDevice = {
      ...device,
      latencyMs: randomLatency,
      lastActive: 'Pinged 1s ago',
    };
    onUpdateDevice(updated);
    onShowToast('Ping Acknowledged', `${device.name} responded in ${randomLatency}ms via ${device.protocol}`, 'info');
  };

  const handleSimulatePhonePairing = () => {
    const newPhone: RemoteDevice = {
      id: `dev-phone-${Date.now()}`,
      name: 'iPhone 17 (Live AirDrop Pair)',
      type: 'phone_ios',
      os: 'ios',
      status: 'online',
      ipOrHost: '192.168.1.199',
      localLanIp: '192.168.1.199',
      protocol: 'cloudflare_tunnel',
      batteryLevel: 98,
      isCharging: true,
      modelName: 'Apple iPhone (iOS 19 Developer Preview)',
      screenResolution: '1206 x 2622 (OLED 120Hz)',
      lastActive: 'Connected via QR Code',
      tunnelUrl: 'https://devdeck-live-handshake.trycloudflare.com',
      qrPairingCode: 'https://devdeck-live-handshake.trycloudflare.com',
      pinCode: '714-382',
      latencyMs: 14,
      tags: ['Paired via QR', 'Safari Live Mobile', 'Local Wi-Fi'],
      pairedAt: new Date().toISOString(),
      activeServices: [
        { name: 'DevDeck Mobile Client (:3000)', port: 3000, url: 'http://192.168.1.199:3000', type: 'dev_server', status: 'running' },
      ],
    };
    onCreateDevice(newPhone);
    setIsPairModalOpen(false);
    onShowToast('Phone Paired Successfully!', 'New smartphone connected to your DevDeck mesh network.', 'success');
  };

  const handleCreatePcDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPcForm.name || !newPcForm.ipOrHost) {
      onShowToast('Missing Fields', 'Please specify a device name and IP / Hostname.', 'warning');
      return;
    }

    const newDev: RemoteDevice = {
      id: `dev-pc-${Date.now()}`,
      name: newPcForm.name,
      type: newPcForm.type,
      os: newPcForm.os,
      status: 'online',
      ipOrHost: newPcForm.ipOrHost,
      localLanIp: newPcForm.ipOrHost,
      protocol: newPcForm.protocol,
      tailscaleIp: newPcForm.protocol === 'tailscale' ? newPcForm.ipOrHost : undefined,
      sshPort: newPcForm.sshPort,
      sshUser: newPcForm.sshUser,
      modelName: newPcForm.modelName || `${newPcForm.os.toUpperCase()} Workstation Node`,
      lastActive: 'Just paired',
      latencyMs: 16,
      tags: newPcForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      pairedAt: new Date().toISOString(),
      activeServices: [
        { name: 'SSH Secure Shell (:22)', port: newPcForm.sshPort, url: `ssh ${newPcForm.sshUser}@${newPcForm.ipOrHost}`, type: 'ssh', status: 'running' },
      ],
    };

    onCreateDevice(newDev);
    setIsPairModalOpen(false);
    setNewPcForm({
      name: '',
      type: 'laptop',
      os: 'macos',
      ipOrHost: '',
      sshPort: 22,
      sshUser: 'developer',
      modelName: '',
      protocol: 'tailscale',
      tags: 'Workstation, Remote SSH',
    });
    onShowToast('Workstation Enrolled', `Connected to ${newDev.name} via ${newDev.protocol}`, 'success');
  };

  // Filter devices
  const filteredDevices = devices.filter((d) => {
    if (filterType === 'pcs' && d.type !== 'laptop' && d.type !== 'desktop' && d.type !== 'server') return false;
    if (filterType === 'phones' && d.type !== 'phone_ios' && d.type !== 'phone_android') return false;
    if (filterType === 'tablets' && d.type !== 'tablet') return false;
    if (filterType === 'online' && d.status !== 'online') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.ipOrHost.toLowerCase().includes(q) ||
        d.modelName.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pcsCount = devices.filter((d) => d.type === 'laptop' || d.type === 'desktop' || d.type === 'server').length;
  const phonesCount = devices.filter((d) => d.type === 'phone_ios' || d.type === 'phone_android').length;
  const onlineCount = devices.filter((d) => d.status === 'online').length;

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
      case 'phone_ios':
      case 'phone_android':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Laptop className="w-5 h-5" />;
    }
  };

  const getOsBadgeColor = (os: string) => {
    switch (os) {
      case 'macos':
      case 'ios':
      case 'ipados':
        return 'bg-zinc-800 text-zinc-200 border-zinc-700';
      case 'windows':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'linux':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'android':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* 1. Header Banner & Actions */}
      <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 via-emerald-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
                Cross-Device Mesh & Mobile Bridge
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {onlineCount} / {devices.length} Devices Online
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Connected PCs, Workstations & Mobile Phones
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Seamlessly bridge your MacBook, Windows WSL2, Linux Homelab servers, iPhones, and Android devices.
              Scan QR codes to test live dev servers instantly on mobile, forward ports, or run remote SSH.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsClipboardDrawerOpen(!isClipboardDrawerOpen)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>P2P Clipboard & Push</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </button>

            <button
              onClick={() => {
                setPairTab('phone');
                setIsPairModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Connect Phone (QR)</span>
            </button>

            <button
              onClick={() => {
                setPairTab('pc');
                setIsPairModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Pair PC or Server</span>
            </button>
          </div>
        </div>

        {/* Mesh Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80 text-xs">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-zinc-100">{pcsCount}</div>
              <div className="text-zinc-500 text-[11px]">PCs & GPU Nodes</div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-zinc-100">{phonesCount}</div>
              <div className="text-zinc-500 text-[11px]">Mobile Phones (iOS & Android)</div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-zinc-100">Tailscale + Wi-Fi</div>
              <div className="text-zinc-500 text-[11px]">Zero-Config Tunneling</div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-emerald-400">12ms avg</div>
              <div className="text-zinc-500 text-[11px]">Mesh Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Universal P2P Clipboard Drawer (Expandable) */}
      <AnimatePresence>
        {isClipboardDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0e121a] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-zinc-100">Universal P2P Clipboard & Mobile Push</h3>
                <span className="text-[11px] text-zinc-500 font-mono">Sync text, URLs, and .env tokens to phone or PC</span>
              </div>
              <button
                onClick={() => setIsClipboardDrawerOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendP2PClip} className="flex flex-col sm:flex-row gap-2">
              <select
                value={targetDeviceForClip}
                onChange={(e) => setTargetDeviceForClip(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Broadcast to All Devices</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.os.toUpperCase()})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newClipContent}
                onChange={(e) => setNewClipContent(e.target.value)}
                placeholder="Paste URL, auth token, terminal command, or text to push..."
                className="flex-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Push Instantly</span>
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {clipboardItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                      {item.contentType}
                    </span>
                    <span className="text-zinc-500 text-[11px] font-mono shrink-0">
                      {item.senderDeviceName} →
                    </span>
                    <span className="text-zinc-200 font-mono truncate select-all">{item.content}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(item.content, 'Copied item')}
                      className="p-1 text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors"
                      title="Copy item"
                    >
                      {copiedText === item.content ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 border border-zinc-800 rounded-xl overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Devices', count: devices.length },
            { id: 'pcs', label: 'PCs & Servers', count: pcsCount },
            { id: 'phones', label: 'Mobile Phones', count: phonesCount },
            { id: 'tablets', label: 'Tablets', count: devices.filter((d) => d.type === 'tablet').length },
            { id: 'online', label: 'Online Only', count: onlineCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  filterType === tab.id ? 'bg-blue-700 text-blue-200' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, IP, or tag..."
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 4. Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevices.map((device) => {
          const isPhone = device.type === 'phone_ios' || device.type === 'phone_android';
          const isPc = device.type === 'laptop' || device.type === 'desktop' || device.type === 'server';

          return (
            <div
              key={device.id}
              className="bg-[#0e121a] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl group relative overflow-hidden"
            >
              {/* Top Row: Icon, Name & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                        isPhone
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}
                    >
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-blue-400 transition-colors">
                          {device.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-semibold ${getOsBadgeColor(device.os)}`}>
                          {device.os}
                        </span>
                        <span>•</span>
                        <span>{device.ipOrHost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {device.batteryLevel !== undefined && (
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                        title={`Battery: ${device.batteryLevel}% ${device.isCharging ? '(Charging)' : ''}`}
                      >
                        {device.isCharging ? (
                          <BatteryCharging className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Battery className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}

                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        device.status === 'online'
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                          : device.status === 'busy'
                          ? 'bg-amber-400'
                          : 'bg-zinc-600'
                      }`}
                      title={`Status: ${device.status}`}
                    />
                  </div>
                </div>

                {/* Device Hardware Model & Latency */}
                <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl mb-3 space-y-1.5 text-xs">
                  <div className="text-[11px] text-zinc-300 truncate font-medium flex items-center justify-between">
                    <span className="truncate">{device.modelName}</span>
                    {device.latencyMs && (
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">
                        {device.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Protocol: {device.protocol}</span>
                    <span>{device.lastActive}</span>
                  </div>
                </div>

                {/* Forwarded Services / Ports */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Forwarded Services & Ports
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {device.activeServices.map((svc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>:{svc.port}</span>
                        <span className="text-[10px] text-zinc-500 font-sans truncate max-w-[100px]">
                          {svc.name.split(' ')[0]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {device.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-900/60 text-zinc-400 border border-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                {/* Specific actions for Phones */}
                {isPhone && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedDeviceForQr(device)}
                      className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Test on Phone (QR)</span>
                    </button>

                    <button
                      onClick={() => setSelectedDeviceForSimulator(device)}
                      className="w-full py-1.5 px-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Frame</span>
                    </button>
                  </div>
                )}

                {/* Specific actions for PCs/Laptops/Servers */}
                {isPc && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onConnectSSH(device)}
                      className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SSH Terminal</span>
                    </button>

                    <a
                      href={`vscode://vscode-remote/ssh-remote+${device.sshUser || 'dev'}@${device.ipOrHost}`}
                      className="w-full py-1.5 px-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <Code2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>VS Code</span>
                    </a>
                  </div>
                )}

                {/* Utility toolbar */}
                <div className="flex items-center justify-between text-xs pt-1 text-zinc-500">
                  <button
                    onClick={() => handlePingDevice(device)}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    title="Ping Device"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ping</span>
                  </button>

                  <button
                    onClick={() => {
                      const cmd = `ssh ${device.sshUser || 'developer'}@${device.ipOrHost} -p ${device.sshPort || 22}`;
                      copyToClipboard(cmd, `SSH Command: ${cmd}`);
                    }}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer font-mono text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy SSH</span>
                  </button>

                  <button
                    onClick={() => onDeleteDevice(device.id)}
                    className="hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Unpair Device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Mobile QR Code Pairing & Live Testing Modal */}
      <AnimatePresence>
        {selectedDeviceForQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeviceForQr(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0e121a] border border-zinc-800 rounded-2xl shadow-2xl p-6 z-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100">
                      Scan to Test on {selectedDeviceForQr.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400">Point your smartphone camera to open live app</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDeviceForQr(null)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic QR Code Box */}
              <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-inner mx-auto max-w-[240px]">
                {/* SVG Visual QR representation */}
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none">
                  {/* Position detection markers */}
                  <rect x="5" y="5" width="30" height="30" fill="black" rx="4" />
                  <rect x="10" y="10" width="20" height="20" fill="white" rx="2" />
                  <rect x="14" y="14" width="12" height="12" fill="black" rx="1" />

                  <rect x="65" y="5" width="30" height="30" fill="black" rx="4" />
                  <rect x="70" y="10" width="20" height="20" fill="white" rx="2" />
                  <rect x="74" y="14" width="12" height="12" fill="black" rx="1" />

                  <rect x="5" y="65" width="30" height="30" fill="black" rx="4" />
                  <rect x="10" y="70" width="20" height="20" fill="white" rx="2" />
                  <rect x="14" y="74" width="12" height="12" fill="black" rx="1" />

                  {/* QR Data Matrix Patterns */}
                  <rect x="42" y="10" width="6" height="6" fill="black" />
                  <rect x="52" y="14" width="6" height="6" fill="black" />
                  <rect x="42" y="24" width="8" height="6" fill="black" />
                  <rect x="54" y="28" width="5" height="8" fill="black" />

                  <rect x="10" y="42" width="6" height="8" fill="black" />
                  <rect x="20" y="48" width="8" height="6" fill="black" />
                  <rect x="32" y="42" width="6" height="6" fill="black" />
                  <rect x="42" y="42" width="16" height="16" fill="#2563eb" rx="2" />
                  <rect x="47" y="47" width="6" height="6" fill="white" rx="1" />

                  <rect x="65" y="42" width="10" height="6" fill="black" />
                  <rect x="80" y="48" width="12" height="6" fill="black" />
                  <rect x="65" y="54" width="6" height="10" fill="black" />
                  <rect x="76" y="58" width="8" height="6" fill="black" />

                  <rect x="42" y="65" width="8" height="6" fill="black" />
                  <rect x="54" y="70" width="6" height="12" fill="black" />
                  <rect x="42" y="80" width="12" height="6" fill="black" />
                  <rect x="65" y="75" width="8" height="8" fill="black" />
                  <rect x="80" y="82" width="10" height="6" fill="black" />
                </svg>

                <div className="text-[10px] text-zinc-600 font-mono mt-2 font-semibold tracking-wider">
                  DEVDECK • {selectedDeviceForQr.os.toUpperCase()} BRIDGE
                </div>
              </div>

              {/* Endpoint URLs */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                  <div className="text-[10px] text-zinc-500 font-mono">Local Wi-Fi Tunnel URL:</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-200 truncate">
                      {window.location.origin}
                    </span>
                    <button
                      onClick={() => copyToClipboard(window.location.origin, 'Tunnel URL')}
                      className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Pairing PIN: <strong className="text-zinc-100 font-mono">{selectedDeviceForQr.pinCode || '492-108'}</strong></span>
                  <span className="text-emerald-400 font-mono text-[11px]">Auto-Reload: Enabled</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Live Mobile Frame Viewport Simulator Modal */}
      <AnimatePresence>
        {selectedDeviceForSimulator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeviceForSimulator(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-4xl bg-[#090b10] border border-zinc-800 rounded-3xl shadow-2xl p-6 z-10 flex flex-col items-center max-h-[92vh] overflow-y-auto"
            >
              {/* Simulator Header */}
              <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100">
                      Live Device Frame — {selectedDeviceForSimulator.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {selectedDeviceForSimulator.screenResolution} • {selectedDeviceForSimulator.modelName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSimulatorOrientation(simulatorOrientation === 'portrait' ? 'landscape' : 'portrait')
                    }
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="capitalize">{simulatorOrientation}</span>
                  </button>

                  <button
                    onClick={() => setSelectedDeviceForSimulator(null)}
                    className="text-zinc-500 hover:text-zinc-300 p-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Phone Mockup Frame */}
              <div
                className={`relative bg-zinc-950 border-[6px] border-zinc-800 rounded-[44px] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                  simulatorOrientation === 'portrait'
                    ? 'w-[360px] h-[680px]'
                    : 'w-[680px] h-[360px]'
                }`}
              >
                {/* Dynamic Island / Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 mr-2" />
                  <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                </div>

                {/* Mobile Screen Iframe Content */}
                <div className="w-full h-full pt-7 bg-[#0a0d13] overflow-hidden flex flex-col">
                  {/* Mock Mobile Browser Bar */}
                  <div className="px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate flex-1 text-center bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                      {window.location.host}
                    </span>
                    <RefreshCw className="w-3 h-3 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
                  </div>

                  {/* Frame Render Preview */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-zinc-200">
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-blue-400 font-mono uppercase font-semibold">DevDeck Mobile Bridge</div>
                      <div className="text-xs font-bold text-zinc-100">Live Client Connection Active</div>
                      <div className="text-[11px] text-zinc-400">
                        Synchronized with {selectedDeviceForSimulator.name} over {selectedDeviceForSimulator.protocol}.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <div className="text-[10px] text-zinc-500 font-mono">LAN IP</div>
                        <div className="font-mono text-zinc-200 text-[11px] font-semibold">{selectedDeviceForSimulator.ipOrHost}</div>
                      </div>
                      <div className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <div className="text-[10px] text-zinc-500 font-mono">LATENCY</div>
                        <div className="font-mono text-emerald-400 text-[11px] font-semibold">{selectedDeviceForSimulator.latencyMs || 12}ms</div>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1 text-[11px] text-zinc-400">
                      <div className="font-semibold text-zinc-300">Active Test Endpoints:</div>
                      <div className="font-mono text-blue-400">• http://localhost:3000 (React Applet)</div>
                      <div className="font-mono text-emerald-400">• exp://192.168.1.104:8081 (Metro Expo)</div>
                    </div>
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-700 rounded-full z-20" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Pair New Device / Phone Wizard Modal */}
      <AnimatePresence>
        {isPairModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPairModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#0e121a] border border-zinc-800 rounded-2xl shadow-2xl p-6 z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-100">Pair New Device to DevDeck Mesh</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Connect other computers, Linux servers, iPhones, and Android smartphones
                  </p>
                </div>
                <button
                  onClick={() => setIsPairModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wizard Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                <button
                  onClick={() => setPairTab('phone')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    pairTab === 'phone'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Connect Phone (iOS/Android)</span>
                </button>

                <button
                  onClick={() => setPairTab('pc')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    pairTab === 'pc'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Connect PC / Workstation</span>
                </button>

                <button
                  onClick={() => setPairTab('tailscale')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    pairTab === 'tailscale'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Tailscale Mesh</span>
                </button>
              </div>

              {/* Tab 1: Connect Phone (Instant QR) */}
              {pairTab === 'phone' && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Step 1: Scan QR Code with Phone Camera</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center max-w-[180px] mx-auto">
                      <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                        <rect x="5" y="5" width="30" height="30" fill="black" rx="4" />
                        <rect x="10" y="10" width="20" height="20" fill="white" rx="2" />
                        <rect x="14" y="14" width="12" height="12" fill="black" rx="1" />

                        <rect x="65" y="5" width="30" height="30" fill="black" rx="4" />
                        <rect x="70" y="10" width="20" height="20" fill="white" rx="2" />
                        <rect x="74" y="14" width="12" height="12" fill="black" rx="1" />

                        <rect x="5" y="65" width="30" height="30" fill="black" rx="4" />
                        <rect x="10" y="70" width="20" height="20" fill="white" rx="2" />
                        <rect x="14" y="74" width="12" height="12" fill="black" rx="1" />

                        <rect x="42" y="10" width="6" height="6" fill="black" />
                        <rect x="52" y="14" width="6" height="6" fill="black" />
                        <rect x="42" y="42" width="16" height="16" fill="#10b981" rx="2" />
                        <rect x="65" y="42" width="10" height="6" fill="black" />
                        <rect x="42" y="65" width="8" height="6" fill="black" />
                      </svg>
                      <span className="text-[10px] text-zinc-600 font-mono mt-1 font-bold">PAIR CODE: 714-382</span>
                    </div>

                    <p className="text-xs text-zinc-400 text-center">
                      No app install required. Works on iOS Safari, Chrome for Android, and Expo Go.
                    </p>
                  </div>

                  <button
                    onClick={handleSimulatePhonePairing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Phone Scan & Auto-Enroll</span>
                  </button>
                </div>
              )}

              {/* Tab 2: Connect PC / Workstation */}
              {pairTab === 'pc' && (
                <div className="space-y-4">
                  {/* 1-Line Script */}
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                    <div className="text-[11px] font-semibold text-zinc-300">
                      Option A: 1-Line Setup Script (Mac / Linux / WSL2)
                    </div>
                    <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-xs font-mono text-emerald-400">
                      <span className="truncate">curl -fsSL https://get.devdeck.dev/connect.sh | bash</span>
                      <button
                        onClick={() =>
                          copyToClipboard('curl -fsSL https://get.devdeck.dev/connect.sh | bash', 'Install Command')
                        }
                        className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0 ml-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Manual Form */}
                  <form onSubmit={handleCreatePcDevice} className="space-y-3">
                    <div className="text-[11px] font-semibold text-zinc-300">Option B: Manual Enrollment</div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Device Name</label>
                        <input
                          type="text"
                          value={newPcForm.name}
                          onChange={(e) => setNewPcForm({ ...newPcForm, name: e.target.value })}
                          placeholder="e.g. MacBook Pro 14 M3"
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Operating System</label>
                        <select
                          value={newPcForm.os}
                          onChange={(e) => setNewPcForm({ ...newPcForm, os: e.target.value as any })}
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                        >
                          <option value="macos">macOS Sequoia / Sonoma</option>
                          <option value="linux">Linux (Ubuntu / Debian / Arch)</option>
                          <option value="windows">Windows 11 (WSL2)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-[11px] text-zinc-400 font-medium">IP / Tailscale / Hostname</label>
                        <input
                          type="text"
                          value={newPcForm.ipOrHost}
                          onChange={(e) => setNewPcForm({ ...newPcForm, ipOrHost: e.target.value })}
                          placeholder="100.84.192.12 or 192.168.1.50"
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">SSH Port</label>
                        <input
                          type="number"
                          value={newPcForm.sshPort}
                          onChange={(e) => setNewPcForm({ ...newPcForm, sshPort: parseInt(e.target.value) || 22 })}
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 font-medium">Hardware Model / Description</label>
                      <input
                        type="text"
                        value={newPcForm.modelName}
                        onChange={(e) => setNewPcForm({ ...newPcForm, modelName: e.target.value })}
                        placeholder="e.g. Apple M3 Max • 64GB RAM"
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-blue-600/20 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save & Enroll Workstation</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Tailscale Mesh */}
              {pairTab === 'tailscale' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-blue-300">
                      <Wifi className="w-4 h-4" />
                      <span>Tailscale Zero-Config Mesh Active</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      DevDeck automatically recognizes machines on your Tailscale tailnet (<code className="font-mono text-blue-300">100.x.y.z</code>).
                      Secure WireGuard-encrypted peer-to-peer tunnels bypass firewalls without port forwarding.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-zinc-300">Discovered Tailscale Nodes:</div>
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-zinc-200">macbook-pro.tailnet</span>
                        <span className="font-mono text-[10px] text-zinc-500">100.84.192.12</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Enrolled</span>
                    </div>

                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-zinc-200">homelab-gpu-4090.tailnet</span>
                        <span className="font-mono text-[10px] text-zinc-500">100.99.14.88</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Enrolled</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
