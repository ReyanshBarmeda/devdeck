import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Filter,
  Grid,
  List,
  Sparkles,
  FolderGit2,
  Code2,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  Project,
  AIPrompt,
  DevSnippet,
  DevBookmark,
  ViewMode,
  ProjectCategory,
  ProjectStatus,
  ProjectPriority,
  ToastState,
  UserProfile,
  AppSettings,
  PipelineRun,
  TeamMember,
  OrganizationWorkspace,
  CloudProviderConnector,
  AuditLogEntry,
  TeamRole,
  Workflow,
  WorkflowExecutionRun,
} from './types';
import {
  DEFAULT_PROJECTS,
  DEFAULT_PROMPTS,
  DEFAULT_SNIPPETS,
  DEFAULT_BOOKMARKS,
} from './data/defaultData';
import { DEFAULT_SETTINGS, DEMO_USERS } from './data/settingsData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { AIStudioView } from './components/AIStudioView';
import { VSCodeEnvView } from './components/VSCodeEnvView';
import { GitHubView } from './components/GitHubView';
import { SnippetsView } from './components/SnippetsView';
import { PortsView } from './components/PortsView';
import { BookmarksView } from './components/BookmarksView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { KanbanBoardView } from './components/KanbanBoardView';
import { ApiManagerView } from './components/ApiManagerView';
import { CredentialClipboardView } from './components/CredentialClipboardView';
import { EnvVaultView } from './components/EnvVaultView';
import { GitWorkbenchView } from './components/GitWorkbenchView';
import { CloudInstancesView } from './components/CloudInstancesView';
import { WebTerminalView } from './components/WebTerminalView';
import { RemoteDevicesView } from './components/RemoteDevicesView';
import { PipelinesView } from './components/PipelinesView';
import { WorkflowsView } from './components/WorkflowsView';
import { TeamWorkspaceView } from './components/TeamWorkspaceView';
import { BillingUsageModal } from './components/BillingUsageModal';
import { ObservabilityView } from './components/ObservabilityView';
import { CostOptimizerView } from './components/CostOptimizerView';
import { MeshTopologyView } from './components/MeshTopologyView';
import { IaCGeneratorView } from './components/IaCGeneratorView';
import { PairProgrammingView } from './components/PairProgrammingView';
import { MeshStorageView } from './components/MeshStorageView';
import { DatabaseStudioView } from './components/DatabaseStudioView';
import { DEFAULT_CLOUD_INSTANCES } from './data/defaultInstances';
import { DEFAULT_REMOTE_DEVICES } from './data/defaultDevices';
import { DEFAULT_PIPELINE_RUNS } from './data/defaultPipelines';
import { DEFAULT_WORKFLOWS, DEFAULT_WORKFLOW_RUNS } from './data/defaultWorkflows';
import { DEFAULT_MESH_FILES } from './data/defaultMeshStorage';
import {
  DEFAULT_WORKSPACE,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_CLOUD_CONNECTORS,
  DEFAULT_AUDIT_LOGS,
} from './data/defaultTeam';
import { THEME_DEFINITIONS } from './data/themesData';
import { Toast } from './components/Toast';
import { CloudInstance, RemoteDevice, MeshStorageFile } from './types';

export default function App() {
  // Persistence with localStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('devdeck_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    return DEFAULT_PROJECTS;
  });

  const [prompts, setPrompts] = useState<AIPrompt[]>(() => {
    const saved = localStorage.getItem('devdeck_prompts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved prompts', e);
      }
    }
    return DEFAULT_PROMPTS;
  });

  const [snippets, setSnippets] = useState<DevSnippet[]>(() => {
    const saved = localStorage.getItem('devdeck_snippets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved snippets', e);
      }
    }
    return DEFAULT_SNIPPETS;
  });

  const [bookmarks, setBookmarks] = useState<DevBookmark[]>(() => {
    const saved = localStorage.getItem('devdeck_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved bookmarks', e);
      }
    }
    return DEFAULT_BOOKMARKS;
  });

  // Cloud Instances (Brev.dev CDE) State
  const [instances, setInstances] = useState<CloudInstance[]>(() => {
    const saved = localStorage.getItem('devdeck_cloud_instances');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved instances', e);
      }
    }
    return DEFAULT_CLOUD_INSTANCES;
  });

  // Connected Devices (PCs, Laptops, Homelab, Phones) Mesh State
  const [devices, setDevices] = useState<RemoteDevice[]>(() => {
    const saved = localStorage.getItem('devdeck_remote_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved remote devices', e);
      }
    }
    return DEFAULT_REMOTE_DEVICES;
  });

  // Mesh Storage State
  const [meshFiles, setMeshFiles] = useState<MeshStorageFile[]>(() => {
    const saved = localStorage.getItem('devdeck_mesh_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved mesh files', e);
      }
    }
    return DEFAULT_MESH_FILES;
  });

  // CI/CD Pipelines State
  const [pipelines, setPipelines] = useState<PipelineRun[]>(() => {
    const saved = localStorage.getItem('devdeck_pipelines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved pipelines', e);
      }
    }
    return DEFAULT_PIPELINE_RUNS;
  });

  // Workflow Automation Engine State
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('devdeck_workflows');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved workflows', e);
      }
    }
    return DEFAULT_WORKFLOWS;
  });

  const [workflowRuns, setWorkflowRuns] = useState<WorkflowExecutionRun[]>(() => {
    const saved = localStorage.getItem('devdeck_workflow_runs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved workflow runs', e);
      }
    }
    return DEFAULT_WORKFLOW_RUNS;
  });

  // Team Workspaces, RBAC & Cloud Connectors State
  const [workspace, setWorkspace] = useState<OrganizationWorkspace>(() => {
    const saved = localStorage.getItem('devdeck_workspace');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved workspace', e);
      }
    }
    return DEFAULT_WORKSPACE;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('devdeck_team_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved team members', e);
      }
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  const [cloudConnectors, setCloudConnectors] = useState<CloudProviderConnector[]>(() => {
    const saved = localStorage.getItem('devdeck_cloud_connectors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved connectors', e);
      }
    }
    return DEFAULT_CLOUD_CONNECTORS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('devdeck_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved audit logs', e);
      }
    }
    return DEFAULT_AUDIT_LOGS;
  });

  const [selectedTerminalInstance, setSelectedTerminalInstance] = useState<CloudInstance | null>(
    DEFAULT_CLOUD_INSTANCES[0] || null
  );

  // User Profile & Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('devdeck_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEMO_USERS[0]; // Default to Reyansh Lead admin account
  });

  // Application Settings & API Configuration
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('devdeck_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('devdeck_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('devdeck_cloud_instances', JSON.stringify(instances));
  }, [instances]);

  useEffect(() => {
    localStorage.setItem('devdeck_prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('devdeck_snippets', JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
    localStorage.setItem('devdeck_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('devdeck_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('devdeck_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('devdeck_settings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-density', settings.ui.density);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('devdeck_remote_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('devdeck_pipelines', JSON.stringify(pipelines));
  }, [pipelines]);

  useEffect(() => {
    localStorage.setItem('devdeck_workspace', JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    localStorage.setItem('devdeck_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('devdeck_cloud_connectors', JSON.stringify(cloudConnectors));
  }, [cloudConnectors]);

  useEffect(() => {
    localStorage.setItem('devdeck_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('devdeck_workflows', JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem('devdeck_workflow_runs', JSON.stringify(workflowRuns));
  }, [workflowRuns]);

  useEffect(() => {
    localStorage.setItem('devdeck_mesh_files', JSON.stringify(meshFiles));
  }, [meshFiles]);

  // Mesh Storage Handlers
  const handleUploadMeshFile = (file: MeshStorageFile) => {
    setMeshFiles((prev) => [file, ...prev]);
  };

  const handleDeleteMeshFile = (fileId: string) => {
    setMeshFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Workflow Handlers
  const handleSaveWorkflow = (workflow: Workflow) => {
    setWorkflows((prev) => {
      const exists = prev.some((w) => w.id === workflow.id);
      if (exists) {
        return prev.map((w) => (w.id === workflow.id ? workflow : w));
      }
      return [workflow, ...prev];
    });
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleStarWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isStarred: !w.isStarred } : w))
    );
  };

  const handleAddWorkflowRun = (run: WorkflowExecutionRun) => {
    setWorkflowRuns((prev) => [run, ...prev.slice(0, 49)]);
  };

  const handleTriggerWorkflowFromPalette = (workflow: Workflow) => {
    setViewMode('workflows');
    showToast(
      'Executing Workflow Sequence',
      `Triggered "${workflow.name}" via Command Palette`,
      'info'
    );
  };

  // Pipeline Handlers
  const handleTriggerPipeline = (
    projectName: string,
    branch: string,
    environment: PipelineRun['environment']
  ) => {
    const newRun: PipelineRun = {
      id: `pipe-run-${Math.floor(100 + Math.random() * 900)}`,
      projectName,
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: `manual(dispatch): trigger ${projectName} on ${branch}`,
      author: currentUser?.name || 'Alex Rivera',
      authorAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      branch,
      trigger: 'manual',
      status: 'running',
      startedAt: new Date().toISOString(),
      durationSec: 14,
      environment,
      dockerImageTag: `ghcr.io/devdeck/${projectName.toLowerCase().replace(/\s+/g, '-')}:latest`,
      stages: [
        {
          id: 'stg-m-1',
          name: 'Lint & TypeCheck',
          status: 'passed',
          steps: [
            {
              id: 'st-m-1-1',
              name: 'ESLint and TypeScript check',
              status: 'passed',
              durationSec: 8,
              logs: ['✔ TypeCheck succeeded with 0 errors.'],
              exitCode: 0,
            },
          ],
        },
        {
          id: 'stg-m-2',
          name: 'CUDA 12.4 & Unit Benchmarks',
          status: 'running',
          steps: [
            {
              id: 'st-m-2-1',
              name: 'NVIDIA H100 TensorCore validation',
              status: 'running',
              durationSec: 6,
              logs: ['Compiling CUDA kernels and running batch benchmarks...'],
            },
          ],
        },
        {
          id: 'stg-m-3',
          name: 'Container Build & Push',
          status: 'queued',
          steps: [
            {
              id: 'st-m-3-1',
              name: 'Docker multi-stage build',
              status: 'queued',
              durationSec: 0,
              logs: ['Queued...'],
            },
          ],
        },
        {
          id: 'stg-m-4',
          name: 'Cluster Ingress Deploy',
          status: 'queued',
          steps: [
            {
              id: 'st-m-4-1',
              name: 'Rolling deployment',
              status: 'queued',
              durationSec: 0,
              logs: ['Queued...'],
            },
          ],
        },
      ],
    };

    setPipelines((prev) => [newRun, ...prev]);

    // Record audit log
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: currentUser?.name || 'Alex Rivera',
      actorEmail: currentUser?.email || 'alex.rivera@apex.ai',
      actorRole: 'Owner',
      action: 'TRIGGER_MANUAL_PIPELINE',
      target: `${projectName} (${branch})`,
      ipAddress: '192.168.1.104',
      timestamp: 'Just now',
      status: 'success',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleRollbackPipeline = (pipelineId: string) => {
    const targetRun = pipelines.find((p) => p.id === pipelineId);
    if (!targetRun) return;
    showToast(
      'Rollback Initiated',
      `Reverting deployment to commit #${targetRun.commitHash} (${targetRun.projectName})`,
      'warning'
    );
  };

  // Team & RBAC Handlers
  const handleUpdateMemberRole = (memberId: string, newRole: TeamRole) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    showToast('Role Updated', `Updated role to ${newRole}`, 'success');
  };

  const handleUpdateMemberQuota = (memberId: string, newQuota: number) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, gpuQuotaHoursPerMonth: newQuota } : m))
    );
  };

  const handleInviteMember = (
    name: string,
    email: string,
    role: TeamRole,
    quotaHours: number
  ) => {
    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name,
      email,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      role,
      gpuQuotaHoursPerMonth: quotaHours,
      gpuHoursUsed: 0,
      activeInstancesCount: 0,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };
    setTeamMembers((prev) => [...prev, newMember]);
  };

  const handleSyncConnector = (connectorId: string) => {
    setCloudConnectors((prev) =>
      prev.map((c) =>
        c.id === connectorId ? { ...c, lastSyncedAt: 'Just now', status: 'connected' } : c
      )
    );
    showToast('Quota Refreshed', 'Cloud provider API synchronized successfully.', 'success');
  };

  // Cloud Instance Handlers
  const handleUpdateInstance = (updated: CloudInstance) => {
    setInstances((prev) => prev.map((inst) => (inst.id === updated.id ? updated : inst)));
  };

  const handleCreateInstance = (newInstance: CloudInstance) => {
    setInstances((prev) => [newInstance, ...prev]);
    showToast('Workspace Provisioned', `Instance ${newInstance.name} is now booting in ${newInstance.region}.`, 'success');
  };

  const handleDeleteInstance = (instanceId: string) => {
    setInstances((prev) => prev.filter((inst) => inst.id !== instanceId));
    showToast('Instance Terminated', 'Cloud compute resources and volume unmounted.', 'info');
  };

  const handleConnectSSH = (instance: CloudInstance) => {
    setSelectedTerminalInstance(instance);
    setViewMode('terminal');
    showToast('SSH Session Active', `Attached to ${instance.name} (${instance.ip || 'localhost'})`, 'success');
  };

  // Connected Devices (PCs & Phones Mesh) Handlers
  const handleUpdateDevice = (updated: RemoteDevice) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleCreateDevice = (newDevice: RemoteDevice) => {
    setDevices((prev) => [newDevice, ...prev]);
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    showToast('Device Unpaired', 'Device removed from your DevDeck mesh network.', 'info');
  };

  const handleConnectDeviceSSH = (device: RemoteDevice) => {
    // Dynamically bridge device to terminal instance
    const syntheticInstance: CloudInstance = {
      id: device.id,
      name: device.name,
      slug: device.id,
      type: 'cpu',
      hardware: {
        tier: device.modelName,
        vcpu: 8,
        ramGb: 32,
        diskGb: 512,
      },
      status: 'running',
      ip: device.ipOrHost,
      region: device.protocol.toUpperCase(),
      sshCommand: `ssh ${device.sshUser || 'developer'}@${device.ipOrHost} -p ${device.sshPort || 22}`,
      vscodeWebUrl: device.tunnelUrl || `http://${device.ipOrHost}:3000`,
      vscodeDesktopUrl: `vscode://vscode-remote/ssh-remote+${device.sshUser || 'dev'}@${device.ipOrHost}`,
      cursorUrl: `cursor://vscode-remote/ssh-remote+${device.sshUser || 'dev'}@${device.ipOrHost}`,
      gitRepoUrl: 'https://github.com/developer/workspace',
      gitBranch: 'main',
      ports: device.activeServices.map((s) => ({
        port: s.port,
        label: s.name,
        url: s.url,
        isPublic: false,
        protocol: 'http',
      })),
      telemetry: {
        cpuPct: 18,
        ramPct: 42,
        diskPct: 55,
        uptime: '2d 14h',
      },
      autoStopMinutes: 0,
      costPerHour: 0,
      createdAt: device.pairedAt,
    };

    setSelectedTerminalInstance(syntheticInstance);
    setViewMode('terminal');
    showToast('SSH Session Active', `Connected to ${device.name} via ${device.protocol} (${device.ipOrHost})`, 'success');
  };

  // Auth & Settings Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed Out', 'You have been signed out of your DevDeck session.', 'info');
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleResetSampleData = () => {
    setProjects(DEFAULT_PROJECTS);
    setInstances(DEFAULT_CLOUD_INSTANCES);
    setPrompts(DEFAULT_PROMPTS);
    setSnippets(DEFAULT_SNIPPETS);
    setBookmarks(DEFAULT_BOOKMARKS);
    showToast('Workspace Reset', 'Sample cloud instances and repository catalogs restored.', 'success');
  };

  // Navigation & Filters - Default to Brev.dev Cloud Instances CDE
  const [viewMode, setViewMode] = useState<ViewMode>('instances');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);

  // Filters for Projects View
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'priority' | 'tasks'>('updated');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Modals & Overlay state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    title: '',
    description: '',
    type: 'info',
  });

  const showToast = (title: string, description?: string, type: ToastState['type'] = 'info') => {
    setToast({
      isVisible: true,
      title,
      description,
      type,
    });
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToast((prev) => (prev.title === title ? { ...prev, isVisible: false } : prev));
    }, 4000);
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setEditingProject(null);
        setIsFormOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (starredOnly && !project.isStarred) return false;
        const matchesCat = categoryFilter === 'all' || project.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          project.name.toLowerCase().includes(q) ||
          project.description.toLowerCase().includes(q) ||
          project.techStack.some((t) => t.toLowerCase().includes(q)) ||
          (project.aiStack && project.aiStack.some((a) => a.toLowerCase().includes(q))) ||
          (project.localPath && project.localPath.toLowerCase().includes(q)) ||
          project.tasks.some((t) => t.title.toLowerCase().includes(q));

        return matchesCat && matchesStatus && matchesPriority && matchesSearch;
      })
      .sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;

        if (sortBy === 'updated') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'priority') {
          const pOrder: Record<ProjectPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return pOrder[b.priority] - pOrder[a.priority];
        }
        if (sortBy === 'tasks') {
          return b.tasks.length - a.tasks.length;
        }
        return 0;
      });
  }, [projects, starredOnly, categoryFilter, statusFilter, priorityFilter, searchQuery, sortBy]);

  // Project CRUD Actions
  const handleSaveProject = (projectToSave: Project) => {
    const exists = projects.some((p) => p.id === projectToSave.id);
    if (exists) {
      setProjects(projects.map((p) => (p.id === projectToSave.id ? projectToSave : p)));
      showToast('Project Updated', projectToSave.name, 'success');
    } else {
      setProjects([projectToSave, ...projects]);
      showToast('Project Registered', projectToSave.name, 'success');
    }

    if (selectedProject?.id === projectToSave.id) {
      setSelectedProject(projectToSave);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    setProjects(projects.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setIsDetailOpen(false);
      setSelectedProject(null);
    }
    showToast('Project Removed', target?.name || 'Deleted from workspace', 'info');
  };

  const handleToggleStar = (projectId: string) => {
    setProjects(
      projects.map((p) => (p.id === projectId ? { ...p, isStarred: !p.isStarred } : p))
    );
  };

  const handleOpenDetail = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleEditFromCard = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleToggleTask = (projectId: string, taskId: string, completed: boolean) => {
    setProjects(
      projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleOpenAIArchitectForProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('ai-studio');
  };

  // AI Prompt CRUD
  const handleAddPrompt = (newPrompt: AIPrompt) => {
    setPrompts([newPrompt, ...prompts]);
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter((p) => p.id !== id));
    showToast('Prompt Removed', 'Deleted from prompt library', 'info');
  };

  const handleToggleFavoritePrompt = (id: string) => {
    setPrompts(
      prompts.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Snippets CRUD
  const handleAddSnippet = (newSnippet: DevSnippet) => {
    setSnippets([newSnippet, ...snippets]);
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets(snippets.filter((s) => s.id !== id));
    showToast('Snippet Removed', 'Deleted from terminal arsenal', 'info');
  };

  // Bookmarks CRUD
  const handleAddBookmark = (newBm: DevBookmark) => {
    setBookmarks([newBm, ...bookmarks]);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    showToast('Bookmark Removed', 'Deleted resource link', 'info');
  };

  // Export / Import
  const handleExportWorkspace = () => {
    const exportData = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      projects,
      prompts,
      snippets,
      bookmarks,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `devdeck_backup_${Date.now()}.json`);
    dlAnchorElem.click();
    showToast('Workspace Exported', 'Downloaded complete workspace JSON configuration', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.projects) setProjects(parsed.projects);
          if (parsed.prompts) setPrompts(parsed.prompts);
          if (parsed.snippets) setSnippets(parsed.snippets);
          if (parsed.bookmarks) setBookmarks(parsed.bookmarks);
          showToast('Workspace Restored', 'Imported all projects, AI prompts, and snippets', 'success');
        } catch (err) {
          showToast('Import Error', 'Invalid JSON backup format', 'error');
        }
      };
    }
  };

  // Quick category items for project filter toolbar
  const projectCategories: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'All Projects', count: projects.length },
    { id: 'ai', label: 'AI & Models', count: projects.filter((p) => p.category === 'ai').length },
    { id: 'web', label: 'Web Apps', count: projects.filter((p) => p.category === 'web').length },
    { id: 'fullstack', label: 'Full Stack', count: projects.filter((p) => p.category === 'fullstack').length },
    { id: 'backend', label: 'Backend APIs', count: projects.filter((p) => p.category === 'backend').length },
    { id: 'library', label: 'SDKs & Libs', count: projects.filter((p) => p.category === 'library').length },
    { id: 'cli', label: 'CLI Tools', count: projects.filter((p) => p.category === 'cli').length },
  ];

  const activeTheme = useMemo(() => {
    return THEME_DEFINITIONS.find((t) => t.id === settings.ui.theme) || THEME_DEFINITIONS[0];
  }, [settings.ui.theme]);

  // Synchronize CSS custom variables and theme attributes to the HTML document
  useEffect(() => {
    const root = document.documentElement;
    const isLight = activeTheme.category === 'light';

    root.style.setProperty('--theme-bg', activeTheme.bgHex);
    root.style.setProperty('--theme-card', activeTheme.cardHex);
    root.style.setProperty('--theme-border', activeTheme.borderHex);
    root.style.setProperty('--theme-text', activeTheme.textHex);
    root.style.setProperty('--theme-text-muted', isLight ? '#475569' : '#94a3b8');
    root.style.setProperty('--theme-accent', activeTheme.accentColor);

    const radiusPx =
      settings.ui.radius === 'sharp'
        ? '0px'
        : settings.ui.radius === 'sleek'
        ? '6px'
        : settings.ui.radius === 'modern'
        ? '12px'
        : settings.ui.radius === 'smooth'
        ? '16px'
        : settings.ui.radius === 'pill'
        ? '24px'
        : '12px';
    root.style.setProperty('--theme-radius', radiusPx);

    root.setAttribute('data-theme', activeTheme.id);
    root.setAttribute('data-theme-category', activeTheme.category);
    if (isLight) {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    root.classList.remove('liquid-glass-active');

    document.body.style.backgroundColor = activeTheme.bgHex;
    document.body.style.color = activeTheme.textHex;
  }, [activeTheme, settings.ui.radius]);

  const bgPatternClass =
    settings.ui.bgPattern === 'dots'
      ? 'bg-pattern-dots'
      : settings.ui.bgPattern === 'grid'
      ? 'bg-pattern-grid'
      : settings.ui.bgPattern === 'crosshair'
      ? 'bg-pattern-crosshair'
      : '';

  const fontClass =
    settings.ui.fontFamily === 'mono'
      ? 'font-mono'
      : settings.ui.fontFamily === 'serif'
      ? 'font-serif'
      : 'font-sans';

  return (
    <div
      className={`min-h-screen flex flex-col ${fontClass} ${bgPatternClass} selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-150`}
      style={{
        backgroundColor: activeTheme.bgHex,
        color: activeTheme.textHex,
      }}
      data-density={settings.ui.density}
    >
      {/* Top Navbar */}
      <Navbar
        currentView={viewMode}
        onNavigate={(view) => setViewMode(view)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewProject={() => {
          setEditingProject(null);
          setIsFormOpen(true);
        }}
        onExportWorkspace={handleExportWorkspace}
        onImportWorkspace={handleImportFile}
        projects={projects}
        runningNodesCount={instances.filter((i) => i.status === 'running').length}
        connectedDevicesCount={devices.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenBillingModal={() => setIsBillingModalOpen(true)}
        onLogout={handleLogout}
        settings={settings}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Persistent Side Navigation */}
        <Sidebar
          currentView={viewMode}
          onNavigate={(mode) => setViewMode(mode)}
          projects={projects}
          starredOnly={starredOnly}
          onToggleStarredOnly={() => setStarredOnly((prev) => !prev)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          showMetrics={settings.ui.showSystemMetrics}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <AnimatePresence mode="wait">
            {/* VIEW 0: CLOUD INSTANCES / BREV.DEV CDE CONTROL PLANE */}
            {viewMode === 'instances' && (
              <motion.div
                key="instances-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CloudInstancesView
                  instances={instances}
                  onUpdateInstance={handleUpdateInstance}
                  onCreateInstance={handleCreateInstance}
                  onDeleteInstance={handleDeleteInstance}
                  onConnectSSH={handleConnectSSH}
                  onNavigate={(mode) => setViewMode(mode)}
                  onShowToast={showToast}
                />
              </motion.div>
            )}


            {/* VIEW 0.25: CONNECTED PCS, WORKSTATIONS & PHONES (DEVICE MESH) */}
            {viewMode === 'devices' && (
              <motion.div
                key="devices-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <RemoteDevicesView
                  devices={devices}
                  onUpdateDevice={handleUpdateDevice}
                  onCreateDevice={handleCreateDevice}
                  onDeleteDevice={handleDeleteDevice}
                  onConnectSSH={handleConnectDeviceSSH}
                  onNavigate={(mode) => setViewMode(mode)}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW 0.5: INTERACTIVE SSH TERMINAL */}
            {viewMode === 'terminal' && (
              <motion.div
                key="terminal-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <WebTerminalView
                  instances={[
                    ...instances,
                    ...devices.map((d) => ({
                      id: d.id,
                      name: `${d.name} (${d.type})`,
                      slug: d.id,
                      type: (d.os === 'linux' ? 'gpu' : 'cpu') as 'gpu' | 'cpu',
                      hardware: {
                        tier: d.modelName,
                        vcpu: 8,
                        ramGb: 32,
                        diskGb: 512,
                        gpuModel: d.os === 'linux' ? 'NVIDIA RTX 4090 24GB' : undefined,
                      },
                      status: 'running' as const,
                      ip: d.ipOrHost,
                      region: d.protocol.toUpperCase(),
                      sshCommand: `ssh ${d.sshUser || 'developer'}@${d.ipOrHost} -p ${d.sshPort || 22}`,
                      vscodeWebUrl: d.tunnelUrl || `http://${d.ipOrHost}:3000`,
                      vscodeDesktopUrl: `vscode://vscode-remote/ssh-remote+${d.sshUser || 'dev'}@${d.ipOrHost}`,
                      cursorUrl: `cursor://vscode-remote/ssh-remote+${d.sshUser || 'dev'}@${d.ipOrHost}`,
                      gitRepoUrl: 'https://github.com/developer/workspace',
                      gitBranch: 'main',
                      ports: [],
                      telemetry: {
                        cpuPct: 18,
                        ramPct: 42,
                        diskPct: 55,
                        uptime: '2d 14h',
                      },
                      autoStopMinutes: 0,
                      costPerHour: 0,
                      createdAt: d.pairedAt,
                    })).filter((d) => !instances.some((i) => i.id === d.id)),
                  ]}
                  activeInstance={selectedTerminalInstance || instances[0] || null}
                  onSelectInstance={(inst) => setSelectedTerminalInstance(inst)}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW: SPRINT KANBAN & MILESTONES */}
            {viewMode === 'kanban' && (
              <motion.div
                key="kanban-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <KanbanBoardView
                  projects={projects}
                  onUpdateProject={handleSaveProject}
                  onNavigate={(mode) => setViewMode(mode)}
                  onSelectProject={handleOpenDetail}
                />
              </motion.div>
            )}

            {/* VIEW: API & WEBHOOK TESTER */}
            {viewMode === 'api-manager' && (
              <motion.div
                key="api-manager-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ApiManagerView onShowToast={showToast} />
              </motion.div>
            )}
            {viewMode === 'credential-clipboard' && (
              <motion.div
                key="credential-clipboard-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CredentialClipboardView onShowToast={showToast} />
              </motion.div>
            )}

            {/* VIEW: ENVIRONMENT SECRETS VAULT */}
            {viewMode === 'env-vault' && (
              <motion.div
                key="env-vault-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <EnvVaultView />
              </motion.div>
            )}

            {/* VIEW: GIT WORKBENCH & COMMIT CRAFTER */}
            {viewMode === 'git-workbench' && (
              <motion.div
                key="git-workbench-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <GitWorkbenchView />
              </motion.div>
            )}

            {/* VIEW: WORKFLOWS & AUTOMATION ENGINE */}
            {viewMode === 'workflows' && (
              <motion.div
                key="workflows-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <WorkflowsView
                  workflows={workflows}
                  workflowRuns={workflowRuns}
                  onSaveWorkflow={handleSaveWorkflow}
                  onDeleteWorkflow={handleDeleteWorkflow}
                  onToggleStarWorkflow={handleToggleStarWorkflow}
                  onAddRunRecord={handleAddWorkflowRun}
                  onShowToast={showToast}
                  onNavigateToCommandPalette={() => setIsCommandPaletteOpen(true)}
                />
              </motion.div>
            )}

            {/* VIEW: CI/CD PIPELINES & AUTOMATED DEPLOYMENTS */}
            {viewMode === 'pipelines' && (
              <motion.div
                key="pipelines-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PipelinesView
                  pipelines={pipelines}
                  onTriggerPipeline={handleTriggerPipeline}
                  onRollback={handleRollbackPipeline}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW: TEAM WORKSPACE, RBAC & CLOUD CONNECTORS */}
            {viewMode === 'team' && (
              <motion.div
                key="team-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TeamWorkspaceView
                  workspace={workspace}
                  members={teamMembers}
                  connectors={cloudConnectors}
                  auditLogs={auditLogs}
                  onUpdateMemberRole={handleUpdateMemberRole}
                  onUpdateMemberQuota={handleUpdateMemberQuota}
                  onInviteMember={handleInviteMember}
                  onSyncConnector={handleSyncConnector}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW: DISTRIBUTED OBSERVABILITY & LOG STREAMER */}
            {viewMode === 'observability' && (
              <motion.div
                key="observability-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-[calc(100vh-4rem)]"
              >
                <ObservabilityView
                  instances={instances}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW: SPOT GPU COST OPTIMIZER */}
            {viewMode === 'cost-optimizer' && (
              <motion.div
                key="cost-optimizer-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CostOptimizerView
                  instances={instances}
                  onShowToast={showToast}
                  onDeployInstance={(hardwareTier, name) => {
                    handleCreateInstance({
                      id: `inst-${Date.now()}`,
                      name,
                      slug: name.toLowerCase(),
                      type: hardwareTier.includes('H100') || hardwareTier.includes('A100') || hardwareTier.includes('L4') ? 'gpu' : 'cpu',
                      hardware: { tier: hardwareTier, vcpu: 16, ramGb: 64, diskGb: 500 },
                      status: 'starting',
                      ip: '100.64.0.99',
                      region: 'us-east-1',
                      sshCommand: 'ssh devdeck@100.64.0.99',
                      vscodeWebUrl: 'https://vscode.devdeck.live',
                      vscodeDesktopUrl: 'vscode://vscode-remote/ssh-remote+devdeck@100.64.0.99/workspace',
                      cursorUrl: 'cursor://vscode-remote/ssh-remote+devdeck@100.64.0.99/workspace',
                      gitRepoUrl: '',
                      gitBranch: 'main',
                      ports: [{ port: 3000, label: 'App Port', url: 'http://100.64.0.99:3000', isPublic: true, protocol: 'http' }],
                      telemetry: { cpuPct: 5, ramPct: 12, diskPct: 8, uptime: '1m' },
                      autoStopMinutes: 60,
                      costPerHour: 2.19,
                      createdAt: new Date().toISOString(),
                    });
                  }}
                />
              </motion.div>
            )}

            {/* VIEW: WIREGUARD MESH TOPOLOGY & PORT TUNNELS */}
            {viewMode === 'mesh-topology' && (
              <motion.div
                key="mesh-topology-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <MeshTopologyView
                  devices={devices}
                  instances={instances}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW: SHARED MESH STORAGE */}
            {viewMode === 'mesh-storage' && (
              <motion.div
                key="mesh-storage-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <MeshStorageView
                  files={meshFiles}
                  devices={devices}
                  onUploadFile={handleUploadMeshFile}
                  onDeleteFile={handleDeleteMeshFile}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW: DATABASE STUDIO */}
            {viewMode === 'database-studio' && (
              <motion.div
                key="database-studio-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DatabaseStudioView onShowToast={showToast} />
              </motion.div>
            )}

            {/* VIEW: IAC & DEVCONTAINER GENERATOR */}
            {viewMode === 'iac-generator' && (
              <motion.div
                key="iac-generator-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <IaCGeneratorView onShowToast={showToast} />
              </motion.div>
            )}

            {/* VIEW: LIVE COLLABORATIVE PAIR PROGRAMMING */}
            {viewMode === 'pair-programming' && (
              <motion.div
                key="pair-programming-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-[calc(100vh-4rem)]"
              >
                <PairProgrammingView
                  currentUser={currentUser}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW 1: PROJECTS HUB */}
            {viewMode === 'projects' && (
              <motion.div
                key="projects-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 12-Column Bento Grid Interactive Dashboard */}
                <div className="grid grid-cols-12 gap-4 lg:gap-5">
                  {/* Bento Cell 1: Workspaces Quick Launcher & Node Status */}
                  <section className="col-span-12 lg:col-span-3 aesthetic-card rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Workspaces</h2>
                        <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">{projects.length} Total</span>
                      </div>
                      <div className="space-y-2">
                        {projects.slice(0, 3).map((p, idx) => (
                          <div
                            key={p.id}
                            onClick={() => handleOpenDetail(p)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                              idx === 0
                                ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-sm'
                                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.12] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${
                                idx === 0 ? 'bg-gradient-to-tr from-blue-600 to-sky-500 text-white' : idx === 1 ? 'bg-gradient-to-tr from-sky-500 to-cyan-400 text-white' : 'bg-white/[0.08] text-slate-200'
                              }`}>
                                {p.category === 'ai' ? 'AI' : p.category === 'web' ? 'UI' : 'VS'}
                              </div>
                              <span className="text-xs font-medium truncate group-hover:text-white transition-colors">{p.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {p.localPort ? `:${p.localPort}` : 'Ready'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1 font-mono">System Telemetry</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 text-[11px]">Core Daemon CPU</span>
                        <span className="text-blue-400 font-mono text-[11px] font-semibold">12.4%</span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.06] rounded-full mt-1.5 overflow-hidden">
                        <div className="w-1/4 h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-full"></div>
                      </div>
                    </div>
                  </section>

                  {/* Bento Cell 2: Project Pipeline (Centralized GitHub Activity) */}
                  <section className="col-span-12 lg:col-span-6 aesthetic-card rounded-2xl p-5 lg:p-6 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-100">Project Pipeline</h2>
                            <span className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Centralized CI/CD workflows and git streams</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingProject(null);
                            setIsFormOpen(true);
                          }}
                          className="aesthetic-button-secondary text-xs py-1.5 px-3 rounded-xl cursor-pointer"
                        >
                          + New Repo
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Pipeline Item 1 */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-9 h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                              <FolderGit2 className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-200 truncate">master-branch / api-gateway</div>
                              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Build Succeeded • 4m ago
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[10px] text-slate-300 font-mono">feat/auth-v2</span>
                            <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-md text-[10px] font-mono">PR #42</span>
                          </div>
                        </div>

                        {/* Pipeline Item 2 */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-9 h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-amber-400 shrink-0">
                              <Terminal className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-200 truncate">frontend / dashboard-next</div>
                              <div className="text-[11px] text-amber-400 font-medium mt-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Deploying staging... (82%)
                              </div>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">ETA 20s</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06]">
                      <span className="font-mono text-[11px]">Git status: 3 clean, 1 uncommitted</span>
                      <button onClick={() => setViewMode('github')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors flex items-center gap-1">
                        <span>View Git Tools</span>
                        <span>→</span>
                      </button>
                    </div>
                  </section>

                  {/* Bento Cell 3: AI Assistant & Model Matrix */}
                  <section className="col-span-12 lg:col-span-3 aesthetic-card rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-sky-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <h2 className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest">AI Studio</h2>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/30">
                          Gemini 3.7
                        </span>
                      </div>

                      <div 
                        onClick={() => setViewMode('ai-studio')}
                        className="bg-black/30 rounded-xl p-3 border border-blue-500/20 hover:border-blue-500/40 mb-3 cursor-pointer transition-all group"
                      >
                        <p className="text-xs italic text-slate-300 group-hover:text-white transition-colors">"Optimize the database query for the auth-service..."</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Recent Intelligence</div>
                        <div className="flex items-center justify-between text-xs p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                          <span className="text-slate-200 text-[11px] font-medium">Gemini 3.7 Flash</span>
                          <span className="text-blue-400 font-semibold font-mono text-[10px]">Active</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 hover:bg-white/[0.03] rounded-lg text-slate-400 transition-colors">
                          <span className="text-[11px]">Claude 3.5 Sonnet</span>
                          <span className="text-slate-500 font-mono text-[10px]">Standby</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewMode('ai-studio')}
                      className="mt-3.5 w-full py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-200 rounded-xl text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer text-center"
                    >
                      Open Prompt Studio →
                    </button>
                  </section>

                  {/* Bento Cell 4: Active Sprint */}
                  <section className="col-span-12 sm:col-span-6 lg:col-span-3 aesthetic-card rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sprint Velocity</div>
                      <div className="font-bold text-lg text-blue-300 mt-0.5 font-mono">
                        Day 4 <span className="text-slate-500 font-normal text-xs">/ 14</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">12 Milestones Open</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                      <span className="text-xs font-bold text-blue-200 font-mono">28%</span>
                    </div>
                  </section>

                  {/* Bento Cell 5: Console Output */}
                  <section className="col-span-12 sm:col-span-6 lg:col-span-4 aesthetic-card rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                        <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1.5">Console Output</h2>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="font-mono text-[10px] space-y-1 text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/[0.06]">
                      <p><span className="text-emerald-400">[info]</span> Dev server bound to 0.0.0.0:3000</p>
                      <p><span className="text-emerald-400">[info]</span> Hot reload ready in 1.4s</p>
                      <p><span className="text-blue-400">[debug]</span> Connected to Redis cluster @ 127.0.0.1</p>
                      <p><span className="text-slate-500">[log]</span> GET /api/v1/health 200 OK</p>
                      <p className="text-blue-400 animate-pulse font-bold">_</p>
                    </div>
                  </section>

                  {/* Bento Cell 6: Resource Links */}
                  <section className="col-span-12 sm:col-span-6 lg:col-span-5 aesthetic-card rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2.5">
                      <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Dev Bookmarks</h2>
                      <span className="text-[9px] font-mono text-slate-500">Quick Access</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="https://developer.mozilla.org"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/[0.02] hover:bg-white/[0.06] p-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] flex items-center gap-2 transition-all group"
                      >
                        <div className="w-6 h-6 bg-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          MD
                        </div>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">MDN Docs</span>
                      </a>
                      <a
                        href="https://stackoverflow.com"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/[0.02] hover:bg-white/[0.06] p-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] flex items-center gap-2 transition-all group"
                      >
                        <div className="w-6 h-6 bg-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          ST
                        </div>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">StackOverflow</span>
                      </a>
                      <a
                        href="https://grafana.com"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/[0.02] hover:bg-white/[0.06] p-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] flex items-center gap-2 transition-all group"
                      >
                        <div className="w-6 h-6 bg-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          GF
                        </div>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">Grafana</span>
                      </a>
                      <a
                        href="https://www.prisma.io/studio"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/[0.02] hover:bg-white/[0.06] p-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] flex items-center gap-2 transition-all group"
                      >
                        <div className="w-6 h-6 bg-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          PR
                        </div>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">Prisma Studio</span>
                      </a>
                    </div>
                  </section>

                  {/* Bento Cell 7: Daily Focus Tile */}
                  <section className="col-span-12 sm:col-span-6 lg:col-span-3 bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-sky-800/90 border border-blue-400/30 rounded-2xl p-5 flex flex-col justify-between text-white shadow-xl shadow-blue-600/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Daily Focus Target</div>
                    <div className="text-sm font-bold leading-snug my-2">Finish Webhooks Architecture & Unit Tests</div>
                    <div className="flex items-center gap-2 text-[11px] bg-white/15 border border-white/20 w-fit px-2.5 py-0.5 rounded-full font-mono">
                      <span>Due: 18:00 UTC</span>
                    </div>
                  </section>
                </div>

                {/* Filter Toolbar */}
                <div className="p-3.5 sm:p-4 rounded-2xl aesthetic-card space-y-3.5">
                  {/* Category Pills */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {projectCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                            categoryFilter === cat.id
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/40'
                              : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.06]'
                          }`}
                        >
                          <span>{cat.label}</span>
                          {cat.count !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                categoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-slate-400'
                              }`}
                            >
                              {cat.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Layout switch */}
                    <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] shrink-0">
                      <button
                        onClick={() => setViewLayout('grid')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewLayout === 'grid' ? 'bg-white/[0.08] text-blue-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewLayout('list')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewLayout === 'list' ? 'bg-white/[0.08] text-blue-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Filters: Status, Priority, Sort */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06] flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                        <Filter className="w-3 h-3 text-blue-400" />
                        Status:
                      </span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#0e121a] border border-white/[0.08] rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="in_progress">In Progress</option>
                        <option value="shipped">Shipped</option>
                        <option value="review">Under Review</option>
                        <option value="paused">Paused</option>
                        <option value="archived">Archived</option>
                      </select>

                      <span className="text-slate-400 font-medium ml-2 text-[11px]">Priority:</span>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="bg-[#0e121a] border border-white/[0.08] rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
                      >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                        <ArrowUpDown className="w-3 h-3 text-blue-400" />
                        Sort by:
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-[#0e121a] border border-white/[0.08] rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
                      >
                        <option value="updated">Recently Updated</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="priority">Highest Priority</option>
                        <option value="tasks">Most Tasks</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Projects Display Matrix */}
                {filteredProjects.length > 0 ? (
                  <div
                    className={
                      viewLayout === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                        : 'space-y-3'
                    }
                  >
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={handleOpenDetail}
                        onEdit={handleEditFromCard}
                        onDelete={handleDeleteProject}
                        onToggleStar={handleToggleStar}
                        onToggleTask={handleToggleTask}
                        onShowToast={showToast}
                        onOpenAIArchitectForProject={handleOpenAIArchitectForProject}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="p-12 text-center rounded-2xl aesthetic-card border-dashed border-white/[0.1] space-y-3">
                    <FolderGit2 className="w-10 h-10 text-slate-500 mx-auto" />
                    <h3 className="text-base font-bold text-slate-200">No Projects Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      No codebases match the selected filters or search query. Try clearing your search or add a new project.
                    </p>
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setStatusFilter('all');
                        setPriorityFilter('all');
                        setSearchQuery('');
                        setStarredOnly(false);
                      }}
                      className="aesthetic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 2: AI STUDIO & PROMPT RUNNER */}
            {(viewMode === 'ai-studio' || viewMode === 'ai-hub') && (
              <motion.div
                key="ai-studio-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AIStudioView
                  prompts={prompts}
                  projects={projects}
                  onAddPrompt={handleAddPrompt}
                  onDeletePrompt={handleDeletePrompt}
                  onToggleFavoritePrompt={handleToggleFavoritePrompt}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW 3: VS CODE & LOCAL WORKSPACES */}
            {viewMode === 'vscode-env' && (
              <motion.div
                key="vscode-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <VSCodeEnvView
                  projects={projects}
                  onShowToast={showToast}
                  onOpenProjectForm={() => {
                    setEditingProject(null);
                    setIsFormOpen(true);
                  }}
                />
              </motion.div>
            )}

            {/* VIEW 4: GITHUB & COMMIT CRAFTER */}
            {viewMode === 'github' && (
              <motion.div
                key="github-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <GitHubView
                  projects={projects}
                  onShowToast={showToast}
                  onImportProject={handleSaveProject}
                />
              </motion.div>
            )}

            {/* VIEW 5: SNIPPETS & CLI */}
            {viewMode === 'snippets' && (
              <motion.div
                key="snippets-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SnippetsView
                  snippets={snippets}
                  onAddSnippet={handleAddSnippet}
                  onDeleteSnippet={handleDeleteSnippet}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW 6: PORTS & PROCESS KILL */}
            {viewMode === 'ports' && (
              <motion.div
                key="ports-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PortsView projects={projects} onShowToast={showToast} />
              </motion.div>
            )}

            {/* VIEW 7: BOOKMARKS & DOCS */}
            {(viewMode === 'bookmarks' || viewMode === 'resources') && (
              <motion.div
                key="bookmarks-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <BookmarksView
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW 8: STATS & ANALYTICS */}
            {viewMode === 'stats' && (
              <motion.div
                key="stats-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <StatsView
                  projects={projects}
                  prompts={prompts}
                  snippets={snippets}
                  bookmarks={bookmarks}
                  onImportData={(data) => {
                    if (data.projects) setProjects(data.projects);
                    if (data.prompts) setPrompts(data.prompts);
                    if (data.snippets) setSnippets(data.snippets);
                    if (data.bookmarks) setBookmarks(data.bookmarks);
                  }}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {/* VIEW 9: SETTINGS & API INTEGRATIONS */}
            {viewMode === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  currentUser={currentUser}
                  projects={projects}
                  onExportData={handleExportWorkspace}
                  onImportData={handleImportFile}
                  onResetSampleData={handleResetSampleData}
                  onShowToast={showToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        aiPrompts={prompts}
        snippets={snippets}
        resources={bookmarks}
        workflows={workflows}
        onSelectProject={(p) => {
          setViewMode('projects');
          handleOpenDetail(p);
        }}
        onNavigate={(v) => setViewMode(v)}
        onNewProject={() => {
          setEditingProject(null);
          setIsFormOpen(true);
        }}
        onShowToast={showToast}
        onTriggerWorkflow={handleTriggerWorkflowFromPalette}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />

      {/* Enterprise Billing & Quota Modal */}
      <BillingUsageModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        workspace={workspace}
        onShowToast={showToast}
      />

      {/* Project Inspector / Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProject(null);
        }}
        onUpdateProject={handleSaveProject}
        onEditProject={(p) => {
          setIsDetailOpen(false);
          setEditingProject(p);
          setIsFormOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* Project Form Modal (Create / Edit) */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
