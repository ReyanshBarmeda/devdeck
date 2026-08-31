const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const navItem = `    {
      id: 'os-provisioning' as ViewMode,
      label: 'OS Provisioning & Live ISO',
      icon: Disc,
      badge: 'Multi-OS',
    },
`;

code = code.replace(navItem, '');
fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log("Sidebar patched successfully");
