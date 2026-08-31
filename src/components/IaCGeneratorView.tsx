import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  FolderGit2,
  Box,
  CheckCircle2,
  Share2,
  Flame,
  Code2,
} from 'lucide-react';

type FileFormat = 'devcontainer' | 'dockerfile' | 'compose' | 'terraform' | 'devdeck_yaml';
type StackType = 'pytorch_cuda' | 'node_fullstack' | 'rust_systems' | 'go_microservices';

export const IaCGeneratorView: React.FC<{
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}> = ({ onShowToast }) => {
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('devcontainer');
  const [selectedStack, setSelectedStack] = useState<StackType>('pytorch_cuda');
  const [enableGpu, setEnableGpu] = useState(true);
  const [enableDockerInDocker, setEnableDockerInDocker] = useState(true);
  const [enableTailscale, setEnableTailscale] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate code based on configuration
  const generateCode = (): { filename: string; content: string } => {
    switch (selectedFormat) {
      case 'devcontainer':
        return {
          filename: '.devcontainer/devcontainer.json',
          content: JSON.stringify(
            {
              name: selectedStack === 'pytorch_cuda' ? 'DevDeck PyTorch CUDA CDE' : 'DevDeck Fullstack Workspace',
              image:
                selectedStack === 'pytorch_cuda'
                  ? 'nvcr.io/nvidia/pytorch:24.08-py3'
                  : selectedStack === 'rust_systems'
                  ? 'mcr.microsoft.com/devcontainers/rust:1-1-bullseye'
                  : 'mcr.microsoft.com/devcontainers/typescript-node:22-bookworm',
              runArgs: enableGpu ? ['--gpus', 'all', '--ipc=host', '--ulimit', 'memlock=-1'] : [],
              features: {
                ...(enableDockerInDocker ? { 'ghcr.io/devcontainers/features/docker-in-docker:2': {} } : {}),
                ...(enableTailscale ? { 'ghcr.io/tailscale/codespace/tailscale': {} } : {}),
                'ghcr.io/devcontainers/features/git:1': {},
                'ghcr.io/devcontainers/features/zsh-plugins:0': {},
              },
              customizations: {
                vscode: {
                  extensions: [
                    'ms-toolsai.jupyter',
                    'ms-python.python',
                    'ms-python.vscode-pylance',
                    'dbaeumer.vscode-eslint',
                    'esbenp.prettier-vscode',
                    'bradlc.vscode-tailwindcss',
                    'GitHub.copilot',
                  ],
                  settings: {
                    'terminal.integrated.defaultProfile.linux': 'zsh',
                    'python.defaultInterpreterPath': '/opt/conda/bin/python',
                    'editor.formatOnSave': true,
                  },
                },
              },
              forwardPorts: [3000, 8000, 8888, 11434],
              postCreateCommand:
                selectedStack === 'pytorch_cuda'
                  ? 'pip install --upgrade pip && pip install torch torchvision torchaudio flash-attn transformers accelerate trl'
                  : 'npm install',
            },
            null,
            2
          ),
        };

      case 'dockerfile':
        return {
          filename: 'Dockerfile',
          content:
            selectedStack === 'pytorch_cuda'
              ? `# DevDeck NVIDIA H100/A100 Optimized CDE Base
FROM nvcr.io/nvidia/pytorch:24.08-py3

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV CUDA_HOME=/usr/local/cuda

# Install System Utilities & Mesh Network
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl git zsh htop tmux nvtop net-tools openssh-server \\
    && rm -rf /var/lib/apt/lists/*

# Install Deep Learning Accelerators
RUN pip install --no-cache-dir \\
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124 \\
    && pip install --no-cache-dir flash-attn --no-build-isolation \\
    && pip install --no-cache-dir transformers datasets accelerate peft bitsandbytes vllm

WORKDIR /workspace
EXPOSE 8000 8888
CMD ["zsh"]`
              : `# DevDeck Modern TypeScript & Node 22 Workspace
FROM node:22-bookworm-slim

ENV NODE_ENV=development
RUN apt-get update && apt-get install -y --no-install-recommends \\
    git curl zsh procps net-tools \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000 5173
CMD ["npm", "run", "dev"]`,
        };

      case 'compose':
        return {
          filename: 'docker-compose.yml',
          content: `version: '3.9'

services:
  cde-workspace:
    build: .
    container_name: devdeck-workspace
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/devdeck_db
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/workspace:cached
      - devdeck_nvme_cache:/root/.cache
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: devdeck_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  devdeck_nvme_cache:
  pgdata:`,
        };

      case 'terraform':
        return {
          filename: 'main.tf',
          content: `# DevDeck H100 GPU Spot Node Provisioning Module
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_spot_instance_request" "gpu_h100_cluster" {
  ami           = "ami-0c7217cdde317cfec" # Deep Learning OSS Nvidia Driver AMI
  instance_type = "p5.48xlarge"
  spot_price    = "2.89"
  wait_for_fulfillment = true

  root_block_device {
    volume_size           = 1200 # 1.2TB NVMe
    volume_type           = "gp3"
    iops                  = 16000
    throughput            = 1000
    delete_on_termination = true
  }

  tags = {
    Name        = "devdeck-h100-spot-worker"
    Environment = "cde-production"
  }
}

output "instance_public_ip" {
  value = aws_spot_instance_request.gpu_h100_cluster.public_ip
}`,
        };

      case 'devdeck_yaml':
        return {
          filename: 'devdeck.yaml',
          content: `version: "2026.1"
workspace:
  name: "llama-finetune-cluster"
  team: "Acme AI Labs"
  tier: "nvidia-h100-sxm5"
  autoStopMinutes: 45
  spotFallback:
    enabled: true
    maxBudgetUsdPerHour: 3.50
    preferredProviders:
      - runpod
      - lambda
      - aws
  network:
    tailscalePeering: true
    exposePorts:
      - port: 8000
        public: true
        auth: true
      - port: 3000
        public: false
  storage:
    persistentNvmeGb: 1000`,
        };
    }
  };

  const currentFile = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    onShowToast('Copied to Clipboard', `Copied ${currentFile.filename}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename.split('/').pop() || 'config.txt';
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('File Downloaded', `Saved ${currentFile.filename}`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090c10] text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Infrastructure as Code (IaC) & DevContainer Generator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                Universal Reproducibility
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Generate standardized `.devcontainer.json`, `Dockerfile`, `docker-compose.yml`, and `main.tf` with 1 click
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {currentFile.filename.split('/').pop()}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="space-y-4">
          {/* Format Tabs */}
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Output Format
            </h2>
            <div className="space-y-1.5">
              {[
                { id: 'devcontainer', label: '.devcontainer.json', desc: 'VS Code & Cursor CDE Spec' },
                { id: 'dockerfile', label: 'Dockerfile', desc: 'CUDA & Multi-arch Container' },
                { id: 'compose', label: 'docker-compose.yml', desc: 'Fullstack Multi-service Stack' },
                { id: 'terraform', label: 'main.tf (Terraform)', desc: 'Cloud GPU Spot Provisioning' },
                { id: 'devdeck_yaml', label: 'devdeck.yaml', desc: 'DevDeck Declarative Spec' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id as FileFormat)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedFormat === fmt.id
                      ? 'bg-blue-600/15 border-blue-500/50 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-mono text-xs font-bold block">{fmt.label}</span>
                    <span className="text-[10px] text-slate-500">{fmt.desc}</span>
                  </div>
                  {selectedFormat === fmt.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Runtime Stack Selection */}
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Primary Language Stack
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'pytorch_cuda', name: 'PyTorch (CUDA 12.4)', icon: Flame },
                { id: 'node_fullstack', name: 'Node 22 (TypeScript)', icon: Code2 },
                { id: 'rust_systems', name: 'Rust (Cargo/Tokio)', icon: Cpu },
                { id: 'go_microservices', name: 'Go 1.23 (Gin/gRPC)', icon: Zap },
              ].map((stk) => {
                const Icon = stk.icon;
                return (
                  <button
                    key={stk.id}
                    onClick={() => setSelectedStack(stk.id as StackType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedStack === stk.id
                        ? 'bg-blue-950/30 border-blue-500/50 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="font-bold text-[11px]">{stk.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Advanced Integrations
            </h2>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04] cursor-pointer">
                <span>NVIDIA GPU Container Toolkit</span>
                <input
                  type="checkbox"
                  checked={enableGpu}
                  onChange={(e) => setEnableGpu(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04] cursor-pointer">
                <span>Docker-in-Docker (DinD)</span>
                <input
                  type="checkbox"
                  checked={enableDockerInDocker}
                  onChange={(e) => setEnableDockerInDocker(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04] cursor-pointer">
                <span>Tailscale Encrypted Mesh</span>
                <input
                  type="checkbox"
                  checked={enableTailscale}
                  onChange={(e) => setEnableTailscale(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl bg-[#06080c] border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-[#0d1017] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <FileCode2 className="w-4 h-4 text-blue-400" />
              <span>{currentFile.filename}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {currentFile.content.split('\n').length} lines
            </span>
          </div>

          <pre className="p-5 overflow-auto font-mono text-xs text-emerald-300 leading-relaxed flex-1 select-text">
            {currentFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
