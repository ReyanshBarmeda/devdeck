import { MeshStorageFile } from '../types';

export const DEFAULT_MESH_FILES: MeshStorageFile[] = [
  {
    id: 'mesh-file-1',
    name: 'llm-weights-v2-q4_K_M.gguf',
    sizeBytes: 4.8 * 1024 * 1024 * 1024,
    type: 'file',
    uploadedBy: 'dev-homelab-gpu',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    accessControl: {
      type: 'restricted',
      allowedIps: ['192.168.1.*', '10.0.0.50'],
      allowedEmails: ['researcher@gmail.com', 'admin@company.com'],
    },
    storageLocation: 'local_network',
    syncStatus: 'synced',
    tags: ['ai', 'weights', 'llama'],
  },
  {
    id: 'mesh-file-2',
    name: 'prod-db-snapshot.sql.gz',
    sizeBytes: 156 * 1024 * 1024,
    type: 'file',
    uploadedBy: 'cloud-db-worker',
    uploadedAt: new Date(Date.now() - 4000000).toISOString(),
    accessControl: {
      type: 'restricted',
      allowedIps: [],
      allowedEmails: ['devteam@gmail.com'],
    },
    storageLocation: 'cloud_relay',
    syncStatus: 'synced',
    tags: ['backup', 'database'],
  },
  {
    id: 'mesh-file-3',
    name: 'onboarding-assets.zip',
    sizeBytes: 42 * 1024 * 1024,
    type: 'file',
    uploadedBy: 'designer-macbook',
    uploadedAt: new Date(Date.now() - 12000000).toISOString(),
    accessControl: {
      type: 'public',
      allowedIps: [],
      allowedEmails: [],
    },
    storageLocation: 'cloud_relay',
    syncStatus: 'synced',
    tags: ['design', 'assets'],
  },
];
