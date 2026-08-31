import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardDrive,
  FolderOpen,
  FileText,
  Upload,
  Download,
  Trash2,
  Share2,
  Lock,
  Globe,
  MoreVertical,
  Plus,
  X,
  Check,
  Mail,
  Search,
  File,
  Image as ImageIcon,
  Code,
  Network
} from 'lucide-react';
import { MeshStorageFile, RemoteDevice } from '../types';

interface MeshStorageViewProps {
  files: MeshStorageFile[];
  devices: RemoteDevice[];
  onUploadFile: (file: MeshStorageFile) => void;
  onDeleteFile: (fileId: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const MeshStorageView: React.FC<MeshStorageViewProps> = ({
  files,
  devices,
  onUploadFile,
  onDeleteFile,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Upload Form State
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState(1024);
  const [accessType, setAccessType] = useState<'public' | 'private' | 'restricted'>('restricted');
  const [allowedIps, setAllowedIps] = useState<string>('');
  const [allowedEmails, setAllowedEmails] = useState<string>('');
  const [storageLocation, setStorageLocation] = useState<'local_network' | 'cloud_relay'>('local_network');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newFile: MeshStorageFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      sizeBytes: newFileSize * 1024,
      type: 'file',
      mimeType: 'application/octet-stream',
      uploadedBy: 'Local Console',
      uploadedAt: new Date().toISOString(),
      accessControl: {
        type: accessType,
        allowedIps: allowedIps.split(',').map((ip) => ip.trim()).filter(Boolean),
        allowedEmails: allowedEmails.split(',').map((email) => email.trim()).filter(Boolean),
      },
      storageLocation,
      syncStatus: 'synced',
      tags: [],
    };

    onUploadFile(newFile);
    setIsUploadModalOpen(false);
    onShowToast('File Uploaded to Mesh', `${newFileName} is now available on the network.`, 'success');
    
    // Reset Form
    setNewFileName('');
    setAllowedIps('');
    setAllowedEmails('');
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.json')) return <Code className="w-5 h-5 text-blue-400" />;
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    if (name.endsWith('.txt') || name.endsWith('.md')) return <FileText className="w-5 h-5 text-zinc-400" />;
    return <File className="w-5 h-5 text-zinc-400" />;
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
                Shared Mesh Storage
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Network Attached Storage (NAS)
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Share files across your local internet (via IP whitelist) or the global internet (via Gmail access).
              Files sync securely across your connected devices using P2P mesh logic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload & Share File</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80 text-xs">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-zinc-100">{files.length}</div>
              <div className="text-zinc-500 text-[11px]">Total Shared Files</div>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-base font-bold text-zinc-100">{devices.length}</div>
              <div className="text-zinc-500 text-[11px]">Storage Nodes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shared files..."
            className="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="bg-[#0e121a] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all hover:shadow-xl group flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {getFileIcon(file.name)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 truncate w-32" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {formatBytes(file.sizeBytes)}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              {/* Access Control Badges */}
              <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Access:</span>
                  {file.accessControl.type === 'public' && (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  )}
                  {file.accessControl.type === 'private' && (
                    <span className="flex items-center gap-1 text-zinc-400 font-medium">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                  {file.accessControl.type === 'restricted' && (
                    <span className="flex items-center gap-1 text-purple-400 font-medium">
                      <Lock className="w-3 h-3" /> Restricted
                    </span>
                  )}
                </div>
                
                {file.accessControl.type === 'restricted' && (
                  <div className="space-y-1 mt-1 pt-2 border-t border-zinc-800/50">
                    {file.accessControl.allowedIps.length > 0 && (
                      <div className="flex items-start gap-1.5 text-[10px] text-zinc-400">
                        <Network className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" />
                        <span className="truncate" title={file.accessControl.allowedIps.join(', ')}>
                          IPs: {file.accessControl.allowedIps.join(', ')}
                        </span>
                      </div>
                    )}
                    {file.accessControl.allowedEmails.length > 0 && (
                      <div className="flex items-start gap-1.5 text-[10px] text-zinc-400">
                        <Mail className="w-3 h-3 mt-0.5 text-emerald-400 shrink-0" />
                        <span className="truncate" title={file.accessControl.allowedEmails.join(', ')}>
                          Gmail: {file.accessControl.allowedEmails.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800">
                <span>By {file.uploadedBy}</span>
                <span className="flex items-center gap-1">
                  {file.syncStatus === 'synced' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {file.syncStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <HardDrive className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-zinc-200 font-medium text-lg">No Files Shared Yet</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm">
            Upload files to the Mesh Storage pool to make them accessible across your connected devices, local internet, or specific Gmail accounts.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#0e121a] border border-zinc-800 rounded-2xl shadow-2xl p-6 z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100">Share File to Mesh</h3>
                    <p className="text-xs text-zinc-400">Configure access permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">File Name</label>
                  <input
                    type="text"
                    required
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. model-weights.bin"
                    className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Storage Relay</label>
                    <select
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value as 'local_network' | 'cloud_relay')}
                      className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
                    >
                      <option value="local_network">Local LAN (P2P)</option>
                      <option value="cloud_relay">Cloud Relay (Global)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Access Scope</label>
                    <select
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
                    >
                      <option value="restricted">Restricted (ACL)</option>
                      <option value="public">Public (Any node)</option>
                      <option value="private">Private (Only me)</option>
                    </select>
                  </div>
                </div>

                {accessType === 'restricted' && (
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">Allowed Local IPs (Local Internet)</label>
                      <input
                        type="text"
                        value={allowedIps}
                        onChange={(e) => setAllowedIps(e.target.value)}
                        placeholder="192.168.1.100, 10.0.0.*"
                        className="w-full bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Comma-separated IPv4 or CIDR blocks.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">Allowed Emails (Other Internet / Gmail)</label>
                      <input
                        type="text"
                        value={allowedEmails}
                        onChange={(e) => setAllowedEmails(e.target.value)}
                        placeholder="colleague@gmail.com, team@company.com"
                        className="w-full bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Users must authenticate via Google OAuth to access these files.</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
