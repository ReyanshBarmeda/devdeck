const fs = require('fs');
let code = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');

const oldAction = `    { id: 'nav-api', title: 'API Manager', subtitle: 'Add and Replace API Endpoints', icon: Network, section: 'Navigation', onSelect: () => onNavigate('api-manager') },`;
const newAction = `    { id: 'nav-api', title: 'API Manager', subtitle: 'Add and Replace API Endpoints', icon: Network, section: 'Navigation', onSelect: () => onNavigate('api-manager') },
    { id: 'nav-credential-clipboard', title: 'API Key Clipboard', subtitle: 'Quick access to API keys', icon: Key, section: 'Navigation', onSelect: () => onNavigate('credential-clipboard') },`;

if (code.includes(oldAction)) {
    code = code.replace(oldAction, newAction);
    
    // Make sure Key icon is imported if it isn't
    if (!code.includes('Key,')) {
      code = code.replace('import {', 'import { Key,');
    }
    
    fs.writeFileSync('src/components/CommandPalette.tsx', code);
    console.log("Command palette patched");
} else {
    console.log("Command palette anchor not found");
}
