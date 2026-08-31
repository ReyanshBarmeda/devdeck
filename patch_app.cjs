const fs = require('fs');
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `            {viewMode === 'api-manager' && (
              <motion.div
                key="api-manager-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ApiManagerView onShowToast={showToast} />
              </motion.div>
            )}`;

const inject = `
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
            )}`;

if (appStr.includes(anchor)) {
    appStr = appStr.replace(anchor, anchor + inject);
    fs.writeFileSync('src/App.tsx', appStr);
    console.log("Success");
} else {
    console.log("Anchor not found");
}
