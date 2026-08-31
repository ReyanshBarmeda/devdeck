import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  FileCode,
  Layers,
  Search,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface EnvVariable {
  id: string;
  key: string;
  devValue: string;
  stagingValue: string;
  prodValue: string;
  isSecret: boolean;
  category: 'AI & LLM' | 'Database' | 'Auth & Security' | 'Storage' | 'App Config';
  description?: string;
}

const DEFAULT_ENV_VARS: EnvVariable[] = [
  {
    id: 'env_1',
    key: 'GEMINI_API_KEY',
    devValue: 'AIzaSyD_dev_991823sample_preview',
    stagingValue: 'AIzaSyD_staging_442109secure',
    prodValue: 'AIzaSyD_prod_883102enterprise',
    isSecret: true,
    category: 'AI & LLM',
    description: 'Google GenAI SDK server-side master access key',
  },
  {
    id: 'env_2',
    key: 'DATABASE_URL',
    devValue: 'postgresql://postgres:postgres@localhost:5432/devdeck_local',
    stagingValue: 'postgresql://app:stag_pwd@staging-db.internal:5432/devdeck',
    prodValue: 'postgresql://app:prod_pwd_secret@cloudsql-prod:5432/devdeck_master',
    isSecret: true,
    category: 'Database',
    description: 'PostgreSQL connection pool URI with credentials',
  },
  {
    id: 'env_3',
    key: 'JWT_SIGNING_SECRET',
    devValue: 'dev_insecure_jwt_local_signing_secret_key_32bytes',
    stagingValue: 'stag_77b319a840e6c51082c918240f6b3e9a',
    prodValue: 'prod_9f81a7b2c3d4e5f60718293a4b5c6d7e',
    isSecret: true,
    category: 'Auth & Security',
    description: 'HMAC-SHA256 signing secret for session tokens',
  },
  {
    id: 'env_4',
    key: 'PORT',
    devValue: '3000',
    stagingValue: '3000',
    prodValue: '3000',
    isSecret: false,
    category: 'App Config',
    description: 'Reverse proxy container ingress binding port',
  },
  {
    id: 'env_5',
    key: 'CORS_ALLOWED_ORIGINS',
    devValue: 'http://localhost:3000,http://127.0.0.1:3000',
    stagingValue: 'https://staging.devdeck.io',
    prodValue: 'https://devdeck.io,https://app.devdeck.io',
    isSecret: false,
    category: 'Auth & Security',
    description: 'Whitelisted web origins for API middleware',
  },
  {
    id: 'env_6',
    key: 'REDIS_CACHE_URL',
    devValue: 'redis://localhost:6379',
    stagingValue: 'redis://redis-staging.internal:6379',
    prodValue: 'redis://:prod_redis_pass@redis-prod.internal:6379',
    isSecret: true,
    category: 'Storage',
    description: 'In-memory cache & rate limiter socket',
  },
];

export const EnvVaultView: React.FC = () => {
  const [envVars, setEnvVars] = useState<EnvVariable[]>(DEFAULT_ENV_VARS);
  const [selectedEnv, setSelectedEnv] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [showAllSecrets, setShowAllSecrets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // New Env Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<EnvVariable['category']>('AI & LLM');
  const [newIsSecret, setNewIsSecret] = useState(true);

  // Filtered list
  const filteredVars = envVars.filter((v) => {
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.key.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const maskValue = (val: string) => {
    if (val.length <= 8) return '••••••••••••';
    return `${val.substring(0, 4)}••••••••${val.substring(val.length - 4)}`;
  };

  const handleCreateVar = () => {
    if (!newKey.trim()) return;
    const item: EnvVariable = {
      id: `env_${Date.now()}`,
      key: newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
      devValue: newValue,
      stagingValue: newValue,
      prodValue: newValue,
      isSecret: newIsSecret,
      category: newCategory,
      description: 'Custom added environment variable',
    };
    setEnvVars([...envVars, item]);
    setNewKey('');
    setNewValue('');
    setIsAddingNew(false);
  };

  const handleDeleteVar = (id: string) => {
    setEnvVars(envVars.filter((v) => v.id !== id));
  };

  const handleUpdateValue = (id: string, value: string) => {
    setEnvVars(
      envVars.map((v) => {
        if (v.id !== id) return v;
        if (selectedEnv === 'dev') return { ...v, devValue: value };
        if (selectedEnv === 'staging') return { ...v, stagingValue: value };
        return { ...v, prodValue: value };
      })
    );
  };

  // Exporters
  const generateDotEnv = (targetEnv: 'dev' | 'staging' | 'prod') => {
    return envVars
      .map((v) => {
        const val = targetEnv === 'dev' ? v.devValue : targetEnv === 'staging' ? v.stagingValue : v.prodValue;
        return `${v.key}=${val}`;
      })
      .join('\n');
  };

  const generateDotEnvExample = () => {
    return envVars
      .map((v) => {
        return `# ${v.description || v.category}\n${v.key}=`;
      })
      .join('\n\n');
  };

  const generateDockerCompose = () => {
    const list = envVars
      .map((v) => `      - ${v.key}=\${${v.key}}`)
      .join('\n');
    return `services:\n  app:\n    environment:\n${list}`;
  };

  const copyToClipboard = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0e121a]/80 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Environment Secrets Vault
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                .env Manager
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Encrypted variable management, multi-environment synchronization, and audit exporter
            </p>
          </div>
        </div>

        {/* Quick Exporters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => copyToClipboard(generateDotEnv(selectedEnv), '.env')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedFormat === '.env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Export .env</span>
          </button>

          <button
            onClick={() => copyToClipboard(generateDotEnvExample(), '.env.example')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedFormat === '.env.example' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>.env.example</span>
          </button>

          <button
            onClick={() => copyToClipboard(generateDockerCompose(), 'docker')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedFormat === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
            <span>Docker YAML</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Environment Switcher & Security Toggles */}
      <div className="bg-[#0b0e14]/90 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Environment Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setSelectedEnv('dev')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedEnv === 'dev'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Development (.env.local)
          </button>
          <button
            onClick={() => setSelectedEnv('staging')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedEnv === 'staging'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staging
          </button>
          <button
            onClick={() => setSelectedEnv('prod')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedEnv === 'prod'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Production
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secret key..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          <button
            onClick={() => setShowAllSecrets(!showAllSecrets)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            {showAllSecrets ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAllSecrets ? 'Mask All' : 'Reveal All'}</span>
          </button>

          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variable</span>
          </button>
        </div>
      </div>

      {/* Inline Add New Variable Modal / Form */}
      {isAddingNew && (
        <div className="bg-[#121620] border border-blue-500/30 p-4 rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">New Environment Variable</h3>
            <button onClick={() => setIsAddingNew(false)} className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="KEY_NAME (e.g. STRIPE_SECRET_KEY)"
              className="bg-black/50 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value..."
              className="bg-black/50 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="flex-1 bg-black/50 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="AI & LLM">AI & LLM</option>
                <option value="Database">Database</option>
                <option value="Auth & Security">Auth & Security</option>
                <option value="Storage">Storage</option>
                <option value="App Config">App Config</option>
              </select>
              <button
                onClick={handleCreateVar}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variables Table */}
      <div className="bg-[#0b0e14]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">Variable Key</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Value ({selectedEnv})</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredVars.map((v) => {
                const currentVal =
                  selectedEnv === 'dev'
                    ? v.devValue
                    : selectedEnv === 'staging'
                    ? v.stagingValue
                    : v.prodValue;

                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Key & Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                        <span>{v.key}</span>
                      </div>
                      {v.description && (
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">{v.description}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                        {v.category}
                      </span>
                    </td>

                    {/* Value Field (Masked or Unmasked) */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={v.isSecret && !showAllSecrets ? maskValue(currentVal) : currentVal}
                          onChange={(e) => handleUpdateValue(v.id, e.target.value)}
                          readOnly={v.isSecret && !showAllSecrets}
                          className="w-full bg-black/40 border border-white/[0.08] focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentVal);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 cursor-pointer"
                          title="Copy raw value"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVar(v.id)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete variable"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
