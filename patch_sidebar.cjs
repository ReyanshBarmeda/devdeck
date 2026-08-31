const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const oldNav = `    {
      id: 'api-manager' as ViewMode,
      label: 'API & Webhook Client',
      icon: Globe,
      badge: 'HTTP',
    },`;

const newNav = `    {
      id: 'api-manager' as ViewMode,
      label: 'API & Webhook Client',
      icon: Globe,
      badge: 'HTTP',
    },
    {
      id: 'credential-clipboard' as ViewMode,
      label: 'API Key Clipboard',
      icon: KeyRound,
      badge: 'Vault',
    },`;

if (code.includes(oldNav)) {
    code = code.replace(oldNav, newNav);
    fs.writeFileSync('src/components/Sidebar.tsx', code);
    console.log("Sidebar patched");
} else {
    console.log("Sidebar anchor not found");
}
