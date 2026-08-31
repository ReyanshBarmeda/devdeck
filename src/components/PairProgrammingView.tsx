import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Terminal,
  Share2,
  Lock,
  Unlock,
  Copy,
  Check,
  Send,
  MessageSquare,
  Shield,
  Zap,
  Play,
  UserPlus,
  Radio,
  ExternalLink,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  permission: 'read_write' | 'read_only';
  cursorColor: string;
  isHost?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  avatar: string;
}

export const PairProgrammingView: React.FC<{
  currentUser?: UserProfile | null;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}> = ({ currentUser, onShowToast }) => {
  const [sessionName, setSessionName] = useState('H100 Distributed Training Debug');
  const [roomCode] = useState('pair-88fa-9921');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSsh, setCopiedSsh] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'user-1',
      name: currentUser?.name || 'Reyansh (You)',
      avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      role: 'Staff AI Engineer',
      permission: 'read_write',
      cursorColor: '#38bdf8',
      isHost: true,
    },
    {
      id: 'user-2',
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      role: 'DevOps / SRE',
      permission: 'read_write',
      cursorColor: '#a855f7',
    },
    {
      id: 'user-3',
      name: 'Sarah Connor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      role: 'Security Auditor',
      permission: 'read_only',
      cursorColor: '#10b981',
    },
  ]);

  const [terminalLines, setTerminalLines] = useState<string[]>([
    'Connected to DevDeck Collaborative Terminal Gateway (v2026.1).',
    'Broadcasting session pair-88fa-9921 on 100.64.0.88:2222',
    'Alex Chen joined the session with [READ/WRITE] access.',
    'Sarah Connor joined the session with [READ ONLY] access.',
    '$ python3 -m torch.distributed.launch --nproc_per_node=8 train.py --batch_size=32',
    '[Alex Chen] [Rank 0] Checkpoint loaded from step 12000. Loss: 0.842',
    '[Reyansh] Investigating CUDA OOM on GPU #4 (allocated: 78.2GB/80GB)...',
    '$ nvidia-smi --query-gpu=index,memory.used,memory.total,temperature.gpu --format=csv',
    '0, 78200 MiB, 81920 MiB, 64 C',
    '1, 78180 MiB, 81920 MiB, 62 C',
    '2, 78210 MiB, 81920 MiB, 65 C',
    '3, 78190 MiB, 81920 MiB, 63 C',
    '$ export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True',
  ]);

  const [inputCommand, setInputCommand] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'Alex Chen',
      text: 'Hey! I noticed GPU #4 ran out of memory right after step 14,000. Let’s enable expandable_segments.',
      time: '09:42 AM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    },
    {
      id: 'msg-2',
      sender: currentUser?.name || 'Reyansh',
      text: 'Good catch. Just set the env variable in the session. Let’s run the evaluation batch.',
      time: '09:43 AM',
      avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    },
  ]);
  const [inputChat, setInputChat] = useState('');

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;

    setTerminalLines((prev) => [...prev, `$ ${inputCommand}`, `[Broadcasted to 3 active peers in session]`]);
    setInputCommand('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || 'Reyansh',
      text: inputChat,
      time: 'Just now',
      avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputChat('');
  };

  const togglePermission = (userId: string) => {
    setParticipants(
      participants.map((p) => {
        if (p.id === userId && !p.isHost) {
          const nextPerm = p.permission === 'read_write' ? 'read_only' : 'read_write';
          onShowToast('Permission Updated', `${p.name} is now ${nextPerm.replace('_', ' ').toUpperCase()}`, 'info');
          return { ...p, permission: nextPerm };
        }
        return p;
      })
    );
  };

  const pairUrl = `https://devdeck.live/pair/${roomCode}`;
  const sshCmd = `tmate -S /tmp/devdeck-pair.sock attach # or ssh pair@devdeck.live -p 2222`;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090c10] text-slate-100 p-6 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Collaborative Live Pair Programming & Remote Terminal (tmate)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                Live Pairing Active
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Multi-cursor synchronized terminal session with granular Read/Write controls and real-time voice/chat
            </p>
          </div>
        </div>

        {/* Invite & Share Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              navigator.clipboard.writeText(pairUrl);
              setCopiedLink(true);
              onShowToast('Copied Join Link', pairUrl, 'success');
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Join URL'}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(sshCmd);
              setCopiedSsh(true);
              onShowToast('Copied SSH Socket', sshCmd, 'info');
              setTimeout(() => setCopiedSsh(false), 2000);
            }}
            className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedSsh ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>Copy SSH Command</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Left: Synchronized Multi-Cursor Terminal (3 cols) */}
        <div className="lg:col-span-3 flex flex-col rounded-2xl bg-[#06080c] border border-white/[0.08] overflow-hidden shadow-2xl">
          {/* Terminal Titlebar */}
          <div className="px-4 py-3 bg-[#0d1017] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-mono text-xs text-slate-300 font-semibold">{sessionName}</span>
            </div>

            {/* Presence indicators */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Collaborating:</span>
              <div className="flex -space-x-1.5">
                {participants.map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={p.name}
                    title={`${p.name} (${p.permission.replace('_', ' ')})`}
                    className="w-5 h-5 rounded-full border-2 border-black object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto space-y-1 select-text">
            {terminalLines.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line.startsWith('$') ? (
                  <span className="text-cyan-400 font-bold">{line}</span>
                ) : line.includes('Alex Chen') ? (
                  <span className="text-blue-300">{line}</span>
                ) : line.includes('Reyansh') ? (
                  <span className="text-sky-300">{line}</span>
                ) : line.includes('Loss:') ? (
                  <span className="text-emerald-400">{line}</span>
                ) : (
                  <span className="text-slate-400">{line}</span>
                )}
              </div>
            ))}

            {/* Live multi-cursor simulation */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-cyan-400 font-bold">$</span>
              <span className="animate-pulse w-2 h-4 bg-sky-400 inline-block" title="Reyansh's Cursor" />
              <span className="text-[10px] font-mono px-1 bg-blue-500/30 text-blue-300 rounded border border-blue-500/40">
                Alex Chen typing...
              </span>
            </div>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendCommand} className="p-3 bg-[#0d1017] border-t border-white/[0.08] flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs font-bold pl-2">$</span>
            <input
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              placeholder="Type terminal command to broadcast to all collaborators..."
              className="flex-1 bg-transparent text-xs text-white font-mono outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Execute
            </button>
          </form>
        </div>

        {/* Right Panel: Participants & Chat (1 col) */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Participants */}
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Active Peers ({participants.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono">STUN P2P</span>
            </h2>

            <div className="space-y-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                      <span
                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black"
                        style={{ backgroundColor: p.cursorColor }}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePermission(p.id)}
                    disabled={p.isHost}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                      p.permission === 'read_write'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-zinc-800 text-zinc-400'
                    } ${p.isHost ? 'opacity-80 cursor-default' : 'cursor-pointer hover:opacity-100'}`}
                  >
                    {p.permission === 'read_write' ? 'READ/WRITE' : 'READ ONLY'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* In-Session Chat */}
          <div className="flex-1 flex flex-col p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Pair Debug Notes</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-slate-200">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-slate-300">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="pt-3 border-t border-white/[0.06] flex items-center gap-2 mt-2">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Send a note..."
                className="flex-1 bg-black/40 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
