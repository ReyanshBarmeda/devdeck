const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.main = "electron-main.cjs";
pkg.scripts["build:desktop"] = "vite build && electron-builder";
pkg.build = {
  appId: "com.devdeck.desktop",
  productName: "DevDeck",
  directories: {
    output: "dist_desktop"
  },
  files: [
    "dist/**/*",
    "electron-main.cjs",
    "package.json"
  ],
  mac: {
    category: "public.app-category.developer-tools"
  },
  win: {
    target: "nsis"
  },
  linux: {
    target: "AppImage",
    category: "Development"
  }
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("package.json patched successfully");
