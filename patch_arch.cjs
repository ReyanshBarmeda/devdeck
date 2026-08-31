const fs = require('fs');
let code = fs.readFileSync('src/components/OSProvisioningView.tsx', 'utf8');

const oldGrid = `<div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsoArch('x86_64')}
                      className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer \${
                        isoArch === 'x86_64'
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-sm'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }\`}
                    >
                      x86_64 (Intel / AMD)
                    </button>
                    <button
                      onClick={() => setIsoArch('aarch64')}
                      className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer \${
                        isoArch === 'aarch64'
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-sm'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }\`}
                    >
                      aarch64 (ARM64 / Ampere)
                    </button>
                  </div>`;

const newGrid = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setIsoArch('intel')}
                      className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer \${
                        isoArch === 'intel'
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-sm'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }\`}
                    >
                      Intel (x86_64)
                    </button>
                    <button
                      onClick={() => setIsoArch('amd')}
                      className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer \${
                        isoArch === 'amd'
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-sm'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }\`}
                    >
                      AMD (x86_64)
                    </button>
                    <button
                      onClick={() => setIsoArch('arm64')}
                      className={\`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer \${
                        isoArch === 'arm64'
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-sm'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }\`}
                    >
                      ARM64
                    </button>
                  </div>`;

if (code.includes(oldGrid)) {
    code = code.replace(oldGrid, newGrid);
    fs.writeFileSync('src/components/OSProvisioningView.tsx', code);
    console.log("Successfully patched arch buttons");
} else {
    console.log("Old grid not found!");
}
