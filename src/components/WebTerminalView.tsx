import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Copy,
  Check,
  RotateCw,
  Maximize2,
  Minimize2,
  Trash2,
  Flame,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Zap,
  Download,
  Plus,
  X,
  Columns,
  Search,
  Key,
  Shield,
  Activity,
  ArrowRight,
  Radio,
  CornerDownLeft,
  ChevronRight,
  Split,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { CloudInstance } from '../types';

interface WebTerminalViewProps {
  instances: CloudInstance[];
  activeInstance?: CloudInstance | null;
  onSelectInstance?: (instance: CloudInstance) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

interface TerminalTab {
  id: string;
  title: string;
  type: 'shell' | 'nvtop' | 'logs' | 'ollama';
  os: 'linux' | 'windows' | 'freebsd' | 'iso_live' | 'macos' | 'bsd';
  lines: string[];
  history: string[];
  historyIndex: number;
  cwd: string;
  isRunning: boolean;
}

export const WebTerminalView: React.FC<WebTerminalViewProps> = ({
  instances,
  activeInstance,
  onSelectInstance,
  onShowToast,
}) => {
  // Select active instance
  const currentInstance = activeInstance || instances[0] || {
    id: 'inst-default',
    name: 'brev-h100-primary',
    slug: 'brev-h100-primary',
    type: 'gpu',
    hardware: { tier: 'NVIDIA H100 SXM5 (80GB VRAM)', vcpu: 16, ramGb: 120, diskGb: 1000, gpuModel: 'NVIDIA H100 80GB SXM5' },
    status: 'running',
    ip: '34.120.48.192',
    region: 'us-central1 (GCP Tier 1)',
    sshCommand: 'ssh brev@34.120.48.192 -p 22',
    vscodeWebUrl: 'http://localhost:3000',
    vscodeDesktopUrl: 'vscode://vscode-remote/ssh-remote+brev@34.120.48.192',
    cursorUrl: 'cursor://vscode-remote/ssh-remote+brev@34.120.48.192',
    gitRepoUrl: 'https://github.com/developer/neuralpulse',
    gitBranch: 'main',
    ports: [],
    telemetry: { cpuPct: 24, ramPct: 48, gpuPct: 78, diskPct: 35, uptime: '4d 12h', temperatureC: 44, powerWatts: 245 },
    autoStopMinutes: 60,
    costPerHour: 2.89,
    createdAt: new Date().toISOString(),
  };

  // Terminal Tabs Management with Multi-OS Support
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'Linux (Ubuntu 24.04)',
      type: 'shell',
      os: 'linux',
      lines: [
        `\x1b[36m⚡ OpenSSH 9.6p1 connected to ${currentInstance.name} (${currentInstance.ip || '34.120.48.192'})\x1b[0m`,
        `Environment: \x1b[33mLinux Ubuntu 24.04.1 LTS (Kernel 6.8.0-40-generic x86_64)\x1b[0m`,
        `Hardware: \x1b[35m${currentInstance.hardware.tier}\x1b[0m | CUDA 12.4 • PyTorch 2.4.0 • Docker 27.1`,
        `Authenticated via ed25519-sha2-nistp256 • Shell: /bin/bash • PTY: /dev/pts/2`,
        `Type \x1b[32m'help'\x1b[0m, \x1b[32m'neofetch'\x1b[0m, or toggle OS environments (Linux, macOS, BSD) below.`,
        `-----------------------------------------------------------------------------------------`,
      ],
      history: [],
      historyIndex: -1,
      cwd: '~/workspace',
      isRunning: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputCommand, setInputCommand] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [fontSize, setFontSize] = useState<number>(12); // in px

  // In-memory Virtual Filesystem for terminal session
  const [virtualFs, setVirtualFs] = useState<Record<string, string[]>>({
    '~/workspace': [
      'train_lora.py',
      'test_cuda.py',
      'inference_api.py',
      'package.json',
      '.env',
      'README.md',
      'data/',
      'models/',
      'src/',
    ],
    '~/Developer/workspace': [
      'Package.swift',
      'App.swift',
      'MetalInference.metal',
      'train_mps.py',
      'Brewfile',
      'README.md',
    ],
    '/usr/home/brev': [
      'zfs_snapshot_mgr.sh',
      'jail_config.conf',
      'pf.conf',
      'nginx.conf',
      'build_cluster.c',
      'Makefile',
    ],
    'C:\\DevDeck\\workspace': [
      'launch_wsl2_gpu.ps1',
      'docker-compose.windows.yml',
      'app_service.cs',
      'NuGet.config',
      'DirectML_Benchmark.py',
      'README.md',
    ],
    '/root/live-cde': [
      'setup-alpine.sh',
      'ramdisk_init.sh',
      'wireguard_up.sh',
      'devdeck_agent.bin',
      'motd.txt',
    ],
  });

  const [virtualFilesContent] = useState<Record<string, string>>({
    'train_lora.py': `# LoRA Fine-Tuning Script for PyTorch 2.4 + CUDA 12.4\nimport torch\nprint("Allocating 80GB VRAM Tensor...")\nprint("Target: Llama-3.3-70B-Instruct QLoRA fine-tuning initialized.")`,
    'test_cuda.py': `import torch\nprint(f"CUDA Available: {torch.cuda.is_available()}")\nprint(f"Device: {torch.cuda.get_device_name(0)}")`,
    'package.json': `{\n  "name": "devdeck-cde-instance",\n  "version": "2.4.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  }\n}`,
    '.env': `CUDA_VISIBLE_DEVICES=0\nHF_TOKEN=hf_enterprise_mock_key_9281\nOLLAMA_HOST=http://127.0.0.1:11434`,
    'README.md': `# DevDeck Cloud CDE\nInstant GPU development environments with Linux, Windows WSL2, FreeBSD & Live ISO terminal gateway.`,
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const currentOs = activeTab.os || 'linux';

  // Helper function to switch OS of current tab
  const setTabOs = (tabId: string, os: 'linux' | 'windows' | 'freebsd' | 'iso_live' | 'macos' | 'bsd') => {
    const osTitles: Record<string, string> = {
      linux: 'Linux (Ubuntu 24.04)',
      windows: 'Windows (PowerShell 7.4 / WSL2)',
      freebsd: 'FreeBSD (14.1-RELEASE)',
      bsd: 'FreeBSD (14.1-RELEASE)',
      iso_live: 'Live ISO (Alpine RAM Disk CDE)',
      macos: 'macOS (Darwin Sequoia 15.0)',
    };
    const osWelcomes: Record<string, string[]> = {
      linux: [
        `\x1b[36m⚡ Switched environment to Linux Ubuntu 24.04 LTS (x86_64)\x1b[0m`,
        `Kernel: \x1b[33mLinux 6.8.0-40-generic\x1b[0m • Shell: \x1b[32m/bin/bash\x1b[0m • Package Manager: \x1b[35mapt / pnpm\x1b[0m`,
        `Try: \x1b[32mneofetch\x1b[0m, \x1b[32mnvidia-smi\x1b[0m, \x1b[32mapt list\x1b[0m, \x1b[32mdocker ps\x1b[0m, \x1b[32mcat /etc/os-release\x1b[0m`,
        `-----------------------------------------------------------------------------------------`,
      ],
      windows: [
        `\x1b[36m⚡ Switched environment to Microsoft Windows 11 Enterprise (PowerShell 7.4 Core)\x1b[0m`,
        `Host: \x1b[33mWindows NT 10.0.26100 (WSL2 Mirrored Mode & DirectML GPU)\x1b[0m • Shell: \x1b[32mpwsh.exe\x1b[0m`,
        `Virtualization: \x1b[35mHyper-V Isolated + WSLg GUI Wayland Forwarding\x1b[0m`,
        `Try: \x1b[32mGet-Process\x1b[0m, \x1b[32mwsl -l -v\x1b[0m, \x1b[32mGet-Service\x1b[0m, \x1b[32mwinget list\x1b[0m, \x1b[32mipconfig\x1b[0m, \x1b[32mneofetch\x1b[0m`,
        `-----------------------------------------------------------------------------------------`,
      ],
      freebsd: [
        `\x1b[36m⚡ Switched environment to FreeBSD 14.1-RELEASE-p3 (GENERIC amd64)\x1b[0m`,
        `Kernel: \x1b[33mFreeBSD 14.1-RELEASE #0\x1b[0m • Shell: \x1b[32m/bin/tcsh / /bin/sh\x1b[0m • Jails & ZFS Active`,
        `Security: \x1b[35mCapsicum Sandboxing + MAC (Mandatory Access Control)\x1b[0m`,
        `Try: \x1b[32mneofetch\x1b[0m, \x1b[32mpkg info\x1b[0m, \x1b[32mzpool status\x1b[0m, \x1b[32mjls (Jails)\x1b[0m, \x1b[32msysctl hw.model\x1b[0m`,
        `-----------------------------------------------------------------------------------------`,
      ],
      bsd: [
        `\x1b[36m⚡ Switched environment to FreeBSD 14.1-RELEASE-p3 (GENERIC amd64)\x1b[0m`,
        `Kernel: \x1b[33mFreeBSD 14.1-RELEASE #0\x1b[0m • Shell: \x1b[32m/bin/tcsh / /bin/sh\x1b[0m • Jails & ZFS Active`,
        `Security: \x1b[35mCapsicum Sandboxing + MAC (Mandatory Access Control)\x1b[0m`,
        `Try: \x1b[32mneofetch\x1b[0m, \x1b[32mpkg info\x1b[0m, \x1b[32mzpool status\x1b[0m, \x1b[32mjls (Jails)\x1b[0m, \x1b[32msysctl hw.model\x1b[0m`,
        `-----------------------------------------------------------------------------------------`,
      ],
      iso_live: [
        `\x1b[36m⚡ Switched environment to DevDeck Live ISO CDE (Alpine 3.20 RAM Disk)\x1b[0m`,
        `Boot Mode: \x1b[33mUEFI Direct RAM Execution (tmpfs /dev/shm 100% Volatile)\x1b[0m`,
        `Services: \x1b[35mOpenRC • Dropbear SSH • WireGuard in-kernel • VS Code Server\x1b[0m`,
        `Try: \x1b[32mramdisk\x1b[0m, \x1b[32mapk info\x1b[0m, \x1b[32mwg show\x1b[0m, \x1b[32mdmesg\x1b[0m, \x1b[32msetup-alpine\x1b[0m, \x1b[32mneofetch\x1b[0m`,
        `-----------------------------------------------------------------------------------------`,
      ],
      macos: [
        `\x1b[36m⚡ Switched environment to Apple Darwin macOS (Sequoia 15.0 / arm64 Apple Silicon)\x1b[0m`,
        `Kernel: \x1b[33mDarwin 24.0.0 Darwin Kernel Version 24.0.0: arm64\x1b[0m • Shell: \x1b[32m/bin/zsh\x1b[0m`,
        `Hardware: \x1b[35mApple M3 Max (16 CPU / 40 GPU / 128GB Unified RAM)\x1b[0m • Metal 3 Accelerate`,
        `Try: \x1b[32mneofetch\x1b[0m, \x1b[32mbrew status\x1b[0m, \x1b[32msw_vers\x1b[0m, \x1b[32msysctl machdep.cpu\x1b[0m, \x1b[32mdefaults read\x1b[0m`,
        `-----------------------------------------------------------------------------------------`,
      ],
    };

    const targetTitle = osTitles[os] || osTitles.linux;
    const targetWelcome = osWelcomes[os] || osWelcomes.linux;

    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              os,
              title: targetTitle,
              cwd:
                os === 'windows'
                  ? 'C:\\DevDeck\\workspace'
                  : os === 'freebsd' || os === 'bsd'
                  ? '/usr/home/brev'
                  : os === 'iso_live'
                  ? '/root/live-cde'
                  : os === 'macos'
                  ? '~/Developer/workspace'
                  : '~/workspace',
              lines: [...t.lines, ...targetWelcome],
            }
          : t
      )
    );
    onShowToast(`Environment: ${os.toUpperCase()}`, `Switched terminal tab to ${targetTitle}`, 'success');
  };

  // Sync instance changes to terminal output
  const prevInstanceIdRef = useRef<string>(currentInstance.id);
  useEffect(() => {
    if (prevInstanceIdRef.current !== currentInstance.id) {
      prevInstanceIdRef.current = currentInstance.id;
      appendLines(activeTabId, [
        `\x1b[36m⚡ SSH target switched to ${currentInstance.name} (${currentInstance.ip || '34.120.48.192'})\x1b[0m`,
        `Hardware: \x1b[35m${currentInstance.hardware.tier}\x1b[0m | Status: \x1b[32m${currentInstance.status}\x1b[0m`,
      ]);
    }
  }, [currentInstance.id, activeTabId]);

  // Auto-scroll on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.lines]);

  // Keep input focused
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Convert ANSI escape codes to styled HTML with Tailwind
  const renderAnsiLine = (line: string) => {
    if (!line.includes('\x1b[')) {
      return <span>{line}</span>;
    }

    const html = line
      .replace(/\x1b\[36m/g, '<span class="text-cyan-400">')
      .replace(/\x1b\[35m/g, '<span class="text-blue-400 font-semibold">')
      .replace(/\x1b\[33m/g, '<span class="text-amber-400">')
      .replace(/\x1b\[32m/g, '<span class="text-emerald-400 font-bold">')
      .replace(/\x1b\[31m/g, '<span class="text-red-400 font-semibold">')
      .replace(/\x1b\[34m/g, '<span class="text-blue-400">')
      .replace(/\x1b\[1;32m/g, '<span class="text-emerald-300 font-bold">')
      .replace(/\x1b\[1;33m/g, '<span class="text-amber-300 font-bold">')
      .replace(/\x1b\[1;36m/g, '<span class="text-cyan-300 font-bold">')
      .replace(/\x1b\[1m/g, '<span class="text-zinc-100 font-bold">')
      .replace(/\x1b\[90m/g, '<span class="text-zinc-500">')
      .replace(/\x1b\[0m/g, '</span>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Helper to add lines to active tab
  const appendLines = (tabId: string, newLines: string[]) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              lines: [...tab.lines, ...newLines],
            }
          : tab
      )
    );
  };

  // Autocomplete command on Tab key press
  const handleTabAutoComplete = () => {
    const commonCommands = [
      'nvidia-smi',
      'nvtop',
      'python test_cuda.py',
      'python train_lora.py',
      'docker ps',
      'docker compose up',
      'ollama run deepseek-r1',
      'ollama list',
      'pnpm dev',
      'pnpm install',
      'git status',
      'git log',
      'git branch',
      'brev status',
      'brev list',
      'cat .env',
      'cat package.json',
      'cat README.md',
      'tailscale status',
      'htop',
      'free -h',
      'df -h',
      'uptime',
      'clear',
      'help',
    ];

    const match = commonCommands.find((c) => c.startsWith(inputCommand.toLowerCase().trim()));
    if (match) {
      setInputCommand(match);
    }
  };

  // Comprehensive Command Execution Engine
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const currentCwd = activeTab.cwd || '~/workspace';
    const userPromptLine = `\x1b[32mbrev@${currentInstance.name || 'node'}\x1b[0m:\x1b[34m${currentCwd}\x1b[0m$ ${trimmed}`;

    // Handle "clear"
    if (trimmed.toLowerCase() === 'clear') {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                lines: [],
                history: [...tab.history, trimmed],
                historyIndex: -1,
              }
            : tab
        )
      );
      setInputCommand('');
      return;
    }

    // Append prompt line
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              lines: [...tab.lines, userPromptLine],
              history: [...tab.history, trimmed],
              historyIndex: -1,
              isRunning: true,
            }
          : tab
      )
    );
    setInputCommand('');

    const targetTabId = activeTabId;

    // Simulation delays for realistic server response
    setTimeout(() => {
      let output: string[] = [];
      const parts = trimmed.split(' ');
      const mainCmd = parts[0].toLowerCase();
      const arg1 = parts[1];
      const arg2 = parts[2];

      switch (mainCmd) {
        case 'help':
          output = [
            `\x1b[1mAvailable Enterprise CLI Commands & Tools:\x1b[0m`,
            `  \x1b[32mnvidia-smi\x1b[0m             - Official NVIDIA System Management Interface table`,
            `  \x1b[32mnvtop\x1b[0m                  - Live GPU load, compute processes & VRAM telemetry`,
            `  \x1b[32mpython test_cuda.py\x1b[0m    - Validate PyTorch 2.4 + CUDA 12.4 tensor acceleration`,
            `  \x1b[32mpython train_lora.py\x1b[0m   - Execute LoRA fine-tuning script on 80GB VRAM`,
            `  \x1b[32mollama run <model>\x1b[0m     - Query local LLM (e.g. deepseek-r1, llama3.3, qwen2.5)`,
            `  \x1b[32mollama list\x1b[0m            - List cached quantized model weights in VRAM`,
            `  \x1b[32mdocker ps\x1b[0m               - List active microservices & inference containers`,
            `  \x1b[32mdocker compose up\x1b[0m       - Spin up Redis, PostgreSQL & vLLM stack`,
            `  \x1b[32mpnpm dev\x1b[0m                - Launch Vite / Next.js web application on port 3000`,
            `  \x1b[32mpnpm install\x1b[0m            - Install node dependencies`,
            `  \x1b[32mgit status\x1b[0m              - Inspect git branch and uncommitted files`,
            `  \x1b[32mgit log\x1b[0m                 - View recent commit tree`,
            `  \x1b[32mbrev status\x1b[0m             - Brev.dev cloud instance lifecycle & spend analytics`,
            `  \x1b[32mtailscale status\x1b[0m        - Inspect WireGuard mesh network & connected peers`,
            `  \x1b[32mpwd / ls / cd / cat\x1b[0m     - Interactive Unix directory & file inspection`,
            `  \x1b[32mcurl <url>\x1b[0m              - HTTP test endpoint & response headers`,
            `  \x1b[32mfree -h / df -h / htop\x1b[0m  - Memory, disk & CPU core metrics`,
            `  \x1b[32mclear\x1b[0m                   - Clear terminal buffer`,
          ];
          break;

        case 'nvidia-smi':
        case 'nvtop': {
          const isGpu = currentInstance.type === 'gpu';
          const gpuName = currentInstance.hardware.gpuModel || (isGpu ? 'NVIDIA H100 80GB SXM5' : 'NVIDIA RTX 4090 24GB');
          const vramTotal = isGpu ? '81920MiB' : '24576MiB';
          const vramUsed = isGpu ? '58340MiB' : '14200MiB';
          const gpuUtil = isGpu ? '76%' : '45%';
          const power = isGpu ? '340W / 700W' : '210W / 450W';
          const temp = isGpu ? '44C' : '52C';

          output = [
            `+-----------------------------------------------------------------------------------------+`,
            `| NVIDIA-SMI 550.54.14              Driver Version: 550.54.14      CUDA Version: 12.4     |`,
            `|-----------------------------------------+------------------------+----------------------+`,
            `| GPU  Name                  Persistence-M| Bus-Id          Disp.A | Volatile Uncorr. ECC |`,
            `| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |`,
            `|=========================================+========================+======================|`,
            `|   0  ${gpuName.padEnd(28)} On | 00000000:00:04.0   Off |                    0 |`,
            `| N/A   ${temp}    P0              ${power.padEnd(11)} |  ${vramUsed} / ${vramTotal} |     ${gpuUtil}      Default |`,
            `+-----------------------------------------+------------------------+----------------------+`,
            `| Processes:                                                                              |`,
            `|  GPU   GI   CI        PID   Type   Process name                              GPU Memory |`,
            `|=========================================================================================|`,
            `|    0   N/A  N/A      4192      C   python3 /workspace/train_lora.py            48200MiB |`,
            `|    0   N/A  N/A      5820      C   triton_inference_server                      6200MiB |`,
            `|    0   N/A  N/A      6410      C   ollama_llama_runner                          3940MiB |`,
            `+-----------------------------------------------------------------------------------------+`,
          ];
          break;
        }

        case 'python':
        case 'python3':
          if (trimmed.includes('test_cuda.py') || trimmed.includes('torch.cuda')) {
            output = [
              `\x1b[36m[PyTorch 2.4.0+cu124]\x1b[0m Initializing CUDA tensor runtime...`,
              `CUDA Available: \x1b[1;32mTrue\x1b[0m`,
              `CUDA Device Count: 1`,
              `Primary Device [0]: \x1b[35m${currentInstance.hardware.gpuModel || 'NVIDIA H100 80GB SXM5'}\x1b[0m`,
              `Compute Capability: \x1b[33m9.0 (Hopper Architecture)\x1b[0m`,
              `Allocated VRAM: 58.34 GB / 80.00 GB (Peak: 72.10 GB)`,
              `Tensor Core GEMM Benchmark: \x1b[32m1,980 TFLOPS (FP8 / BF16 Native)\x1b[0m`,
              `FlashAttention-3: \x1b[32mEnabled (Hopper TMA Async Copy)\x1b[0m`,
            ];
          } else if (trimmed.includes('train_lora.py')) {
            output = [
              `\x1b[35m[LoRA-Trainer]\x1b[0m Loading base weights: /workspace/models/llama-3.3-70b-instruct...`,
              `Applying Rank-64 LoRA adapters to (q_proj, k_proj, v_proj, o_proj)...`,
              `Trainable parameters: 168,427,520 || Total parameters: 70,553,948,160 || Trainable%: 0.2387%`,
              `[Epoch 1/5] Step 100/2500 - Loss: \x1b[32m1.428\x1b[0m - Speed: \x1b[36m4,820 tokens/sec\x1b[0m - VRAM: 58.3GB`,
              `[Epoch 1/5] Step 200/2500 - Loss: \x1b[32m1.291\x1b[0m - Speed: \x1b[36m4,850 tokens/sec\x1b[0m - VRAM: 58.3GB`,
              `\x1b[32m✔ Checkpoint step-200.pt saved to /workspace/checkpoints/\x1b[0m`,
            ];
          } else {
            output = [
              `Python 3.11.9 (main, Apr 19 2024, 16:48:06) [GCC 13.2.0] on linux`,
              `Type "help", "copyright", "credits" or "license" for more information.`,
              `>>> print("DevDeck NVIDIA Shell Active")`,
              `DevDeck NVIDIA Shell Active`,
            ];
          }
          break;

        case 'ollama':
          if (parts[1] === 'list' || parts[1] === 'ls') {
            output = [
              `NAME                    ID              SIZE      MODIFIED`,
              `deepseek-r1:70b         8a24c5208b31    42 GB     2 hours ago`,
              `llama3.3:latest         a140f92b71c0    40 GB     1 day ago`,
              `qwen2.5-coder:32b       99f1a0e88210    19 GB     3 days ago`,
              `nomic-embed-text:latest 0a10df92b110    274 MB    1 week ago`,
            ];
          } else if (parts[1] === 'run') {
            const model = parts[2] || 'deepseek-r1';
            output = [
              `pulling manifest`,
              `verifying sha256 digest... \x1b[32msuccess\x1b[0m`,
              `writing layer weights to Hopper VRAM: 100% [==================================>] 42 GB`,
              `\x1b[35m>>> Model ${model} is loaded and ready.\x1b[0m`,
              `\x1b[36mDeepSeek R1\x1b[0m: Hello! I am running with full FP8 tensor core acceleration on your ${currentInstance.hardware.tier}. How can I assist your code deployment today?`,
            ];
          } else {
            output = [
              `Ollama is running on http://127.0.0.1:11434`,
              `Usage: ollama run <model> | ollama list | ollama pull <model>`,
            ];
          }
          break;

        case 'docker':
          if (trimmed.includes('compose') || trimmed.includes('up')) {
            output = [
              `[+] Running 4/4`,
              ` ✔ Network workspace_default       Created                              0.1s`,
              ` ✔ Container postgres-vector       Started (5432/tcp)                   0.4s`,
              ` ✔ Container redis-cache           Started (6379/tcp)                   0.3s`,
              ` ✔ Container vllm-inference        Started (8000/tcp on Hopper GPU 0)   1.2s`,
            ];
          } else {
            output = [
              `CONTAINER ID   IMAGE                          COMMAND                  CREATED         STATUS         PORTS                    NAMES`,
              `c49f82a10e8b   ghcr.io/dev/neuralpulse:latest  "pnpm start"             2 days ago      Up 48 hours    0.0.0.0:3000->3000/tcp   web-frontend`,
              `a10d9382f71c   vllm/vllm-openai:v0.6.0        "python3 -m vllm.entry…" 2 days ago      Up 48 hours    0.0.0.0:8000->8000/tcp   vllm-inference`,
              `e72b109c48ea   pgvector/pgvector:pg16         "docker-entrypoint.s…"   4 days ago      Up 4 days      0.0.0.0:5432->5432/tcp   postgres-vector`,
              `f81902bb314d   redis:7-alpine                 "docker-entrypoint.s…"   4 days ago      Up 4 days      0.0.0.0:6379->6379/tcp   redis-cache`,
            ];
          }
          break;

        case 'pnpm':
        case 'npm':
        case 'yarn':
          if (trimmed.includes('dev') || trimmed.includes('start')) {
            output = [
              `> neuralpulse-cde@2.4.0 dev /workspace`,
              `> vite --host 0.0.0.0 --port 3000`,
              ``,
              `  \x1b[32mVITE v5.4.2\x1b[0m  ready in \x1b[1m218 ms\x1b[0m`,
              ``,
              `  \x1b[1m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://localhost:3000/\x1b[0m`,
              `  \x1b[1m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m \x1b[36mhttp://${currentInstance.ip || '34.120.48.192'}:3000/\x1b[0m`,
              `  \x1b[1m➜\x1b[0m  \x1b[1mIngress:\x1b[0m \x1b[35mhttps://3000-${currentInstance.slug || 'node'}.preview.brev.dev\x1b[0m`,
              `  \x1b[90mpress h + enter to show help\x1b[0m`,
            ];
          } else {
            output = [
              `Lockfile is up to date, resolution step is skipped`,
              `Packages: +14`,
              `++++++++++++++`,
              `Progress: resolved 452, reused 452, downloaded 0, added 14, done`,
              `Done in 1.4s`,
            ];
          }
          break;

        case 'git':
          if (parts[1] === 'status') {
            output = [
              `On branch \x1b[36m${currentInstance.gitBranch || 'main'}\x1b[0m`,
              `Your branch is up to date with 'origin/${currentInstance.gitBranch || 'main'}'.`,
              ``,
              `Changes not staged for commit:`,
              `  (use "git add <file>..." to update what will be committed)`,
              `	\x1b[31mmodified:   src/components/WebTerminalView.tsx\x1b[0m`,
              `	\x1b[31mmodified:   src/types.ts\x1b[0m`,
              ``,
              `no changes added to commit (use "git add")`,
            ];
          } else if (parts[1] === 'log') {
            output = [
              `\x1b[33mcommit 7f4a9b2c8e10d (HEAD -> main, origin/main)\x1b[0m`,
              `Author: Developer <dev@enterprise.corp>`,
              `Date:   ${new Date().toDateString()}`,
              ``,
              `    feat(cde): enable cross-device mesh, GPU telemetry, and Brev.dev orchestration`,
              ``,
              `\x1b[33mcommit 1b04c892fa44e\x1b[0m`,
              `Author: Cloud Engineer <infra@enterprise.corp>`,
              `Date:   Yesterday`,
              ``,
              `    chore(cluster): configure NVIDIA H100 SXM5 node with TensorRT-LLM and vLLM`,
            ];
          } else if (parts[1] === 'branch') {
            output = [`* \x1b[32m${currentInstance.gitBranch || 'main'}\x1b[0m`, `  feature/cross-device-mesh`, `  release/v2.4`];
          } else {
            output = [`Everything up-to-date with origin/${currentInstance.gitBranch || 'main'}.`];
          }
          break;

        case 'brev':
          output = [
            `\x1b[1mBrev.dev Cloud Dev Environments (CDE) Control Plane\x1b[0m`,
            `--------------------------------------------------------------------------------`,
            `ID                     NAME                     TIER                    STATUS     COST`,
            `inst-h100-primary      gpu-h100-primary-node    NVIDIA H100 SXM5 80GB   \x1b[32mRUNNING\x1b[0m    $2.89/hr`,
            `inst-l4-cluster        gpu-l4-embed-worker      NVIDIA L4 24GB          \x1b[32mRUNNING\x1b[0m    $0.72/hr`,
            `inst-cpu-fullstack     cpu-fullstack-dev        AMD EPYC (16 vCPU/64GB) \x1b[32mRUNNING\x1b[0m    $0.38/hr`,
            `inst-rust-engine       rust-indexer             High-Freq (32 vCPU)     \x1b[90mSTOPPED\x1b[0m    $0.85/hr`,
            `--------------------------------------------------------------------------------`,
            `Active Monthly Projected Spend: \x1b[33m$184.20\x1b[0m (Auto-stop savings: \x1b[32m~$412.00\x1b[0m)`,
          ];
          break;

        case 'tailscale':
          output = [
            `\x1b[1mTailscale WireGuard Mesh Status\x1b[0m`,
            `100.84.192.12   macbook-pro-m3        developer@  macOS    active; direct 192.168.1.104:41641, tx 42MB, rx 180MB`,
            `100.99.14.88    homelab-rtx4090-node  ubuntu@     linux    active; direct 192.168.1.185:41641, tx 1.2GB, rx 850MB`,
            `100.112.45.67   windows11-wsl2        win_dev@    windows  active; relay "dfw", tx 14MB, rx 32MB`,
            `100.120.88.19   devdeck-cloud-h100    root@       linux    active; direct 34.120.48.192:41641`,
          ];
          break;

        case 'ls': {
          const files = virtualFs[currentCwd] || virtualFs['~/workspace'] || [];
          if (trimmed.includes('-la') || trimmed.includes('-l')) {
            output = [
              `total ${files.length * 4}`,
              `drwxr-xr-x 14 brev brev 4096 ${new Date().toLocaleDateString()} .`,
              `drwxr-xr-x  6 brev brev 4096 ${new Date().toLocaleDateString()} ..`,
              ...files.map((f) => {
                const isDir = f.endsWith('/');
                return `${isDir ? 'drwxr-xr-x' : '-rw-r--r--'}  2 brev brev ${isDir ? '4096' : '1024'} ${new Date().toLocaleDateString()} ${
                  isDir ? `\x1b[34m${f}\x1b[0m` : f
                }`;
              }),
            ];
          } else {
            output = [
              files
                .map((f) => (f.endsWith('/') ? `\x1b[34m${f}\x1b[0m` : f))
                .join('   '),
            ];
          }
          break;
        }

        case 'pwd':
          output = [currentCwd.replace('~', '/home/brev')];
          break;

        case 'cd': {
          const targetDir = arg1 || '~';
          let newCwd = currentCwd;
          if (targetDir === '..' || targetDir === '../') {
            newCwd = currentCwd === '~/workspace' ? '~' : '~/workspace';
          } else if (targetDir.startsWith('~/') || targetDir === '~') {
            newCwd = targetDir;
          } else if (targetDir === 'src' || targetDir === 'src/') {
            newCwd = '~/workspace/src';
          } else if (targetDir === 'models' || targetDir === 'models/') {
            newCwd = '~/workspace/models';
          } else if (targetDir === 'workspace' || targetDir === 'workspace/') {
            newCwd = '~/workspace';
          } else {
            newCwd = `${currentCwd}/${targetDir}`.replace('//', '/');
          }

          setTabs((prev) =>
            prev.map((tab) =>
              tab.id === targetTabId ? { ...tab, cwd: newCwd } : tab
            )
          );
          output = [];
          break;
        }

        case 'cat': {
          const fileName = arg1;
          const fullPath = fileName?.startsWith('~/') ? fileName : `${currentCwd}/${fileName}`;
          const content = virtualFilesContent[fullPath] || virtualFilesContent[`~/workspace/${fileName}`];
          if (content) {
            output = content.split('\n');
          } else {
            output = [`cat: ${fileName || ''}: No such file or directory`];
          }
          break;
        }

        case 'curl':
          output = [
            `HTTP/1.1 200 OK`,
            `Date: ${new Date().toUTCString()}`,
            `Server: Caddy/v2.8.4 (Cloud Dev Ingress)`,
            `Content-Type: application/json; charset=utf-8`,
            `X-Powered-By: Express / FastAPI vLLM`,
            `Strict-Transport-Security: max-age=31536000; includeSubDomains`,
            ``,
            `{"status":"healthy","uptime":"4d 12h","gpu":"NVIDIA H100","version":"2.4.0"}`,
          ];
          break;

        case 'htop':
        case 'top':
          output = [
            `Tasks: 148 total,   2 running, 146 sleeping,   0 stopped,   0 zombie`,
            `%Cpu(s): \x1b[32m18.4\x1b[0m us,  \x1b[33m4.2\x1b[0m sy,  0.0 ni, \x1b[36m77.1\x1b[0m id,  0.3 wa,  0.0 hi,  0.0 si`,
            `MiB Mem : \x1b[32m120832.0\x1b[0m total,  \x1b[33m48210.4\x1b[0m used,  \x1b[36m72621.6\x1b[0m free,   4210.0 buff/cache`,
            `MiB Swap:   8192.0 total,      0.0 used,   8192.0 free. \x1b[32m71240.2\x1b[0m avail Mem`,
            ``,
            `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`,
            ` 4192 brev      20   0   48.2g  32.1g   8.4g R  98.4  26.5  42:18.12 python3 train_lora.py`,
            ` 5820 brev      20   0   14.4g   8.2g   2.1g S  45.2   6.8  18:04.91 vllm_server`,
            ` 1042 root      20   0    2.4g 480.0m 120.0m S  12.0   0.4   8:12.44 dockerd`,
          ];
          break;

        case 'free':
          output = [
            `               total        used        free      shared  buff/cache   available`,
            `Mem:           120Gi        48Gi        64Gi       1.2Gi       8.0Gi        71Gi`,
            `Swap:          8.0Gi          0B       8.0Gi`,
          ];
          break;

        case 'df':
          output = [
            `Filesystem      Size  Used Avail Use% Mounted on`,
            `/dev/nvme0n1p1  1.0T  350G  674G  35% /`,
            `tmpfs            60G     0   60G   0% /dev/shm`,
            `/dev/nvme1n1    2.0T  840G  1.2T  42% /workspace/data`,
          ];
          break;

        case 'neofetch':
        case 'fastfetch':
          if (currentOs === 'windows') {
            output = [
              `\x1b[36m   ####################   ####################   \x1b[36mAdministrator@WIN-DEVDECK-01\x1b[0m`,
              `\x1b[36m   ####################   ####################   \x1b[0m-----------------------------`,
              `\x1b[36m   ####################   ####################   \x1b[33mOS:\x1b[0m Windows 11 Enterprise x86_64`,
              `\x1b[36m   ####################   ####################   \x1b[33mHost:\x1b[0m Precision 7960 Workstation`,
              `\x1b[36m   ####################   ####################   \x1b[33mKernel:\x1b[0m 10.0.26100.1591 (WinNT)`,
              `\x1b[36m                                                 \x1b[33mUptime:\x1b[0m 12 days, 8 hours`,
              `\x1b[36m   ####################   ####################   \x1b[33mPackages:\x1b[0m 64 (winget), 18 (choco)`,
              `\x1b[36m   ####################   ####################   \x1b[33mShell:\x1b[0m PowerShell 7.4.5 (Core)`,
              `\x1b[36m   ####################   ####################   \x1b[33mWSL2 Engine:\x1b[0m Ubuntu 24.04 (Mirrored)`,
              `\x1b[36m   ####################   ####################   \x1b[33mCPU:\x1b[0m Intel Xeon w9-3495X (56c/112t)`,
              `\x1b[36m   ####################   ####################   \x1b[33mGPU:\x1b[0m \x1b[35mNVIDIA RTX 6000 Ada (48GB GDDR6)\x1b[0m`,
              `\x1b[36m   ####################   ####################   \x1b[33mMemory:\x1b[0m 52140MiB / 262144MiB (ECC)`,
            ];
          } else if (currentOs === 'iso_live') {
            output = [
              `\x1b[33m       .---.            \x1b[33mroot@devdeck-live-cde\x1b[0m`,
              `\x1b[33m      /     \\           \x1b[0m---------------------`,
              `\x1b[33m     | () () |          \x1b[33mOS:\x1b[0m DevDeck Live ISO (Alpine Linux 3.20)`,
              `\x1b[33m      \\  _  /           \x1b[33mHost:\x1b[0m Live RAM Disk Ephemeral Node`,
              `\x1b[33m       \`---\`            \x1b[33mKernel:\x1b[0m 6.6.34-0-lts (x86_64)`,
              `\x1b[33m     /       \\          \x1b[33mBoot Medium:\x1b[0m UEFI ISO RAM Disk (tmpfs)`,
              `\x1b[33m    |         |         \x1b[33mUptime:\x1b[0m 0 days, 2 hours, 18 mins`,
              `\x1b[33m    | |     | |         \x1b[33mPackages:\x1b[0m 142 (apk)`,
              `\x1b[33m    \`-\`     \`-\`         \x1b[33mShell:\x1b[0m /bin/ash (BusyBox 1.36.1)`,
              `\x1b[33m                        \x1b[33mRAM Usage:\x1b[0m 1.84GiB / 32GiB (Volatile)`,
              `\x1b[33m                        \x1b[33mSecurity:\x1b[0m PaX / Hardened Grsecurity & WireGuard`,
            ];
          } else if (currentOs === 'macos') {
            output = [
              `\x1b[32m                    'c.          \x1b[32mdeveloper@macbook-pro.local\x1b[0m`,
              `\x1b[32m                 ,xNMM.          \x1b[0m---------------------------`,
              `\x1b[32m               .OMMMMo           \x1b[33mOS:\x1b[0m macOS Sequoia 15.0 arm64`,
              `\x1b[33m               OMMM0,            \x1b[33mHost:\x1b[0m MacBookPro18,2 (Apple Silicon)`,
              `\x1b[33m     .;loddo:' loolloddol;.      \x1b[33mKernel:\x1b[0m Darwin 24.0.0`,
              `\x1b[31m   cKMMMMMMMMMMNWMMMMMMMMMM0:    \x1b[33mUptime:\x1b[0m 6 days, 21 hours`,
              `\x1b[31m .KMMMMMMMMMMMMMMMMMMMMMMMWd.    \x1b[33mPackages:\x1b[0m 218 (brew)`,
              `\x1b[35m XMMMMMMMMMMMMMMMMMMMMMMMX.      \x1b[33mShell:\x1b[0m zsh 5.9 (x86_64-apple-darwin24.0)`,
              `\x1b[35m;MMMMMMMMMMMMMMMMMMMMMMMM:       \x1b[33mResolution:\x1b[0m 3456x2234 Liquid Retina XDR`,
              `\x1b[34m:MMMMMMMMMMMMMMMMMMMMMMMM:       \x1b[33mCPU:\x1b[0m Apple M3 Max (16 cores: 12P + 4E)`,
              `\x1b[34m.WN0kKMMMMMMMMMMMMMMMMMMX.       \x1b[33mGPU:\x1b[0m \x1b[35mApple M3 Max 40-core GPU (Metal 3)\x1b[0m`,
              `\x1b[36m  .KMMMMMMMMMMMMMMMMMMMMWd.      \x1b[33mMemory:\x1b[0m 38410MiB / 131072MiB (Unified RAM)`,
              `\x1b[36m    'kMMMMMMMMMMMMMMMMMMk.       \x1b[33mAcceleration:\x1b[0m Metal Performance Shaders (MPS)`,
            ];
          } else if (currentOs === 'freebsd' || currentOs === 'bsd') {
            output = [
              "\x1b[31m  ```                        ```  \x1b[31mroot@freebsd-node.corp\x1b[0m",
              "\x1b[31m s` `.....---.......--.```   -/  \x1b[0m----------------------",
              "\x1b[31m +o   .--`         /y:`      +.  \x1b[33mOS:\x1b[0m FreeBSD 14.1-RELEASE-p3 amd64",
              "\x1b[31m  yo`:.            :o      `+-   \x1b[33mHost:\x1b[0m PowerEdge R7525 Server",
              "\x1b[31m   y/               -/   `yo`    \x1b[33mKernel:\x1b[0m 14.1-RELEASE-p3",
              "\x1b[31m   .-                  :h+`      \x1b[33mUptime:\x1b[0m 18 days, 4 hours, 12 mins",
              "\x1b[31m   /`                 `yd.       \x1b[33mPackages:\x1b[0m 482 (pkg)",
              "\x1b[31m  `+                  .md/       \x1b[33mShell:\x1b[0m tcsh 6.24.10 / csh",
              "\x1b[31m  `+        -::-      .ymd/      \x1b[33mCPU:\x1b[0m AMD EPYC 7763 64-Core Processor",
              "\x1b[31m   /       /dMMMy      `ymd/     \x1b[33mFile System:\x1b[0m ZFS (zpool: tank / raidz2)",
              "\x1b[31m   .-      ymMMMm.      `ymd/    \x1b[33mSecurity:\x1b[0m Capsicum / FreeBSD Jails (Active)",
              "\x1b[31m    y/     .yMMMy        `ymd/   \x1b[33mMemory:\x1b[0m 18420MiB / 65536MiB (ECC)",
            ];
          } else {
            output = [
              `\x1b[36m       _,met$$$$$gg.          \x1b[32mbrev@${currentInstance.name || 'node'}\x1b[0m`,
              `\x1b[36m    ,g$$$$$$$$$$$$$$$P.       \x1b[0m---------------------`,
              `\x1b[36m  ,g$$P"     """Y$$.".        \x1b[33mOS:\x1b[0m Ubuntu 24.04.1 LTS x86_64`,
              `\x1b[36m ,$$P'              \`$$$.     \x1b[33mHost:\x1b[0m DevDeck Cloud CDE (${currentInstance.region})`,
              `\x1b[36m',$$P       ,ggs.     \`$$b:   \x1b[33mKernel:\x1b[0m 6.8.0-40-generic`,
              `\x1b[36m\`d$$'     ,$P"'   .    $$$    \x1b[33mUptime:\x1b[0m 4 days, 12 hours, 44 mins`,
              `\x1b[36m $$P      d$'     ,    $$P    \x1b[33mPackages:\x1b[0m 1842 (dpkg), 12 (snap)`,
              `\x1b[36m $$:      $$.   -    ,d$$'    \x1b[33mShell:\x1b[0m bash 5.2.21`,
              `\x1b[36m \`$$;      Y$b._   _,d$P'     \x1b[33mCPU:\x1b[0m AMD EPYC 9654 96-Core Processor (16 vCPU)`,
              `\x1b[36m  Y$$.    \`."Y$$$$P"'         \x1b[33mGPU:\x1b[0m \x1b[35m${currentInstance.hardware.gpuModel || currentInstance.hardware.tier}\x1b[0m`,
              `\x1b[36m   \`$$b.                      \x1b[33mMemory:\x1b[0m 48210MiB / 120832MiB (40%)`,
              `\x1b[36m     \`Y$$b.                   \x1b[33mGPU-Driver:\x1b[0m NVIDIA 550.54.14 • CUDA 12.4`,
            ];
          }
          break;

        case 'echo':
          output = [trimmed.replace(/^echo\s*/i, '').replace(/^["']|["']$/g, '') || ''];
          break;

        case 'ping': {
          const host = arg1 || '8.8.8.8';
          output = [
            `PING ${host} (${host}) 56(84) bytes of data.`,
            `64 bytes from ${host}: icmp_seq=1 ttl=118 time=8.24 ms`,
            `64 bytes from ${host}: icmp_seq=2 ttl=118 time=7.91 ms`,
            `64 bytes from ${host}: icmp_seq=3 ttl=118 time=8.10 ms`,
            `--- ${host} ping statistics ---`,
            `3 packets transmitted, 3 received, 0% packet loss, time 2003ms, rtt min/avg/max = 7.910/8.083/8.240 ms`,
          ];
          break;
        }

        case 'mkdir':
          if (arg1) {
            const dirName = arg1.endsWith('/') ? arg1 : `${arg1}/`;
            setVirtualFs((prev) => ({
              ...prev,
              [currentCwd]: [...(prev[currentCwd] || []), dirName],
            }));
            output = [`\x1b[32m✔ Created directory: ${arg1}\x1b[0m`];
          } else {
            output = [`mkdir: missing operand`];
          }
          break;

        case 'touch':
          if (arg1) {
            setVirtualFs((prev) => ({
              ...prev,
              [currentCwd]: [...(prev[currentCwd] || []), arg1],
            }));
            output = [`\x1b[32m✔ Created file: ${arg1}\x1b[0m`];
          } else {
            output = [`touch: missing file operand`];
          }
          break;

        case 'node':
          output = [`v20.18.0 (Node.js runtime LTS)`];
          break;

        case 'bun':
          output = [`1.1.29 (Bun Native TypeScript engine)`];
          break;

        case 'cargo':
          output = [`cargo 1.80.0 (376290e 2024-07-16)`];
          break;

        case 'go':
          output = [`go version go1.23.1 linux/amd64`];
          break;

        case 'pip':
        case 'pip3':
          if (trimmed.includes('install')) {
            const pkg = parts[2] || 'transformers';
            output = [
              `Collecting ${pkg}`,
              `  Downloading ${pkg}-latest-py3-none-any.whl (4.2 MB)`,
              `Installing collected packages: ${pkg}`,
              `\x1b[32mSuccessfully installed ${pkg} in /home/brev/.local/lib/python3.11/site-packages\x1b[0m`,
            ];
          } else {
            output = [
              `Package             Version`,
              `------------------- ---------`,
              `torch               2.4.0+cu124`,
              `torchvision         0.19.0+cu124`,
              `transformers        4.44.2`,
              `accelerate          0.34.0`,
              `vllm                0.6.0`,
              `flash-attn          2.6.3`,
              `triton              3.0.0`,
            ];
          }
          break;

        case 'ps':
          output = [
            `    PID TTY          TIME CMD`,
            `   2104 pts/2    00:00:00 bash`,
            `   4192 pts/2    00:42:18 python3 train_lora.py`,
            `   5820 ?        00:18:04 vllm_server`,
            `   9482 pts/2    00:00:00 ps`,
          ];
          break;

        case 'env':
        case 'export':
          output = [
            `CUDA_HOME=/usr/local/cuda-12.4`,
            `CUDA_VISIBLE_DEVICES=0`,
            `PATH=/home/brev/.local/bin:/usr/local/cuda/bin:/usr/local/bin:/usr/bin:/bin`,
            `SHELL=/bin/bash`,
            `USER=brev`,
            `PWD=${currentCwd.replace('~', '/home/brev')}`,
            `OLLAMA_HOST=http://127.0.0.1:11434`,
            `HF_HOME=/workspace/models`,
            `TERM=xterm-256color`,
          ];
          break;

        case 'history':
          output = activeTab.history.map((h, i) => `  ${(i + 1).toString().padStart(4, ' ')}  ${h}`);
          if (output.length === 0) {
            output = [`     1  nvidia-smi`, `     2  python test_cuda.py`, `     3  docker ps`, `     4  pnpm dev`];
          }
          break;

        case 'brew':
          if (parts[1] === 'install') {
            const formula = parts[2] || 'htop';
            output = [
              `==> Downloading https://ghcr.io/v2/homebrew/core/${formula}/manifests/latest`,
              `==> Fetching ${formula}`,
              `==> Pouring ${formula}--latest.arm64_sequoia.bottle.tar.gz`,
              `🍺  /opt/homebrew/Cellar/${formula}/latest: 18 files, 2.4MB`,
              `\x1b[32m✔ Successfully installed ${formula} via Homebrew (Apple Silicon Native)\x1b[0m`,
            ];
          } else {
            output = [
              `==> Homebrew 4.3.18-12-g492a`,
              `Homebrew/homebrew-core (git revision a819; last commit 2 hours ago)`,
              `Homebrew/homebrew-cask (git revision 9b42; last commit 4 hours ago)`,
              `Prefix: /opt/homebrew (Apple Silicon arm64)`,
              `Installed Formulae: node, python@3.11, rust, go, ffmpeg, git, tmux, zsh, ollama, cmake`,
            ];
          }
          break;

        case 'pkg':
          if (parts[1] === 'install') {
            const pkgName = parts[2] || 'nginx';
            output = [
              `Updating FreeBSD repository catalogue...`,
              `FreeBSD repository is up to date.`,
              `All repositories are up to date.`,
              `The following 1 package(s) will be affected (of 0 checked):`,
              `Installed packages to be UPGRADED: ${pkgName}`,
              `[1/1] Fetching ${pkgName}-1.26.2.pkg: 100% [==========================] 1.8MB`,
              `[1/1] Installing ${pkgName}-1.26.2...`,
              `\x1b[32m✔ Extracting ${pkgName}-1.26.2: 100% - FreeBSD package installed successfully.\x1b[0m`,
            ];
          } else {
            output = [
              `FreeBSD pkg 1.21.3 (x86_64-portbld-freebsd14.1)`,
              `Usage: pkg install <pkg> | pkg info | pkg update | pkg search <query>`,
              `Installed packages: zfs-stats, tmux, clang-18, python311, git, nginx, postgresql16-server, wireguard`,
            ];
          }
          break;

        case 'apt':
        case 'apt-get':
          if (parts[1] === 'install') {
            const pkg = parts[2] || 'htop';
            output = [
              `Reading package lists... Done`,
              `Building dependency tree... Done`,
              `The following NEW packages will be installed: ${pkg}`,
              `0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`,
              `Need to get 1,420 kB of archives.`,
              `Get:1 http://archive.ubuntu.com/ubuntu noble/main amd64 ${pkg} [1,420 kB]`,
              `Fetched 1,420 kB in 0s (4,820 kB/s)`,
              `Setting up ${pkg} ...`,
              `\x1b[32m✔ Package ${pkg} installed successfully.\x1b[0m`,
            ];
          } else {
            output = [
              `apt 2.8.0 (amd64) - Ubuntu Package Management`,
              `Active Repositories: noble-updates, noble-security, universe, nvidia-cuda-repo`,
            ];
          }
          break;

        case 'sw_vers':
          output = [
            `ProductName:            macOS`,
            `ProductVersion:         15.0 (Sequoia)`,
            `BuildVersion:           24A335`,
            `HardwareArchitecture:   arm64 (Apple Silicon M3 Max)`,
          ];
          break;

        case 'sysctl':
          if (currentOs === 'macos') {
            output = [
              `machdep.cpu.brand_string: Apple M3 Max`,
              `machdep.cpu.core_count: 16`,
              `hw.memsize: 137438953472 (128 GB Unified Memory)`,
              `hw.ncpu: 16 (12 performance + 4 efficiency)`,
              `hw.byteorder: 1234 (little-endian)`,
              `hw.model: MacBookPro18,2`,
            ];
          } else if (currentOs === 'bsd') {
            output = [
              `hw.machine: amd64`,
              `hw.model: AMD EPYC 7763 64-Core Processor`,
              `hw.ncpu: 64`,
              `hw.physmem: 68719476736 (64 GB ECC Registered DDR4)`,
              `kern.ostype: FreeBSD`,
              `kern.osrelease: 14.1-RELEASE-p3`,
              `security.jail.jailed: 0`,
              `vfs.zfs.arc_max: 34359738368 (32 GB ARC Cache)`,
            ];
          } else {
            output = [
              `kernel.osrelease = 6.8.0-40-generic`,
              `kernel.ostype = Linux`,
              `vm.swappiness = 10`,
              `net.ipv4.ip_forward = 1`,
              `fs.file-max = 2097152`,
            ];
          }
          break;

        case 'zpool':
        case 'zfs':
          output = [
            `  pool: tank`,
            ` state: \x1b[32mONLINE\x1b[0m`,
            `  scan: scrub repaired 0B in 02:14:18 with 0 errors on Sun Aug 25 04:14:18 2026`,
            `config:`,
            `	NAME        STATE     READ WRITE CKSUM`,
            `	tank        \x1b[32mONLINE\x1b[0m       0     0     0`,
            `	  raidz2-0  \x1b[32mONLINE\x1b[0m       0     0     0`,
            `	    da0p2   \x1b[32mONLINE\x1b[0m       0     0     0 (Enterprise NVMe 3.84TB)`,
            `	    da1p2   \x1b[32mONLINE\x1b[0m       0     0     0 (Enterprise NVMe 3.84TB)`,
            `	    da2p2   \x1b[32mONLINE\x1b[0m       0     0     0 (Enterprise NVMe 3.84TB)`,
            `	    da3p2   \x1b[32mONLINE\x1b[0m       0     0     0 (Enterprise NVMe 3.84TB)`,
            `errors: No known data errors (ZFS Self-Healing Protection Active)`,
          ];
          break;

        case 'jls':
        case 'jail':
          output = [
            `   JID  IP Address      Hostname                      Path`,
            `     1  10.0.0.101      cde-rust-builder.local        /usr/jails/rust-build`,
            `     2  10.0.0.102      db-postgres-vector.local      /usr/jails/postgres16`,
            `     3  10.0.0.103      nginx-edge-proxy.local        /usr/jails/nginx-edge`,
            `\x1b[32m✔ 3 FreeBSD Jails running with VNET & Capsicum sandbox isolation.\x1b[0m`,
          ];
          break;

        case 'diskutil':
          output = [
            `/dev/disk0 (internal, physical):`,
            `   #:                       TYPE NAME                    SIZE       IDENTIFIER`,
            `   0:      GUID_partition_scheme                        *2.0 TB     disk0`,
            `   1:             EFI EFI                                524.3 MB   disk0s1`,
            `   2:                 Apple_APFS Container disk3         2.0 TB     disk0s2`,
            `/dev/disk3 (synthesized):`,
            `   #:                       TYPE NAME                    SIZE       IDENTIFIER`,
            `   0:  APFS Container Scheme -                      +2.0 TB     disk3`,
            `   1:                APFS Volume Macintosh HD - Data     840.4 GB   disk3s1`,
            `   2:                APFS Volume Macintosh HD (System)   15.4 GB    disk3s2`,
          ];
          break;

        case 'defaults':
          output = [
            `{\n  "AppleInterfaceStyle" = "Dark";\n  "AppleKeyboardUIMode" = 2;\n  "NSAutomaticSpellingCorrectionEnabled" = 0;\n  "com.apple.trackpad.scaling" = "2.5";\n}`,
          ];
          break;

        case 'kldstat':
          output = [
            `Id Refs Address                Size Name`,
            ` 1   42 0xffffffff80200000  1d49240 kernel`,
            ` 2    1 0xffffffff81f4a000     9140 nullfs.ko`,
            ` 3    1 0xffffffff81f54000   4f8290 zfs.ko`,
            ` 4    1 0xffffffff8244d000    14820 if_bridge.ko`,
            ` 5    1 0xffffffff82462000    21440 bridgestp.ko`,
            ` 6    1 0xffffffff82484000    42100 if_wg.ko (WireGuard in-kernel)`,
          ];
          break;

        case 'get-process':
        case 'gps':
          output = [
            `Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id ProcessName`,
            `-------  ------    -----      -----     ------     -- -----------`,
            `    412      24    42100      68200      18.42   1048 DevDeckAgent`,
            `    820      68   482000     824000     142.10   2840 Code`,
            `    310      18    28400      36200       2.14   4120 docker`,
            `   1240     140  1840000    2410000     412.50   5920 pwsh`,
            `    190      12    14200      19400       0.45   6812 wslhost`,
            `    980      84  3840000    4100000     812.90   7412 python (DirectML)`,
          ];
          break;

        case 'get-service':
        case 'gsv':
          output = [
            `Status   Name               DisplayName`,
            `------   ----               -----------`,
            `\x1b[32mRunning\x1b[0m  DevDeckAgent       DevDeck Continuous Remote CDE Agent`,
            `\x1b[32mRunning\x1b[0m  LxssManager        Windows Subsystem for Linux (WSL2)`,
            `\x1b[32mRunning\x1b[0m  com.docker.service Docker Desktop Core Service`,
            `\x1b[32mRunning\x1b[0m  ssh-agent          OpenSSH Authentication Agent`,
            `\x1b[32mRunning\x1b[0m  WireGuardTunnel    WireGuard Tunnel (devdeck0)`,
            `\x1b[90mStopped\x1b[0m  wuauserv           Windows Update Service`,
          ];
          break;

        case 'wsl':
          output = [
            `  NAME                   STATE           VERSION`,
            `* Ubuntu-24.04           \x1b[32mRunning\x1b[0m         2 (Mirrored Mode, DirectML GPU)`,
            `  docker-desktop         \x1b[32mRunning\x1b[0m         2`,
            `  docker-desktop-data    \x1b[32mRunning\x1b[0m         2`,
            `  Debian                 \x1b[90mStopped\x1b[0m         2`,
            `\x1b[36m✔ WSL2 kernel 6.6.36.3-microsoft-standard-WSL2 initialized with autoProxy & memoryReclaim.\x1b[0m`,
          ];
          break;

        case 'winget':
          output = [
            `Name                                  Id                             Version          Source`,
            `---------------------------------------------------------------------------------------------`,
            `DevDeck Agent                         DevDeck.Agent                  2.4.0            winget`,
            `Microsoft.PowerShell                  Microsoft.PowerShell           7.4.5.0          winget`,
            `Git                                   Git.Git                        2.46.0           winget`,
            `Microsoft Visual Studio Code          Microsoft.VisualStudioCode     1.93.0           winget`,
            `Docker Desktop                        Docker.DockerDesktop           4.33.1           winget`,
            `WireGuard                             WireGuard.WireGuard            0.5.3            winget`,
          ];
          break;

        case 'ipconfig':
          output = [
            `Windows IP Configuration`,
            ``,
            `Ethernet adapter DevDeck-WireGuard:`,
            `   Connection-specific DNS Suffix  . : internal.devdeck.mesh`,
            `   IPv4 Address. . . . . . . . . . . : 10.42.0.84`,
            `   Subnet Mask . . . . . . . . . . . : 255.255.255.0`,
            `   Default Gateway . . . . . . . . . : 10.42.0.1`,
            ``,
            `Wireless LAN adapter Wi-Fi:`,
            `   Connection-specific DNS Suffix  . : corp.local`,
            `   IPv4 Address. . . . . . . . . . . : 192.168.1.140`,
            `   Subnet Mask . . . . . . . . . . . : 255.255.255.0`,
            `   Default Gateway . . . . . . . . . : 192.168.1.1`,
          ];
          break;

        case 'ramdisk':
          output = [
            `DevDeck Live ISO RAM Disk Topology:`,
            `---------------------------------------------------------`,
            `• Root FS (tmpfs)  : 32.0 GiB total, \x1b[32m1.84 GiB used\x1b[0m, 30.16 GiB available (100% in RAM)`,
            `• Persistence Mode : Volatile RAM-Only (zero disk writes, pure isolation)`,
            `• Execution Speed  : ~14.2 GB/s memory I/O read/write`,
            `• Network Bridge   : WireGuard mesh active (10.42.0.19)`,
            `• VS Code Server   : Running on port 443 via TLS tunnel`,
            `\x1b[32m✔ High-security zero-trace ephemeral CDE operational.\x1b[0m`,
          ];
          break;

        case 'apk':
          output = [
            `Installed Alpine Packages (142 total):`,
            `alpine-base-3.20.2-r0`,
            `wireguard-tools-1.0.20210914-r4`,
            `dropbear-2024.85-r0`,
            `docker-cli-26.1.4-r0`,
            `git-2.45.2-r0`,
            `tmux-3.4-r1`,
            `python3-3.12.4-r0`,
            `curl-8.8.0-r0`,
            `\x1b[32mOK: 142 distinct packages available in RAM disk.\x1b[0m`,
          ];
          break;

        case 'wg':
          output = [
            `interface: wg0`,
            `  public key: p+8Xj3vN0xKMMMMMMMMMMMMMMMMMMMMMMMXDevDeck=`,
            `  private key: (hidden)`,
            `  listening port: 51820`,
            ``,
            `peer: 9kQxJ7devdeckMeshCoordinatorPubKeyHere=`,
            `  endpoint: 35.240.18.90:51820`,
            `  allowed ips: 10.42.0.0/16`,
            `  latest handshake: 14 seconds ago`,
            `  transfer: 42.18 MiB received, 128.40 MiB sent`,
            `  persistent keepalive: every 25 seconds`,
          ];
          break;

        case 'setup-alpine':
          output = [
            `DevDeck Automated Live ISO Provisioner:`,
            `✔ Configuring hostname: devdeck-live-node`,
            `✔ Initializing loopback & WireGuard (wg0)...`,
            `✔ Mounting tmpfs RAM disk overlays...`,
            `✔ Starting Dropbear SSH daemon...`,
            `✔ Launching DevDeck Agent background supervisor...`,
            `\x1b[32mSystem ready for immediate cross-platform cloud pairing!\x1b[0m`,
          ];
          break;

        case 'uname':
          if (currentOs === 'windows') {
            output = [`Microsoft Windows [Version 10.0.26100.1591]`];
          } else if (currentOs === 'iso_live') {
            output = [`Linux devdeck-live-node 6.6.34-0-lts #1-Alpine SMP PREEMPT_DYNAMIC x86_64 Linux`];
          } else if (currentOs === 'macos') {
            output = [`Darwin macbook-pro.local 24.0.0 Darwin Kernel Version 24.0.0: arm64 x86_64`];
          } else if (currentOs === 'freebsd' || currentOs === 'bsd') {
            output = [`FreeBSD freebsd-node 14.1-RELEASE-p3 FreeBSD 14.1-RELEASE-p3 #0: GENERIC amd64`];
          } else {
            output = [`Linux brev-node 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux`];
          }
          break;

        case 'whoami':
          if (currentOs === 'windows') {
            output = [`WIN-DEVDECK-01\\Administrator`];
          } else if (currentOs === 'iso_live' || currentOs === 'freebsd' || currentOs === 'bsd') {
            output = [`root`];
          } else if (currentOs === 'macos') {
            output = [`developer`];
          } else {
            output = [`brev`];
          }
          break;

        case 'uptime':
          output = [` 03:26:14 up 4 days, 12:44,  2 users,  load average: 1.42, 1.18, 0.95`];
          break;

        default:
          output = [
            `\x1b[90m[exec]\x1b[0m ${trimmed}`,
            `Exit code: 0 (Execution successful in 18ms)`,
          ];
      }

      appendLines(targetTabId, output);

      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === targetTabId ? { ...tab, isRunning: false } : tab
        )
      );
    }, 200);
  };

  // Keyboard navigation for History (Up/Down) and Tab auto-complete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputCommand);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabAutoComplete();
    } else if (e.key === 'c' && e.ctrlKey) {
      // Handle Ctrl + C
      e.preventDefault();
      if (activeTab) {
        appendLines(activeTabId, [`^C`]);
        setInputCommand('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      // Handle Ctrl + L (clear screen)
      e.preventDefault();
      setTabs((prev) =>
        prev.map((tab) => (tab.id === activeTabId ? { ...tab, lines: [] } : tab))
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeTab.history.length > 0) {
        const nextIndex =
          activeTab.historyIndex === -1
            ? activeTab.history.length - 1
            : Math.max(0, activeTab.historyIndex - 1);
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId ? { ...t, historyIndex: nextIndex } : t
          )
        );
        setInputCommand(activeTab.history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeTab.historyIndex !== -1) {
        const nextIndex = activeTab.historyIndex + 1;
        if (nextIndex >= activeTab.history.length) {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTabId ? { ...t, historyIndex: -1 } : t
            )
          );
          setInputCommand('');
        } else {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTabId ? { ...t, historyIndex: nextIndex } : t
            )
          );
          setInputCommand(activeTab.history[nextIndex]);
        }
      }
    }
  };

  // Copy plain logs
  const copyTerminalOutput = () => {
    const rawText = activeTab.lines
      .map((line) => line.replace(/\x1b\[[0-9;]*m/g, ''))
      .join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    onShowToast('Copied Terminal Output', 'All session logs copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export session log
  const exportSessionLogs = () => {
    const rawText = activeTab.lines
      .map((line) => line.replace(/\x1b\[[0-9;]*m/g, ''))
      .join('\n');
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentInstance.name || 'node'}-session-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Logs Exported', 'Session log downloaded successfully', 'info');
  };

  // Create new terminal tab
  const handleAddNewTab = (
    type: 'shell' | 'nvtop' | 'logs' = 'shell',
    targetOs: 'linux' | 'windows' | 'freebsd' | 'iso_live' | 'macos' | 'bsd' = 'linux'
  ) => {
    const newId = `tab-${Date.now()}`;
    const osTitleMap: Record<string, string> = {
      linux: 'Linux (Ubuntu 24.04)',
      windows: 'Windows (PowerShell 7.4)',
      freebsd: 'FreeBSD (14.1-RELEASE)',
      bsd: 'FreeBSD (14.1-RELEASE)',
      iso_live: 'Live ISO (RAM Disk)',
      macos: 'macOS (Darwin Sequoia)',
    };
    const newTitle =
      type === 'nvtop'
        ? 'GPU nvtop'
        : type === 'logs'
        ? 'Docker Logs'
        : osTitleMap[targetOs] || `Shell ${tabs.length + 1}`;

    const newTab: TerminalTab = {
      id: newId,
      title: newTitle,
      type,
      os: targetOs,
      lines: [
        `\x1b[36mConnected to ${currentInstance.name} (Session ${tabs.length + 1} • ${targetOs.toUpperCase()})\x1b[0m`,
        `Direct PTY Terminal Initialized • Type \x1b[32m'help'\x1b[0m or \x1b[32m'neofetch'\x1b[0m for commands.`,
        `-----------------------------------------------------------------------------------------`,
      ],
      history: [],
      historyIndex: -1,
      cwd:
        targetOs === 'windows'
          ? 'C:\\DevDeck\\workspace'
          : targetOs === 'freebsd' || targetOs === 'bsd'
          ? '/usr/home/brev'
          : targetOs === 'iso_live'
          ? '/root/live-cde'
          : targetOs === 'macos'
          ? '~/Developer/workspace'
          : '~/workspace',
      isRunning: false,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    onShowToast('New Terminal Tab', `Opened ${newTitle} session`, 'info');
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
    }
  };

  // Restart SSH Session
  const handleRestartSession = () => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              lines: [
                `\x1b[33m⚡ Restarting SSH session to ${currentInstance.name} (${currentInstance.ip || '34.120.48.192'})...\x1b[0m`,
                `Handshake re-established via OpenSSH 9.6p1 (chacha20-poly1305@openssh.com)`,
                `Hardware: \x1b[35m${currentInstance.hardware.tier}\x1b[0m | Latency: \x1b[32m8ms\x1b[0m`,
                `-----------------------------------------------------------------------------------------`,
              ],
            }
          : t
      )
    );
    onShowToast('SSH Session Reset', `Reconnected to ${currentInstance.name}`, 'success');
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#05070a] p-6 overflow-y-auto' : ''}`}>
      {/* 1. Terminal Control & Machine Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0a0d14] border border-zinc-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-zinc-100 font-mono tracking-tight">
                Interactive SSH Terminal & Shell Gateway
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live PTY Attached
              </span>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                8ms latency
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Direct terminal access to NVIDIA GPU clusters, Brev.dev containers, Homelab rigs & paired PCs
            </p>
          </div>
        </div>

        {/* Machine Target Selector & Session Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Instance Picker */}
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
            <Server className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={currentInstance.id}
              onChange={(e) => {
                const found = instances.find((i) => i.id === e.target.value);
                if (found && onSelectInstance) {
                  onSelectInstance(found);
                  onShowToast('Attached to Target', `Switched SSH session to ${found.name}`, 'info');
                }
              }}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none font-mono cursor-pointer"
            >
              {instances.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-zinc-900 text-zinc-200">
                  {inst.name} ({inst.hardware.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Reconnect */}
          <button
            onClick={handleRestartSession}
            title="Restart SSH Session"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Font Controls */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1.5 text-zinc-500">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(16, fontSize + 1))}
              className="px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Split Mode */}
          <button
            onClick={() => setIsSplitView(!isSplitView)}
            title={isSplitView ? 'Disable Split Mode' : 'Enable Side-by-Side Split View'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isSplitView
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Clear Buffer */}
          <button
            onClick={() => {
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTabId ? { ...t, lines: [] } : t))
              );
            }}
            title="Clear buffer (Ctrl+L)"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy Logs */}
          <button
            onClick={copyTerminalOutput}
            title="Copy logs to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span className="hidden sm:inline">Copy Logs</span>
          </button>

          {/* Export Log */}
          <button
            onClick={exportSessionLogs}
            title="Download log file"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Terminal'}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Enterprise Quick-Run Toolbar (Tailored by Active OS) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-zinc-500 shrink-0 font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-zinc-400" /> {currentOs.toUpperCase()} Quick Exec:
        </span>
        {(currentOs === 'macos'
          ? [
              { label: 'brew status', cmd: 'brew', icon: Sparkles },
              { label: 'sw_vers', cmd: 'sw_vers', icon: Activity },
              { label: 'sysctl cpu', cmd: 'sysctl', icon: Cpu },
              { label: 'diskutil list', cmd: 'diskutil', icon: Layers },
              { label: 'defaults read', cmd: 'defaults', icon: TerminalIcon },
              { label: 'brew install htop', cmd: 'brew install htop', icon: Play },
              { label: 'neofetch', cmd: 'neofetch', icon: TerminalIcon },
              { label: 'uname -a', cmd: 'uname', icon: Server },
            ]
          : currentOs === 'bsd'
          ? [
              { label: 'pkg info', cmd: 'pkg', icon: Sparkles },
              { label: 'zpool status (ZFS)', cmd: 'zpool status', icon: Layers },
              { label: 'jls (FreeBSD Jails)', cmd: 'jls', icon: Activity },
              { label: 'kldstat (Modules)', cmd: 'kldstat', icon: Cpu },
              { label: 'sysctl hw', cmd: 'sysctl', icon: Server },
              { label: 'pkg install nginx', cmd: 'pkg install nginx', icon: Play },
              { label: 'neofetch', cmd: 'neofetch', icon: TerminalIcon },
              { label: 'uname -a', cmd: 'uname', icon: Server },
            ]
          : [
              { label: 'nvidia-smi', cmd: 'nvidia-smi', icon: Flame },
              { label: 'nvtop', cmd: 'nvtop', icon: Activity },
              { label: 'PyTorch CUDA Test', cmd: 'python test_cuda.py', icon: Zap },
              { label: 'Train LoRA (80GB)', cmd: 'python train_lora.py', icon: Cpu },
              { label: 'ollama list', cmd: 'ollama list', icon: Sparkles },
              { label: 'docker ps', cmd: 'docker ps', icon: Layers },
              { label: 'apt list', cmd: 'apt', icon: Play },
              { label: 'tailscale status', cmd: 'tailscale status', icon: Radio },
              { label: 'git status', cmd: 'git status', icon: TerminalIcon },
              { label: 'brev status', cmd: 'brev status', icon: Server },
            ]
        ).map((item) => (
          <button
            key={item.label}
            onClick={() => executeCommand(item.cmd)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
          >
            <item.icon className="w-3 h-3 text-zinc-400" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Terminal Tabs Header & OS Environment Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 bg-[#07090e] rounded-t-2xl px-3 pt-2 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const tabOs = tab.os || 'linux';
            const osBadge =
              tabOs === 'windows'
                ? 'Windows'
                : tabOs === 'iso_live'
                ? 'Live ISO'
                : tabOs === 'freebsd' || tabOs === 'bsd'
                ? 'FreeBSD'
                : tabOs === 'macos'
                ? 'macOS'
                : 'Linux';

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-mono cursor-pointer transition-colors border-t border-x ${
                  activeTabId === tab.id
                    ? 'bg-[#05070a] text-zinc-100 border-zinc-700/80 font-semibold shadow-inner'
                    : 'bg-zinc-900/40 text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">{tab.title}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono border bg-zinc-800 text-zinc-300 border-zinc-700">
                  {osBadge}
                </span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Spawner Buttons by OS */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() => handleAddNewTab('shell', 'linux')}
              className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
              title="Open new Linux (Ubuntu / systemd) terminal tab"
            >
              <Plus className="w-3 h-3 text-zinc-400" />
              <span>+ Linux</span>
            </button>
            <button
              onClick={() => handleAddNewTab('shell', 'windows')}
              className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
              title="Open new Windows (PowerShell 7.4 / WSL2) terminal tab"
            >
              <Plus className="w-3 h-3 text-zinc-400" />
              <span>+ Windows</span>
            </button>
            <button
              onClick={() => handleAddNewTab('shell', 'freebsd')}
              className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
              title="Open new FreeBSD (ZFS / Jails) terminal tab"
            >
              <Plus className="w-3 h-3 text-zinc-400" />
              <span>+ FreeBSD</span>
            </button>
            <button
              onClick={() => handleAddNewTab('shell', 'iso_live')}
              className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
              title="Open new DevDeck Live ISO (RAM Disk CDE) terminal tab"
            >
              <Plus className="w-3 h-3 text-zinc-400" />
              <span>+ Live ISO</span>
            </button>
          </div>
        </div>

        {/* Current Tab OS Switcher Pill */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <span className="text-[11px] font-mono text-zinc-500">OS Mode:</span>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setTabOs(activeTabId, 'linux')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                currentOs === 'linux'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Linux
            </button>
            <button
              onClick={() => setTabOs(activeTabId, 'windows')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                currentOs === 'windows'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Windows
            </button>
            <button
              onClick={() => setTabOs(activeTabId, 'freebsd')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                currentOs === 'freebsd' || currentOs === 'bsd'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              FreeBSD
            </button>
            <button
              onClick={() => setTabOs(activeTabId, 'iso_live')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                currentOs === 'iso_live'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Live ISO
            </button>
          </div>
        </div>
      </div>

      {/* 4. Terminal Main Viewport (Single or Split View) */}
      <div className={`grid ${isSplitView ? 'grid-cols-1 lg:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
        {/* Primary Shell Window */}
        <div
          onClick={focusInput}
          className="bg-[#05070a] border border-zinc-800 rounded-b-2xl p-4 font-mono shadow-2xl flex flex-col justify-between overflow-hidden cursor-text select-text transition-all"
          style={{ height: isFullscreen ? 'calc(100vh - 220px)' : '520px', fontSize: `${fontSize}px` }}
        >
          {/* Logs Stream Container */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {activeTab.lines.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-all leading-relaxed text-zinc-300">
                {renderAnsiLine(line)}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive Shell Prompt Line */}
          <div className="mt-3 pt-3 border-t border-zinc-900/90 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(inputCommand);
              }}
              className="flex items-center gap-2"
            >
              {currentOs === 'windows' ? (
                <>
                  <span className="text-sky-400 font-bold shrink-0 text-xs sm:text-sm">
                    PS C:\DevDeck\workspace&gt;
                  </span>
                </>
              ) : currentOs === 'iso_live' ? (
                <>
                  <span className="text-amber-400 font-bold shrink-0 text-xs sm:text-sm">
                    root@devdeck-live-cde:
                  </span>
                  <span className="text-yellow-400 font-semibold shrink-0 text-xs sm:text-sm">
                    {activeTab.cwd || '/root/live-cde'}#
                  </span>
                </>
              ) : currentOs === 'freebsd' || currentOs === 'bsd' ? (
                <>
                  <span className="text-red-400 font-bold shrink-0 text-xs sm:text-sm">
                    root@freebsd-node:
                  </span>
                  <span className="text-amber-400 font-semibold shrink-0 text-xs sm:text-sm">
                    {activeTab.cwd || '/usr/home/brev'} #
                  </span>
                </>
              ) : currentOs === 'macos' ? (
                <>
                  <span className="text-blue-400 font-bold shrink-0 text-xs sm:text-sm">
                    developer@macbook-pro:
                  </span>
                  <span className="text-cyan-400 font-semibold shrink-0 text-xs sm:text-sm">
                    {activeTab.cwd || '~/Developer/workspace'} %
                  </span>
                </>
              ) : (
                <>
                  <span className="text-emerald-400 font-bold shrink-0 text-xs sm:text-sm">
                    brev@{currentInstance.name || 'node'}:
                  </span>
                  <span className="text-blue-400 font-semibold shrink-0 text-xs sm:text-sm">
                    {activeTab.cwd || '~/workspace'}$
                  </span>
                </>
              )}
              <input
                ref={inputRef}
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={activeTab.isRunning}
                placeholder={
                  activeTab.isRunning
                    ? 'Executing command...'
                    : currentOs === 'windows'
                    ? 'PowerShell command (e.g. Get-Process, wsl -l -v, Get-Service, winget, dir)...'
                    : currentOs === 'iso_live'
                    ? 'Alpine RAM disk command (e.g. ramdisk, apk info, wg show, dmesg, setup-alpine)...'
                    : currentOs === 'freebsd' || currentOs === 'bsd'
                    ? 'FreeBSD tcsh command (e.g. pkg info, zpool status, jls, neofetch)...'
                    : currentOs === 'macos'
                    ? 'macOS zsh prompt (e.g. brew, sw_vers, neofetch, sysctl, diskutil)...'
                    : 'Linux bash prompt (e.g. apt, nvidia-smi, docker ps, ollama run, help)...'
                }
                className="flex-1 bg-transparent text-zinc-100 font-mono focus:outline-none placeholder-zinc-600 text-xs sm:text-sm py-1"
                autoFocus
              />
              {activeTab.isRunning ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Running...
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={!inputCommand.trim()}
                  title="Execute command (Enter)"
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Run</span>
                </button>
              )}
            </form>

            {/* In-Terminal Clickable Quick Suggestions Tailored to Active OS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-600 shrink-0 text-[10px] uppercase font-sans font-medium">Suggestions:</span>
              {(currentOs === 'macos'
                ? [
                    'neofetch',
                    'sw_vers',
                    'brew',
                    'sysctl',
                    'diskutil',
                    'defaults',
                    'uname',
                    'whoami',
                    'ls -la',
                    'clear',
                  ]
                : currentOs === 'bsd'
                ? [
                    'neofetch',
                    'pkg',
                    'zpool status',
                    'jls',
                    'kldstat',
                    'sysctl',
                    'uname',
                    'whoami',
                    'df -h',
                    'clear',
                  ]
                : [
                    'help',
                    'nvidia-smi',
                    'python test_cuda.py',
                    'ollama run deepseek-r1',
                    'docker ps',
                    'apt',
                    'pnpm dev',
                    'neofetch',
                    'ls -la',
                    'git status',
                    'tailscale status',
                    'clear',
                  ]
              ).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => {
                    setInputCommand(cmd);
                    executeCommand(cmd);
                  }}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded border border-zinc-800 hover:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Secondary Split Pane: Real-Time Telemetry & GPU Matrix */}
        {isSplitView && (
          <div
            className="bg-[#05070a] border border-zinc-800 rounded-2xl p-4 font-mono shadow-2xl flex flex-col justify-between overflow-hidden"
            style={{ height: isFullscreen ? 'calc(100vh - 220px)' : '520px', fontSize: `${fontSize}px` }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Flame className="w-4 h-4 text-blue-400" />
                <span>NVIDIA Telemetry Matrix — {currentInstance.hardware.gpuModel || currentInstance.hardware.tier}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live 1s Refresh
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 text-xs">
              {/* VRAM Progress */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Hopper HBM3 VRAM Memory</span>
                  <span className="text-zinc-100 font-bold">58.34 GB / 80.00 GB (73%)</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 w-[73%] rounded-full" />
                </div>
              </div>

              {/* Hardware Telemetry 4-Col Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-500">GPU Core Util</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">76%</div>
                </div>
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-500">Hopper Temp</div>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">44°C</div>
                </div>
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-500">Power Draw</div>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">340W / 700W</div>
                </div>
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-500">PCIe / NVLink Rx</div>
                  <div className="text-blue-400 font-bold text-sm mt-0.5">840 GB/s</div>
                </div>
              </div>

              {/* Live Compute Process List */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Active Compute Jobs
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-zinc-200">python3 train_lora.py (PID 4192)</span>
                    <span className="text-blue-400 font-mono">48.2 GB VRAM</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-zinc-200">vLLM Inference Server (PID 5820)</span>
                    <span className="text-cyan-400 font-mono">6.2 GB VRAM</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-zinc-200">Ollama Runner (PID 6410)</span>
                    <span className="text-blue-400 font-mono">3.9 GB VRAM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Driver: 550.54.14 • CUDA: 12.4</span>
              <span>NVLink Bandwidth: 900 GB/s</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Terminal Quick Helper Card */}
      <div className="bg-[#0e121a] border border-zinc-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Connected via secure Ed25519 encrypted tunnel to <strong className="text-zinc-200">{currentInstance.ip || '34.120.48.192'}</strong>.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span><kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300">Ctrl+C</kbd> Interrupt</span>
          <span><kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300">Ctrl+L</kbd> Clear</span>
          <span><kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300">↑ / ↓</kbd> History</span>
        </div>
      </div>
    </div>
  );
};
