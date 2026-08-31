export type ProjectCategory = 
  | 'web' 
  | 'backend' 
  | 'ai' 
  | 'mobile' 
  | 'fullstack' 
  | 'library' 
  | 'cli' 
  | 'infra' 
  | 'tool'
  | 'swift-app'
  | 'swift-server';

export type ProjectStatus = 
  | 'active' 
  | 'in_progress' 
  | 'review' 
  | 'shipped' 
  | 'paused' 
  | 'archived';

export type ProjectPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  tag?: string;
  dueDate?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
}

export interface ProjectScript {
  id: string;
  label: string;
  command: string;
  category?: 'dev' | 'build' | 'test' | 'deploy' | 'db' | 'docker';
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  localPath: string;
  githubUrl: string;
  defaultBranch?: string;
  liveUrl?: string;
  docsUrl?: string;
  localPort?: number;
  tags?: string[];
  techStack: string[];
  aiStack: string[];
  vscodeWorkspace?: string;
  workspaceType?: 'folder' | 'code-workspace' | 'multi-root';
  workspaceFile?: string;
  linkedFolders?: string[];
  githubStars?: number;
  githubForks?: number;
  githubOpenIssues?: number;
  githubLastCommit?: {
    message: string;
    author: string;
    date: string;
    sha: string;
  };
  envVariables: EnvVariable[];
  scripts: ProjectScript[];
  tasks: ProjectTask[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  isStarred: boolean;
  lastOpenedAt?: string;
  color?: string;
}

export interface GitHubAccountInfo {
  username: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  html_url?: string;
  token?: string;
  connectedAt?: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  default_branch: string;
  pushed_at: string;
  updated_at: string;
  private: boolean;
  lastCommit?: {
    message: string;
    author: string;
    date: string;
    sha: string;
  };
}

export interface AIPrompt {
  id: string;
  title: string;
  category: 'architecture' | 'coding' | 'refactor' | 'review' | 'testing' | 'documentation' | 'debugging' | 'security';
  modelTarget: string;
  systemPrompt: string;
  userTemplate: string;
  tags: string[];
  isFavorite: boolean;
  variables: string[];
}

export interface DevSnippet {
  id: string;
  title: string;
  category: 'swift' | 'macos' | 'git' | 'docker' | 'npm' | 'vscode' | 'terminal' | 'database' | 'ai' | 'port' | 'ports' | 'python';
  code: string;
  command?: string;
  description: string;
  tags: string[];
  copyCount?: number;
}

export interface DevBookmark {
  id: string;
  title: string;
  url: string;
  category: 'ai' | 'docs' | 'cloud' | 'tools' | 'design' | 'git' | 'apis';
  description: string;
  iconName?: string;
  isPinned?: boolean;
}

export type DevResource = DevBookmark;

export interface CloudInstancePort {
  port: number;
  label: string;
  url: string;
  isPublic: boolean;
  protocol: 'http' | 'https' | 'ws' | 'tcp';
}

export interface CloudInstance {
  id: string;
  name: string;
  slug: string;
  type: 'gpu' | 'cpu';
  os?: 'linux' | 'windows' | 'freebsd' | 'iso_live' | 'macos';
  hardware: {
    tier: string;
    gpuModel?: string;
    vramGb?: number;
    vcpu: number;
    ramGb: number;
    diskGb: number;
  };
  status: 'running' | 'idle' | 'starting' | 'stopped' | 'building';
  ip: string;
  region: string;
  sshCommand: string;
  vscodeWebUrl: string;
  vscodeDesktopUrl: string;
  cursorUrl: string;
  gitRepoUrl: string;
  gitBranch: string;
  ports: CloudInstancePort[];
  telemetry: {
    cpuPct: number;
    ramPct: number;
    vramPct?: number;
    diskPct: number;
    uptime: string;
  };
  autoStopMinutes: number;
  costPerHour: number;
  createdAt: string;
}

export interface PortEntry {
  id: string;
  port: number;
  projectId?: string;
  projectName?: string;
  serviceName?: string;
  status?: 'running' | 'idle' | 'reserved';
  protocol?: 'http' | 'https' | 'ws' | 'tcp';
  notes?: string;
}

export type DeviceType = 'laptop' | 'desktop' | 'server' | 'phone_ios' | 'phone_android' | 'tablet';
export type DeviceOS = 'macos' | 'windows' | 'linux' | 'freebsd' | 'iso_live' | 'ios' | 'android' | 'ipados';
export type ConnectionProtocol = 'tailscale' | 'ssh' | 'vscode_tunnel' | 'wireguard' | 'lan_bridge' | 'cloudflare_tunnel';

export interface DeviceService {
  name: string;
  port: number;
  url: string;
  type: 'dev_server' | 'expo_metro' | 'ssh' | 'api' | 'adb_debug' | 'ollama' | 'jail' | 'wsl';
  status: 'running' | 'idle' | 'stopped';
}

export interface RemoteDevice {
  id: string;
  name: string;
  type: DeviceType;
  os: DeviceOS;
  status: 'online' | 'busy' | 'offline' | 'pairing' | 'idle';
  ipOrHost: string;
  localLanIp?: string;
  protocol: ConnectionProtocol;
  tailscaleIp?: string;
  sshPort?: number;
  sshUser?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  modelName: string;
  screenResolution?: string;
  lastActive: string;
  qrPairingCode?: string;
  pinCode?: string;
  tunnelUrl?: string;
  activeServices: DeviceService[];
  pairedAt: string;
  latencyMs?: number;
  tags: string[];
}

export interface P2PClipItem {
  id: string;
  senderDeviceId: string;
  senderDeviceName: string;
  targetDeviceId: string;
  contentType: 'text' | 'url' | 'token' | 'env_snippet' | 'file_link';
  content: string;
  timestamp: string;
  isCopied?: boolean;
}

export type ViewMode = 
  | 'instances'
  | 'devices'
  | 'projects' 
  | 'workflows'
  | 'terminal'
  | 'pipelines'
  | 'ports'
  | 'env-vault'
  | 'api-manager'
  | 'credential-clipboard'
  | 'git-workbench'
  | 'team'
  | 'vscode-env' 
  | 'kanban'
  | 'observability'
  | 'cost-optimizer'
  | 'mesh-topology'
  | 'mesh-storage'
  | 'database-studio'
  | 'iac-generator'
  | 'pair-programming'
  | 'ai-studio'
  | 'ai-hub' 
  | 'github' 
  | 'snippets' 
  | 'bookmarks'
  | 'resources' 
  | 'stats'
  | 'settings';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: 'Fullstack Architect' | 'AI Engineer' | 'Frontend Specialist' | 'Backend Engineer' | 'DevOps / SRE' | 'Tech Lead';
  bio?: string;
  company?: string;
  githubUsername?: string;
  token?: string;
  createdAt: string;
  lastLoginAt: string;
  themePreference?: 'dark-studio' | 'cyber-midnight' | 'monokai' | 'zinc-minimal' | 'light-studio';
}

export interface AuthCredentials {
  email: string;
  password?: string;
  name?: string;
  role?: string;
}

export interface ApiSettings {
  geminiApiKey: string;
  geminiModel: 'gemini-3.7-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash';
  geminiTemperature: number;
  geminiCustomInstructions: string;
  githubToken: string;
  githubDefaultUsername: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  anthropicApiKey: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  webhookUrl: string;
}

export interface EditorSettings {
  defaultEditor: 'vscode' | 'cursor' | 'vscodium' | 'sublime' | 'webstorm' | 'custom';
  customScheme: string;
  defaultBasePath: string;
  defaultShell: 'bash' | 'zsh' | 'fish' | 'powershell';
  openInNewWindow: boolean;
}

export type ThemeId =
  | 'dark-studio'
  | 'macos-liquid-dark'
  | 'macos-liquid-light'
  | 'macos-sequoia-aurora'
  | 'visionos-glass'
  | 'tokyo-night'
  | 'catppuccin-mocha'
  | 'dracula-pro'
  | 'nord-aurora'
  | 'github-dark'
  | 'monokai-graphite'
  | 'one-dark-pro'
  | 'gruvbox-dark'
  | 'solarized-dark'
  | 'rose-pine'
  | 'material-ocean'
  | 'jetbrains-darcula'
  | 'obsidian-minimal'
  | 'vercel-midnight'
  | 'linear-dark'
  | 'supabase-forest'
  | 'cobalt-pulse'
  | 'cyber-midnight'
  | 'cyberpunk-neon'
  | 'synthwave-84'
  | 'hacker-matrix'
  | 'oled-stealth'
  | 'midnight-ruby'
  | 'deep-amethyst'
  | 'zinc-minimal'
  | 'clean-light'
  | 'paper-minimal'
  | 'tokyo-light'
  | 'nord-frost-light'
  | 'alabaster-clean'
  | 'solarized-light'
  | 'pastel-blossom'
  | 'gruvbox-light';

export type FontOption = 'sans' | 'mono' | 'fira' | 'inter' | 'serif';
export type RadiusOption = 'sharp' | 'sleek' | 'modern' | 'smooth' | 'pill';
export type BorderStyleOption = 'subtle' | 'high-contrast' | 'dashed' | 'none' | 'liquid-glass';
export type BgPatternOption = 'clean' | 'dots' | 'grid' | 'crosshair' | 'liquid-mesh' | 'macos-aurora';

export interface UIThemeDefinition {
  id: ThemeId;
  name: string;
  category: 'dark' | 'cyber' | 'light' | 'retro' | 'minimal' | 'glass';
  description: string;
  accentColor: string;
  bgHex: string;
  cardHex: string;
  borderHex: string;
  textHex: string;
  previewGradient: string;
  classes: {
    bg: string;
    card: string;
    cardHover: string;
    border: string;
    text: string;
    textMuted: string;
    accentBg: string;
    accentText: string;
    accentBorder: string;
  };
}

export interface UiSettings {
  theme: ThemeId;
  density: 'comfortable' | 'compact' | 'spacious';
  fontFamily?: FontOption;
  radius?: RadiusOption;
  borderStyle?: BorderStyleOption;
  bgPattern?: BgPatternOption;
  confettiEnabled: boolean;
  autoSaveIntervalSec: number;
  showSystemMetrics: boolean;
}

export interface AppSettings {
  api: ApiSettings;
  editor: EditorSettings;
  ui: UiSettings;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface ToastState {
  isVisible: boolean;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

// CI/CD Pipeline Interfaces
export type PipelineStatus = 'passed' | 'failed' | 'running' | 'queued' | 'canceled';
export type PipelineTrigger = 'push' | 'pull_request' | 'manual' | 'webhook' | 'schedule';

export interface PipelineStep {
  id: string;
  name: string;
  status: PipelineStatus;
  durationSec: number;
  logs: string[];
  exitCode?: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: PipelineStatus;
  steps: PipelineStep[];
}

export interface PipelineRun {
  id: string;
  projectName: string;
  projectId?: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  authorAvatar?: string;
  branch: string;
  trigger: PipelineTrigger;
  status: PipelineStatus;
  startedAt: string;
  finishedAt?: string;
  durationSec: number;
  environment: 'production' | 'staging-gpu-cluster' | 'preview-pr' | 'dev-sandbox';
  stages: PipelineStage[];
  artifactUrl?: string;
  dockerImageTag?: string;
}

// Team Workspaces, RBAC & Cloud Connectors
export type TeamRole = 'Owner' | 'Staff AI Engineer' | 'DevOps / SRE' | 'Fullstack Dev' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: TeamRole;
  gpuQuotaHoursPerMonth: number;
  gpuHoursUsed: number;
  activeInstancesCount: number;
  joinedAt: string;
  status: 'active' | 'invited' | 'suspended';
}

export interface OrganizationWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: 'Enterprise GPU Scale' | 'Pro CDE' | 'Starter';
  monthlyBudgetUsd: number;
  currentSpendUsd: number;
  membersCount: number;
  gpuClustersCount: number;
  defaultRegion: string;
}

export interface CloudProviderConnector {
  id: string;
  provider: 'aws' | 'gcp' | 'runpod' | 'lambda' | 'brev' | 'digitalocean' | 'cloudflare';
  name: string;
  accountOrProjectId: string;
  authMethod: 'api_key' | 'service_account' | 'iam_role' | 'oauth_token';
  status: 'connected' | 'error' | 'pending';
  lastSyncedAt: string;
  availableGpuQuota: string;
  activeNodes: number;
  maskedSecretKey: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  target: string;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'warning' | 'denied';
}

// Workflow Automation Engine Interfaces
export type WorkflowActionType =
  | 'trigger_pipeline'
  | 'run_tests'
  | 'deploy'
  | 'run_script'
  | 'http_request'
  | 'ai_review'
  | 'provision_instance'
  | 'notify_team';

export type StepCondition = 'always' | 'if_passed' | 'if_failed';

export interface WorkflowActionStepConfig {
  targetProject?: string;
  targetEnvironment?: 'production' | 'staging-gpu-cluster' | 'preview-pr' | 'dev-sandbox';
  branch?: string;
  pipelineId?: string;
  command?: string;
  testRunner?: 'vitest' | 'jest' | 'pytest' | 'cargo' | 'playwright';
  testSuitePath?: string;
  httpUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  httpHeaders?: Record<string, string>;
  httpBody?: string;
  condition?: StepCondition;
  instanceTier?: string;
  timeoutSec?: number;
  retryCount?: number;
  description?: string;
}

export interface WorkflowActionStep {
  id: string;
  name: string;
  type: WorkflowActionType;
  config: WorkflowActionStepConfig;
  status?: 'idle' | 'running' | 'passed' | 'failed' | 'skipped';
  durationSec?: number;
  outputLogs?: string[];
}

export type WorkflowTriggerType =
  | 'manual'
  | 'command_palette'
  | 'webhook'
  | 'git_push'
  | 'cron_schedule'
  | 'pipeline_finished';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  trigger: WorkflowTriggerType;
  cronSchedule?: string;
  webhookToken?: string;
  actions: WorkflowActionStep[];
  isStarred?: boolean;
  tags: string[];
  lastRunAt?: string;
  lastRunStatus?: 'passed' | 'failed' | 'running' | 'idle';
  lastRunDurationSec?: number;
  totalRuns: number;
  successRatePct: number;
  createdAt: string;
  updatedAt: string;
}

export interface StepExecutionResult {
  stepId: string;
  stepName: string;
  type: WorkflowActionType;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  durationSec: number;
  logs: string[];
  exitCode?: number;
  outputDetails?: string;
}

export interface WorkflowExecutionRun {
  id: string;
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'passed' | 'failed' | 'cancelled';
  durationSec: number;
  stepResults: StepExecutionResult[];
  currentStepIndex: number;
  error?: string;
}

export interface MeshStorageFile {
  id: string;
  name: string;
  sizeBytes: number;
  type: 'file' | 'folder';
  mimeType?: string;
  uploadedBy: string; // Device ID or user name
  uploadedAt: string;
  accessControl: {
    type: 'public' | 'private' | 'restricted';
    allowedIps: string[];
    allowedEmails: string[];
  };
  storageLocation: 'local_network' | 'cloud_relay';
  syncStatus: 'synced' | 'syncing' | 'offline';
  tags: string[];
}



